import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Users, UserPlus, Heart, Activity, Mic, AlertTriangle } from 'lucide-react';
import { FAMILY_MEMBERS } from '../../data/emergencyData';
import type { FamilyMember } from '../../types/emergencySOS';

function parseSpeechPatientDetails(text: string) {
  const normalized = text.toLowerCase();
  
  let extractedName = '';
  let extractedAge: number | null = null;
  let extractedGender = '';
  let extractedBloodGroup = '';
  let extractedConditions = '';
  let extractedHistory = '';

  // 1. Age extraction
  const ageMatch = normalized.match(/\b(\d{1,3})\s*(?:years\s*old|years|yr|year\s*old|yrs|yo)\b/i) || 
                   normalized.match(/\bage\s*(?:is\s*)?(\d{1,3})\b/i) || 
                   normalized.match(/\b(?:he|she)\s+is\s+(\d{1,3})\b/i);
  if (ageMatch) {
    extractedAge = parseInt(ageMatch[1], 10);
  }

  // 2. Gender extraction
  if (/\bmale\b/i.test(normalized)) extractedGender = 'Male';
  else if (/\bfemale\b/i.test(normalized)) extractedGender = 'Female';
  else if (/\bother\b/i.test(normalized)) extractedGender = 'Other';

  // 3. Blood group extraction
  const bloodMatch = normalized.match(/\b([ab]{1,2}|o)\s*(positive|negative|\+|\-)\b/i);
  if (bloodMatch) {
    const type = bloodMatch[1].toUpperCase();
    const sign = bloodMatch[2].startsWith('pos') || bloodMatch[2] === '+' ? '+' : '-';
    extractedBloodGroup = type + sign;
  } else {
    const shortBloodMatch = normalized.match(/\b(a\+|a\-|b\+|b\-|ab\+|ab\-|o\+|o\-)\b/i);
    if (shortBloodMatch) {
      extractedBloodGroup = shortBloodMatch[1].toUpperCase();
    }
  }

  // 4. Name extraction
  const stopWords = ['is', 'has', 'and', 'with', 'in', 'by', 'eta', 'years', 'old', 'blood', 'group', 'coming', 'he', 'she', 'about', 'friend', 'brother', 'father', 'mother', 'relative', 'patient', 'diabetic', 'asthma', 'hypertension', 'allergy'];
  const namePatterns = [
    /patient\s+name\s+is\s+([a-z\s]+?)(?:\s+age|\s+who|\s+is|\s+and|\s+has|\s+blood|\s+coming|$)/i,
    /patient\s+is\s+([a-z\s]+?)(?:\s+age|\s+who|\s+is|\s+and|\s+has|\s+blood|\s+coming|$)/i,
    /patient\s+([a-z\s]+?)(?:\s+age|\s+who|\s+is|\s+and|\s+has|\s+blood|\s+coming|$)/i,
    /friend\s+([a-z\s]+?)(?:\s+age|\s+who|\s+is|\s+and|\s+has|\s+blood|\s+coming|$)/i,
    /brother\s+([a-z\s]+?)(?:\s+age|\s+who|\s+is|\s+and|\s+has|\s+blood|\s+coming|$)/i,
    /father\s+([a-z\s]+?)(?:\s+age|\s+who|\s+is|\s+and|\s+has|\s+blood|\s+coming|$)/i,
    /mother\s+([a-z\s]+?)(?:\s+age|\s+who|\s+is|\s+and|\s+has|\s+blood|\s+coming|$)/i,
    /relative\s+([a-z\s]+?)(?:\s+age|\s+who|\s+is|\s+and|\s+has|\s+blood|\s+coming|$)/i,
    /for\s+([a-z\s]+?)(?:\s+age|\s+who|\s+is|\s+and|\s+has|\s+blood|\s+coming|$)/i,
    /name\s+is\s+([a-z\s]+?)(?:\s+age|\s+who|\s+is|\s+and|\s+has|\s+blood|\s+coming|$)/i,
  ];

  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      let candidate = match[1].trim();
      candidate = candidate.replace(/^(is|was|called)\s+/i, '').trim();
      const words = candidate.split(/\s+/);
      if (words.length >= 1 && words.length <= 3 && !words.some(w => stopWords.includes(w.toLowerCase()))) {
        extractedName = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        break;
      }
    }
  }

  // 5. Conditions/Diseases
  const knownConditions = ['diabetes', 'diabetic', 'asthma', 'hypertension', 'heart disease', 'blood pressure', 'high blood pressure', 'bp', 'allergy', 'allergies'];
  const foundConditions: string[] = [];
  for (const cond of knownConditions) {
    if (normalized.includes(cond)) {
      foundConditions.push(cond.charAt(0).toUpperCase() + cond.slice(1));
    }
  }
  if (foundConditions.length > 0) {
    extractedConditions = foundConditions.join(', ');
  }

  // 6. Medical History
  const historyPatterns = [
    /(?:history of|had|has a history of|suffering from)\s+([a-z0-9\s]+?)(?:\s+and|\s+is|\s+since|\s+for|$)/i
  ];
  for (const pattern of historyPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      extractedHistory = match[1].trim();
      break;
    }
  }

  return {
    name: extractedName,
    age: extractedAge,
    gender: extractedGender,
    bloodGroup: extractedBloodGroup,
    conditions: extractedConditions,
    history: extractedHistory
  };
}

interface Props {
  onNext: (patient: {
    name: string;
    age: number;
    gender: string;
    bloodGroup: string;
    conditions: string;
    history?: string;
    isNew: boolean;
  }) => void;
  onBack: () => void;
  selectedPersonType: 'myself' | 'family' | 'someone';
}

export default function SOSPatientStep({ onNext, onBack, selectedPersonType }: Props) {
  const [useExisting, setUseExisting] = useState(selectedPersonType === 'family');
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(
    selectedPersonType === 'family' ? FAMILY_MEMBERS[0] : null
  );

  const [name, setName] = useState(
    selectedPersonType === 'myself' ? 'Jaiveer Patil' : ''
  );
  const [age, setAge] = useState<number>(selectedPersonType === 'myself' ? 25 : 30);
  const [gender, setGender] = useState<string>(selectedPersonType === 'myself' ? 'Male' : 'Male');
  const [bloodGroup, setBloodGroup] = useState<string>(selectedPersonType === 'myself' ? 'O+' : 'O+');
  const [conditions, setConditions] = useState<string>(selectedPersonType === 'myself' ? 'None' : '');
  const [history, setHistory] = useState<string>('');

  // Voice Scribe states
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isManualTyping, setIsManualTyping] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [extractedDetails, setExtractedDetails] = useState<any>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const recognitionRef = React.useRef<any>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const audioStreamRef = React.useRef<MediaStream | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);

  const startAudioMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkVolume = () => {
          if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;
          analyser.getByteFrequencyData(dataArray);

          let values = 0;
          const length = dataArray.length;
          for (let i = 0; i < length; i++) {
            values += dataArray[i];
          }
          const average = values / length;
          const level = Math.min(100, Math.round((average / 128) * 100));
          setAudioLevel(level);

          animationFrameRef.current = requestAnimationFrame(checkVolume);
        };

        checkVolume();
      }
    } catch (err) {
      console.warn('Audio level monitoring failed to start:', err);
    }
  };

  const stopAudioMonitoring = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    if (audioStreamRef.current) {
      try {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      } catch (e) {}
      audioStreamRef.current = null;
    }
    setAudioLevel(0);
  };

  React.useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      stopAudioMonitoring();
      window.dispatchEvent(new CustomEvent('mcgm-scribe-active', { detail: false }));
    };
  }, []);

  const simulateSpeechRecognition = () => {
    setVoiceListening(true);
    setVoiceTranscript('');
    setInterimTranscript('Listening...');

    const phrases = [
      'Patient Sameer Joshi...',
      'Patient Sameer Joshi, age 45 years, blood group O positive...',
      'Patient Sameer Joshi, age 45 years, blood group O positive. He suffers from diabetes and had heart surgery last year.'
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < phrases.length) {
        setInterimTranscript(phrases[step]);
        step++;
      } else {
        clearInterval(interval);
        setVoiceListening(false);
        const finalText = 'Patient Sameer Joshi, age 45 years, blood group O positive. He suffers from diabetes and had heart surgery last year.';
        setVoiceTranscript(finalText);
        setInterimTranscript('');
      }
    }, 1000);
  };

  const toggleVoiceScribe = async () => {
    if (voiceListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      } else {
        setVoiceListening(false);
        stopAudioMonitoring();
      }
    } else {
      // Explicitly request microphone permission first
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.error('Microphone permission request failed:', err);
        window.dispatchEvent(new CustomEvent('mcgm-system-notification', {
          detail: {
            title: 'Microphone Permission Blocked',
            message: 'Please allow microphone access in your browser to speak details.',
            type: 'warning'
          }
        }));
        simulateSpeechRecognition();
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-IN';

          recognition.onstart = () => {
            setVoiceListening(true);
            setVoiceTranscript('');
            setInterimTranscript('');
            startAudioMonitoring();
          };

          recognition.onresult = (event: any) => {
            let finalTrans = '';
            let interimTrans = '';
            for (let i = 0; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalTrans += event.results[i][0].transcript + ' ';
              } else {
                interimTrans += event.results[i][0].transcript;
              }
            }
            if (finalTrans) {
              setVoiceTranscript(finalTrans.trim());
            }
            if (interimTrans) {
              setInterimTranscript(interimTrans);
            }
          };

          recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setVoiceListening(false);
            stopAudioMonitoring();
            if (event.error === 'not-allowed' || event.error === 'permission-denied') {
              window.dispatchEvent(new CustomEvent('mcgm-system-notification', {
                detail: {
                  title: 'Microphone Permission Blocked',
                  message: 'Please click the microphone icon in your browser address bar to allow access, then click the scribe button again.',
                  type: 'warning'
                }
              }));
            } else if (event.error === 'no-speech') {
              window.dispatchEvent(new CustomEvent('mcgm-system-notification', {
                detail: {
                  title: 'No Speech Detected',
                  message: 'We could not hear you. Please speak clearly into the microphone or try again.',
                  type: 'info'
                }
              }));
            } else {
              window.dispatchEvent(new CustomEvent('mcgm-system-notification', {
                detail: {
                  title: 'Speech Recognition Fallback',
                  message: `Speech error: ${event.error}. Connecting to fallback simulation.`,
                  type: 'warning'
                }
              }));
              simulateSpeechRecognition();
            }
          };

          recognition.onend = () => {
            setVoiceListening(false);
            stopAudioMonitoring();
          };

          recognitionRef.current = recognition;
          window.dispatchEvent(new CustomEvent('mcgm-scribe-active', { detail: true }));
          recognition.start();
        } catch (e) {
          console.error('Error starting recognition:', e);
          window.dispatchEvent(new CustomEvent('mcgm-system-notification', {
            detail: {
              title: 'Speech Engine Failed',
              message: 'Could not initialize speech recognition. Starting simulation.',
              type: 'warning'
            }
          }));
          simulateSpeechRecognition();
        }
      } else {
        window.dispatchEvent(new CustomEvent('mcgm-system-notification', {
          detail: {
            title: 'Speech Engine Offline',
            message: 'Web Speech API is not supported in this browser. Running simulation.',
            type: 'info'
          }
        }));
        simulateSpeechRecognition();
      }
    }
  };

  React.useEffect(() => {
    if (!voiceListening && voiceTranscript) {
      window.dispatchEvent(new CustomEvent('mcgm-scribe-active', { detail: false }));
      const parsed = parseSpeechPatientDetails(voiceTranscript);
      setExtractedDetails(parsed);
    }
  }, [voiceListening, voiceTranscript]);

  const applyExtractedDetails = () => {
    if (!extractedDetails) return;
    setUseExisting(false);
    if (extractedDetails.name) setName(extractedDetails.name);
    if (extractedDetails.age) setAge(extractedDetails.age);
    if (extractedDetails.gender) setGender(extractedDetails.gender);
    if (extractedDetails.bloodGroup) setBloodGroup(extractedDetails.bloodGroup);
    if (extractedDetails.conditions) setConditions(extractedDetails.conditions);
    if (extractedDetails.history) setHistory(extractedDetails.history);
    setVoiceTranscript('');
    setExtractedDetails(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (useExisting && selectedMember) {
      onNext({
        name: selectedMember.name,
        age: selectedMember.age,
        gender: selectedMember.gender,
        bloodGroup: selectedMember.bloodGroup,
        conditions: selectedMember.conditions,
        isNew: false
      });
    } else {
      onNext({
        name,
        age,
        gender,
        bloodGroup,
        conditions,
        history,
        isNew: true
      });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
      <div className="flex items-center space-x-3">
        <button onClick={onBack} type="button" className="p-2 hover:bg-gray-50 rounded-xl transition-all">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Patient Details</h2>
          <p className="text-[11px] text-gray-400 font-semibold">Step 4 of 5 • Enter medical profile</p>
        </div>
      </div>

      {/* Voice Scribe Assistant Section */}
      <div className="bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-blue-50/50 border border-blue-100 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${voiceListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-[#0A5BFF]'}`}>
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-gray-900">Voice Scribe Assistant</h4>
              <p className="text-[9px] text-gray-500">Dictate patient details to auto-fill</p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleVoiceScribe}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${
              voiceListening
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-[#0A5BFF] text-white hover:bg-[#002f6f]'
            }`}
          >
            {voiceListening ? 'Stop Scribe' : 'Start Scribe'}
          </button>
        </div>

        {voiceListening && (
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 justify-center py-1 h-8">
              {[...Array(6)].map((_, i) => {
                const baseHeight = 6 + (audioLevel / 100) * 20;
                const barHeight = Math.max(6, Math.min(26, baseHeight * (0.6 + Math.sin(i * 0.5) * 0.4)));
                return (
                  <motion.div
                    key={i}
                    animate={{ height: barHeight }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="w-1 bg-[#0A5BFF] rounded-full"
                  />
                );
              })}
            </div>
            {audioLevel === 0 && (
              <p className="text-[9px] text-amber-600 font-semibold animate-pulse text-center">
                ⚠️ Microphone level is silent. Try speaking louder or check mic hardware.
              </p>
            )}
            {interimTranscript && (
              <p className="text-[10px] text-indigo-600 italic text-center bg-white/60 p-2 rounded-xl border border-blue-50">
                "{interimTranscript}"
              </p>
            )}
          </div>
        )}

        {(voiceTranscript || isManualTyping) && !voiceListening && (
          <div className="bg-white/85 border border-blue-100/50 rounded-2xl p-3 space-y-2.5">
            <textarea
              value={voiceTranscript}
              onChange={(e) => {
                setVoiceTranscript(e.target.value);
                const parsed = parseSpeechPatientDetails(e.target.value);
                setExtractedDetails(parsed);
              }}
              placeholder="Type patient details here (e.g. Patient Sameer Joshi, age 45 years, blood group O positive. He suffers from diabetes and had heart surgery last year)..."
              className="w-full bg-transparent border-none outline-none resize-none text-[10px] text-gray-700 italic border-l-2 border-[#0A5BFF] pl-2 focus:ring-0"
              rows={3}
            />
            <p className="text-[8px] text-gray-400 text-right font-medium">✏️ Type or edit to adjust details</p>
            {extractedDetails && (
              <div className="space-y-2">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Extracted Details</p>
                <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                  {extractedDetails.name && (
                    <div className="bg-blue-50/40 px-2 py-1 rounded-lg">
                      <span className="text-gray-500">Name:</span> <strong className="text-gray-900">{extractedDetails.name}</strong>
                    </div>
                  )}
                  {extractedDetails.age && (
                    <div className="bg-blue-50/40 px-2 py-1 rounded-lg">
                      <span className="text-gray-500">Age:</span> <strong className="text-gray-900">{extractedDetails.age}</strong>
                    </div>
                  )}
                  {extractedDetails.gender && (
                    <div className="bg-blue-50/40 px-2 py-1 rounded-lg">
                      <span className="text-gray-500">Gender:</span> <strong className="text-gray-900">{extractedDetails.gender}</strong>
                    </div>
                  )}
                  {extractedDetails.bloodGroup && (
                    <div className="bg-blue-50/40 px-2 py-1 rounded-lg">
                      <span className="text-gray-500">Blood:</span> <strong className="text-gray-900">{extractedDetails.bloodGroup}</strong>
                    </div>
                  )}
                  {extractedDetails.conditions && (
                    <div className="bg-blue-50/40 px-2 py-1 rounded-lg col-span-2">
                      <span className="text-gray-500">Diseases:</span> <strong className="text-[#0A5BFF]">{extractedDetails.conditions}</strong>
                    </div>
                  )}
                  {extractedDetails.history && (
                    <div className="bg-blue-50/40 px-2 py-1 rounded-lg col-span-2">
                      <span className="text-gray-500">History:</span> <strong className="text-gray-900">{extractedDetails.history}</strong>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={applyExtractedDetails}
                    className="flex-1 bg-[#0A5BFF] hover:bg-[#002f6f] text-white py-1.5 rounded-xl font-bold text-[10px] transition-all"
                  >
                    ✓ Apply to Form
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVoiceTranscript('');
                      setExtractedDetails(null);
                      setIsManualTyping(false);
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-xl font-bold text-[10px] transition-all"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {!voiceListening && !voiceTranscript && (
          <div className="flex flex-col space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <p className="text-[8px] text-gray-400 italic max-w-[65%]">
                Try saying: "Patient Sameer Joshi, age 45 years, blood group O positive. He suffers from diabetes and had heart surgery last year."
              </p>
              <div className="flex space-x-2 text-[9px] font-extrabold text-[#0A5BFF]">
                <button
                  type="button"
                  onClick={simulateSpeechRecognition}
                  className="hover:underline cursor-pointer"
                >
                  Try Simulation
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={() => setIsManualTyping(true)}
                  className="hover:underline cursor-pointer"
                >
                  Type Manually
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {FAMILY_MEMBERS.length > 0 && selectedPersonType !== 'myself' && (
        <div className="flex bg-gray-50 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setUseExisting(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              useExisting ? 'bg-white text-[#0A5BFF] shadow-sm' : 'text-gray-500'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Select Family Member</span>
          </button>
          <button
            type="button"
            onClick={() => setUseExisting(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              !useExisting ? 'bg-white text-[#0A5BFF] shadow-sm' : 'text-gray-500'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Enter New Details</span>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {useExisting && selectedPersonType !== 'myself' ? (
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Select patient</p>
            <div className="grid gap-2.5">
              {FAMILY_MEMBERS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMember(m)}
                  className={`w-full bg-white border rounded-2xl p-3 flex items-center space-x-3 text-left transition-all ${
                    selectedMember?.id === m.id
                      ? 'border-[#0A5BFF] ring-1 ring-[#0A5BFF]'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-50">
                    <img src={m.photo} alt={m.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-xs">{m.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {m.age} Y / {m.gender} • {m.relation}
                    </p>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedMember?.id === m.id
                        ? 'border-[#0A5BFF] bg-[#0A5BFF] text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedMember?.id === m.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Patient's full name"
                className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0A5BFF] mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Approximate Age</label>
                <input
                  required
                  type="number"
                  value={age || ''}
                  onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                  placeholder="Age in years"
                  className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0A5BFF] mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0A5BFF] mt-1"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0A5BFF] mt-1"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'Unknown'].map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Known Diseases</label>
                <input
                  type="text"
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  placeholder="Diabetes, Asthma, etc."
                  className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0A5BFF] mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Medical History / Notes (optional)</label>
              <textarea
                value={history}
                onChange={(e) => setHistory(e.target.value)}
                placeholder="Allergies, recent surgeries, medications..."
                rows={2}
                className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0A5BFF] mt-1 resize-none"
              />
            </div>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            className="w-full bg-[#0A5BFF] hover:bg-[#002f6f] text-white py-3.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-[0.98]"
          >
            Continue to Confirmation
          </button>
        </div>
      </form>
    </motion.div>
  );
}
