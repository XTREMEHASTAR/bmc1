import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Navigation, Camera, Mic, FileText, Send, Image, Video, CheckCircle } from 'lucide-react';

interface Props {
  onSubmit: (data: { lat: number; lng: number; address: string; note: string; attachments: string[] }) => void;
  onBack: () => void;
}

export default function SOSWhereStep({ onSubmit, onBack }: Props) {
  const [lat] = useState(19.0430);
  const [lng] = useState(72.8601);
  const [address, setAddress] = useState('Sion East, Mumbai 400022');
  const [note, setNote] = useState('');
  const [accuracy] = useState('High (±3 meters)');
  const [timer, setTimer] = useState(0);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [attType, setAttType] = useState<string | null>(null);

  useEffect(() => {
    const iv = setInterval(() => setTimer(p => p + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const addAttachment = (type: string) => {
    setAttType(type);
    setTimeout(() => {
      setAttachments(prev => [...prev, `${type}_${Date.now().toString().slice(-4)}`]);
      setAttType(null);
    }, 1200);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <div className="flex items-center space-x-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Confirm Location</h2>
          <p className="text-[11px] text-gray-400 font-semibold">Step 3 of 5 • Share details & GPS</p>
        </div>
      </div>

      {/* Timer */}
      <div className="text-center bg-gray-50 rounded-2xl p-3 border border-gray-100/50">
        <div className="text-2xl font-black text-[#0A5BFF] font-mono tracking-wider">{fmt(timer)}</div>
        <div className="flex items-center justify-center space-x-1.5 mt-1">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-bold text-green-600">Continuous Location Stream</span>
        </div>
      </div>

      {/* Map simulation */}
      <div className="relative h-40 rounded-2xl bg-sky-50 border border-sky-100 overflow-hidden shadow-inner">
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0 20 C 50 20, 50 60, 100 60 C 150 60, 150 10, 200 10 C 250 10, 250 80, 300 80" fill="none" stroke="#003399" strokeWidth="3" />
            <path d="M 20 0 C 20 50, 80 50, 80 100 C 80 150, 30 150, 30 200" fill="none" stroke="#003399" strokeWidth="2" />
            <line x1="0" y1="80" x2="400" y2="80" stroke="#003399" strokeWidth="1" />
          </svg>
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-3 border-white shadow-lg animate-bounce">
            <MapPin className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[9px] font-bold text-gray-700 bg-white px-2 py-0.5 rounded shadow mt-1">Your Location</span>
        </div>
      </div>

      {/* Location info */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-2">
        <div className="flex items-start space-x-2">
          <Navigation className="w-4 h-4 text-[#0A5BFF] mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <input
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full text-xs font-bold text-gray-900 bg-transparent border-b border-gray-100 pb-1 outline-none focus:border-[#0A5BFF] transition-all"
            />
            <p className="text-[9px] text-gray-400 mt-1">Lat {lat.toFixed(4)}, Lng {lng.toFixed(4)} • Accuracy: {accuracy}</p>
          </div>
        </div>
      </div>

      {/* Additional info */}
      <div className="space-y-2.5">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Add Details (optional)</label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={2}
          placeholder="e.g. Near main gate, third floor, unconscious patient..."
          className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0A5BFF] resize-none"
        />
        
        {/* Media attachments triggers */}
        <div className="flex space-x-2">
          {[
            { id: 'photo', label: 'Add Photo', icon: Camera },
            { id: 'video', label: 'Add Video', icon: Video },
            { id: 'voice', label: 'Voice Note', icon: Mic },
          ].map(a => (
            <button
              key={a.id}
              type="button"
              onClick={() => addAttachment(a.id)}
              disabled={attType !== null}
              className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold text-gray-600 hover:bg-gray-100 transition-all active:scale-[0.98]"
            >
              <a.icon className="w-3.5 h-3.5" />
              <span>{a.label}</span>
            </button>
          ))}
        </div>

        {/* Display attached items */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {attachments.map(att => (
              <span key={att} className="text-[9px] font-bold bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-full flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span className="capitalize">{att.replace('_', ' #')}</span>
              </span>
            ))}
          </div>
        )}

        {/* Attachment simulation loader */}
        {attType && (
          <p className="text-[9px] text-gray-400 animate-pulse font-semibold">
            Uploading {attType} attachment to emergency dispatch...
          </p>
        )}
      </div>

      <button
        onClick={() => onSubmit({ lat, lng, address, note, attachments })}
        className="w-full bg-[#0A5BFF] hover:bg-[#002f6f] text-white py-3.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 shadow-md active:scale-[0.98] transition-all"
      >
        <span>Continue to Patient Details</span>
      </button>
    </motion.div>
  );
}
