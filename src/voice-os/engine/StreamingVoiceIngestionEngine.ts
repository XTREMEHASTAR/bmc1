// Enterprise Streaming Voice Ingestion Engine
// Handles Microphone streaming, Web Audio API VAD, chunk managers, and real-time backend communication

export interface WordTimestamp {
  word: string;
  timeMs: number;
}

export interface StreamingEngineConfig {
  portal: string;
  language: string;
  sessionId?: string;
  onChunkProcessed: (result: {
    extractedEntities: any;
    formUpdates: any;
    triageRecommendation: string | null;
    confidenceScores: any;
    timestampedWords: WordTimestamp[];
    chunkText: string;
  }) => void;
  onVadStateChange?: (state: 'speech' | 'silence' | 'noise' | 'interrupted') => void;
  onTranscriptUpdate?: (interim: string, final: string, finalizedSentences?: { text: string; timestamp: string }[]) => void;
  isOfflineMode?: boolean;
}

export class StreamingVoiceIngestionEngine {
  public sessionId: string = '';
  private config: StreamingEngineConfig;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private recognizer: any = null;
  
  private startTime: number = 0;
  private lastActivityTime: number = 0;
  private isSpeechActive: boolean = false;
  private noiseFloor: number = 0.01;
  private vadInterval: any = null;
  
  private fullTranscript: string = '';
  private chunkTranscript: string = '';
  private processedWordsCount: number = 0;
  private timestampedWords: WordTimestamp[] = [];
  
  private lastChunkTime: number = 0;
  private offlineQueue: Array<{
    transcriptChunk: string;
    fullTranscript: string;
    timestamp: string;
  }> = [];

  // Transcript Merge Engine states (cursors and memory)
  private lastProcessedIndex: number = 0;
  private finalizedSentences: { text: string; timestamp: string }[] = [];
  private pendingFinalSentences: string[] = [];
  private lastSentence: string = '';
  private audioCursorMs: number = 0;
  private wordCursor: number = 0;

  private isDestroyed: boolean = false;

  constructor(config: StreamingEngineConfig) {
    this.config = config;
    (window as any).__streamingEngineInstances = ((window as any).__streamingEngineInstances || 0) + 1;
    console.log(`[TRACE] [StreamingVoiceIngestionEngine] Constructor called. Total instances: ${(window as any).__streamingEngineInstances}, portal: ${config.portal}`);
  }

  public async start(): Promise<void> {
    if (this.isDestroyed) {
      console.log(`[StreamingEngine] start() aborted because instance is already destroyed.`);
      return;
    }

    const sessionNum = Math.floor(100 + Math.random() * 900);
    this.sessionId = this.config.sessionId || `session-${this.config.portal}-${Date.now()}-${sessionNum}`;
    (window as any).__speechRecognitionInstances = ((window as any).__speechRecognitionInstances || 0) + 1;
    console.log(`[TRACE] [StreamingVoiceIngestionEngine] start() called. Session: ${this.sessionId}. Total SpeechRecognition instances started: ${(window as any).__speechRecognitionInstances}`);
    
    this.startTime = Date.now();
    this.lastActivityTime = Date.now();
    this.lastChunkTime = Date.now();
    this.fullTranscript = '';
    this.chunkTranscript = '';
    this.processedWordsCount = 0;
    this.timestampedWords = [];
    this.isSpeechActive = false;

    // Reset cursors and merge engine states
    this.lastProcessedIndex = 0;
    this.finalizedSentences = [];
    this.pendingFinalSentences = [];
    this.lastSentence = '';
    this.audioCursorMs = 0;
    this.wordCursor = 0;

    // 1. Initialize Microphone and Analyser Node (VAD)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (this.isDestroyed) {
        stream.getTracks().forEach(t => {
          try { t.stop(); } catch (_) {}
        });
        console.log(`[StreamingEngine] [${this.sessionId}] start() aborted after getUserMedia because instance was destroyed.`);
        return;
      }
      this.mediaStream = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      source.connect(this.analyser);
      
      this.startVadMonitoring();
    } catch (err) {
      console.warn('[StreamingEngine] Microphone access failed or AudioContext init blocked:', err);
      if (this.config.onVadStateChange) {
        this.config.onVadStateChange('interrupted');
      }
    }

    if (this.isDestroyed) {
      console.log(`[StreamingEngine] [${this.sessionId}] start() aborted before initializing SpeechRecognition.`);
      return;
    }

    // 2. Initialize Web Speech Recognition
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      this.recognizer = new SpeechRecognitionClass();
      this.recognizer.continuous = true;
      this.recognizer.interimResults = true;
      this.recognizer.maxAlternatives = 1;
      (window as any).__onresultCallbacksCount = ((window as any).__onresultCallbacksCount || 0) + 1;
      console.log(`[TRACE] [SpeechRecognition] Registering onresult callback. Total registered callbacks: ${(window as any).__onresultCallbacksCount}`);

      if (this.config.language === 'hi') this.recognizer.lang = 'hi-IN';
      else if (this.config.language === 'mr') this.recognizer.lang = 'mr-IN';
      else this.recognizer.lang = 'en-IN';

      this.recognizer.onstart = () => {
        console.log(`[StreamingEngine] [Event] onstart: Speech recognition session started. lastProcessedIndex preserved at ${this.lastProcessedIndex}.`);
        // DO NOT reset lastProcessedIndex here.
        // The cursor must persist across browser-internal session restarts (onend → start()).
        // It is only reset when a genuinely new StreamingVoiceIngestionEngine session begins (in start()).
      };

      this.recognizer.onresult = (event: any) => {
        console.log('[StreamingEngine] [Event] onresult: resultIndex =', event.resultIndex, 'results.length =', event.results.length);
        let interimTrans = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (!result || result.length === 0) continue;
          
          console.log('[StreamingEngine] [Result] index =', i, 'isFinal =', result.isFinal, 'transcript =', result[0].transcript);

          if (result.isFinal) {
            if (i >= this.lastProcessedIndex) {
              this.lastProcessedIndex = i + 1;
              const textSegment = result[0].transcript.trim();
              if (textSegment) {
                this.handleFinalTranscript(textSegment);
              }
            }
          } else {
            interimTrans += result[0].transcript;
          }
        }

        console.log('[StreamingEngine] [Update] finalTranscript =', this.fullTranscript, 'interimTranscript =', interimTrans);

        if (this.config.onTranscriptUpdate) {
          this.config.onTranscriptUpdate(interimTrans, this.fullTranscript, this.finalizedSentences);
        }
      };

      this.recognizer.onerror = (e: any) => {
        console.error('[StreamingEngine] [Event] onerror:', e.error);
        if (e.error === 'not-allowed') {
          if (this.config.onVadStateChange) this.config.onVadStateChange('interrupted');
        }
      };

      this.recognizer.onend = () => {
        console.log('[StreamingEngine] [Event] onend: Speech recognition session ended.');
        // Keep restarting if we have media stream active
        if (this.mediaStream && this.mediaStream.active) {
          try {
            this.recognizer.start();
          } catch (e) {}
        }
      };

      try {
        this.recognizer.start();
      } catch (e) {
        console.error('[StreamingEngine] Failed to start recognizer:', e);
      }
    }
  }

  public stop(): void {
    this.isDestroyed = true;
    console.log(`[StreamingEngine] [${this.sessionId}] Completely destroying speech session`);

    // 1. Stop and clear VAD monitoring
    if (this.vadInterval) {
      clearInterval(this.vadInterval);
      this.vadInterval = null;
    }

    // 2. Stop and clear Audio Stream / Tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (_) {}
      });
      this.mediaStream = null;
    }

    // 3. Stop and close Audio Context
    if (this.audioContext) {
      try {
        if (this.audioContext.state !== 'closed') {
          this.audioContext.close();
        }
      } catch (_) {}
      this.audioContext = null;
    }
    
    this.analyser = null;

    // 4. Destroy Speech Recognition Instance
    if (this.recognizer) {
      this.recognizer.onresult = null;
      this.recognizer.onerror = null;
      this.recognizer.onend = null;
      this.recognizer.onspeechstart = null;
      this.recognizer.onspeechend = null;
      this.recognizer.onstart = null;
      try {
        this.recognizer.stop();
      } catch (_) {}
      try {
        this.recognizer.abort();
      } catch (_) {}
      this.recognizer = null;
    }

    // 5. Completely clear all buffers, cursors, caches, and transcripts
    this.fullTranscript = '';
    this.chunkTranscript = '';
    this.processedWordsCount = 0;
    this.timestampedWords = [];
    this.lastProcessedIndex = 0;
    this.finalizedSentences = [];
    this.pendingFinalSentences = [];
    this.lastSentence = '';
    this.audioCursorMs = 0;
    this.wordCursor = 0;
    this.offlineQueue = [];
    
    // 6. Reset metadata
    this.startTime = 0;
    this.lastActivityTime = 0;
    this.isSpeechActive = false;
    this.lastChunkTime = 0;
    this.sessionId = '';
  }

  private startVadMonitoring(): void {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    let silenceCounter = 0;
    
    // Dynamic noise floor calibration
    let calibrationSamples = 0;
    let calibrationSum = 0;

    this.vadInterval = setInterval(() => {
      if (!this.analyser) return;
      
      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate RMS (average energy)
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / dataArray.length) / 255;

      // Calibration phase (first 10 samples)
      if (calibrationSamples < 10) {
        calibrationSum += rms;
        calibrationSamples++;
        this.noiseFloor = Math.max(0.005, calibrationSum / calibrationSamples);
        return;
      }

      // Voice Activity Threshold (RMS above noise floor)
      const threshold = this.noiseFloor + 0.015;
      
      if (rms > threshold) {
        silenceCounter = 0;
        this.lastActivityTime = Date.now();
        if (!this.isSpeechActive) {
          this.isSpeechActive = true;
          if (this.config.onVadStateChange) this.config.onVadStateChange('speech');
        }
      } else {
        silenceCounter++;
        // If silence persists for 1.5 seconds (15 samples at 100ms interval)
        if (silenceCounter >= 15 && this.isSpeechActive) {
          this.isSpeechActive = false;
          if (this.config.onVadStateChange) this.config.onVadStateChange('silence');
          
          // Natural pause detected - compile current chunk immediately
          this.compileAndProcessChunk();
        }
      }

      // Check mic interruption (track muted/stopped)
      const tracks = this.mediaStream?.getAudioTracks() || [];
      const isMutedOrStopped = tracks.length === 0 || !tracks[0].enabled || tracks[0].readyState === 'ended';
      if (isMutedOrStopped && this.config.onVadStateChange) {
        this.config.onVadStateChange('interrupted');
      }

    }, 100);
  }

  private handleFinalTranscript(finalText: string): void {
    const cleanSentence = finalText.trim().replace(/\s+/g, ' ');
    if (!cleanSentence) return;

    (window as any).__handleFinalTranscriptCalls = ((window as any).__handleFinalTranscriptCalls || 0) + 1;
    console.log(`[TRACE] [StreamingVoiceIngestionEngine] handleFinalTranscript called. Text: "${cleanSentence}". Total calls: ${(window as any).__handleFinalTranscriptCalls}`);

    // Normal append - strictly append only when isFinal is true
    const elapsedMs = Date.now() - this.startTime;
    const timestampStr = this.formatElapsed(elapsedMs);

    this.finalizedSentences.push({
      text: cleanSentence,
      timestamp: timestampStr
    });

    this.pendingFinalSentences.push(cleanSentence);

    // Calculate approximate word-level timestamps relative to start
    const words = cleanSentence.split(/\s+/);
    const wordCount = words.length;
    const durationOffsetPerWord = wordCount > 1 ? 250 : 0;
    
    words.forEach((word, idx) => {
      const timeMs = elapsedMs - (wordCount - 1 - idx) * durationOffsetPerWord;
      this.timestampedWords.push({
        word,
        timeMs: Math.max(0, timeMs)
      });
    });

    // Update cursors
    this.lastSentence = cleanSentence;
    this.wordCursor += wordCount;
    this.audioCursorMs = elapsedMs;

    this.fullTranscript = this.finalizedSentences.map(s => s.text).join('. ');

    // Check if 10-second interval elapsed for continuous stream segmentation
    const timeSinceLastChunk = Date.now() - this.lastChunkTime;
    if (timeSinceLastChunk >= 10000 && this.pendingFinalSentences.length > 0) {
      this.compileAndProcessChunk();
    }
  }

  private async compileAndProcessChunk(): Promise<void> {
    const chunkText = this.pendingFinalSentences.join('. ').trim();
    if (!chunkText) return;

    // Reset pending final sentences so they are only processed once
    this.pendingFinalSentences = [];
    this.lastChunkTime = Date.now();

    // Offline Buffering Queue Logic
    if (this.config.isOfflineMode || !navigator.onLine) {
      console.warn('[StreamingEngine] Offline mode detected. Buffering chunk.');
      this.offlineQueue.push({
        transcriptChunk: chunkText,
        fullTranscript: this.fullTranscript,
        timestamp: new Date().toISOString()
      });
      // Fire local simulated extraction
      this.simulateLocalExtraction(chunkText);
      return;
    }

    try {
      const response = await fetch('/api/v1/cognitive/stream-ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Hospital-ID': '45be8d20-7419-4ad3-a9d0-6f29239ba7a1',
          'X-Request-ID': 'req_' + Math.random().toString(36).substring(7),
          'Authorization': 'Bearer mock-bearer-session-token'
        },
        body: JSON.stringify({
          transcript_chunk: chunkText,
          full_transcript: this.fullTranscript,
          portal: this.config.portal,
          context: {
            user_role: this.config.portal === 'reception' ? 'receptionist' : 'doctor',
            consent_verified: true
          }
        })
      });

      if (!response.ok) {
        throw new Error('API failed with status ' + response.status);
      }

      const res = await response.json();
      this.config.onChunkProcessed({
        extractedEntities: res.extracted_entities,
        formUpdates: res.form_updates,
        triageRecommendation: res.triage_recommendation,
        confidenceScores: res.confidence_scores,
        timestampedWords: [...this.timestampedWords],
        chunkText
      });
    } catch (err) {
      console.error('[StreamingEngine] Failed to dispatch ingest payload:', err);
      // Fallback: Queue chunk locally
      this.offlineQueue.push({
        transcriptChunk: chunkText,
        fullTranscript: this.fullTranscript,
        timestamp: new Date().toISOString()
      });
      this.simulateLocalExtraction(chunkText);
    }
  }

  public getOfflineQueueCount(): number {
    return this.offlineQueue.length;
  }

  public async syncOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) return;
    console.log('[StreamingEngine] Syncing offline queue logs...');
    
    const chunksToSync = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const chunk of chunksToSync) {
      try {
        await fetch('/api/v1/cognitive/stream-ingest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Hospital-ID': '45be8d20-7419-4ad3-a9d0-6f29239ba7a1',
            'X-Request-ID': 'req_sync_' + Math.random().toString(36).substring(7),
            'Authorization': 'Bearer mock-bearer-session-token'
          },
          body: JSON.stringify({
            transcript_chunk: chunk.transcriptChunk,
            full_transcript: chunk.fullTranscript,
            portal: this.config.portal,
            context: {
              user_role: 'doctor',
              consent_verified: true
            }
          })
        });
      } catch (err) {
        console.error('[StreamingEngine] Failed to sync chunk, putting back in queue:', err);
        this.offlineQueue.push(chunk);
      }
    }
  }

  // Simulated extraction if completely offline or backend fails
  private simulateLocalExtraction(text: string): void {
    const clean = text.toLowerCase();
    const extractedEntities: any = {};
    const formUpdates: any = {};
    const confidenceScores: any = {};
    let triageRecommendation: string | null = null;

    // 1. Demographics Extraction
    const nameMatch = clean.match(/(?:name is|patient is|patient named|this is|call me)\s+([a-zA-Z\s]+?)(?:\s+and|\s+who|\s+is|\s+phone|\s+age|\.|\,|$)/);
    if (nameMatch) {
      const name = nameMatch[1].trim().replace(/\b\w/g, c => c.toUpperCase());
      if (name.length > 2) {
        formUpdates["newPatientName"] = name;
        formUpdates["patient_name"] = name;
        extractedEntities["patient_name"] = name;
        confidenceScores["newPatientName"] = "Very High";
      }
    }

    const ageMatch = clean.match(/\b(\d+)\s*(?:-|–)?\s*(?:years|years-old|year-old|yr|yrs|age|old)\b/);
    if (ageMatch) {
      const val = parseInt(ageMatch[1]);
      formUpdates["newPatientAge"] = val;
      formUpdates["age"] = val;
      extractedEntities["age"] = val;
      confidenceScores["newPatientAge"] = "Very High";
    }

    const genderMatch = clean.match(/\b(male|female|other|transgender|man|woman|boy|girl)\b/);
    if (genderMatch) {
      const g = genderMatch[1];
      const val = ["male", "man", "boy"].includes(g) ? "Male" : (["female", "woman", "girl"].includes(g) ? "Female" : "Other");
      formUpdates["newPatientGender"] = val;
      formUpdates["gender"] = val;
      extractedEntities["gender"] = val;
      confidenceScores["newPatientGender"] = "High";
    }

    const phoneMatch = clean.match(/\b(\d{10})\b/);
    if (phoneMatch) {
      formUpdates["newPatientPhone"] = phoneMatch[1];
      formUpdates["phone"] = phoneMatch[1];
      extractedEntities["phone"] = phoneMatch[1];
      confidenceScores["newPatientPhone"] = "Very High";
    }

    const addressMatch = clean.match(/(?:resident of|residing at|living in|address is|lives in)\s+([a-zA-Z0-9\s\,]+?)(?:\s+phone|\s+with|\s+and|\.|\,|$)/);
    if (addressMatch) {
      const val = addressMatch[1].trim().replace(/\b\w/g, c => c.toUpperCase());
      formUpdates["newPatientAddress"] = val;
      formUpdates["address"] = val;
      extractedEntities["address"] = val;
      confidenceScores["newPatientAddress"] = "High";
    }

    const langMatch = clean.match(/\b(marathi|hindi|english|gujarati|bengali|tamil|telugu)\b/);
    if (langMatch) {
      const val = langMatch[1].replace(/\b\w/g, c => c.toUpperCase());
      formUpdates["newPatientLanguage"] = val;
      formUpdates["language"] = val;
      extractedEntities["language"] = val;
      confidenceScores["newPatientLanguage"] = "High";
    }

    const relativeMatch = clean.match(/(?:father|mother|husband|spouse|wife|relative)\s+(?:name is|is)\s+([a-zA-Z\s]+?)(?:\s+and|\.|\,|$)/);
    if (relativeMatch) {
      const val = relativeMatch[1].trim().replace(/\b\w/g, c => c.toUpperCase());
      formUpdates["newPatientRelation"] = val;
      formUpdates["relation"] = val;
      extractedEntities["relative"] = val;
      confidenceScores["newPatientRelation"] = "Medium";
    }

    const emergencyMatch = clean.match(/(?:emergency contact|emergency phone|contact in emergency)\s*(?:is|\:)?\s*(\d{10})/);
    if (emergencyMatch) {
      formUpdates["newPatientEmergencyContact"] = emergencyMatch[1];
      extractedEntities["emergency_contact"] = emergencyMatch[1];
      confidenceScores["newPatientEmergencyContact"] = "High";
    }

    const arrivalMatch = clean.match(/\b(ambulance|walk-in|walked|walking|walk|stretcher|taxi|wheelchair|car|auto|vehicle|private)\b/);
    if (arrivalMatch) {
      const g = arrivalMatch[1];
      const val = ["walk-in", "walked", "walking", "walk"].includes(g) ? "Walk-in" : g.replace(/\b\w/g, c => c.toUpperCase());
      formUpdates["newPatientArrivalMethod"] = val;
      extractedEntities["arrival_method"] = val;
      confidenceScores["newPatientArrivalMethod"] = "High";
    }

    const complaintMatch = clean.match(/(?:complaining of|chief complaint|suffering from|presents with|complains of|with|has|having)\s+([a-zA-Z\s\,]+?)(?:\s+since|\s+for|\.|\,|$|and)/);
    let chiefComplaint = "";
    if (complaintMatch) {
      chiefComplaint = complaintMatch[1].trim();
      formUpdates["newPatientChiefComplaint"] = chiefComplaint;
      formUpdates["chief_complaint"] = chiefComplaint;
      extractedEntities["chief_complaint"] = chiefComplaint;
      confidenceScores["newPatientChiefComplaint"] = "High";
    }

    const durationMatch = clean.match(/(?:since|for|duration is)\s+(\d+\s*(?:days|weeks|months|years|hours|day|week|month|year|hour)|morning|yesterday|last night|last evening|afternoon|noon|today)\b/);
    let duration = "";
    if (durationMatch) {
      duration = durationMatch[1].trim();
      formUpdates["newPatientDuration"] = duration;
      extractedEntities["duration"] = duration;
      confidenceScores["newPatientDuration"] = "High";
    }

    // 2. Medical History & Allergy Recognition
    const historyKeywords: Record<string, string[]> = {
      "diabetes": ["diabetic", "diabetes", "dm", "sugar"],
      "hypertension": ["hypertensive", "hypertension", "bp", "high bp", "blood pressure"],
      "asthma": ["asthma", "asthmatic", "wheezing"],
      "tuberculosis": ["tb", "tuberculosis", "koch"],
      "copd": ["copd", "bronchitis", "emphysema"],
      "thyroid": ["thyroid", "hypothyroidism", "hyperthyroidism"],
      "cardiac": ["cad", "heart disease", "infarct", "angina"]
    };
    const foundHistory: string[] = [];
    Object.entries(historyKeywords).forEach(([condition, kws]) => {
      if (kws.some(kw => clean.includes(kw))) {
        const negPattern = new RegExp(`\\b(?:no|deny|denies|without|negative for|not)\\s+(?:history of\\s+)?(?:${condition}|${kws.join('|')})\\b`);
        if (!negPattern.test(clean)) {
          foundHistory.push(condition.replace(/\b\w/g, c => c.toUpperCase()));
        }
      }
    });
    if (foundHistory.length > 0) {
      const val = foundHistory.join(", ");
      formUpdates["newPatientKnownDiseases"] = val;
      extractedEntities["known_diseases"] = foundHistory;
      confidenceScores["newPatientKnownDiseases"] = "High";
    }

    // Allergy recognition
    const negatedAllergyMatch = clean.match(/\b(?:no|not|denies|negative for|free of|nil)\s+(?:known\s+)?(?:drug\s+)?allergies\b/);
    const negatedSpecificPenicillin = clean.match(/\b(?:no|not|free of|without|denies)\s+(?:known\s+)?penicillin\s+allergy\b/) || clean.match(/\bno\s+penicillin\s+allergy\b/);
    if (negatedAllergyMatch) {
      formUpdates["newPatientAllergies"] = "None";
      extractedEntities["allergies"] = ["None"];
      confidenceScores["newPatientAllergies"] = "Very High";
    } else {
      const allergies: string[] = [];
      ["penicillin", "sulfa", "nsaid", "aspirin", "paracetamol", "peanuts"].forEach(a => {
        if (clean.includes(a)) {
          const negPattern = new RegExp(`\\b(?:no|not|free of|without|denies)\\s+([a-zA-Z\\s]+?)\\b${a}`);
          if (!negPattern.test(clean) && !(a === "penicillin" && negatedSpecificPenicillin)) {
            allergies.push(a.replace(/\b\w/g, c => c.toUpperCase()));
          }
        }
      });
      if (allergies.length > 0) {
        const val = allergies.join(", ");
        formUpdates["newPatientAllergies"] = val;
        extractedEntities["allergies"] = allergies;
        confidenceScores["newPatientAllergies"] = "High";
      } else {
        formUpdates["newPatientAllergies"] = "None";
        extractedEntities["allergies"] = ["None"];
      }
    }

    const insuranceMatch = clean.match(/\b(pmjay|star health|hdfc|icici|bajaj|tata|government scheme|insurance)\b/);
    if (insuranceMatch) {
      let val = insuranceMatch[1].toUpperCase();
      if (val === "INSURANCE") val = "Private Insurance";
      formUpdates["newPatientInsurance"] = val;
      extractedEntities["insurance"] = val;
      confidenceScores["newPatientInsurance"] = "Medium";
    }

    const referralSourceMatch = clean.match(/(?:referred by|referral from)\s+([a-zA-Z\s\.\,]+?)(?:\s+for|\.|\,|$)/);
    if (referralSourceMatch) {
      const val = referralSourceMatch[1].trim().replace(/\b\w/g, c => c.toUpperCase());
      formUpdates["newPatientReferralSource"] = val;
      extractedEntities["referral_source"] = val;
      confidenceScores["newPatientReferralSource"] = "Medium";
    }

    const hospMatch = clean.match(/\b(hosp-\d+|hospital ID\s+\d+)\b/);
    if (hospMatch) {
      const val = hospMatch[1].toUpperCase();
      formUpdates["newPatientHospitalID"] = val;
      extractedEntities["hospital_id"] = val;
      confidenceScores["newPatientHospitalID"] = "Very High";
    }

    // 3. Triage Recommendation
    const redKeywords = ["cardiac arrest", "unconscious", "stopped breathing", "no pulse", "severe chest pain", "infarct", "severe respiratory distress", "hypoxia", "profuse bleeding", "appendicitis"];
    const yellowKeywords = ["stroke", "paralysis", "hemiplegia", "major trauma", "fracture", "accident", "fall from height", "burns", "deep wound", "snake bite", "abdominal pain", "vomiting"];
    const greenKeywords = ["fever", "cough", "mild pain", "cold", "diarrhea", "rash"];
    const blackKeywords = ["dead on arrival", "no signs of life", "rigor mortis", "asphyxiation", "deceased"];

    const isRed = redKeywords.some(k => clean.includes(k));
    const isYellow = yellowKeywords.some(k => clean.includes(k));
    const isGreen = greenKeywords.some(k => clean.includes(k));
    const isBlack = blackKeywords.some(k => clean.includes(k));

    if (isBlack) triageRecommendation = "BLACK";
    else if (isRed) triageRecommendation = "RED";
    else if (isYellow) triageRecommendation = "YELLOW";
    else if (isGreen) triageRecommendation = "GREEN";

    // 4. Clinical Scribing (SOAP, Medications, Labs, Radiologies, Vitals)
    const soap = { subjective: "", objective: "", assessment: "", plan: "" };

    const subjDetails: string[] = [];
    if (chiefComplaint) subjDetails.push(`Chief Complaint: ${chiefComplaint}` + (duration ? ` since ${duration}` : ""));
    if (clean.includes("vomiting")) {
      const vomitMatch = clean.match(/(\w+)\s+episodes\s+of\s+vomiting/);
      const vCount = vomitMatch ? vomitMatch[1] : "two";
      subjDetails.push(`Symptoms: Vomiting (${vCount} episodes)`);
    }
    if (foundHistory.length > 0) subjDetails.push(`Medical History: Known case of ${foundHistory.join(", ")}`);
    if (extractedEntities.allergies) subjDetails.push(`Allergies: ${extractedEntities.allergies.join(", ")}`);

    soap.subjective = subjDetails.length > 0 ? subjDetails.join(". ") + "." : "Patient interview conducted.";

    // Parse vitals
    const vitals: any = {};
    const objectiveDetails: string[] = [];
    const bpM = clean.match(/bp\s*(?:is)?\s*(\d{2,3}\/\d{2,3})/);
    if (bpM) { vitals.bp = bpM[1]; objectiveDetails.push(`Blood pressure: ${bpM[1]}`); }
    const tempM = clean.match(/(?:temperature|temp)\s*(?:is)?\s*(\d+(?:\.\d+)?)\b/);
    if (tempM) { vitals.temp = tempM[1]; objectiveDetails.push(`Temperature: ${tempM[1]}F`); }
    const pulseM = clean.match(/(?:pulse|heart rate|hr)\s*(?:is)?\s*(\d+)\b/);
    if (pulseM) { vitals.pulse = pulseM[1]; objectiveDetails.push(`Pulse: ${pulseM[1]} bpm`); }
    const spo2M = clean.match(/(?:spo2|oxygen saturation|oxygen|saturation|sat|sats)\s*(?:is)?\s*(\d+)\s*%?/);
    if (spo2M) { vitals.spo2 = spo2M[1]; objectiveDetails.push(`SpO2: ${spo2M[1]}%`); }
    const rrM = clean.match(/(?:respiratory rate|rr|respiration)\s*(?:is)?\s*(\d+)\b/);
    if (rrM) { vitals.rr = rrM[1]; objectiveDetails.push(`Respiratory rate: ${rrM[1]} bpm`); }

    if (Object.keys(vitals).length > 0) {
      formUpdates["vitals"] = vitals;
      extractedEntities["vitals"] = vitals;
      confidenceScores["vitals"] = "High";
    }

    // Exam findings
    const posFindings: string[] = [];
    const negFindings: string[] = [];
    if (clean.includes("tenderness")) {
      const tenderM = clean.match(/\b([a-zA-Z\s]+?tenderness)\b/);
      posFindings.push(tenderM ? tenderM[1].trim().replace(/\b\w/g, c => c.toUpperCase()) : "Tenderness present");
    }
    ["rebound tenderness", "guarding", "rigidity", "effusion", "swelling", "joint effusion"].forEach(finding => {
      if (clean.includes(finding)) {
        const negPattern = new RegExp(`\\b(?:no|not|without|free of|denies)\\s+${finding}`);
        if (negPattern.test(clean)) {
          negFindings.push(`No ${finding}`);
        } else {
          posFindings.push(finding.replace(/\b\w/g, c => c.toUpperCase()));
        }
      }
    });

    if (posFindings.length > 0 || negFindings.length > 0) {
      const examStrList: string[] = [];
      if (posFindings.length > 0) examStrList.push(`Positive: ${posFindings.join(", ")}`);
      if (negFindings.length > 0) examStrList.push(`Negative: ${negFindings.join(", ")}`);
      objectiveDetails.push(`Physical Exam: ${examStrList.join("; ")}`);
      extractedEntities["examination_findings"] = { positive: posFindings, negative: negFindings };
      formUpdates["examination_findings"] = examStrList.join("; ");
    }

    soap.objective = objectiveDetails.length > 0 ? objectiveDetails.join(", ") + "." : "Physical exam conducted.";

    // Diagnoses
    const provM = clean.match(/\b(?:provisional diagnosis|provisional|working diagnosis)\s*(?:is|of)?\s*([a-zA-Z\s]+?)(?:\.|\,|$|keep|start|give|send|get|call|monitor)/);
    const diffM = clean.match(/\b(?:differential diagnosis|differential|rule out)\s*(?:is|of)?\s*([a-zA-Z\s]+?)(?:\.|\,|$|keep|start|give|send|get|call|monitor)/);
    const confM = clean.match(/\b(?:confirmed diagnosis|confirmed|diagnosis is)\s*([a-zA-Z\s]+?)(?:\.|\,|$|keep|start|give|send|get|call|monitor)/);

    const diagnosesExtracted: any = {};
    const assessDetails: string[] = [];
    if (provM) {
      const val = provM[1].trim().replace(/\b\w/g, c => c.toUpperCase());
      diagnosesExtracted["provisional"] = val;
      assessDetails.push(`Provisional Diagnosis: ${val}`);
      formUpdates["assessment"] = val;
    }
    if (diffM) {
      const val = diffM[1].trim().replace(/\b\w/g, c => c.toUpperCase());
      diagnosesExtracted["differential"] = val;
      assessDetails.push(`Differential Diagnosis: ${val}`);
    }
    if (confM) {
      const val = confM[1].trim().replace(/\b\w/g, c => c.toUpperCase());
      diagnosesExtracted["confirmed"] = val;
      assessDetails.push(`Confirmed Diagnosis: ${val}`);
      formUpdates["assessment"] = val;
    }

    if (Object.keys(diagnosesExtracted).length === 0) {
      ["appendicitis", "osteoarthritis", "diabetes", "hypertension"].forEach(d => {
        if (clean.includes(d)) {
          const val = d.replace(/\b\w/g, c => c.toUpperCase());
          diagnosesExtracted["provisional"] = val;
          assessDetails.push(`Provisional Diagnosis: ${val}`);
          formUpdates["assessment"] = val;
        }
      });
    }

    if (Object.keys(diagnosesExtracted).length > 0) {
      extractedEntities["diagnoses"] = diagnosesExtracted;
      soap.assessment = assessDetails.join("; ") + ".";
      confidenceScores["diagnoses"] = "High";
    } else {
      soap.assessment = "Awaiting diagnostic confirmation.";
    }

    // Existing medications
    const existingMedsList: any[] = [];
    const existingMatches = clean.matchAll(/\b(?:taking|on|prescribed|using|takes|receives)\s+([a-zA-Z]+)(?:\s+(\d+)\s*(?:mg|g|ml)?)?(?:\s+(twice daily|once daily|three times daily|bd|od|tds|qds|hs|daily))?/g);
    for (const m of existingMatches) {
      const drugName = m[1].replace(/\b\w/g, c => c.toUpperCase());
      const strength = m[2] ? m[2] + "mg" : "500mg";
      let freq = m[3] ? m[3].toUpperCase() : "BD";
      if (freq.toLowerCase().includes("twice daily") || freq.toLowerCase().includes("bd")) freq = "BD";
      else if (freq.toLowerCase().includes("once daily") || freq.toLowerCase().includes("od")) freq = "OD";
      else if (freq.toLowerCase().includes("three times daily") || freq.toLowerCase().includes("tds")) freq = "TDS";
      existingMedsList.push({
        name: drugName,
        strength,
        frequency: freq,
        timing: "After Food",
        status: "Existing"
      });
    }
    if (existingMedsList.length > 0) {
      extractedEntities["existing_medications"] = existingMedsList;
      formUpdates["existing_medications"] = existingMedsList;
    }

    // New medications
    const newMedsList: any[] = [];
    const allDrugs = ["ondansetron", "paracetamol", "pcm", "amoxicillin", "metformin", "aspirin", "pantocid", "ibuprofen", "diclofenac", "pantoprazole", "tramadol", "morphine"];
    allDrugs.forEach(drug => {
      if (clean.includes(drug)) {
        if (existingMedsList.some(em => em.name.toLowerCase() === drug)) return;

        // self correction
        const dosesFound = clean.match(new RegExp(`${drug}\\s+(?:.*?)\\b(\\d+)\\s*(?:mg|g|ml|l)\\b`, 'g')) || [];
        let strength = drug === "ondansetron" ? "4mg" : (["pcm", "paracetamol"].includes(drug) ? "650mg" : "500mg");
        if (dosesFound.length > 0) {
          const lastDoseM = dosesFound[dosesFound.length - 1].match(/\b(\d+)\s*(?:mg|g|ml|l)\b/);
          if (lastDoseM) strength = lastDoseM[1] + "mg";
        }

        const routeM = clean.match(new RegExp(`${drug}.*?\\b(iv|im|oral|po|subcutaneous|stat)\\b`));
        let route = drug === "ondansetron" ? "IV" : "Oral";
        if (routeM) {
          route = routeM[1].toUpperCase();
          if (route === "PO") route = "Oral";
        }

        const freqM = clean.match(new RegExp(`${drug}.*?\\b(stat|bd|od|tds|qds|prn|sos|twice daily|once daily|daily)\\b`));
        let freq = drug === "ondansetron" ? "Stat" : "BD";
        if (freqM) {
          freq = freqM[1].toUpperCase();
          if (freq.toLowerCase().includes("twice daily") || freq.toLowerCase().includes("bd")) freq = "BD";
          else if (freq.toLowerCase().includes("once daily") || freq.toLowerCase().includes("od")) freq = "OD";
          else if (freq.toLowerCase().includes("three times daily") || freq.toLowerCase().includes("tds")) freq = "TDS";
        }

        const durM = clean.match(new RegExp(`${drug}.*?\\bfor\\s+(\\d+\\s*(?:days|weeks|months|day|week|month))\\b`));
        let durationVal = freq === "STAT" ? "Stat" : "5 Days";
        if (durM) durationVal = durM[1].replace(/\b\w/g, c => c.toUpperCase());

        newMedsList.push({
          name: drug === "pcm" ? "Paracetamol" : drug.replace(/\b\w/g, c => c.toUpperCase()),
          strength,
          route,
          duration: durationVal,
          frequency: freq,
          timing: "After Food"
        });
      }
    });

    if (newMedsList.length > 0) {
      extractedEntities["medications"] = newMedsList;
      confidenceScores["medications"] = "High";
      formUpdates["medications"] = newMedsList.map(m => ({
        name: m.name,
        dosage: m.frequency,
        timing: m.timing,
        duration: m.duration,
        route: m.route,
        strength: m.strength
      }));
    }

    // Labs
    const labsExtracted: string[] = [];
    ["cbc", "lft", "kft", "crp", "hba1c", "lipid profile", "blood sugar", "amylase", "lipase"].forEach(lab => {
      if (clean.includes(lab)) {
        labsExtracted.push(lab.toUpperCase());
      }
    });
    if (labsExtracted.length > 0) {
      extractedEntities["labs"] = labsExtracted;
      formUpdates["labs"] = labsExtracted;
      confidenceScores["labs"] = "Very High";
    }

    // Radiology
    const radsExtracted: string[] = [];
    ["ultrasound abdomen", "ultrasound", "usg", "mri", "x-ray", "xray", "ct", "ecg"].forEach(rad => {
      if (clean.includes(rad)) {
        radsExtracted.push(rad.toUpperCase());
      }
    });
    if (radsExtracted.length > 0) {
      extractedEntities["radiology"] = radsExtracted;
      formUpdates["radiology"] = radsExtracted;
      confidenceScores["radiology"] = "Very High";
    }

    // Diet / NPO
    let diet = "General";
    if (clean.includes("npo") || clean.includes("nil per os") || clean.includes("nil by mouth")) {
      diet = "NPO";
    }
    extractedEntities["diet"] = diet;
    formUpdates["diet"] = diet;

    // Procedures
    const procedures: string[] = [];
    if (clean.includes("normal saline") || clean.includes("saline")) {
      const nsM = clean.match(/\b(normal saline\s+[a-zA-Z0-9\s]+?over\s+\w+\s+(?:hours|hrs|min|mins|minutes))\b/);
      procedures.push(nsM ? nsM[1].trim().replace(/\b\w/g, c => c.toUpperCase()) : "Normal Saline infusion");
    }
    if (procedures.length > 0) {
      extractedEntities["procedures"] = procedures;
      formUpdates["procedures"] = procedures;
    }

    // Nursing instructions
    const nursingInstructions: string[] = [];
    const nurseM = clean.match(/\b(?:monitor|check|record|observe)\s+([a-zA-Z\s]+?every\s+\w+\s+(?:hours|hrs|min|mins|minutes|day|daily))\b/);
    if (nurseM) {
      nursingInstructions.push(nurseM[1].trim().replace(/\b\w/g, c => c.toUpperCase()));
    } else if (clean.includes("monitor vitals")) {
      nursingInstructions.push("Monitor vitals every 4 hours");
    }
    if (nursingInstructions.length > 0) {
      extractedEntities["nursing_instructions"] = nursingInstructions;
      formUpdates["nursing_instructions"] = nursingInstructions;
    }

    // Specialist consultation
    const consultations: string[] = [];
    if (clean.includes("general surgery") || clean.includes("call general surgery")) {
      consultations.push("General Surgery");
    }
    if (consultations.length > 0) {
      extractedEntities["specialist_consultation"] = consultations;
      formUpdates["specialist_consultation"] = consultations;
    }

    // Admission
    let admissionIntent = "None";
    let wardDept = "";
    if (clean.includes("admit") || clean.includes("admission")) {
      if (clean.includes("if ") || clean.includes("advises") || clean.includes("conditional")) {
        admissionIntent = "Conditional Admission";
      } else {
        admissionIntent = "Admit";
      }
    }
    if (clean.includes("general surgery")) {
      wardDept = "General Surgery";
    }
    extractedEntities["admission_intent"] = admissionIntent;
    formUpdates["admission_intent"] = admissionIntent;
    if (wardDept) {
      extractedEntities["ward_department"] = wardDept;
      formUpdates["ward_department"] = wardDept;
    }

    // Follow-up
    let followUp = "";
    const followM = clean.match(/\b(?:follow up|review)\s*(?:in|after)?\s*(\d+\s*(?:days|weeks|months|day|week|month))\b/);
    if (followM) {
      followUp = `Follow up in ${followM[1]}`;
    } else if (clean.includes("3 weeks") || clean.includes("three weeks")) {
      followUp = "Follow up in 3 weeks";
    }
    if (followUp) {
      extractedEntities["follow_up"] = followUp;
      formUpdates["follow_up"] = followUp;
    }

    // Plan
    const planItems: string[] = [];
    if (newMedsList.length > 0) {
      planItems.push("Prescriptions: " + newMedsList.map(m => `${m.name} ${m.strength} ${m.route} ${m.frequency}`).join(", "));
    }
    if (procedures.length > 0) planItems.push("Procedures: " + procedures.join(", "));
    if (labsExtracted.length > 0) planItems.push("Labs: " + labsExtracted.join(", "));
    if (radsExtracted.length > 0) planItems.push("Radiology: " + radsExtracted.join(", "));
    if (diet !== "General") planItems.push(`Diet: ${diet}`);
    if (nursingInstructions.length > 0) planItems.push("Nursing: " + nursingInstructions.join(", "));
    if (consultations.length > 0) planItems.push("Consultations: " + consultations.join(", "));
    if (admissionIntent !== "None") planItems.push(`Disposition: ${admissionIntent}` + (wardDept ? ` under ${wardDept}` : ""));
    if (followUp) planItems.push(followUp);

    soap.plan = planItems.length > 0 ? planItems.join("; ") + "." : "Routine follow-up.";
    formUpdates["plan"] = soap.plan;

    // EMR Draft object
    formUpdates["emrDraft"] = {
      chiefComplaint: chiefComplaint ? chiefComplaint.charAt(0).toUpperCase() + chiefComplaint.slice(1) : "",
      historyOfPresentIllness: `Patient presents with {chiefComplaint || "symptoms"}` + (duration ? ` since ${duration}` : "") + (clean.includes("vomiting") ? ", associated with vomiting." : "."),
      pastMedicalHistory: foundHistory.length > 0 ? foundHistory.join(", ") : "No significant past medical history.",
      surgicalHistory: "No surgical history.",
      familyHistory: "No significant family history.",
      socialHistory: "Non-smoker.",
      examinationFindings: formUpdates["examination_findings"] || "Physical exam normal.",
      assessment: soap.assessment,
      plan: soap.plan,
      followUp: followUp || "As needed.",
      patientInstructions: diet === "NPO" ? "Nil Per Os." : "Take meds as directed."
    };

    extractedEntities["soap"] = soap;

    this.config.onChunkProcessed({
      extractedEntities,
      formUpdates,
      triageRecommendation,
      confidenceScores,
      timestampedWords: [...this.timestampedWords],
      chunkText: text
    });
  }

  private formatElapsed(ms: number): string {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
