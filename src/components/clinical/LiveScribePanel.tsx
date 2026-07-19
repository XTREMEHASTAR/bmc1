import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, Loader2, ClipboardList, CheckCircle, Keyboard, Play } from 'lucide-react';
import { extractFromSegment, createEmptyExtraction } from '../../services/ai/clinicalExtractor';
import type { ExtractedClinicalData } from '../../types/clinical';

interface LiveScribePanelProps {
  onExtractionChange: (data: ExtractedClinicalData) => void;
  onTranscriptUpdate: (transcript: string) => void;
}

const SIMULATION_PHRASES = [
  "Patient Ramesh Kumar presents with severe chest pain and breathlessness since last night. ",
  "On examination, there is mild chest tenderness. ",
  "Let's order a complete blood count and a chest x-ray immediately. ",
  "Give normal saline IV fluids, start oxygen therapy, and prescribe paracetamol 650 mg orally twice daily. ",
  "Monitor vitals every 15 minutes."
];

export const LiveScribePanel: React.FC<LiveScribePanelProps> = ({ onExtractionChange, onTranscriptUpdate }) => {
  const [isScribing, setIsScribing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [manualText, setManualText] = useState('');
  const [isManualInputOpen, setIsManualInputOpen] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedClinicalData>(createEmptyExtraction());
  const recognitionRef = useRef<any>(null);
  const simulationIntervalRef = useRef<any>(null);

  // Refs to avoid stale closures and unnecessary re-initialization of SpeechRecognition
  const isScribingRef = useRef(isScribing);
  const isSimulatingRef = useRef(isSimulating);
  const onTranscriptUpdateRef = useRef(onTranscriptUpdate);
  const onExtractionChangeRef = useRef(onExtractionChange);

  // Keep refs in sync with props and state
  useEffect(() => {
    isScribingRef.current = isScribing;
    isSimulatingRef.current = isSimulating;
    onTranscriptUpdateRef.current = onTranscriptUpdate;
    onExtractionChangeRef.current = onExtractionChange;
  });

  // Sync mcgm-scribe-active event to let VoiceAssistantOverlay pause/resume
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('mcgm-scribe-active', { detail: isScribing }));
    return () => {
      window.dispatchEvent(new CustomEvent('mcgm-scribe-active', { detail: false }));
    };
  }, [isScribing]);

  // Clean up SpeechRecognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current._userStopped = true;
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, []);

  const startScribeSession = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current._userStopped = true;
          recognitionRef.current.abort();
        } catch (_) {}
      }

      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-IN';

      rec.onresult = (event: any) => {
        if (isSimulatingRef.current) return; // Ignore actual microphone if simulating
        
        let interimTranscript = '';
        let newFinalized = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            newFinalized += result[0].transcript + ' ';
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        if (newFinalized) {
          setTranscript(prev => {
            const next = prev + newFinalized;
            onTranscriptUpdateRef.current(next);
            return next;
          });

          // Run NLP Live Extraction
          setExtractedData(prev => {
            const next = extractFromSegment(newFinalized, prev);
            onExtractionChangeRef.current(next);
            return next;
          });
        }
      };

      rec.onerror = (e: any) => {
        console.error('Speech recognition error in Scribe Panel:', e);
        
        // Don't auto-turn off if it's just a transient issue, but abort or handle appropriately
        if (e.error === 'no-speech') {
          return;
        }

        // Turn off scribing state to avoid getting stuck
        setIsScribing(false);
        
        let errorMsg = 'Speech recognition failed.';
        if (e.error === 'not-allowed' || e.error === 'permission-denied') {
          errorMsg = 'Microphone permission blocked. Please check browser permissions or try the Simulation mode.';
        }
        
        window.dispatchEvent(new CustomEvent('mcgm-system-notification', {
          detail: {
            title: 'Scribing Connection Alert',
            message: errorMsg,
            type: 'warning'
          }
        }));
      };

      rec.onend = () => {
        if (isScribingRef.current && !isSimulatingRef.current && !rec._userStopped) {
          try {
            // Auto-restart with a fresh instance
            startScribeSession();
          } catch (err) {
            console.warn('Auto-restart SpeechRecognition failed:', err);
          }
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      console.error('Failed to initialize scribe session:', e);
    }
  };

  const startSimulation = () => {
    stopScribingOrSimulation();
    setIsScribing(true);
    setIsSimulating(true);
    setTranscript('');
    const emptyData = createEmptyExtraction();
    setExtractedData(emptyData);
    onExtractionChange(emptyData);
    
    let phraseIndex = 0;
    
    simulationIntervalRef.current = setInterval(() => {
      if (phraseIndex < SIMULATION_PHRASES.length) {
        const nextPhrase = SIMULATION_PHRASES[phraseIndex];
        setTranscript(prev => {
          const next = prev + nextPhrase;
          onTranscriptUpdate(next);
          return next;
        });
        
        setExtractedData(prev => {
          const next = extractFromSegment(nextPhrase, prev);
          onExtractionChange(next);
          return next;
        });
        
        phraseIndex++;
      } else {
        if (simulationIntervalRef.current) {
          clearInterval(simulationIntervalRef.current);
          simulationIntervalRef.current = null;
        }
        setIsScribing(false);
        setIsSimulating(false);
        window.dispatchEvent(new CustomEvent('mcgm-system-notification', {
          detail: {
            title: 'Scribing Simulation Complete',
            message: 'Successfully transcribed and extracted entities for patient রমেশ.',
            type: 'success'
          }
        }));
      }
    }, 2000);
  };

  const stopScribingOrSimulation = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current._userStopped = true;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsScribing(false);
    setIsSimulating(false);
  };

  const toggleScribing = () => {
    if (isScribing) {
      stopScribingOrSimulation();
    } else {
      setTranscript('');
      setExtractedData(createEmptyExtraction());
      onExtractionChange(createEmptyExtraction());
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        window.dispatchEvent(new CustomEvent('mcgm-system-notification', {
          detail: {
            title: 'Microphone API Not Supported',
            message: 'Web Speech API is not supported in this browser. Running clinical simulation.',
            type: 'info'
          }
        }));
        startSimulation();
      } else {
        try {
          setIsScribing(true);
          startScribeSession();
        } catch (e) {
          console.error('Error starting recognition:', e);
          startSimulation();
        }
      }
    }
  };

  const handleManualSubmit = () => {
    if (!manualText.trim()) return;
    const nextTranscript = transcript ? transcript + '\n' + manualText : manualText;
    setTranscript(nextTranscript);
    onTranscriptUpdate(nextTranscript);

    // Extract everything in the manual segment
    setExtractedData(prev => {
      const next = extractFromSegment(manualText, prev);
      onExtractionChange(next);
      return next;
    });

    setManualText('');
    window.dispatchEvent(new CustomEvent('mcgm-system-notification', {
      detail: {
        title: 'Clinical Data Extracted',
        message: 'Successfully extracted entities from manual text input.',
        type: 'success'
      }
    }));
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border border-indigo-900/50 rounded-xl p-5 shadow-lg text-white mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-indigo-900/50 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-indigo-500/20 text-indigo-400 ${(isScribing || isSimulating) ? 'animate-pulse' : ''}`}>
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              Ambient Clinical Scribe
              {isScribing && <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />}
            </h3>
            <p className="text-xs text-indigo-300">Natural voice capturing with live data extraction</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => setIsManualInputOpen(!isManualInputOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-xs transition-all border ${
              isManualInputOpen 
                ? 'bg-indigo-900/40 border-indigo-500/50 text-indigo-200' 
                : 'bg-slate-900 border-indigo-950 text-slate-400 hover:text-white'
            }`}
          >
            <Keyboard className="h-3.5 w-3.5" />
            {isManualInputOpen ? 'Hide Input' : 'Type/Paste'}
          </button>

          <button
            onClick={startSimulation}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-all shadow-sm"
          >
            <Play className="h-3.5 w-3.5" />
            Try Simulation
          </button>

          <button
            onClick={toggleScribing}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 shadow-md ${
              isScribing
                ? 'bg-red-650 hover:bg-red-750 text-white shadow-red-950/30'
                : 'bg-[#0A5BFF] hover:bg-blue-750 text-white shadow-blue-950/40'
            }`}
          >
            {isScribing ? (
              <>
                <MicOff className="h-4 w-4" />
                Stop Scribing
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 animate-bounce" />
                Start Scribing
              </>
            )}
          </button>
        </div>
      </div>

      {isManualInputOpen && (
        <div className="bg-slate-950/50 border border-indigo-950 rounded-lg p-3.5 mb-4 space-y-2">
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Type or paste medical details here (e.g. 'Patient c/o breathlessness, prescribe pantoprazole 40mg IV, order CBC and ECG')..."
            className="w-full bg-slate-900 border border-indigo-950 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none font-mono"
            rows={2}
          />
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-500 font-semibold">✏️ NLP will parse your custom text directly</span>
            <div className="flex gap-2">
              <button
                onClick={() => setManualText('')}
                className="px-3 py-1 rounded bg-slate-900 border border-indigo-950 text-[10px] font-bold text-slate-400 hover:text-white"
              >
                Clear
              </button>
              <button
                onClick={handleManualSubmit}
                disabled={!manualText.trim()}
                className="px-3.5 py-1 rounded bg-indigo-650 hover:bg-indigo-750 text-[10px] font-bold text-white disabled:opacity-50"
              >
                Extract Entities
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Transcript */}
        <div className="lg:col-span-2 flex flex-col h-48 bg-black/40 border border-indigo-950/80 rounded-lg p-4">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2">Live Conversation Transcript</span>
          <div className="flex-1 overflow-y-auto text-sm text-slate-350 leading-relaxed font-mono select-text scrollbar-thin">
            {transcript || (
              <span className="text-slate-600 italic">
                {isScribing 
                  ? (isSimulating ? 'Simulating clinical scribe feed...' : 'Listening to doctor conversation...') 
                  : 'Press Start Scribing, Try Simulation, or Type/Paste to begin...'}
              </span>
            )}
          </div>
        </div>

        {/* Live Extractions */}
        <div className="flex flex-col h-48 bg-black/40 border border-indigo-950/80 rounded-lg p-4 overflow-y-auto">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">Live AI Extraction</span>
          <div className="space-y-3 text-xs">
            {extractedData.symptoms.length > 0 && (
              <div>
                <span className="text-indigo-300 font-bold">Symptoms: </span>
                <span className="text-slate-200">{extractedData.symptoms.join(', ')}</span>
              </div>
            )}
            {extractedData.medications.length > 0 && (
              <div>
                <span className="text-indigo-300 font-bold">Meds: </span>
                <div className="pl-2 mt-1 space-y-0.5">
                  {extractedData.medications.map((m, idx) => (
                    <div key={idx} className="text-emerald-400 font-medium">
                      • {m.drug} {m.dose} {m.route} {m.frequency}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {extractedData.lab_orders.length > 0 && (
              <div>
                <span className="text-indigo-300 font-bold">Labs: </span>
                <span className="text-slate-200">{extractedData.lab_orders.join(', ')}</span>
              </div>
            )}
            {extractedData.radiology_orders.length > 0 && (
              <div>
                <span className="text-indigo-300 font-bold">Radiology: </span>
                <span className="text-slate-200">{extractedData.radiology_orders.join(', ')}</span>
              </div>
            )}
            {extractedData.procedures.length > 0 && (
              <div>
                <span className="text-indigo-300 font-bold">Procedures: </span>
                <span className="text-slate-200">
                  {extractedData.procedures.map(p => p.name + (p.details ? ` (${p.details})` : '')).join(', ')}
                </span>
              </div>
            )}
            {extractedData.nursing_orders.length > 0 && (
              <div>
                <span className="text-indigo-300 font-bold">Nursing: </span>
                <span className="text-slate-200">{extractedData.nursing_orders.join(', ')}</span>
              </div>
            )}
            {extractedData.diet && (
              <div>
                <span className="text-indigo-300 font-bold">Diet: </span>
                <span className="text-slate-200">{extractedData.diet}</span>
              </div>
            )}
            {!extractedData.symptoms.length && 
             !extractedData.medications.length && 
             !extractedData.lab_orders.length && 
             !extractedData.radiology_orders.length && 
             !extractedData.procedures.length && 
             !extractedData.nursing_orders.length && 
             !extractedData.diet && (
              <span className="text-slate-600 italic">Waiting for medical entities...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
