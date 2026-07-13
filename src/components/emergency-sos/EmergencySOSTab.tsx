import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HeartPulse, Phone, MapPin, Siren, ShieldAlert, Flame, Shield, AlertTriangle,
  Clock, ChevronRight, Users, History, PhoneCall, Hospital, Lightbulb,
  ArrowLeft, Plus, X, Check, Bell, Mic, Navigation, UserPlus, Share2
} from 'lucide-react';
import type { SOSFlowStep, EmergencyPerson, EmergencyType, FamilyMember, ArrivalMode } from '../../types/emergencySOS';
import { FAMILY_MEMBERS, EMERGENCY_CONTACTS, NEARBY_HOSPITALS, PAST_EMERGENCIES, SAFETY_TIPS } from '../../data/emergencyData';
import SOSWhoStep from './SOSWhoStep';
import SOSWhatStep from './SOSWhatStep';
import SOSWhereStep from './SOSWhereStep';
import SOSPatientStep from './SOSPatientStep';
import SOSConfirmStep from './SOSConfirmStep';
import SOSTrackingView from './SOSTrackingView';
import PreRegisterWalkIn from './PreRegisterWalkIn';
import { registerEmergencyPatient, getAutoAssignment } from '../../services/patients';

function parseVoiceSOSCommand(text: string) {
  const normalized = text.toLowerCase();
  
  let patient = 'Someone else';
  let patientKey: EmergencyPerson = 'someone';
  let condition = 'Other';
  let priority = 'HIGH';
  let location = 'Sion East, Mumbai';
  let arrivalMode = 'Ambulance';
  let note = text;

  // 1. Patient extraction
  if (/\b(father|dad|papa)\b/i.test(normalized)) {
    patient = 'Father (Anil Patil)';
    patientKey = 'family';
  } else if (/\b(mother|mom|mummy)\b/i.test(normalized)) {
    patient = 'Mother (Sunita Patil)';
    patientKey = 'family';
  } else if (/\b(brother|sister|son|daughter|wife|husband|family)\b/i.test(normalized)) {
    patient = 'Family Member';
    patientKey = 'family';
  } else if (/\b(my|myself|i|me|i am)\b/i.test(normalized) && !/\b(my father|my mother|my brother|my sister|my wife|my husband|my friend|my son|my daughter)\b/i.test(normalized)) {
    patient = 'Myself (Jaiveer Patil)';
    patientKey = 'myself';
  }

  // 2. Condition extraction
  if (/\b(chest pain|heart|cardiac|heart attack)\b/i.test(normalized)) {
    condition = 'Chest Pain';
    priority = 'CRITICAL';
  } else if (/\b(breath|breathing|asthma|choking)\b/i.test(normalized)) {
    condition = 'Breathing Difficulty';
    priority = 'CRITICAL';
  } else if (/\b(accident|crash|fall|injury|hit|bleeding|blood)\b/i.test(normalized)) {
    condition = 'Road Accident';
    priority = 'CRITICAL';
  } else if (/\b(unconscious|passed out|fainted|unresponsive)\b/i.test(normalized)) {
    condition = 'Unconscious';
    priority = 'CRITICAL';
  } else if (/\b(stroke|paralysis|speech)\b/i.test(normalized)) {
    condition = 'Stroke';
    priority = 'CRITICAL';
  } else if (/\b(burn|fire)\b/i.test(normalized)) {
    condition = 'Severe Burn';
    priority = 'HIGH';
  }

  // 3. Location extraction
  const mumbaiPlaces = [
    'dadar', 'sion', 'bandra', 'chembur', 'kurla', 'andheri', 'worli', 'parel', 'colaba', 'mulund', 'thane', 'ghatkopar', 'borivali', 'juhu', 'cst', 'byculla'
  ];
  for (const place of mumbaiPlaces) {
    if (normalized.includes(place)) {
      location = place.charAt(0).toUpperCase() + place.slice(1) + ', Mumbai';
      break;
    }
  }

  // 4. Arrival Mode
  if (/\b(ambulance|108)\b/i.test(normalized)) {
    arrivalMode = 'Ambulance';
  } else if (/\b(taxi|cab|auto|rickshaw)\b/i.test(normalized)) {
    arrivalMode = 'Taxi';
  } else if (/\b(car|private car|vehicle|bike)\b/i.test(normalized)) {
    arrivalMode = 'Private Car';
  } else if (/\b(walk|walking|foot)\b/i.test(normalized)) {
    arrivalMode = 'Walk-In';
  }

  return {
    patient,
    patientKey,
    condition,
    priority,
    location,
    arrivalMode,
    note
  };
}

export default function EmergencySOSTab() {
  const [step, setStep] = useState<SOSFlowStep>('home');
  const [person, setPerson] = useState<EmergencyPerson>('myself');
  const [emergencyType, setEmergencyType] = useState<EmergencyType>('Other');
  const [emergencyId, setEmergencyId] = useState('');
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'warning' | 'info' } | null>(null);
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isManualTyping, setIsManualTyping] = useState(false);
  const [voiceExtracted, setVoiceExtracted] = useState<any>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
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
      'My father has severe chest pain...',
      'My father has severe chest pain. We are travelling in a taxi...',
      'My father has severe chest pain. We are travelling in a taxi near Dadar.'
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < phrases.length) {
        setInterimTranscript(phrases[step]);
        step++;
      } else {
        clearInterval(interval);
        setVoiceListening(false);
        const finalText = 'My father has severe chest pain. We are travelling in a taxi near Dadar.';
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
      // Request microphone permission explicitly first to trigger permission prompt on insecure/different contexts
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
            message: 'Please allow microphone access in your browser to speak your emergency.',
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
            setVoiceExtracted(null);
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
                  message: 'Please click the microphone icon in your browser address bar to allow access, then click the mic button again.',
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
      const parsed = parseVoiceSOSCommand(voiceTranscript);
      setVoiceExtracted(parsed);
      
      // Auto-assign details to internal state so the next steps are prefilled
      setEmergencyType(parsed.condition as EmergencyType);
      setPerson(parsed.patientKey);
      setAddress(parsed.location);
      setNote(parsed.note);
      
      // Map to family member or create new details for Jaiveer Patil if myself
      if (parsed.patientKey === 'myself') {
        setPatientDetails({
          name: 'Jaiveer Patil',
          age: 25,
          gender: 'Male',
          bloodGroup: 'O+',
          conditions: 'None',
          history: ''
        });
      } else if (parsed.patientKey === 'family') {
        const found = FAMILY_MEMBERS[0]; // Default to first family member (father)
        setPatientDetails({
          name: found.name,
          age: found.age,
          gender: found.gender,
          bloodGroup: found.bloodGroup,
          conditions: found.conditions,
          history: ''
        });
      } else {
        setPatientDetails({
          name: 'Unknown Patient (Voice SOS)',
          age: 0,
          gender: 'Unknown',
          bloodGroup: 'Unknown',
          conditions: 'Unverified',
          history: ''
        });
      }
    }
  }, [voiceListening, voiceTranscript]);

  // SOS request intermediate state
  const [address, setAddress] = useState('Sion East, Mumbai 400022');
  const [note, setNote] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [patientDetails, setPatientDetails] = useState({
    name: 'Jaiveer Patil',
    age: 25,
    gender: 'Male',
    bloodGroup: 'O+',
    conditions: 'None',
    history: '',
  });

  // Relative pre-registration details
  const [preRegDetails, setPreRegDetails] = useState<any>(null);

  React.useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleSOSTrigger = () => {
    setEmergencyId('EID' + Date.now().toString().slice(-10));
    setStep('who');
  };

  const handleWhoSelect = (p: EmergencyPerson) => {
    setPerson(p);
    setStep('what');
  };

  const handleWhatSelect = (t: EmergencyType) => {
    setEmergencyType(t);
    setStep('where');
  };

  const handleWhereSubmit = (data: { lat: number; lng: number; address: string; note: string; attachments: string[] }) => {
    setAddress(data.address);
    setNote(data.note);
    setAttachments(data.attachments);
    setStep('patient');
  };

  const handlePatientSubmit = (patient: any) => {
    setPatientDetails(patient);
    setStep('confirm');
  };

  const handleConfirmSubmit = () => {
    setToast({
      title: '🚨 SOS Alert Dispatched',
      message: `Emergency ID: ${emergencyId}. Nearest trauma center notified. Team dispatched.`,
      type: 'success',
    });

    // Dispatch global system-wide window event for all portals to react
    const event = new CustomEvent('mcgm-system-notification', {
      detail: {
        title: '🚨 CRITICAL: SOS ALERT DISPATCHED',
        message: `Emergency ID: ${emergencyId}. Patient ${patientDetails.name} (${patientDetails.age}/${patientDetails.gender}) reported a ${emergencyType} emergency.`,
        type: 'warning'
      }
    });
    window.dispatchEvent(event);

    // Call service to add the patient to the live emergency database
    const mappedGender = (patientDetails.gender === 'Male' || patientDetails.gender === 'Female' || patientDetails.gender === 'Other' || patientDetails.gender === 'Unknown') ? patientDetails.gender : 'Unknown';
    const mappedBlood = (patientDetails.bloodGroup === 'A+' || patientDetails.bloodGroup === 'A-' || patientDetails.bloodGroup === 'B+' || patientDetails.bloodGroup === 'B-' || patientDetails.bloodGroup === 'AB+' || patientDetails.bloodGroup === 'AB-' || patientDetails.bloodGroup === 'O+' || patientDetails.bloodGroup === 'O-' || patientDetails.bloodGroup === 'Unknown') ? patientDetails.bloodGroup : 'Unknown';

    registerEmergencyPatient({
      name: patientDetails.name,
      age: patientDetails.age ? Number(patientDetails.age) : undefined,
      gender: mappedGender,
      blood_group: mappedBlood,
      arrival_mode: 'AMBULANCE',
      chief_complaint: `SOS ALERT: ${emergencyType}`,
      injury_mechanism: note || `SOS alert triggered at GPS location.`,
      triage_category: 'RED' // Critical emergency
    }).catch(err => console.error('Failed to register SOS patient:', err));

    setStep('tracking');
  };

  const handlePreRegSubmit = (details: any) => {
    const tempUhid = 'UHID-TMP-' + Math.floor(10000 + Math.random() * 90000);
    const mockId = 'EID' + Date.now().toString().slice(-10);
    const auto = getAutoAssignment(details.complaint, `Pre-registration by relative. ETA: ${details.eta} mins.`);
    
    setPreRegDetails({
      ...details,
      tempUhid,
      mockId,
      autoWard: auto.ward,
      autoDept: auto.department
    });
    
    setToast({
      title: '📋 Pre-Registration Complete',
      message: `UHID: ${tempUhid} generated. Auto-assigned to ${auto.ward} (${auto.department}).`,
      type: 'success',
    });

    // Dispatch global system-wide window event for all portals to react
    const event = new CustomEvent('mcgm-system-notification', {
      detail: {
        title: '📋 NEW TRAUMA PRE-REGISTRATION',
        message: `Temp UHID: ${tempUhid}. Patient: ${details.patientName}. Arrival: ${details.arrivalMode.toUpperCase()} (ETA: ${details.eta}m). Auto-Assigned: ${auto.ward} (${auto.department}). Complaint: ${details.complaint}`,
        type: 'success'
      }
    });
    window.dispatchEvent(event);

    // Call service to add the patient to the live emergency database
    const mappedGender = (details.patientGender === 'Male' || details.patientGender === 'Female' || details.patientGender === 'Other' || details.patientGender === 'Unknown') ? details.patientGender : 'Unknown';
    const mappedBlood = (details.bloodGroup === 'A+' || details.bloodGroup === 'A-' || details.bloodGroup === 'B+' || details.bloodGroup === 'B-' || details.bloodGroup === 'AB+' || details.bloodGroup === 'AB-' || details.bloodGroup === 'O+' || details.bloodGroup === 'O-' || details.bloodGroup === 'Unknown') ? details.bloodGroup : 'Unknown';

    registerEmergencyPatient({
      name: details.patientName,
      age: details.patientAge ? Number(details.patientAge) : undefined,
      gender: mappedGender,
      blood_group: mappedBlood,
      arrival_mode: details.arrivalMode === 'ambulance' ? 'AMBULANCE' : details.arrivalMode === 'taxi' ? 'TAXI' : details.arrivalMode === 'car' ? 'PRIVATE_CAR' : 'WALK_IN',
      chief_complaint: details.complaint,
      injury_mechanism: `Pre-registration by relative. ETA: ${details.eta} mins. Auto-assigned to ${auto.ward} (${auto.department}). SMS status: ${details.sendSMS ? 'Active (' + details.smsPhoneNumber + ')' : 'Inactive'}`,
      phone: details.sendSMS ? details.smsPhoneNumber : undefined,
      triage_category: 'PENDING',
      assigned_ward: auto.ward,
      assigned_department: auto.department
    }).catch(err => console.error('Failed to register pre-registered patient:', err));
  };

  // Sub-views rendering
  if (step === 'who') return <div className="pb-24"><SOSWhoStep onSelect={handleWhoSelect} onBack={() => setStep('home')} /></div>;
  if (step === 'what') return <div className="pb-24"><SOSWhatStep onSelect={handleWhatSelect} onBack={() => setStep('who')} /></div>;
  
  if (step === 'where') {
    return (
      <div className="pb-24">
        <SOSWhereStep onSubmit={handleWhereSubmit} onBack={() => setStep('what')} />
      </div>
    );
  }

  if (step === 'patient') {
    if (person === 'someone' && note === 'pre-register') {
      return (
        <div className="pb-24">
          <PreRegisterWalkIn onSubmit={handlePreRegSubmit} onBack={() => setStep('home')} />
        </div>
      );
    }
    return (
      <div className="pb-24">
        <SOSPatientStep onNext={handlePatientSubmit} onBack={() => setStep('where')} selectedPersonType={person} />
      </div>
    );
  }

  if (step === 'confirm') {
    if (preRegDetails) {
      return (
        <div className="pb-24 space-y-4">
          <div className="flex items-center space-x-3">
            <button onClick={() => { setPreRegDetails(null); setStep('home'); }} className="p-2 hover:bg-gray-50 rounded-xl transition-all"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
            <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Pre-Registration Confirmed</h2>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto text-xl">✓</div>
              <h3 className="font-extrabold text-sm text-gray-900">Hospital Pre-Alert Sent</h3>
              <p className="text-[10px] text-gray-400">Trauma bay is notified and ready for arrival</p>
            </div>

            <div className="bg-blue-50/40 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">Emergency ID</span><span className="font-bold text-gray-900 font-mono">{preRegDetails.mockId}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Temporary UHID</span><span className="font-bold text-[#0A5BFF] font-mono">{preRegDetails.tempUhid}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Patient Name</span><span className="font-bold text-gray-900">{preRegDetails.patientName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Arrival Mode</span><span className="font-bold text-gray-900 capitalize">{preRegDetails.arrivalMode}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">ETA</span><span className="font-bold text-gray-900">{preRegDetails.eta} mins</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Chief Complaint</span><span className="font-bold text-red-600">{preRegDetails.complaint}</span></div>
              <div className="flex justify-between border-t border-blue-100/50 pt-2"><span className="text-gray-500 font-semibold">Auto-Assigned Ward</span><span className="font-bold text-gray-900">{preRegDetails.autoWard}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 font-semibold">Department</span><span className="font-bold text-[#0A5BFF]">{preRegDetails.autoDept}</span></div>
              {preRegDetails.sendSMS && (
                <div className="flex justify-between border-t border-blue-100/50 pt-2 mt-1">
                  <span className="text-gray-500">💬 SMS Alert Active</span>
                  <span className="font-bold text-[#0A5BFF]">{preRegDetails.smsPhoneNumber}</span>
                </div>
              )}
            </div>

            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-2xl p-3.5 flex items-start space-x-2.5">
              <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-[10px] font-bold text-emerald-900">Direct Ward Admission (Inquiry Bypassed)</p>
                <p className="text-[9px] text-emerald-700 leading-normal mt-0.5">
                  Clinically routed to <strong>{preRegDetails.autoDept}</strong>. Proceed directly to <strong>{preRegDetails.autoWard}</strong>. The general inquiry counter is bypassed automatically.
                </p>
              </div>
            </div>

            <button onClick={() => { setPreRegDetails(null); setStep('home'); }} className="w-full bg-[#0A5BFF] text-white py-3 rounded-xl text-xs font-bold hover:bg-[#002f6f] transition-all">
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="pb-24">
        <SOSConfirmStep
          patient={patientDetails}
          personType={person}
          emergencyType={emergencyType}
          address={address}
          note={note}
          onSubmit={handleConfirmSubmit}
          onBack={() => setStep('patient')}
        />
      </div>
    );
  }

  if (step === 'tracking') {
    return (
      <div className="pb-24">
        <SOSTrackingView
          emergencyId={emergencyId}
          emergencyType={emergencyType}
          onBack={() => setStep('home')}
          assignedWard={preRegDetails?.autoWard}
          assignedDept={preRegDetails?.autoDept}
        />
      </div>
    );
  }

  if (step === 'history') return (
    <div className="pb-24 space-y-4">
      <div className="flex items-center space-x-3">
        <button onClick={() => setStep('home')} className="p-2 hover:bg-gray-50 rounded-xl transition-all"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
        <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Emergency History</h2>
      </div>
      {PAST_EMERGENCIES.map(e => (
        <div key={e.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-900">{e.type} — {e.patientName}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{e.createdAt}</p>
            </div>
            <span className="text-[9px] font-extrabold text-green-700 bg-green-50 px-2 py-0.5 rounded-full uppercase">Discharged</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400">Emergency ID</span><p className="font-bold text-gray-900 font-mono mt-0.5">{e.emergencyId}</p></div>
            <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400">Hospital</span><p className="font-bold text-gray-900 mt-0.5">{e.hospitalName}</p></div>
            <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400">Doctor</span><p className="font-bold text-gray-900 mt-0.5">{e.doctorName}</p></div>
            <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400">UHID</span><p className="font-bold text-gray-900 font-mono mt-0.5">{e.uhid}</p></div>
          </div>
        </div>
      ))}
    </div>
  );

  if (step === 'family') return (
    <div className="pb-24 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={() => setStep('home')} className="p-2 hover:bg-gray-50 rounded-xl transition-all"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
          <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">My Family</h2>
        </div>
        <button onClick={() => setToast({ title: 'Add Member', message: 'Add family member feature matches core profile app integrations.', type: 'info' })}
          className="bg-[#0A5BFF] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center space-x-1"><Plus className="w-3 h-3" /><span>Add</span></button>
      </div>
      {FAMILY_MEMBERS.map(m => (
        <div key={m.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100">
              <img src={m.photo} alt={m.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-xs">{m.name}</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">{m.age} Y / {m.gender} • {m.relation}</p>
              <div className="flex space-x-2 mt-1.5">
                <span className="text-[9px] font-bold bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full">{m.bloodGroup}</span>
                {m.conditions !== 'None' && <span className="text-[9px] font-bold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full">{m.conditions}</span>}
              </div>
            </div>
            <button onClick={() => { setPerson('family'); setStep('what'); }}
              className="bg-red-50 text-red-600 p-2 rounded-xl hover:bg-red-100 transition-all">
              <Siren className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  if (step === 'contacts') return (
    <div className="pb-24 space-y-4">
      <div className="flex items-center space-x-3">
        <button onClick={() => setStep('home')} className="p-2 hover:bg-gray-50 rounded-xl transition-all"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
        <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Emergency Contacts</h2>
      </div>
      <div className="space-y-2">
        {EMERGENCY_CONTACTS.map(c => (
          <button key={c.id} onClick={() => setToast({ title: `Dialing ${c.name}`, message: `Calling ${c.number}...`, type: 'success' })}
            className="w-full bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-gray-200 transition-all active:scale-[0.98]">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${c.color}`}>{c.icon}</div>
              <div className="text-left">
                <h4 className="font-bold text-gray-900 text-xs">{c.name}</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Tap to call</p>
              </div>
            </div>
            <Phone className="w-4 h-4 text-[#0A5BFF]" />
          </button>
        ))}
      </div>
    </div>
  );

  if (step === 'hospitals') return (
    <div className="pb-24 space-y-4">
      <div className="flex items-center space-x-3">
        <button onClick={() => setStep('home')} className="p-2 hover:bg-gray-50 rounded-xl transition-all"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
        <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Nearby Hospitals</h2>
      </div>
      {NEARBY_HOSPITALS.map(h => (
        <div key={h.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="h-24 overflow-hidden">
            <img src={h.image} alt={h.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="p-4 space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-gray-900 text-sm">{h.name}</h4>
              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                h.erStatus === 'Available' ? 'bg-green-50 text-green-700' : h.erStatus === 'Busy' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
              }`}>{h.erStatus}</span>
            </div>
            <p className="text-[10px] text-gray-400 flex items-center"><MapPin className="w-3 h-3 mr-1" />{h.distance} • ETA {h.eta}</p>
            <div className="flex flex-wrap gap-1">
              {h.departments.map(d => (
                <span key={d} className="text-[9px] font-bold bg-blue-50 text-[#0A5BFF] px-2 py-0.5 rounded-full">{d}</span>
              ))}
            </div>
            <div className="flex space-x-2 pt-1">
              <button onClick={() => setToast({ title: 'Navigating', message: `Opening directions to ${h.name}`, type: 'info' })}
                className="flex-1 bg-[#0A5BFF] text-white py-2 rounded-xl text-[10px] font-bold flex items-center justify-center space-x-1 hover:bg-[#002f6f] transition-all">
                <Navigation className="w-3 h-3" /><span>Directions</span>
              </button>
              <button onClick={() => setToast({ title: `Calling ${h.name}`, message: `Dialing ${h.phone}`, type: 'success' })}
                className="bg-gray-50 border border-gray-100 text-gray-700 p-2 rounded-xl hover:bg-gray-100 transition-all">
                <Phone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (step === 'voice') return (
    <div className="pb-24 space-y-5">
      <div className="flex items-center space-x-3">
        <button onClick={() => setStep('home')} className="p-2 hover:bg-gray-50 rounded-xl transition-all"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
        <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Voice SOS</h2>
      </div>
      <div className="flex flex-col items-center justify-center py-6 space-y-6">
        <p className="text-xs font-bold text-gray-600 text-center px-4">
          {voiceListening ? 'Listening... Describe the emergency' : 'Tap microphone and start speaking'}
        </p>
        <div className="relative">
          {voiceListening && <div className="absolute inset-0 bg-[#0A5BFF]/20 rounded-full animate-ping scale-125" />}
          <button onClick={toggleVoiceScribe} className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 z-10 ${
            voiceListening ? 'bg-red-500 text-white' : 'bg-[#0A5BFF] text-white hover:bg-[#002f6f]'
          }`}>
            <Mic className="w-9 h-9" />
          </button>
        </div>

        {voiceListening && (
          <div className="space-y-3 w-full flex flex-col items-center">
            <div className="flex items-center space-x-1.5 h-12 justify-center">
              {[...Array(12)].map((_, i) => {
                const baseHeight = 8 + (audioLevel / 100) * 36;
                const barHeight = Math.max(8, Math.min(48, baseHeight * (0.6 + Math.sin(i * 0.5) * 0.4)));
                return (
                  <motion.div
                    key={i}
                    animate={{ height: barHeight }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="w-1.5 bg-[#0A5BFF] rounded-full"
                  />
                );
              })}
            </div>
            {audioLevel === 0 && (
              <p className="text-[10px] text-amber-600 font-semibold animate-pulse text-center">
                ⚠️ Microphone level is silent. Try speaking louder or check mic hardware.
              </p>
            )}
            {interimTranscript && (
              <p className="text-xs text-indigo-600 italic text-center px-4">
                "{interimTranscript}"
              </p>
            )}
          </div>
        )}

        {(voiceTranscript || isManualTyping) && !voiceListening && (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 w-full text-xs text-gray-700 italic text-center space-y-2">
            <textarea
              value={voiceTranscript}
              onChange={(e) => {
                setVoiceTranscript(e.target.value);
                const parsed = parseVoiceSOSCommand(e.target.value);
                setVoiceExtracted(parsed);
                setEmergencyType(parsed.condition as EmergencyType);
                setPerson(parsed.patientKey);
                setAddress(parsed.location);
                setNote(parsed.note);
              }}
              placeholder="Type your emergency details here (e.g. My father has severe chest pain. We are travelling in a taxi near Dadar)..."
              className="w-full bg-transparent border-none outline-none resize-none text-center italic text-xs font-semibold text-slate-700 placeholder-slate-400 focus:ring-0"
              rows={3}
            />
            <p className="text-[9px] text-gray-400 text-right font-medium">✏️ Type or edit to adjust details</p>
          </div>
        )}

        {voiceExtracted && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-white border border-blue-100 rounded-2xl p-4 shadow-sm space-y-3">
            <h4 className="font-extrabold text-[#0A5BFF] text-xs uppercase tracking-wider">AI Extracted Summary</h4>
            <div className="grid grid-cols-2 gap-2.5 text-[10px]">
              <div className="bg-gray-50 p-2 rounded-lg"><span className="text-gray-400">Patient</span><p className="font-bold mt-0.5 text-gray-900">{voiceExtracted.patient}</p></div>
              <div className="bg-gray-50 p-2 rounded-lg"><span className="text-gray-400">Condition</span><p className="font-bold mt-0.5 text-red-600">{voiceExtracted.condition}</p></div>
              <div className="bg-gray-50 p-2 rounded-lg"><span className="text-gray-400">Location</span><p className="font-bold mt-0.5 text-gray-900">{voiceExtracted.location}</p></div>
              <div className="bg-gray-50 p-2 rounded-lg"><span className="text-gray-400">Arrival Mode</span><p className="font-bold mt-0.5 text-gray-900">{voiceExtracted.arrivalMode}</p></div>
            </div>
            <button onClick={() => setStep('patient')} className="w-full bg-[#0A5BFF] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-[#002f6f] transition-all">
              Confirm & Continue SOS Flow
            </button>
          </motion.div>
        )}

        {!voiceListening && !voiceExtracted && (
          <div className="flex flex-col items-center space-y-3 w-full">
            <div className="flex items-center space-x-3 text-xs">
              <button type="button" onClick={simulateSpeechRecognition} className="font-extrabold text-[#0A5BFF] hover:underline cursor-pointer">
                Try Fallback Simulation
              </button>
              <span className="text-gray-300">|</span>
              <button type="button" onClick={() => setIsManualTyping(true)} className="font-extrabold text-[#0A5BFF] hover:underline cursor-pointer">
                Type Manually
              </button>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 w-full text-xs text-gray-500 text-center">
              <p className="font-semibold text-gray-700 mb-1">Example Command:</p>
              <p className="italic">"My father has severe chest pain. We are travelling in a taxi near Dadar."</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );



  // ═══ HOME VIEW ═══
  return (
    <div className="pb-24 space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Emergency SOS</h2>
        <p className="text-gray-400 text-[11px] font-semibold mt-0.5">Quick help. Faster care. Save lives.</p>
      </div>

      {/* Large SOS Button Card */}
      <div className="bg-gradient-to-br from-red-600 via-red-500 to-rose-500 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-8 -translate-y-8" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -translate-x-6 translate-y-6" />
        <div className="flex items-center justify-between relative z-10">
          <div className="space-y-1">
            <h3 className="font-extrabold text-lg tracking-tight">Emergency SOS</h3>
            <p className="text-[10px] text-red-100">Tap for immediate help</p>
            <p className="text-[9px] text-red-200 flex items-center mt-1"><MapPin className="w-3 h-3 mr-0.5" />Location shared with nearest hospital</p>
          </div>
          <button onClick={handleSOSTrigger} className="relative">
            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
            <div className="relative w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/40 hover:scale-105 active:scale-95 transition-all cursor-pointer">
              <HeartPulse className="w-10 h-10 text-white animate-pulse stroke-[2.5]" />
            </div>
          </button>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h3 className="font-extrabold text-gray-900 text-sm tracking-wider uppercase mb-3">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-2.5">
          {[
            { label: 'Medical\nEmergency', icon: HeartPulse, bg: 'bg-red-50', color: 'text-red-600', action: handleSOSTrigger },
            { label: 'Call\nAmbulance', icon: Phone, bg: 'bg-blue-50', color: 'text-[#0A5BFF]', action: () => setToast({ title: 'Calling 108', message: 'Dialing ambulance...', type: 'success' }) },
            { label: 'Blood\nRequest', icon: HeartPulse, bg: 'bg-pink-50', color: 'text-pink-600', action: () => setToast({ title: 'Blood Request', message: 'Opening blood request form...', type: 'info' }) },
            { label: 'Nearest\nHospital', icon: Hospital, bg: 'bg-green-50', color: 'text-green-600', action: () => setStep('hospitals') },
            { label: 'Report\nAccident', icon: AlertTriangle, bg: 'bg-amber-50', color: 'text-amber-600', action: () => { setEmergencyType('Road Accident'); setStep('who'); } },
            { label: 'Fire', icon: Flame, bg: 'bg-orange-50', color: 'text-orange-600', action: () => setToast({ title: 'Calling 101', message: 'Dialing Fire Brigade...', type: 'success' }) },
            { label: 'Police', icon: Shield, bg: 'bg-indigo-50', color: 'text-indigo-600', action: () => setToast({ title: 'Calling 100', message: 'Dialing Police...', type: 'success' }) },
            { label: 'Disaster\nMgmt', icon: ShieldAlert, bg: 'bg-yellow-50', color: 'text-yellow-700', action: () => setToast({ title: 'Calling 1078', message: 'Dialing Disaster Management...', type: 'success' }) },
            { label: 'Relative\nPre-Reg', icon: UserPlus, bg: 'bg-teal-50', color: 'text-teal-600', action: () => { setPerson('someone'); setNote('pre-register'); setStep('patient'); } },
            { label: 'Voice\nSOS', icon: Mic, bg: 'bg-purple-50', color: 'text-purple-600', action: () => setStep('voice') },
          ].map((a, i) => (
            <button key={i} onClick={a.action}
              className="bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center text-center hover:border-gray-200 transition-all shadow-sm active:scale-95">
              <div className={`w-10 h-10 ${a.bg} rounded-xl flex items-center justify-center ${a.color} mb-1.5`}>
                <a.icon className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold text-gray-700 leading-tight whitespace-pre-line">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Section links */}
      <div className="space-y-2">
        {[
          { label: 'Emergency History', desc: 'View past emergencies', icon: History, action: () => setStep('history') },
          { label: 'My Family', desc: 'Manage family members', icon: Users, action: () => setStep('family') },
          { label: 'Emergency Contacts', desc: 'Police, Fire, Ambulance & more', icon: PhoneCall, action: () => setStep('contacts') },
          { label: 'Nearby Hospitals', desc: 'Live ER status & directions', icon: Hospital, action: () => setStep('hospitals') },
        ].map(s => (
          <button key={s.label} onClick={s.action}
            className="w-full bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-gray-200 transition-all active:scale-[0.98]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#0A5BFF]">
                <s.icon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-gray-900 text-xs">{s.label}</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">{s.desc}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
        ))}
      </div>

      {/* Recent Emergency Requests */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-extrabold text-gray-900 text-sm tracking-wider uppercase">Recent Requests</h3>
          <button onClick={() => setStep('history')} className="text-xs font-bold text-[#0A5BFF] hover:underline">View All</button>
        </div>
        {PAST_EMERGENCIES.slice(0, 1).map(e => (
          <div key={e.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-900">{e.type} — {e.patientName}</p>
                <p className="text-[9px] text-gray-400 mt-0.5">{e.createdAt}</p>
              </div>
              <span className="text-[9px] font-extrabold text-green-700 bg-green-50 px-2 py-0.5 rounded-full uppercase">Discharged</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400">Hospital</span><p className="font-bold text-gray-900 mt-0.5">{e.hospitalName}</p></div>
              <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400">Doctor</span><p className="font-bold text-gray-900 mt-0.5">{e.doctorName}</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* Safety Tips */}
      <div>
        <h3 className="font-extrabold text-gray-900 text-sm tracking-wider uppercase mb-3 flex items-center space-x-1.5">
          <Lightbulb className="w-4 h-4 text-amber-500" /><span>Safety Tips</span>
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {SAFETY_TIPS.map(t => (
            <div key={t.id} className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm">
              <h4 className="font-bold text-gray-900 text-[11px]">{t.title}</h4>
              <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] max-w-sm w-[90%] bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 flex items-start space-x-3 pointer-events-auto">
            <div className={`p-2 rounded-xl ${toast.type === 'warning' ? 'bg-red-500/10 text-red-500' : toast.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
              {toast.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> : toast.type === 'success' ? <Check className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-black text-gray-900">{toast.title}</h5>
              <p className="text-[11px] text-gray-500 leading-normal mt-0.5">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
