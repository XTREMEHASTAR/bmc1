import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, MicOff, Settings, X, Volume2, VolumeX, Shield, Radio, Check, 
  Wifi, WifiOff, FileText, Activity, Layers, MessageSquare, AlertCircle, Copy
} from 'lucide-react';
import { VoiceContextManager } from '../voice-os/VoiceCommandEngine';
import { AgentOrchestrator } from '../voice-os/agents/AgentOrchestrator';

interface VoiceAssistantOverlayProps {
  currentPortal: string;
  isDarkMode: boolean;
}

export default function VoiceAssistantOverlay({ currentPortal, isDarkMode }: VoiceAssistantOverlayProps) {
  // Config & Settings
  const [isOpen, setIsOpenState] = useState(false);
  const setIsOpen = (val: boolean) => { setIsOpenState(val); isOpenRef.current = val; };
  const [isHoldingKey, setIsHoldingKey] = useState(false);
  const isHoldingKeyRef = useRef(false);
  const [isListening, setIsListening] = useState(false);
  const [wakeWord, setWakeWordState] = useState('Hey Arogya');
  const setWakeWord = (val: string) => { setWakeWordState(val); wakeWordRef.current = val; };
  const [language, setLanguage] = useState<'mixed' | 'en' | 'hi' | 'mr'>('mixed');
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);
  const [noiseCancellation, setNoiseCancellation] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [micPermission, setMicPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [hudMessage, setHudMessage] = useState<string | null>(null);
  const hudTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // States
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [responseMessage, setResponseMessage] = useState('How can I help you, Doctor?');
  const [offlineQueue, setOfflineQueue] = useState<{ id: string; text: string; timestamp: string }[]>([]);
  const [feedbackType, setFeedbackType] = useState<'info' | 'success' | 'warning' | 'error'>('info');

  // Chat History
  type ChatEntry = {
    id: string;
    role: 'user' | 'system';
    text: string;
    corrected?: boolean;
    originalText?: string;
    feedbackType?: 'info' | 'success' | 'warning' | 'error';
    timestamp: string;
    agent?: string;
    intent?: string;
    confidence?: number;
    status?: string;
  };
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([
    { id: 'init', role: 'system', text: 'How can I help you, Doctor?', feedbackType: 'info', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Ambient Documentation Drafts
  const [soapDraft, setSoapDraft] = useState<{
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    prescription: string;
  } | null>(null);

  const [handoverDraft, setHandoverDraft] = useState<string | null>(null);

  // Audio Visualizer waveform nodes
  const [waveformLevels, setWaveformLevels] = useState<number[]>([20, 40, 25, 60, 45, 80, 50, 70, 30, 40, 20]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const speechRecognizerRef = useRef<any>(null);
  const isExplicitlyStopped = useRef<boolean>(false);
  const isListeningRef = useRef<boolean>(false);
  const isStartingRef = useRef<boolean>(false);
  const [pausedForScribing, setPausedForScribing] = useState(false);
  // Refs to avoid stale closures inside SpeechRecognition callbacks
  const isOpenRef = useRef<boolean>(false);
  const wakeWordRef = useRef<string>('Hey Arogya');
  const currentPortalRef = useRef<string>(currentPortal);
  const startSpeechRecognitionRef = useRef<() => void>(() => {});

  // Sync isListening state to ref to avoid stale closures in event handlers
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Speak voice output helper
  const speakResponse = (text: string) => {
    const enabled = localStorage.getItem('mcgm-enable-voice-speech') !== 'false';
    if (enabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = voiceSpeed;
      if (language === 'hi') {
        utterance.lang = 'hi-IN';
      } else if (language === 'mr') {
        utterance.lang = 'mr-IN';
      } else {
        utterance.lang = 'en-IN';
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  // Start waveform animation
  const startWaveformSimulation = () => {
    const updateWave = () => {
      setWaveformLevels(prev => prev.map(() => 10 + Math.floor(Math.random() * (isListening ? 80 : 20))));
      animationFrameRef.current = requestAnimationFrame(updateWave);
    };
    updateWave();
  };

  // Stop waveform animation
  const stopWaveformSimulation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // Update VoiceContextManager with current portal and update greeting
  useEffect(() => {
    VoiceContextManager.setPortal(currentPortal);
    currentPortalRef.current = currentPortal;
    if (currentPortal === 'patient') {
      setResponseMessage('How can I help you, Rahul?');
    } else if (currentPortal === 'nurse') {
      setResponseMessage('How can I help you, Sister?');
    } else {
      setResponseMessage('How can I help you, Doctor?');
    }
  }, [currentPortal]);

  // Pause Voice OS when scribing is active to prevent mic conflicts
  useEffect(() => {
    const handleScribeActive = (e: Event) => {
      const active = (e as CustomEvent).detail as boolean;
      if (active) {
        isExplicitlyStopped.current = true;
        if (speechRecognizerRef.current) {
          try { speechRecognizerRef.current.stop(); } catch (_) {}
        }
        setPausedForScribing(true);
        setIsListening(false);
        const msg = '⏸ Paused — Ambient scribing is active. Voice OS resumes when scribing stops.';
        setResponseMessage(msg);
        setFeedbackType('warning');
        const st = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setChatHistory(prev => [...prev, { id: 'sys-scribe-' + Date.now(), role: 'system', text: msg, feedbackType: 'warning', timestamp: st }]);
      } else {
        setPausedForScribing(false);
        isExplicitlyStopped.current = false;
        // Do not auto-start speech recognition here—only run when key is pressed
        const msg = '▶ Voice OS resumed. Hold Spacebar or V to speak.';
        setResponseMessage(msg);
        setFeedbackType('success');
        const st = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setChatHistory(prev => [...prev, { id: 'sys-resume-' + Date.now(), role: 'system', text: msg, feedbackType: 'success', timestamp: st }]);
      }
    };
    window.addEventListener('mcgm-scribe-active', handleScribeActive);
    return () => window.removeEventListener('mcgm-scribe-active', handleScribeActive);
  }, []);

  // Check Speech Recognition support once on mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicPermission('denied');
      const st = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatHistory(prev => [...prev, { id: 'sys-nosupport', role: 'system', text: 'Speech recognition is not supported in this browser. Please use Chrome or Edge.', feedbackType: 'error', timestamp: st }]);
    }
  }, []);

  // Dynamically initialize SpeechRecognition on every start
  const startSpeechRecognition = () => {
    if ((isListeningRef.current || isStartingRef.current) && speechRecognizerRef.current) {
      return;
    }
    
    isStartingRef.current = true;
    
    if (speechRecognizerRef.current) {
      try {
        speechRecognizerRef.current.stop();
      } catch (e) {}
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.maxAlternatives = 1;

      if (language === 'hi') recognizer.lang = 'hi-IN';
      else if (language === 'mr') recognizer.lang = 'mr-IN';
      else recognizer.lang = 'en-IN';

      recognizer.onstart = () => {
        if (speechRecognizerRef.current !== recognizer) return;
        isStartingRef.current = false;
        setIsListening(true);
        setMicPermission('granted');
        setFeedbackType('info');
        startWaveformSimulation();
      };

      recognizer.onresult = (event: any) => {
        if (speechRecognizerRef.current !== recognizer) return;
        let finalTrans = '';
        let interimTrans = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTrans += event.results[i][0].transcript;
          else interimTrans += event.results[i][0].transcript;
        }
        if (finalTrans) {
          setTranscript(finalTrans);
          setInterimTranscript('');
          processCommandWithRefs(finalTrans, isOpenRef.current, wakeWordRef.current, currentPortalRef.current);
        }
        if (interimTrans) setInterimTranscript(interimTrans);
      };

      recognizer.onerror = (e: any) => {
        if (speechRecognizerRef.current !== recognizer) return;
        isStartingRef.current = false;
        console.error('[VoiceOS] SpeechRecognition error:', e.error);
        if (e.error === 'not-allowed' || e.error === 'permission-denied') {
          if (document.hidden) {
            console.warn('[VoiceOS] Speech recognition stopped due to backgrounding. Will resume on focus.');
            return;
          }
          if (micPermission !== 'granted') {
            setMicPermission('denied');
            isExplicitlyStopped.current = true;
            const st = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const msg = '🚫 Microphone access denied. Click the lock icon in your browser address bar to allow access, then click the orb again.';
            setChatHistory(prev => [...prev, { id: 'sys-denied-' + Date.now(), role: 'system', text: msg, feedbackType: 'error', timestamp: st }]);
            setResponseMessage(msg);
            setFeedbackType('error');
          } else {
            console.warn('[VoiceOS] Speech recognition start blocked by browser (gesture restriction). Waiting for user focus/interaction.');
          }
        } else if (e.error === 'audio-capture') {
          const st = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const msg = '🎤 No microphone found. Please connect a microphone and try again.';
          setChatHistory(prev => [...prev, { id: 'sys-nomic-' + Date.now(), role: 'system', text: msg, feedbackType: 'error', timestamp: st }]);
          isExplicitlyStopped.current = true;
        } else if (e.error === 'network') {
          console.warn('[VoiceOS] Network error, will retry...');
        }
      };

      recognizer.onend = () => {
        if (speechRecognizerRef.current !== recognizer) return;
        isStartingRef.current = false;
        setIsListening(false);
        setInterimTranscript('');
        stopWaveformSimulation();
        // Only restart automatically if the user is still holding down the command key
        if (isHoldingKeyRef.current && !isExplicitlyStopped.current && !document.hidden) {
          setTimeout(() => {
            if (isHoldingKeyRef.current && !isExplicitlyStopped.current && !document.hidden) {
              startSpeechRecognition();
            }
          }, 400);
        }
      };

      speechRecognizerRef.current = recognizer;
      recognizer.start();
    } catch (err) {
      isStartingRef.current = false;
      console.error('[VoiceOS] Failed to start recognition:', err);
    }
  };

  useEffect(() => {
    startSpeechRecognitionRef.current = startSpeechRecognition;
  }, [language, isListening]);

  // Self-healing watchdog: automatically restart recognition if it stops unexpectedly
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        isHoldingKeyRef.current &&
        !isListeningRef.current &&
        !isStartingRef.current &&
        !isExplicitlyStopped.current &&
        !pausedForScribing &&
        !document.hidden &&
        micPermission === 'granted'
      ) {
        console.log('[VoiceOS] Watchdog: Speech recognition stopped unexpectedly. Restarting...');
        try {
          startSpeechRecognition();
        } catch (e) {
          console.error('[VoiceOS] Watchdog restart failed:', e);
        }
      }
    }, 2000); // Check every 2 seconds for aggressive self-healing

    return () => clearInterval(interval);
  }, [pausedForScribing, micPermission]);

  // Auto-resume speech recognition when the tab regains focus or becomes visible
  useEffect(() => {
    const handleFocus = () => {
      if (
        isHoldingKeyRef.current &&
        !isListeningRef.current &&
        !isStartingRef.current &&
        !isExplicitlyStopped.current &&
        !pausedForScribing &&
        micPermission === 'granted'
      ) {
        console.log('[VoiceOS] Window focused. Resuming speech recognition...');
        startSpeechRecognition();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        if (
          isHoldingKeyRef.current &&
          !isListeningRef.current &&
          !isStartingRef.current &&
          !isExplicitlyStopped.current &&
          !pausedForScribing &&
          micPermission === 'granted'
        ) {
          console.log('[VoiceOS] Document visible. Resuming speech recognition...');
          startSpeechRecognition();
        }
      } else {
        // Document is hidden, stop recognition to prevent background retry loops
        if (speechRecognizerRef.current) {
          try {
            speechRecognizerRef.current.stop();
          } catch (e) {}
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isOpen, pausedForScribing, micPermission]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      isExplicitlyStopped.current = true;
      if (speechRecognizerRef.current) {
        try { speechRecognizerRef.current.stop(); } catch (_) {}
      }
      stopWaveformSimulation();
      if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    };
  }, []);

  // Helper: request mic permission via getUserMedia then start recognizer
  const requestMicAndStart = async () => {
    if (isListening) return; // already running
    try {
      // getUserMedia triggers the browser permission prompt (required user gesture)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop()); // release stream; recognizer manages its own
      setMicPermission('granted');
      isExplicitlyStopped.current = false;
      isStartingRef.current = false;
      startSpeechRecognition();
    } catch (err: any) {
      console.error('[VoiceOS] getUserMedia denied:', err);
      setMicPermission('denied');
      const st = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const msg = '🚫 Microphone access denied. Please allow mic access in browser and try again.';
      setChatHistory(prev => [...prev, { id: 'sys-denied-' + Date.now(), role: 'system', text: msg, feedbackType: 'error', timestamp: st }]);
    }
  };

  // Core Command Action execution (called directly or after wake word check)
  const executeCommandAction = (text: string) => {
    // Trigger local offline buffer if simulated offline
    if (isOfflineMode) {
      const newOfflineItem = {
        id: 'off_' + Date.now(),
        text: text,
        timestamp: new Date().toLocaleTimeString()
      };
      setOfflineQueue(prev => [...prev, newOfflineItem]);
      setFeedbackType('warning');
      setResponseMessage('Offline Mode Active. Command saved locally. Click Sync when back online.');
      speakResponse('Saved command offline.');
      return;
    }

    // Route through multi-agent orchestrator
    const { response } = AgentOrchestrator.process(text);
    if (response.success) {
      setFeedbackType('success');
      setResponseMessage(response.message);

      // Handle specific intents to update local state drafts
      if (response.intent === 'GENERATE_SOAP') {
        setSoapDraft({
          subjective: 'Patient reports persistent mechanical knee joint stiffness, exacerbated during deep flexion. Relieved on rest.',
          objective: 'Tenderness over the medial tibial plateau. Mild crepitus. No collateral instability or joint effusion.',
          assessment: 'Left Knee Primary Osteoarthritis (ICD-10 M17.11) - Stage II.',
          plan: 'Start Quadriceps isometric rehabilitation, prescribe Tab Aceclofenac 100mg twice daily with PPI shield, follow up 3 weeks.',
          prescription: 'Tab. Aceclofenac 100mg (1-0-1) 5 days, Tab. Pantoprazole 40mg (1-0-0) 5 days.'
        });
      } else if (response.intent === 'GENERATE_HANDOVER') {
        setHandoverDraft(
          `Orthopedic Ward Unit 4B - Shift Handover Report\n` +
          `Date: ${new Date().toLocaleDateString()} | Nurse: Sister Sneha Shinde\n\n` +
          `Active Patients: 4 Beds Occupied.\n` +
          `- Bed 401 (Rahul Patil): Stable post-op recovery. Knee dressing clean.\n` +
          `- Bed 403 (Ramesh Joshi): Temp spiked at 101.2 F. Administered Inj Paracetamol 1g IV. Monitoring Q2H.\n` +
          `- Bed 404 (Mahesh Jadhav): Extremity perfusion normal, cast checked.\n\n` +
          `All orders executed. Inventories checked.`
        );
      }
    } else {
      setFeedbackType('info');
      setResponseMessage(response.message);
      speakResponse(response.message);
    }
  };

  // Fuzzy matching is now handled by SpeechNormalizer in the voice-os engine layer

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Update initial chat greeting when portal changes
  useEffect(() => {
    const greeting = currentPortal === 'patient'
      ? 'How can I help you, Rahul?'
      : currentPortal === 'nurse'
        ? 'How can I help you, Sister?'
        : 'How can I help you, Doctor?';
    setChatHistory([{ id: 'init-' + currentPortal, role: 'system', text: greeting, feedbackType: 'info', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
  }, [currentPortal]);

  // Expose test function to window for automation/testing
  useEffect(() => {
    (window as any).simulateVoiceInput = (text: string) => {
      console.log(`[VoiceTest] Simulating voice input: "${text}"`);
      setTranscript(text);
      processCommand(text);
    };
    return () => {
      delete (window as any).simulateVoiceInput;
    };
  }, [wakeWord]);

  // Ref-based command processor — avoids stale closure inside SpeechRecognition callbacks
  const processCommandWithRefs = (
    text: string,
    openNow: boolean,
    wakeWordNow: string,
    portalNow: string,
    fromTyping = false
  ) => {
    // Run through multi-agent orchestrator (handles fuzzy correction internally)
    const { response, normalized, wasChanged } = AgentOrchestrator.process(text);
    const effectiveText = normalized || text;

    // Push user bubble into chat history
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatHistory(prev => [...prev, {
      id: 'u-' + Date.now(),
      role: 'user',
      text: effectiveText,
      corrected: wasChanged,
      originalText: wasChanged ? text : undefined,
      timestamp: ts,
      agent: response.agent,
      intent: response.intent,
      confidence: response.confidence,
      status: response.success ? (response.action === 'confirm' ? 'Awaiting Confirmation' : 'Executed') : 'Failed/Unrecognized'
    }]);
    const raw = effectiveText.toLowerCase().trim();
    const currentWakeWord = wakeWordNow.toLowerCase();

    const pushSystemMsg = (msg: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
      const st = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatHistory(prev => [...prev, { id: 'sys-' + Date.now(), role: 'system', text: msg, feedbackType: type, timestamp: st }]);
      setResponseMessage(msg);
      setFeedbackType(type);
    };

    const wakeWordVariations = [
      currentWakeWord,
      'hey arogya', 'arogya', 'aarogya', 'hey aarogya',
      'hai arogya', 'hello arogya', 'computer', 'assistant',
      'doctor', 'hey doctor', 'ok doctor', 'okay doctor'
    ];

    const bypassWakeWord = isHoldingKeyRef.current || fromTyping;

    if (!openNow && !bypassWakeWord) {
      const matchedWakeWord = wakeWordVariations.find(v => raw.includes(v));
      if (matchedWakeWord) {
        setIsOpen(true);
        const greetText = portalNow === 'patient'
          ? 'Yes, Rahul? How can I help you?'
          : portalNow === 'nurse'
            ? 'Yes, Sister? How can I help you?'
            : 'Yes, Doctor? How can I help you?';
        const speakGreet = portalNow === 'patient' ? 'Yes, Rahul?' : portalNow === 'nurse' ? 'Yes, Sister?' : 'Yes, Doctor?';
        pushSystemMsg(greetText, 'success');
        speakResponse(speakGreet);

        const parts = raw.split(matchedWakeWord);
        if (parts.length > 1 && parts[1].trim()) {
          const remainingCommand = parts[1].trim();
          setTimeout(() => executeCommandAction(remainingCommand), 1000);
        }
      }
      return;
    }

    // Process the already-computed orchestrator response
    if (response.success && response.intent !== 'THROTTLED') {
      // Map agent type to feedback styling
      const feedbackMap: Record<string, 'success' | 'info'> = {
        voice_command: 'success',
        documentation: 'success',
        search: 'success',
        analytics: 'success',
        conversation: 'info',
        orchestrator: 'info',
      };
      const fbType = feedbackMap[response.agent] || 'success';
      pushSystemMsg(response.message, fbType);
      speakResponse(response.message);

      // Display HUD message for visual confirmation
      if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
      setHudMessage(response.message);
      hudTimeoutRef.current = setTimeout(() => {
        setHudMessage(null);
      }, 4000);

      if (response.intent === 'GENERATE_SOAP') {
        setSoapDraft({
          subjective: 'Patient reports persistent mechanical knee joint stiffness, exacerbated during deep flexion. Relieved on rest.',
          objective: 'Tenderness over the medial tibial plateau. Mild crepitus. No collateral instability or joint effusion.',
          assessment: 'Left Knee Primary Osteoarthritis (ICD-10 M17.11) - Stage II.',
          plan: 'Start Quadriceps isometric rehabilitation, prescribe Tab Aceclofenac 100mg twice daily with PPI shield, follow up 3 weeks.',
          prescription: 'Tab. Aceclofenac 100mg (1-0-1) 5 days, Tab. Pantoprazole 40mg (1-0-0) 5 days.'
        });
      } else if (response.intent === 'GENERATE_HANDOVER') {
        setHandoverDraft(
          `Orthopedic Ward Unit 4B - Shift Handover Report\n` +
          `Date: ${new Date().toLocaleDateString()} | Nurse: Sister Sneha Shinde\n\n` +
          `Active Patients: 4 Beds Occupied.\n` +
          `- Bed 401 (Rahul Patil): Stable post-op recovery. Knee dressing clean.\n` +
          `- Bed 403 (Ramesh Joshi): Temp spiked at 101.2 F. Administered Inj Paracetamol 1g IV. Monitoring Q2H.\n` +
          `- Bed 404 (Mahesh Jadhav): Extremity perfusion normal, cast checked.\n\n` +
          `All orders executed. Inventories checked.`
        );
      }
      return;
    }

    // Unrecognized command
    pushSystemMsg(response.message, 'info');
    speakResponse(response.message);

    // Display HUD message for visual confirmation
    if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    setHudMessage(response.message);
    hudTimeoutRef.current = setTimeout(() => {
      setHudMessage(null);
    }, 4000);
  };

  // Legacy wrapper used by simulateVoiceInput and manual form
  const processCommand = (text: string) => {
    processCommandWithRefs(text, isOpenRef.current, wakeWordRef.current, currentPortalRef.current);
  };

  // Sync offline transcripts
  const syncOfflineQueue = () => {
    if (offlineQueue.length === 0) return;
    setFeedbackType('success');
    setResponseMessage(`Synced ${offlineQueue.length} offline speech events to server ledger.`);
    speakResponse(`Synced offline cache.`);
    setOfflineQueue([]);
  };

  // Toggle Assistant listening
  const toggleListening = () => {
    if (isListening) {
      isExplicitlyStopped.current = true;
      if (speechRecognizerRef.current) {
        try { speechRecognizerRef.current.stop(); } catch (_) {}
      }
    } else {
      setTranscript('');
      setInterimTranscript('');
      isExplicitlyStopped.current = false;
      startSpeechRecognition();
    }
  };

  // Keyboard shortcut listener for Push-to-Talk (holding Space or V)
  // NOTE: These shortcuts only control speech recognition — they do NOT open the panel.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Push-to-Talk via Space or 'v' (when not focused on inputs)
      const isInput = 
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement || 
        e.target instanceof HTMLSelectElement ||
        (e.target as HTMLElement).isContentEditable;

      if (isInput) return;

      if (e.code === 'Space' || e.key.toLowerCase() === 'v') {
        // Prevent default spacebar scrolling behavior
        if (e.code === 'Space') {
          e.preventDefault();
        }

        if (!isHoldingKeyRef.current) {
          isHoldingKeyRef.current = true;
          setIsHoldingKey(true);
          isStartingRef.current = false; // Safety reset for push-to-talk activation

          // Start listening (panel does NOT open — click the orb to open it)
          setTranscript('');
          setInterimTranscript('');
          isExplicitlyStopped.current = false;
          if (micPermission === 'granted') {
            startSpeechRecognition();
          } else {
            requestMicAndStart();
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key.toLowerCase() === 'v') {
        if (isHoldingKeyRef.current) {
          isHoldingKeyRef.current = false;
          setIsHoldingKey(false);

          // Wait a short delay before stopping to ensure speech is fully captured
          setTimeout(() => {
            if (!isHoldingKeyRef.current) {
              isExplicitlyStopped.current = true;
              try {
                speechRecognizerRef.current?.stop();
              } catch (_) {}
            }
          }, 800);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [language, micPermission]);

  return (
    <>
      {/* Floating Activation orb button (above bottom nav bar) */}
      <div className="fixed right-4 z-55 flex flex-col items-end space-y-3" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)' }}>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className={`w-[calc(100vw-32px)] max-w-96 max-h-[calc(100dvh-160px)] rounded-3xl border shadow-2xl p-5 flex flex-col space-y-4 z-55 overflow-y-auto ${
                isDarkMode 
                  ? 'bg-slate-950/95 border-slate-800 text-white backdrop-blur-md' 
                  : 'bg-white/95 border-gray-200 text-[#0A5BFF] backdrop-blur-md shadow-slate-200'
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-800/10 dark:border-slate-800/60">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="font-extrabold text-xs tracking-wider uppercase">Arogya Voice OS</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-1 rounded-lg hover:bg-slate-800/10 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-800/10 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Mic Permission Banner — shown when blocked */}
              {micPermission === 'denied' && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-2xl px-3 py-2">
                  <MicOff className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-[10px] text-red-300 flex-1 leading-tight">
                    Mic blocked. Click the lock icon in browser address bar → Allow Microphone.
                  </p>
                  <button
                    onClick={() => requestMicAndStart()}
                    className="text-[9px] font-bold bg-red-500 hover:bg-red-400 text-white px-2 py-1 rounded-lg shrink-0 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Compact waveform status bar */}
              <div className="flex items-center gap-3 px-3 py-2 bg-slate-900/60 rounded-2xl border border-slate-800/40">
                <div className="flex items-center gap-0.5 h-7 shrink-0">
                  {waveformLevels.slice(0, 7).map((val, idx) => (
                    <motion.div
                      key={idx}
                      animate={{ height: `${val}%` }}
                      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                      className={`w-0.5 rounded-full ${
                        isListening
                          ? 'bg-gradient-to-t from-indigo-500 via-purple-400 to-pink-400'
                          : 'bg-slate-700'
                      }`}
                      style={{ minHeight: 3 }}
                    />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  {interimTranscript ? (
                    <p className="text-[11px] text-indigo-300 italic truncate">🎙 {interimTranscript}</p>
                  ) : (
                    <p className="text-[10px] text-slate-500 font-medium">
                      {isHoldingKey
                        ? '🎙 Holding to talk... Release key to submit'
                        : isListening
                        ? '● Listening...'
                        : micPermission === 'unknown'
                        ? 'Tap the orb below to enable mic'
                        : `Say "${wakeWord}" or hold Spacebar`}
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  {isOfflineMode ? (
                    <span className="bg-amber-600/20 text-amber-400 text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-500/30">
                      <WifiOff className="w-2 h-2" />OFFLINE
                    </span>
                  ) : (
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 border ${
                      isListening
                        ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30'
                        : 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      <Wifi className="w-2 h-2" />{isListening ? 'ON AIR' : 'LIVE'}
                    </span>
                  )}
                </div>
              </div>

              {/* ── Chat History ─────────────────────────────────────────── */}
              <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-0.5" style={{ scrollbarWidth: 'thin' }}>
                {chatHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {entry.role === 'user' ? (
                      <div className="max-w-[85%] flex flex-col items-end gap-1">
                        {entry.corrected && (
                          <span className="text-[8px] text-amber-500 dark:text-amber-400 font-bold flex items-center gap-1 mr-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-pulse" />
                            Auto-corrected from: &ldquo;{entry.originalText}&rdquo;
                          </span>
                        )}
                        <div className="bg-indigo-650 dark:bg-indigo-600/90 text-white rounded-2xl rounded-tr-sm px-3.5 py-2 text-[11px] font-medium shadow-md shadow-indigo-900/10">
                          {entry.text}
                        </div>
                        
                        {/* Command Recognition & Execution Metadata Badges */}
                        {(entry.agent || entry.intent || entry.confidence !== undefined || entry.status) && (
                          <div className="flex flex-wrap gap-1 justify-end px-1 max-w-full">
                            {entry.agent && (
                              <span className="text-[7.5px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900/60 dark:text-slate-400 text-slate-600 border border-slate-200/50 dark:border-slate-800/40">
                                🤖 {entry.agent.replace('_', ' ')}
                              </span>
                            )}
                            {entry.intent && entry.intent !== 'UNRECOGNIZED' && entry.intent !== 'EMPTY' && (
                              <span className="text-[7.5px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900/60 dark:text-slate-400 text-slate-600 border border-slate-200/50 dark:border-slate-800/40">
                                🎯 {entry.intent}
                              </span>
                            )}
                            {entry.confidence !== undefined && entry.confidence > 0 && (
                              <span className={`text-[7.5px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                                entry.confidence >= 90 
                                  ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                                  : entry.confidence >= 70
                                  ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/25'
                                  : 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/25'
                              }`}>
                                📊 {entry.confidence}% Conf
                              </span>
                            )}
                            {entry.status && (
                              <span className={`text-[7.5px] font-bold px-1.5 py-0.5 rounded border ${
                                entry.status === 'Executed'
                                  ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/25'
                                  : entry.status === 'Awaiting Confirmation'
                                  ? 'bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/25'
                                  : 'bg-gray-500/10 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/25'
                              }`}>
                                ⚡ {entry.status}
                              </span>
                            )}
                          </div>
                        )}
                        <span className="text-[8px] text-slate-400 dark:text-slate-500 mr-1">{entry.timestamp}</span>
                      </div>
                    ) : (
                      <div className="max-w-[78%] flex flex-col items-start gap-0.5">
                        <div className={`rounded-2xl rounded-tl-sm px-3 py-2 text-[11px] font-medium border ${
                          entry.feedbackType === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                            : entry.feedbackType === 'warning'
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                            : entry.feedbackType === 'error'
                            ? 'bg-red-500/10 border-red-500/20 text-red-300'
                            : 'bg-slate-800/80 border-slate-700/40 text-slate-300'
                        }`}>
                          {entry.text}
                        </div>
                        <span className="text-[8px] text-slate-500 ml-1">{entry.timestamp}</span>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* ── Type / Manual Command Input ─────────────────────────── */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.target as HTMLFormElement;
                  const input = target.elements.namedItem('manualCommand') as HTMLInputElement;
                  if (input.value.trim()) {
                    processCommand(input.value);
                    input.value = '';
                  }
                }}
                className="flex items-center gap-2 bg-slate-900/80 border border-slate-700 rounded-xl p-1"
              >
                <input
                  name="manualCommand"
                  type="text"
                  placeholder="Type a command or speak..."
                  className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                >
                  Send
                </button>
              </form>

              {/* Ambient Documentation drafts panel */}
              {soapDraft && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                    <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Ambient SOAP Draft</span>
                    </span>
                    <button 
                      onClick={() => setSoapDraft(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[10px] space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    <p><strong className="text-gray-400">Subjective:</strong> {soapDraft.subjective}</p>
                    <p><strong className="text-gray-400">Objective:</strong> {soapDraft.objective}</p>
                    <p><strong className="text-gray-400">Assessment:</strong> {soapDraft.assessment}</p>
                    <p><strong className="text-gray-400">Plan:</strong> {soapDraft.plan}</p>
                    <p><strong className="text-gray-400">Prescription:</strong> {soapDraft.prescription}</p>
                  </div>
                  <div className="flex space-x-2 pt-1 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        // Trigger custom event to write meds to patient file
                        window.dispatchEvent(new CustomEvent('mcgm-doctor-prescribe', { detail: 'Tab. Aceclofenac 100mg' }));
                        setSoapDraft(null);
                        setFeedbackType('success');
                        setResponseMessage('Prescription & SOAP notes successfully synced to consultation card.');
                        speakResponse('Approved and synced.');
                      }}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] py-1.5 rounded-xl flex items-center justify-center space-x-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Approve & Sync</span>
                    </button>
                  </div>
                </div>
              )}

              {handoverDraft && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider flex items-center space-x-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Shift Handover Draft</span>
                    </span>
                    <button 
                      onClick={() => setHandoverDraft(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <pre className="text-[9px] font-mono leading-relaxed bg-black/35 p-2 rounded-xl text-gray-300 max-h-32 overflow-y-auto whitespace-pre-wrap">
                    {handoverDraft}
                  </pre>
                  <div className="flex space-x-2 pt-1 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        setHandoverDraft(null);
                        setFeedbackType('success');
                        setResponseMessage('Shift handover signed & stored in ward logbook.');
                        speakResponse('Shift handover approved.');
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-1.5 rounded-xl flex items-center justify-center space-x-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Approve Handover</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Settings pane */}
              {showSettings && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <h4 className="font-extrabold text-[10px] tracking-wider uppercase text-gray-400 border-b border-slate-800 pb-1">
                    Voice UI Preferences
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Wake Word:</span>
                      <select 
                        value={wakeWord} 
                        onChange={(e) => setWakeWord(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-white"
                      >
                        <option value="Hey Arogya">Hey Arogya</option>
                        <option value="Computer">Computer</option>
                        <option value="Assistant">Assistant</option>
                      </select>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Primary Language:</span>
                      <select 
                        value={language} 
                        onChange={(e) => setLanguage(e.target.value as any)}
                        className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-white"
                      >
                        <option value="mixed">Mixed (Hinglish/Marathi)</option>
                        <option value="en">English (India)</option>
                        <option value="hi">Hindi (हिंदी)</option>
                        <option value="mr">Marathi (मराठी)</option>
                      </select>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Voice Speed:</span>
                      <input 
                        type="range" 
                        min="0.7" 
                        max="1.5" 
                        step="0.1" 
                        value={voiceSpeed}
                        onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                        className="w-20 accent-indigo-500"
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Noise Cancellation:</span>
                      <button
                        onClick={() => setNoiseCancellation(!noiseCancellation)}
                        className={`w-8 h-4 rounded-full transition-colors relative ${noiseCancellation ? 'bg-emerald-500' : 'bg-slate-800'}`}
                      >
                        <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.25 transition-all ${noiseCancellation ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Offline Buffer Mode:</span>
                      <button
                        onClick={() => {
                          setIsOfflineMode(!isOfflineMode);
                          if (!isOfflineMode) {
                            speakResponse('Switched to offline recording mode.');
                          } else {
                            speakResponse('Switched back online.');
                          }
                        }}
                        className={`w-8 h-4 rounded-full transition-colors relative ${isOfflineMode ? 'bg-amber-500' : 'bg-slate-800'}`}
                      >
                        <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.25 transition-all ${isOfflineMode ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>

                    {offlineQueue.length > 0 && (
                      <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                        <span className="text-[10px] text-amber-500 font-bold">
                          {offlineQueue.length} Transcripts buffered
                        </span>
                        <button
                          onClick={syncOfflineQueue}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[9px] px-2 py-1 rounded"
                        >
                          Sync Logs
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}


            </motion.div>
          )}
        </AnimatePresence>

        {/* HUD Tooltip Feedback Bubble */}
        <AnimatePresence>
          {(isListening || hudMessage || micPermission === 'denied') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: -4 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className={`max-w-[280px] rounded-2xl px-3.5 py-2 text-[10px] font-bold shadow-xl border backdrop-blur-md transition-all ${
                micPermission === 'denied'
                  ? 'bg-red-500/10 border-red-500/30 text-red-650 dark:text-red-400'
                  : isDarkMode
                  ? 'bg-slate-900/90 border-slate-800 text-white'
                  : 'bg-white/95 border-gray-200 text-[#003F8A]'
              }`}
            >
              {micPermission === 'denied' ? (
                <div className="flex items-center gap-2">
                  <MicOff className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span className="leading-tight">
                    Microphone access denied. Please allow mic access in your browser.
                  </span>
                </div>
              ) : isListening ? (
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="truncate italic">
                    {interimTranscript || "Listening..."}
                  </span>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-tight">{hudMessage}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulsing Glowing holographic Siri / Apple Intelligence orb */}
        {/* Badge: paused for scribing */}
        {pausedForScribing && (
          <div className="absolute -top-1 -left-1 z-10 bg-amber-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-lg">
            SCRIBE
          </div>
        )}
        <button
          onClick={async () => {
            if (micPermission !== 'granted') {
              await requestMicAndStart();
            } else {
              if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
              setHudMessage("Hold Spacebar or V to speak voice commands.");
              hudTimeoutRef.current = setTimeout(() => {
                setHudMessage(null);
              }, 4000);
              speakResponse("Hold Spacebar or V to speak voice commands.");
            }
          }}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden transition-all hover:scale-105 active:scale-95 border-2 border-white/20 cursor-pointer ${
            pausedForScribing
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 ring-4 ring-amber-500/30'
              : isListening 
              ? 'bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 ring-4 ring-indigo-500/20' 
              : 'bg-gradient-to-tr from-slate-900 via-[#0a101f] to-slate-950 hover:border-indigo-500/40'
          }`}
        >
          {pausedForScribing ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <MicOff className="w-6 h-6 text-white z-10" />
            </div>
          ) : isListening ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="w-10 h-10 rounded-full bg-white/20 animate-ping absolute" />
              <Mic className="w-6 h-6 text-white z-10" />
            </div>
          ) : (
            <div className="relative flex items-center justify-center w-full h-full">
              {/* Pulsing background ambient light circles */}
              <span className="absolute w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500/30 to-pink-500/30 blur-md animate-pulse" />
              <Mic className="w-5.5 h-5.5 text-indigo-400 hover:text-white transition-colors" />
            </div>
          )}
        </button>
      </div>

    </>
  );
}
