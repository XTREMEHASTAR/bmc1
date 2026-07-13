import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check, Phone, MapPin, Truck, Clock, Share2, Navigation, MessageSquare, Bell, Smartphone } from 'lucide-react';
import { MOCK_TIMELINE, NEARBY_HOSPITALS } from '../../data/emergencyData';
import type { SOSTimelineEvent } from '../../types/emergencySOS';
import { getAutoAssignment } from '../../services/patients';

interface Props {
  emergencyId: string;
  emergencyType: string;
  onBack: () => void;
  assignedWard?: string;
  assignedDept?: string;
}

export default function SOSTrackingView({ emergencyId, emergencyType, onBack, assignedWard, assignedDept }: Props) {
  const [timeline, setTimeline] = useState<SOSTimelineEvent[]>(MOCK_TIMELINE);
  const [eta, setEta] = useState(12);
  const [speed, setSpeed] = useState(48);
  const [traffic, setTraffic] = useState('Moderate');
  const [shared, setShared] = useState(false);
  const hospital = NEARBY_HOSPITALS[0];

  const auto = getAutoAssignment(emergencyType);
  const ward = assignedWard || auto.ward;
  const dept = assignedDept || auto.department;

  // Notification configuration states
  const [channels, setChannels] = useState({
    push: true,
    sms: true,
    whatsapp: true,
  });

  const [milestones, setMilestones] = useState({
    admission: true,
    doctor: true,
    ctScan: false,
    surgery: true,
    blood: true,
    icu: true,
    ward: false,
    discharge: true,
  });

  // Simulate timeline progress
  useEffect(() => {
    const t1 = setTimeout(() => {
      setTimeline(prev => prev.map((e, i) =>
        i === 4 ? { ...e, isActive: true, time: '10:33 AM' } : i === 3 ? { ...e, isCompleted: true, isActive: false, time: '10:28 AM' } : e
      ));
      setEta(5);
      setSpeed(60);
      setTraffic('Clear');
    }, 8000);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (eta > 0) {
      const iv = setInterval(() => {
        setEta(p => Math.max(0, p - 1));
        setSpeed(prev => Math.max(20, Math.min(75, prev + (Math.random() > 0.5 ? 5 : -5))));
      }, 15000);
      return () => clearInterval(iv);
    }
  }, [eta]);

  const handleShareLocation = () => {
    setShared(true);
    setTimeout(() => setShared(false), 3000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pb-28">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-50 rounded-xl transition-all"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">SOS Alert Sent</h2>
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
          </div>
          <p className="text-[11px] text-gray-400 font-semibold">Help is on the way</p>
        </div>
      </div>

      {/* Emergency ID Card */}
      <div className="bg-gradient-to-br from-[#0A5BFF] via-[#003399] to-[#0050cc] text-white rounded-2xl p-4 shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[9px] font-bold text-blue-200 uppercase tracking-wider">Emergency ID</p>
            <p className="text-sm font-black font-mono mt-0.5">{emergencyId}</p>
            <p className="text-[10px] text-blue-200 mt-1">{emergencyType} • High Priority</p>
          </div>
          <button onClick={handleShareLocation} className="bg-white/15 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center space-x-1 hover:bg-white/25 transition-all">
            <Share2 className="w-3 h-3" /><span>{shared ? 'Copied Link!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Auto-Routing Clinical Path Banner */}
      <div className="bg-emerald-50 text-emerald-800 border border-emerald-100/50 rounded-2xl p-4 shadow-sm space-y-2">
        <div className="flex items-start space-x-2.5">
          <span className="text-base mt-0.5">⚡</span>
          <div className="text-left">
            <h4 className="font-extrabold text-emerald-950 text-xs">Direct Admission Pathway Active</h4>
            <p className="text-[10px] text-emerald-700/90 leading-snug">The general triage inquiry counter is bypassed automatically. Proceed directly to the assigned unit.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2 pt-2.5 border-t border-emerald-200/50 text-[11px]">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-emerald-800/80 font-bold block">Assigned Ward</span>
            <span className="font-extrabold text-emerald-950">{ward}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-emerald-800/80 font-bold block">Department</span>
            <span className="font-extrabold text-emerald-950">{dept}</span>
          </div>
        </div>
      </div>

      {/* Ambulance tracking card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-900 text-sm flex items-center space-x-2">
            <Truck className="w-4 h-4 text-[#0A5BFF]" /><span>Live Ambulance Tracking</span>
          </h3>
          <span className="text-[9px] font-extrabold text-green-700 bg-green-50 px-2 py-0.5 rounded-full flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" /><span>LIVE</span>
          </span>
        </div>

        {/* Map with ambulance */}
        <div className="relative h-32 rounded-xl bg-sky-50 border border-sky-100 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            {/* Grid background simulation */}
            <div className="w-full h-full bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:16px_16px]" />
          </div>
          <div className="absolute left-[35%] top-[45%] flex flex-col items-center">
            <div className="text-xl animate-bounce">🚑</div>
            <span className="text-[8px] font-bold bg-white px-1.5 py-0.5 rounded shadow text-gray-700 mt-0.5">MH-01-AB-1234</span>
          </div>
          <div className="absolute right-[20%] top-[30%] flex flex-col items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow animate-pulse" />
            <span className="text-[8px] font-bold bg-white px-1.5 py-0.5 rounded shadow text-gray-700 mt-0.5">{hospital.name.split('(')[0].trim()}</span>
          </div>
          {/* Details Overlay */}
          <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-sm rounded-lg p-1.5 px-3 border border-gray-100 flex justify-between items-center text-[9px] font-bold text-gray-600 shadow-sm">
            <span>Speed: {speed} km/h</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <span>Traffic: {traffic}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <span>GPS: Connected</span>
          </div>
        </div>

        {/* ETA and details */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-50 rounded-xl p-2.5 text-center">
            <p className="text-[9px] font-bold text-gray-400 uppercase">Hospital ETA</p>
            <p className="text-lg font-black text-[#0A5BFF]">{eta}</p>
            <p className="text-[9px] text-gray-400 font-bold">mins</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2.5 text-center">
            <p className="text-[9px] font-bold text-gray-400 uppercase">Driver</p>
            <p className="text-xs font-bold text-gray-900 mt-1">Ramesh K.</p>
            <p className="text-[8px] text-green-600 font-bold mt-0.5">Dialable</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2.5 text-center">
            <p className="text-[9px] font-bold text-gray-400 uppercase">Paramedic</p>
            <p className="text-xs font-bold text-gray-900 mt-1">Sunil M.</p>
            <p className="text-[8px] text-gray-400 font-bold mt-0.5">ACLS Certified</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <button className="flex-1 bg-[#0A5BFF] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 hover:bg-[#002f6f] transition-all">
            <Phone className="w-3.5 h-3.5" /><span>Call Ambulance</span>
          </button>
          <button onClick={handleShareLocation} className="flex-1 bg-gray-50 border border-gray-100 text-gray-700 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 hover:bg-gray-100 transition-all">
            <Navigation className="w-3.5 h-3.5" /><span>{shared ? 'Link Copied!' : 'Share Live Location'}</span>
          </button>
        </div>
      </div>

      {/* Hospital assigned */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
            <img src={hospital.image} alt={hospital.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-xs">{hospital.name}</h4>
            <p className="text-[10px] text-gray-400 mt-0.5 flex items-center"><MapPin className="w-3 h-3 mr-0.5" />{hospital.distance} • {hospital.eta}</p>
            <span className="inline-block mt-1.5 text-[9px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">Trauma Team & ICU Notified ✓</span>
          </div>
        </div>
      </div>

      {/* Patient Status Timeline */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-1">
        <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-[#0A5BFF]" /><span>Patient Status Updates</span>
        </h3>
        <div className="space-y-0">
          {timeline.map((e, i) => (
            <div key={e.id} className="flex items-start space-x-3 relative">
              {i < timeline.length - 1 && (
                <div className={`absolute left-[11px] top-6 w-0.5 h-full ${e.isCompleted ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                e.isCompleted ? 'bg-green-500 text-white' : e.isActive ? 'bg-[#0A5BFF] text-white animate-pulse' : 'bg-gray-100 text-gray-400'
              }`}>
                {e.isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : <div className="w-2 h-2 rounded-full bg-current" />}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex justify-between items-center">
                  <p className={`text-xs font-bold ${e.isCompleted || e.isActive ? 'text-gray-900' : 'text-gray-400'}`}>{e.label}</p>
                  <span className={`text-[10px] font-semibold ${e.isCompleted ? 'text-green-600' : e.isActive ? 'text-[#0A5BFF]' : 'text-gray-300'}`}>{e.time}</span>
                </div>
                {e.isActive && <p className="text-[10px] text-[#0A5BFF] font-semibold mt-0.5 animate-pulse">In progress...</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Relative / Family Notifications configurations */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <span className="text-xl">📢</span>
          <div>
            <h4 className="font-bold text-gray-900 text-xs">Family Update Channels</h4>
            <p className="text-[10px] text-gray-400">Select how relatives receive real-time updates</p>
          </div>
        </div>

        {/* Toggle Channels */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'push', label: 'Push Alert', icon: Bell },
            { id: 'sms', label: 'SMS Texts', icon: Smartphone },
            { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
          ].map((c) => {
            const active = channels[c.id as keyof typeof channels];
            return (
              <button
                key={c.id}
                onClick={() => setChannels(prev => ({ ...prev, [c.id]: !active }))}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                  active ? 'border-[#0A5BFF] bg-blue-50/20 text-[#0A5BFF]' : 'border-gray-100 text-gray-500'
                }`}
              >
                <c.icon className="w-4 h-4 mb-1" />
                <span className="text-[9px] font-bold">{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* Milestones to report */}
        <div className="space-y-2.5 pt-2 border-t border-gray-50">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Report milestones</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'admission', label: 'Admission Confirmed' },
              { id: 'doctor', label: 'Doctor Assigned' },
              { id: 'ctScan', label: 'CT Scan & Diagnostics' },
              { id: 'surgery', label: 'Surgery Started' },
              { id: 'blood', label: 'Blood Required Alert' },
              { id: 'icu', label: 'ICU Admissions' },
              { id: 'ward', label: 'Ward Transfer' },
              { id: 'discharge', label: 'Discharge Summary' },
            ].map((m) => {
              const checked = milestones[m.id as keyof typeof milestones];
              return (
                <label key={m.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => setMilestones(prev => ({ ...prev, [m.id]: !checked }))}
                    className="rounded border-gray-300 text-[#0A5BFF] focus:ring-[#0A5BFF] w-3.5 h-3.5"
                  />
                  <span className="text-[10px] text-gray-600 font-bold">{m.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
