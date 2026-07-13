import React from 'react';
import { motion } from 'motion/react';
import { User, Users, UserPlus, ArrowLeft } from 'lucide-react';
import type { EmergencyPerson } from '../../types/emergencySOS';

interface Props {
  onSelect: (p: EmergencyPerson) => void;
  onBack: () => void;
}

const options: { id: EmergencyPerson; label: string; desc: string; Icon: any }[] = [
  { id: 'myself', label: 'Myself', desc: 'I need emergency help', Icon: User },
  { id: 'family', label: 'Family Member', desc: 'A family member needs help', Icon: Users },
  { id: 'someone', label: 'Someone Else', desc: 'Reporting for another person', Icon: UserPlus },
];

export default function SOSWhoStep({ onSelect, onBack }: Props) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
      <div className="flex items-center space-x-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-50 rounded-xl transition-all"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Who needs help?</h2>
          <p className="text-[11px] text-gray-400 font-semibold">Step 1 of 3</p>
        </div>
      </div>
      <div className="space-y-3">
        {options.map((o) => (
          <button key={o.id} onClick={() => onSelect(o.id)}
            className="w-full bg-white border border-gray-100 rounded-2xl p-4 flex items-center space-x-4 text-left hover:border-[#0A5BFF]/30 hover:shadow-md transition-all active:scale-[0.98] shadow-sm">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#0A5BFF]">
              <o.Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-sm">{o.label}</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">{o.desc}</p>
            </div>
            <div className="w-5 h-5 border-2 border-gray-200 rounded-full" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
