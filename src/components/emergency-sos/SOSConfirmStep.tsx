import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check, ShieldAlert, AlertCircle, FileText, Send, User } from 'lucide-react';
import type { EmergencyPerson, EmergencyType } from '../../types/emergencySOS';

interface Props {
  patient: {
    name: string;
    age: number;
    gender: string;
    bloodGroup: string;
    conditions: string;
    history?: string;
  };
  personType: EmergencyPerson;
  emergencyType: EmergencyType;
  address: string;
  note: string;
  onSubmit: () => void;
  onBack: () => void;
}

export default function SOSConfirmStep({
  patient,
  personType,
  emergencyType,
  address,
  note,
  onSubmit,
  onBack,
}: Props) {
  const [emergencyId] = useState('EID' + Date.now().toString().slice(-10));
  const [tempUhid] = useState('UHID-TMP-' + Math.floor(10000 + Math.random() * 90000));
  const [agreed, setAgreed] = useState(true);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <div className="flex items-center space-x-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Confirm & Dispatch</h2>
          <p className="text-[11px] text-gray-400 font-semibold">Step 5 of 5 • Final review</p>
        </div>
      </div>

      {/* Review details */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-50 pb-3">
          <div>
            <span className="text-[9px] font-bold text-gray-400 uppercase">Emergency Type</span>
            <p className="text-sm font-black text-red-600 mt-0.5">{emergencyType}</p>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-bold text-gray-400 uppercase">Priority</span>
            <span className="block mt-1 text-[9px] font-black text-white bg-red-600 px-2 py-0.5 rounded-full">
              CRITICAL
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-b border-gray-50 pb-3">
          <div>
            <span className="text-[9px] font-bold text-gray-400 uppercase">Patient Name</span>
            <p className="text-xs font-bold text-gray-900 mt-0.5 flex items-center">
              <User className="w-3.5 h-3.5 text-gray-400 mr-1 flex-shrink-0" />
              <span className="truncate">{patient.name}</span>
            </p>
          </div>
          <div>
            <span className="text-[9px] font-bold text-gray-400 uppercase">Profile Info</span>
            <p className="text-xs font-bold text-gray-900 mt-0.5">
              {patient.age} Y / {patient.gender} • {patient.bloodGroup}
            </p>
          </div>
        </div>

        <div className="border-b border-gray-50 pb-3">
          <span className="text-[9px] font-bold text-gray-400 uppercase">Live Location</span>
          <p className="text-xs font-bold text-gray-900 mt-0.5 leading-relaxed">{address}</p>
        </div>

        {patient.conditions && (
          <div className="border-b border-gray-50 pb-3">
            <span className="text-[9px] font-bold text-gray-400 uppercase">Medical Conditions</span>
            <p className="text-xs font-bold text-gray-700 mt-0.5">{patient.conditions}</p>
          </div>
        )}

        {note && (
          <div>
            <span className="text-[9px] font-bold text-gray-400 uppercase">Situation Note</span>
            <p className="text-xs font-bold text-gray-700 mt-0.5 leading-relaxed">{note}</p>
          </div>
        )}
      </div>

      {/* Generated IDs Preview */}
      <div className="bg-blue-50/40 border border-blue-50 rounded-2xl p-4 space-y-2.5">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-gray-500">Proposed Emergency ID</span>
          <span className="font-black text-[#0A5BFF] font-mono">{emergencyId}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-gray-500">Auto-Generated Temporary UHID</span>
          <span className="font-black text-[#0A5BFF] font-mono">{tempUhid}</span>
        </div>
      </div>

      {/* Consent checkbox */}
      <label className="flex items-start space-x-3 cursor-pointer p-1">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 rounded border-gray-300 text-[#0A5BFF] focus:ring-[#0A5BFF]"
        />
        <span className="text-[10px] text-gray-500 font-semibold leading-normal">
          I consent to share live GPS location, medical history, and contact details with the trauma response team at the nearest hospital.
        </span>
      </label>

      {/* Submit Button */}
      <button
        disabled={!agreed}
        onClick={onSubmit}
        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-4 rounded-2xl font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg active:scale-[0.98] transition-all"
      >
        <Send className="w-5 h-5" />
        <span>Confirm Emergency Alert 🚨</span>
      </button>
    </motion.div>
  );
}
