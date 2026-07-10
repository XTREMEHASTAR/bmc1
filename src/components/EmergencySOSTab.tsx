import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PhoneCall, Navigation, ArrowLeft, ShieldAlert, Plus, X, HeartPulse, Shield, MapPin, AlertTriangle, Bell, Check } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export default function EmergencySOSTab() {
  const [sosActive, setSosActive] = useState(false);
  const [dispatcherConnected, setDispatcherConnected] = useState(false);
  const [showEditContacts, setShowEditContacts] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  
  // Contacts State
  const [contacts, setContacts] = useState<Contact[]>([
    { id: 'c1', name: 'Sangeeta Patil', relation: 'Wife', phone: '+91 98765 43210' },
    { id: 'c2', name: 'Dr. Amit Shah', relation: 'Family Doctor', phone: '+91 91234 56789' }
  ]);
  
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const triggerSOS = () => {
    setSosActive(true);
    setDispatcherConnected(false);
    // Simulate dispatcher connect in 2s
    setTimeout(() => {
      setDispatcherConnected(true);
    }, 2500);
  };

  const cancelSOS = () => {
    setSosActive(false);
    setDispatcherConnected(false);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    const contact: Contact = {
      id: 'contact_' + Date.now(),
      name: newName,
      relation: newRelation || 'Contact',
      phone: newPhone
    };

    setContacts([...contacts, contact]);
    setNewName('');
    setNewRelation('');
    setNewPhone('');
  };

  const handleRemoveContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  return (
    <div className="pb-24 space-y-6">
      {/* Header Description */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Emergency SOS</h2>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Press for immediate medical assistance. Current location is being shared.</p>
      </div>

      {/* SOS Button Area */}
      <div className="flex flex-col items-center justify-center py-6">
        <div className="relative">
          {/* Animated rings for pulse effect */}
          <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping scale-110" />
          <div className="absolute inset-0 bg-red-500/10 rounded-full animate-pulse scale-125" />
          
          <button
            onClick={triggerSOS}
            className="relative w-48 h-48 bg-gradient-to-br from-[#ba1a1a] to-red-500 text-white rounded-full flex flex-col items-center justify-center shadow-2xl hover:scale-102 active:scale-95 transition-all border-8 border-white cursor-pointer z-10 text-center"
          >
            <HeartPulse className="w-12 h-12 mb-2 animate-bounce stroke-[2.5]" />
            <span className="font-extrabold text-lg uppercase tracking-wider">CALL AMBULANCE</span>
            <span className="text-[10px] text-red-100 font-semibold mt-1">Sion LTMGH Dispatch</span>
          </button>
        </div>
      </div>

      {/* Nearest ER / Casualty Card */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center justify-between">
          <span>Nearest ER / Casualty</span>
          <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2.5 py-1 rounded-full">
            Live Location
          </span>
        </h3>

        {/* Info card */}
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-850 flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=150&h=150"
              alt="Sion Hospital ER"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Sion Hospital (LTMGH)</h4>
            <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center">
              <MapPin className="w-3.5 h-3.5 text-gray-400 mr-1" />
              1.2 km • 8 mins away
            </p>
            <div className="flex space-x-2 mt-3">
              <button
                onClick={() => setToast({
                  title: 'Navigation Started',
                  message: 'Simulating Google Maps Navigation directions to Sion Hospital Emergency...',
                  type: 'info'
                })}
                className="bg-[#002068] dark:bg-[#0050cc] text-white py-2 px-4 rounded-lg font-bold flex items-center space-x-1.5 hover:bg-[#00164e] dark:hover:bg-blue-700 transition-all"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Directions</span>
              </button>
              <button
                onClick={() => setToast({
                  title: 'Dialing Sion ER',
                  message: 'Dialing LTMG Sion Emergency ER Desk: 022-24071234',
                  type: 'success'
                })}
                className="bg-gray-100 dark:bg-slate-800 text-[#002068] dark:text-blue-400 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center"
              >
                <PhoneCall className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Vector map visualization */}
        <div className="relative h-32 rounded-2xl bg-sky-50 dark:bg-slate-950/40 border border-sky-100 dark:border-slate-800/80 overflow-hidden flex items-center justify-center">
          {/* Mock Map Background Graphics */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <path d="M 0 20 C 50 20, 50 60, 100 60 C 150 60, 150 10, 200 10 C 250 10, 250 80, 300 80 C 350 80, 350 30, 400 30" fill="none" stroke="#003399" strokeWidth="4" />
              <path d="M 20 0 C 20 50, 80 50, 80 100 C 80 150, 30 150, 30 200" fill="none" stroke="#003399" strokeWidth="2" />
              <line x1="0" y1="50" x2="400" y2="50" stroke="#003399" strokeWidth="1" />
              <line x1="150" y1="0" x2="150" y2="200" stroke="#003399" strokeWidth="1" />
            </svg>
          </div>
          
          {/* Sion Hospital marker */}
          <div className="absolute left-[35%] top-[35%] flex flex-col items-center">
            <div className="w-4 h-4 bg-[#ba1a1a] rounded-full flex items-center justify-center border-2 border-white animate-pulse">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
            <span className="text-[9px] font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-gray-100 dark:border-slate-800 shadow-sm mt-1">
              Sion Hospital ER
            </span>
          </div>

          {/* Patient current position marker */}
          <div className="absolute left-[50%] top-[60%] flex flex-col items-center">
            <div className="w-5 h-5 bg-[#0050cc] rounded-full flex items-center justify-center border-2 border-white shadow-md">
              <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            </div>
            <span className="text-[9px] font-extrabold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900/30 shadow-sm mt-1">
              Rahul (You)
            </span>
          </div>
        </div>
      </div>

      {/* Police & Fire quick links */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setToast({
            title: 'Dialing Police',
            message: 'Dialing Police emergency dispatch line: 100',
            type: 'success'
          })}
          className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-2xl p-4 flex items-center space-x-3 text-left hover:border-gray-200 dark:hover:border-slate-700 transition-all shadow-sm active:scale-98"
        >
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/30 rounded-xl flex items-center justify-center text-[#0050cc] dark:text-blue-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Police</h4>
            <p className="text-[11px] text-gray-505 dark:text-gray-400">Call (100)</p>
          </div>
        </button>

        <button
          onClick={() => setToast({
            title: 'Dialing Fire Brigade',
            message: 'Dialing Fire brigade emergency line: 101',
            type: 'success'
          })}
          className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-2xl p-4 flex items-center space-x-3 text-left hover:border-gray-200 dark:hover:border-slate-700 transition-all shadow-sm active:scale-98"
        >
          <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950/30 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Fire</h4>
            <p className="text-[11px] text-gray-550 dark:text-gray-400">Call (101)</p>
          </div>
        </button>
      </div>

      {/* Emergency Contacts List */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-2">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Emergency Contacts</h3>
          <button
            onClick={() => setShowEditContacts(!showEditContacts)}
            className="text-[#0050cc] dark:text-blue-400 text-xs font-bold hover:underline"
          >
            {showEditContacts ? 'Done' : 'Edit List'}
          </button>
        </div>

        <div className="space-y-3">
          {contacts.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-1">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 text-xs">
                  {c.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-xs">{c.name}</h4>
                  <p className="text-[10px] text-gray-450 dark:text-gray-500 mt-0.5">{c.relation} • {c.phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {showEditContacts && (
                  <button
                    onClick={() => handleRemoveContact(c.id)}
                    className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-[#ba1a1a] dark:text-red-400 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setToast({
                    title: `Dialing ${c.name}`,
                    message: `Dialing contact: ${c.phone}`,
                    type: 'success'
                  })}
                  className="p-2 bg-blue-50 dark:bg-blue-950/30 text-[#0050cc] dark:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Expand Form if Editing is Open */}
          <AnimatePresence>
            {showEditContacts && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddContact}
                className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-3"
              >
                <h4 className="font-bold text-gray-900 dark:text-white text-xs">Add Emergency Contact</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-850 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#002068] dark:focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Relation (e.g. Wife)"
                    value={newRelation}
                    onChange={(e) => setNewRelation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-850 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#002068] dark:focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-2">
                  <input
                    type="tel"
                    placeholder="Phone (+91 XXXXX XXXXX)"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-gray-200 dark:border-slate-850 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#002068] dark:focus:ring-blue-500"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-[#002068] dark:bg-blue-600 text-white px-4 rounded-lg text-xs font-bold hover:bg-[#00164e] dark:hover:bg-blue-700 transition-all flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* SOS Active Overlay Screen Simulator */}
      <AnimatePresence>
        {sosActive && (
          <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-6 text-center text-white">
            <div className="mt-12 space-y-3">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white mx-auto animate-ping border-4 border-white">
                <HeartPulse className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h2 className="text-3xl font-black text-red-500 uppercase tracking-wider">SOS Active</h2>
              <p className="text-gray-300 text-xs px-6">
                Your coordinates and medical ID are shared with MCGM ambulance systems.
              </p>
            </div>

            <div className="my-auto space-y-6">
              <div className="p-5 bg-white/5 border border-white/10 rounded-3xl max-w-sm mx-auto space-y-3">
                <div className="flex items-center justify-center space-x-2 text-sm text-green-400 font-bold">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
                  <span>{dispatcherConnected ? 'Connected to Operator' : 'Pinging Operator...'}</span>
                </div>
                <p className="text-sm font-semibold text-gray-200">
                  {dispatcherConnected 
                    ? 'Sion LTMG Ambulance unit #882 is dispatched. ETA 7 mins.' 
                    : 'Awaiting operator answering sequence...'}
                </p>
                <p className="text-[10px] text-gray-400">
                  GPS Coordinates: Lat 19.0343, Lng 72.8601 • Sion Hospital Area
                </p>
              </div>
            </div>

            <button
              onClick={cancelSOS}
              className="w-full max-w-sm mx-auto bg-white text-[#ba1a1a] py-4 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg text-sm"
            >
              Cancel Emergency SOS Alert
            </button>
          </div>
        )}
      </AnimatePresence>

      {/* Local Toast Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-y-1/2 z-[9999] max-w-sm w-[90%] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 flex items-start space-x-3 pointer-events-auto"
          >
            <div className={`p-2 rounded-xl ${
              toast.type === 'warning' 
                ? 'bg-red-500/10 text-red-500' 
                : toast.type === 'success' 
                ? 'bg-green-500/10 text-green-500' 
                : 'bg-blue-500/10 text-blue-500'
            }`}>
              {toast.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> : toast.type === 'success' ? <Check className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-black text-gray-900 dark:text-white">{toast.title}</h5>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal mt-0.5">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
