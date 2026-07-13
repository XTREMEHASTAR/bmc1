import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Car, HeartPulse, Brain, Wind, Activity, Flame, Skull, Baby, Zap, HelpCircle, AlertTriangle } from 'lucide-react';
import type { EmergencyType } from '../../types/emergencySOS';

interface Props {
  onSelect: (t: EmergencyType) => void;
  onBack: () => void;
}

const types: { id: EmergencyType; icon: any; color: string; bg: string }[] = [
  { id: 'Road Accident', icon: Car, color: 'text-red-600', bg: 'bg-red-50' },
  { id: 'Chest Pain', icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'Stroke', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'Breathing Difficulty', icon: Wind, color: 'text-sky-600', bg: 'bg-sky-50' },
  { id: 'Heart Attack', icon: Activity, color: 'text-red-700', bg: 'bg-red-50' },
  { id: 'Fall', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'Burn', icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'Poisoning', icon: Skull, color: 'text-emerald-700', bg: 'bg-emerald-50' },
  { id: 'Pregnancy', icon: Baby, color: 'text-pink-600', bg: 'bg-pink-50' },
  { id: 'Unconscious', icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'Other', icon: HelpCircle, color: 'text-gray-600', bg: 'bg-gray-50' },
];

export default function SOSWhatStep({ onSelect, onBack }: Props) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
      <div className="flex items-center space-x-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-50 rounded-xl transition-all"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">What happened?</h2>
          <p className="text-[11px] text-gray-400 font-semibold">Step 2 of 3 • Select emergency type</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {types.map((t) => (
          <button key={t.id} onClick={() => onSelect(t.id)}
            className="bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center text-center hover:border-[#0A5BFF]/30 hover:shadow-md transition-all active:scale-95 shadow-sm space-y-2">
            <div className={`w-10 h-10 ${t.bg} rounded-xl flex items-center justify-center ${t.color}`}>
              <t.icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-gray-700 leading-tight">{t.id}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
