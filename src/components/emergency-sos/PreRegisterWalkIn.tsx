import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Car, HelpCircle, Navigation, Shield, User, Clock, AlertTriangle, MessageSquare, Mic } from 'lucide-react';
import { FAMILY_MEMBERS, NEARBY_HOSPITALS } from '../../data/emergencyData';
import type { ArrivalMode } from '../../types/emergencySOS';

interface Props {
  onSubmit: (details: {
    arrivalMode: ArrivalMode;
    complaint: string;
    eta: number;
    patientName: string;
    patientAge: number;
    patientGender: string;
    bloodGroup: string;
    hospitalId: string;
    sendSMS?: boolean;
    smsPhoneNumber?: string;
  }) => void;
  onBack: () => void;
}

function parseSpeechRegistration(text: string) {
  const normalized = text.toLowerCase();
  
  let extractedName = '';
  let extractedAge: number | null = null;
  let extractedGender = '';
  let extractedBloodGroup = '';
  let extractedArrival: ArrivalMode | null = null;
  let extractedEta: number | null = null;
  let extractedComplaint = '';
  let smsPhone = '';

  // 1. ETA extraction: "eta 20 minutes", "20 mins", "in 15 minutes", "eta 10 mins"
  const etaMatch = normalized.match(/\b(\d{1,2})\s*(?:minutes|mins|min|minute)\b/i) || normalized.match(/\beta\s*(\d{1,2})\b/i);
  if (etaMatch) {
    extractedEta = parseInt(etaMatch[1], 10);
  }

  // 2. Age extraction: "28 years old", "age 34", "35 year old", "45 years"
  const ageMatch = normalized.match(/\b(\d{1,3})\s*(?:years\s*old|years|yr|year\s*old|yrs|yo)\b/i) || normalized.match(/\bage\s*(?:is\s*)?(\d{1,3})\b/i) || normalized.match(/\b(?:he|she)\s+is\s+(\d{1,3})\b/i);
  if (ageMatch) {
    extractedAge = parseInt(ageMatch[1], 10);
  }

  // 3. Gender extraction: "male", "female", "other"
  if (/\bmale\b/i.test(normalized)) extractedGender = 'Male';
  else if (/\bfemale\b/i.test(normalized)) extractedGender = 'Female';
  else if (/\bother\b/i.test(normalized)) extractedGender = 'Other';

  // 4. Blood group extraction: "o positive", "ab negative", "a+", "b-", "o+"
  const bloodMatch = normalized.match(/\b([ab]{1,2}|o)\s*(positive|negative|\+|\-)\b/i);
  if (bloodMatch) {
    const type = bloodMatch[1].toUpperCase();
    const sign = bloodMatch[2].startsWith('pos') || bloodMatch[2] === '+' ? '+' : '-';
    extractedBloodGroup = type + sign;
  } else {
    // try exact shorthand like a+, o-, b+, ab+
    const shortBloodMatch = normalized.match(/\b(a\+|a\-|b\+|b\-|ab\+|ab\-|o\+|o\-)\b/i);
    if (shortBloodMatch) {
      extractedBloodGroup = shortBloodMatch[1].toUpperCase();
    }
  }

  // 5. Arrival Mode:
  if (/\bambulance\b/i.test(normalized) || /\b108\b/i.test(normalized)) {
    extractedArrival = 'ambulance';
  } else if (/\btaxi\b/i.test(normalized) || /\bauto\b/i.test(normalized) || /\bcab\b/i.test(normalized) || /\bric\w*\b/i.test(normalized)) {
    extractedArrival = 'taxi';
  } else if (/\bcar\b/i.test(normalized) || /\bprivate\b/i.test(normalized) || /\bvehicle\b/i.test(normalized)) {
    extractedArrival = 'private';
  } else if (/\bwalk\b/i.test(normalized) || /\bon foot\b/i.test(normalized)) {
    extractedArrival = 'walkin';
  }

  // 6. Name extraction:
  const stopWords = ['is', 'has', 'and', 'with', 'in', 'by', 'eta', 'years', 'old', 'blood', 'group', 'coming', 'he', 'she', 'about', 'friend', 'brother', 'father', 'mother', 'relative', 'patient'];
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

  // 7. Chief Complaint:
  const complaintPatterns = [
    /(?:complaining of|suffering from|has|with|having)\s+([a-z\s]+?)(?:\s+and|\s+is|\s+by|\s+eta|\s+in\s+\d+|\s+coming|$)/i,
    /condition\s+is\s+([a-z\s]+?)(?:\s+and|\s+is|\s+by|\s+eta|\s+in\s+\d+|\s+coming|$)/i,
    /because\s+(?:he|she)\s+(?:has|is)\s+([a-z\s]+?)(?:\s+and|\s+is|\s+by|\s+eta|\s+in\s+\d+|\s+coming|$)/i,
  ];

  for (const pattern of complaintPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      const words = candidate.split(/\s+/);
      if (words.length <= 6) {
        extractedComplaint = candidate;
        break;
      }
    }
  }

  const knownComplaints = [
    'chest pain', 'heart attack', 'stroke', 'fracture', 'broken leg', 'broken arm',
    'unconscious', 'breathing difficulty', 'bleeding', 'accident', 'cut', 'burn',
    'fever', 'headache', 'abdominal pain', 'seizure', 'fall', 'breathing problem',
    'asthma attack', 'allergic reaction', 'poisoning'
  ];
  for (const kc of knownComplaints) {
    if (normalized.includes(kc)) {
      extractedComplaint = kc.charAt(0).toUpperCase() + kc.slice(1);
      break;
    }
  }

  // 8. Phone number extraction: look for 10-digit number
  const phoneMatch = normalized.match(/\b\d{10}\b/) || normalized.match(/\b\d{5}\s\d{5}\b/);
  if (phoneMatch) {
    smsPhone = phoneMatch[0].replace(/\s/g, '');
  }

  return {
    name: extractedName,
    age: extractedAge,
    gender: extractedGender,
    bloodGroup: extractedBloodGroup,
    arrivalMode: extractedArrival,
    eta: extractedEta,
    complaint: extractedComplaint,
    smsPhone
  };
}

export default function PreRegisterWalkIn({ onSubmit, onBack }: Props) {
  const [arrivalMode, setArrivalMode] = useState<ArrivalMode>('taxi');
  const [complaint, setComplaint] = useState('');
  const [eta, setEta] = useState<number>(15);
  const [selectedHospital, setSelectedHospital] = useState(NEARBY_HOSPITALS[0].id);
  const [patientType, setPatientType] = useState<'existing' | 'new' | 'unknown'>('new');
  const [selectedMember, setSelectedMember] = useState(FAMILY_MEMBERS[0]);

  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');

  const [sendSMS, setSendSMS] = useState(false);
  const [smsPhoneNumber, setSmsPhoneNumber] = useState('');

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
      'Patient Sameer Joshi, age 45 years, blood group O positive is coming by taxi. ETA is 15 minutes. He has severe chest pain.'
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < phrases.length) {
        setInterimTranscript(phrases[step]);
        step++;
      } else {
        clearInterval(interval);
        setVoiceListening(false);
        const finalText = 'Patient Sameer Joshi, age 45 years, blood group O positive is coming by taxi. ETA is 15 minutes. He has severe chest pain.';
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
      const parsed = parseSpeechRegistration(voiceTranscript);
      setExtractedDetails(parsed);
    }
  }, [voiceListening, voiceTranscript]);

  const applyExtractedDetails = () => {
    if (!extractedDetails) return;
    if (extractedDetails.name) {
      setPatientType('new');
      setName(extractedDetails.name);
    }
    if (extractedDetails.age) setAge(extractedDetails.age);
    if (extractedDetails.gender) setGender(extractedDetails.gender);
    if (extractedDetails.bloodGroup) setBloodGroup(extractedDetails.bloodGroup);
    if (extractedDetails.arrivalMode) setArrivalMode(extractedDetails.arrivalMode);
    if (extractedDetails.eta) setEta(extractedDetails.eta);
    if (extractedDetails.complaint) setComplaint(extractedDetails.complaint);
    if (extractedDetails.smsPhone) {
      setSendSMS(true);
      setSmsPhoneNumber(extractedDetails.smsPhone);
    }
    setVoiceTranscript('');
    setExtractedDetails(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      arrivalMode,
      complaint: complaint || 'General Trauma Alert',
      eta,
      patientName: patientType === 'existing' 
        ? selectedMember.name 
        : patientType === 'unknown' 
          ? 'Unknown Patient (Trauma Unit)' 
          : name,
      patientAge: patientType === 'existing' 
        ? selectedMember.age 
        : patientType === 'unknown' 
          ? 0 
          : age,
      patientGender: patientType === 'existing' 
        ? selectedMember.gender 
        : patientType === 'unknown' 
          ? 'Unknown' 
          : gender,
      bloodGroup: patientType === 'existing' 
        ? selectedMember.bloodGroup 
        : patientType === 'unknown' 
          ? 'Unknown' 
          : bloodGroup,
      hospitalId: selectedHospital,
      sendSMS,
      smsPhoneNumber: sendSMS ? smsPhoneNumber : undefined,
    });
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <div className="flex items-center space-x-3">
        <button onClick={onBack} type="button" className="p-2 hover:bg-gray-50 rounded-xl transition-all">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Relative Pre-Registration</h2>
          <p className="text-[11px] text-gray-400 font-semibold">Notify hospital before arrival</p>
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
                const parsed = parseSpeechRegistration(e.target.value);
                setExtractedDetails(parsed);
              }}
              placeholder="Type registration details here (e.g. Patient Sameer Joshi, age 45 years, blood group O positive is coming by taxi. ETA is 15 minutes. He has severe chest pain)..."
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
                  {extractedDetails.arrivalMode && (
                    <div className="bg-blue-50/40 px-2 py-1 rounded-lg">
                      <span className="text-gray-500">Arrival:</span> <strong className="text-gray-900 capitalize">{extractedDetails.arrivalMode}</strong>
                    </div>
                  )}
                  {extractedDetails.eta && (
                    <div className="bg-blue-50/40 px-2 py-1 rounded-lg">
                      <span className="text-gray-500">ETA:</span> <strong className="text-gray-900">{extractedDetails.eta} mins</strong>
                    </div>
                  )}
                  {extractedDetails.complaint && (
                    <div className="bg-blue-50/40 px-2 py-1 rounded-lg col-span-2">
                      <span className="text-gray-500">Complaint:</span> <strong className="text-red-700">{extractedDetails.complaint}</strong>
                    </div>
                  )}
                  {extractedDetails.smsPhone && (
                    <div className="bg-blue-50/40 px-2 py-1 rounded-lg col-span-2">
                      <span className="text-gray-500">SMS Alert:</span> <strong className="text-[#0A5BFF]">{extractedDetails.smsPhone}</strong>
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
                Try saying: "Patient Sameer Joshi, age 45 years, blood group O positive is coming by taxi. ETA is 15 minutes. He has severe chest pain."
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

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Arrival Mode */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Arrival Mode</label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { mode: 'ambulance', label: 'Ambulance', icon: '🚑' },
              { mode: 'taxi', label: 'Taxi/Auto', icon: '🛺' },
              { mode: 'private', label: 'Private Car', icon: '🚗' },
              { mode: 'walkin', label: 'Walk-In', icon: '🚶' },
            ].map((m) => (
              <button
                key={m.mode}
                type="button"
                onClick={() => setArrivalMode(m.mode as ArrivalMode)}
                className={`border rounded-2xl p-2.5 flex flex-col items-center justify-center text-center transition-all ${
                  arrivalMode === m.mode
                    ? 'border-[#0A5BFF] bg-blue-50/20 text-[#0A5BFF]'
                    : 'border-gray-100 bg-white hover:border-gray-200 text-gray-700'
                }`}
              >
                <span className="text-lg mb-1">{m.icon}</span>
                <span className="text-[8px] font-black tracking-tight">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Hospital */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Destination Hospital</label>
          <select
            value={selectedHospital}
            onChange={(e) => setSelectedHospital(e.target.value)}
            className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0A5BFF] mt-1"
          >
            {NEARBY_HOSPITALS.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.distance} away)
              </option>
            ))}
          </select>
        </div>

        {/* ETA */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estimated Time of Arrival (ETA)</label>
          <div className="flex items-center space-x-3 mt-1">
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={eta}
              onChange={(e) => setEta(parseInt(e.target.value))}
              className="flex-1 accent-[#0A5BFF]"
            />
            <span className="text-xs font-black text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 min-w-[70px] text-center">
              {eta} mins
            </span>
          </div>
        </div>

        {/* Chief Complaint */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Chief Complaint / Condition</label>
          <input
            required
            type="text"
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            placeholder="e.g. Chest pain, broken leg, severe cut, unconscious"
            className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0A5BFF] mt-1"
          />
        </div>

        {/* Patient Profile Selection */}
        <div className="border-t border-gray-100 pt-3 space-y-3">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Patient Identity</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { type: 'existing', label: 'Family Member', icon: '👥' },
              { type: 'new', label: 'New Patient', icon: '👤' },
              { type: 'unknown', label: 'Unknown Person', icon: '❓' },
            ].map((t) => (
              <button
                key={t.type}
                type="button"
                onClick={() => setPatientType(t.type as any)}
                className={`border rounded-2xl p-2.5 flex flex-col items-center justify-center text-center transition-all ${
                  patientType === t.type
                    ? 'border-[#0A5BFF] bg-blue-50/20 text-[#0A5BFF]'
                    : 'border-gray-100 bg-white hover:border-gray-200 text-gray-700'
                }`}
              >
                <span className="text-lg mb-1">{t.icon}</span>
                <span className="text-[9px] font-black">{t.label}</span>
              </button>
            ))}
          </div>

          {patientType === 'existing' && (
            <select
              value={selectedMember.id}
              onChange={(e) => {
                const found = FAMILY_MEMBERS.find((m) => m.id === e.target.value);
                if (found) setSelectedMember(found);
              }}
              className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0A5BFF] mt-2"
            >
              {FAMILY_MEMBERS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.relation})
                </option>
              ))}
            </select>
          )}

          {patientType === 'new' && (
            <div className="space-y-3 mt-2">
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Patient Full Name"
                className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0A5BFF]"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  required
                  type="number"
                  value={age || ''}
                  onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                  placeholder="Age"
                  className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0A5BFF]"
                />
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0A5BFF]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0A5BFF]"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'Unknown'].map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {patientType === 'unknown' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start space-x-2.5 mt-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-[10px] font-bold text-amber-800">Identity Unverified / Unknown Patient</p>
                <p className="text-[9px] text-amber-700 leading-normal mt-0.5">
                  The patient will be pre-registered as "Unknown Patient (Trauma Unit)". ER clinicians will verify identity, estimate age/gender, and update files upon arrival.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* SMS Notifications */}
        <div className="border-t border-gray-100 pt-3 space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">SMS Alert System</label>
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={sendSMS}
                onChange={(e) => setSendSMS(e.target.checked)}
                className="rounded border-gray-300 text-[#0A5BFF] focus:ring-[#0A5BFF]"
              />
              <span className="text-[10px] text-gray-500 font-bold">Send SMS alerts</span>
            </label>
          </div>
          <AnimatePresence>
            {sendSMS && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1 mt-1 overflow-hidden"
              >
                <input
                  required
                  type="tel"
                  value={smsPhoneNumber}
                  onChange={(e) => setSmsPhoneNumber(e.target.value)}
                  placeholder="Relative Contact Number (e.g. +91 98765 43210)"
                  className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0A5BFF]"
                />
                <p className="text-[9px] text-gray-400 italic">
                  Hospital admission alerts, Temporary UHID, and live timeline status will be sent to this number.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-[#0A5BFF] hover:bg-[#002f6f] text-white py-3.5 rounded-xl font-extrabold text-xs shadow-md transition-all active:scale-[0.98]"
        >
          Pre-Register Patient ➔
        </button>
      </form>
    </motion.div>
  );
}
