import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Terminal, 
  Settings, 
  Layers, 
  Users, 
  Activity, 
  Clock, 
  Stethoscope, 
  Sun, 
  Moon, 
  CornerDownLeft,
  X,
  Brain,
  Pill,
  Siren,
  Scissors,
  HeartPulse
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onToggleTheme: () => void;
  onTriggerAction: (actionCmd: string) => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onToggleTheme,
  onTriggerAction
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = [
    { id: 'nav-dashboard', label: 'Go to Doctor Dashboard', category: 'Navigation', icon: Layers, action: () => onNavigate('dashboard') },
    { id: 'nav-ai', label: 'Go to AI Copilot Workspace', category: 'Navigation', icon: Brain, action: () => onNavigate('ai') },
    { id: 'nav-twin', label: 'Go to Command Center (Hospital Twin)', category: 'Navigation', icon: Activity, action: () => onNavigate('twin') },
    { id: 'nav-queue', label: 'Go to Patient Live Queue', category: 'Navigation', icon: Clock, action: () => onNavigate('queue') },
    { id: 'nav-consult', label: 'Go to Active Consultation', category: 'Navigation', icon: Stethoscope, action: () => onNavigate('consultation') },
    { id: 'nav-settings', label: 'Go to Portal Settings', category: 'Navigation', icon: Settings, action: () => onNavigate('settings') },
    { id: 'nav-pharmacy', label: 'Go to Pharmacy Portal', category: 'Navigation', icon: Pill, action: () => onNavigate('pharmacy') },
    { id: 'nav-emergency', label: 'Go to Emergency Care OS (Trauma Command Center)', category: 'Navigation', icon: Siren, action: () => onNavigate('emergency') },
    { id: 'nav-surgery', label: 'Go to Surgical OS (Operation Theatre Management)', category: 'Navigation', icon: Scissors, action: () => onNavigate('surgery') },
    { id: 'nav-icu', label: 'Go to ICU Management Platform (Critical Care OS)', category: 'Navigation', icon: HeartPulse, action: () => onNavigate('icu') },
    { id: 'action-theme', label: 'Toggle Dark / Light Theme Mode', category: 'System Action', icon: Sun, action: () => onToggleTheme() },
    { id: 'action-next', label: 'Call Next Patient in Queue', category: 'Clinical Command', icon: Users, action: () => onTriggerAction('call next') },
    { id: 'action-para', label: 'Prescribe Paracetamol 650mg', category: 'Clinical Command', icon: Stethoscope, action: () => onTriggerAction('add paracetamol') },
    { id: 'action-sign', label: 'Digitally Sign & Seal Prescription', category: 'Clinical Command', icon: Stethoscope, action: () => onTriggerAction('sign prescription') },
  ];

  const filteredItems = items.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase()) || 
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard events inside palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#020617]/70 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: -10 }}
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[500px]"
      >
        {/* Search Input Bar */}
        <div className="flex items-center space-x-3 px-4 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search action (e.g. go to command center)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-slate-200 text-xs font-semibold placeholder-gray-400 dark:placeholder-gray-600"
          />
          <span className="hidden sm:inline-block text-[9px] font-black uppercase px-2 py-1 bg-slate-200 dark:bg-slate-800 text-gray-500 rounded-md border border-slate-300/20">ESC</span>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-all">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-[#0A5BFF] text-white shadow-md' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black tracking-tight">{item.label}</p>
                      <span className={`text-[8px] font-extrabold uppercase ${isSelected ? 'text-blue-200' : 'text-gray-400'}`}>
                        {item.category}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-[9px] font-black flex items-center space-x-1 uppercase text-blue-200">
                      <span>ENTER</span>
                      <CornerDownLeft className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-gray-400 dark:text-gray-500 text-xs font-bold space-y-1">
              <Terminal className="w-8 h-8 text-gray-400 mx-auto opacity-50 mb-2" />
              <p>No matching commands or navigation endpoints.</p>
              <p className="text-[10px] text-gray-500">Try typing "go to" or "theme"</p>
            </div>
          )}
        </div>

        {/* Helper footer */}
        <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center text-[9px] text-gray-400 font-extrabold">
          <span>MCGM Digital Hospital OS Commands</span>
          <div className="flex space-x-4">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
