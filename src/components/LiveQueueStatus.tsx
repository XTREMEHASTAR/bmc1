import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, RefreshCw, Clock, User, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Appointment, Patient } from '../types';

interface LiveQueueStatusProps {
  appointment: Appointment;
  patients: Patient[];
  onBack: () => void;
}

export default function LiveQueueStatus({ appointment, patients, onBack }: LiveQueueStatusProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Get live status of patient from the doctor queue
  const livePatient = patients.find(p => p.token === appointment.tokenNo);
  const liveStatus = livePatient ? livePatient.status : appointment.status;

  // 2. Calculate dynamic queue position
  const waitingPatients = patients.filter(p => p.status === 'Waiting');
  const currentIndex = waitingPatients.findIndex(p => p.token === appointment.tokenNo);
  
  // If not waiting (i.e. Consulting or Completed), peopleAhead is 0
  const peopleAhead = liveStatus === 'Waiting' && currentIndex >= 0 ? currentIndex : 0;
  const estimatedWait = peopleAhead * 4; // 4 mins per patient

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header back & title */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 border border-gray-200 bg-white rounded-xl hover:bg-gray-50 flex items-center text-xs font-bold text-gray-700 space-x-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-sm font-extrabold text-[#0A5BFF]">Live Queue Tracker</span>
      </div>

      {/* Appointment Summary banner */}
      <div className="bg-gradient-to-r from-[#0A5BFF] to-[#0050cc] text-white rounded-3xl p-5 shadow-md relative overflow-hidden">
        <p className="text-[10px] font-bold tracking-widest uppercase text-blue-200">Current Appointment</p>
        <h2 className="text-xl font-black mt-1">{appointment.department.name} OPD</h2>
        <p className="text-xs text-blue-50 mt-1">{appointment.hospital.name}, Building A, 2nd Floor</p>
      </div>

      {/* Live queue status metrics */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-900 text-sm flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${liveStatus === 'Completed' ? 'bg-green-500' : 'bg-red-600 animate-pulse'}`} />
            <span>Live Queue Status</span>
          </h3>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-1.5 hover:bg-gray-50 rounded-lg text-gray-500 transition-all flex items-center space-x-1 text-xs font-semibold ${
              isRefreshing ? 'opacity-50' : ''
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Big visual stats */}
        <div className="grid grid-cols-2 gap-4 divide-x divide-gray-100">
          <div className="text-center py-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Token Number</p>
            <p className="text-2xl font-black text-[#0A5BFF] mt-1">{appointment.tokenNo}</p>
          </div>
          <div className="text-center py-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Wait Time</p>
            <p className="text-2xl font-black text-[#0050cc] mt-1">
              {liveStatus === 'Completed' ? '0 mins' : liveStatus === 'In Consultation' ? 'Active now' : `~${estimatedWait} mins`}
            </p>
          </div>
        </div>

        {/* People Ahead Card */}
        <div className="bg-gray-50/50 rounded-2xl p-5 text-center border border-gray-100">
          <p className="text-4xl font-black text-gray-900">
            {liveStatus === 'Completed' ? 'Completed' : liveStatus === 'In Consultation' ? 'Calling You Now' : `${peopleAhead} people`}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {liveStatus === 'Completed' ? 'Session completed' : liveStatus === 'In Consultation' ? 'Please enter Doctor room #4B' : 'ahead of you in the queue'}
          </p>
        </div>

        {/* Queue timeline progress */}
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Queue Timeline</h4>
          <div className="relative pl-6 space-y-6 text-xs font-semibold">
            {/* Thread line linking items */}
            <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-gray-100" />
            <div 
              className="absolute left-1.5 top-2 w-0.5 bg-[#0050cc] transition-all duration-500" 
              style={{
                height: liveStatus === 'Completed' ? '100%' : liveStatus === 'In Consultation' ? '66%' : '33%'
              }}
            />

            {/* Step 1: Confirmed */}
            <div className="relative flex items-start space-x-3">
              <div className="absolute -left-6 w-3.5 h-3.5 rounded-full bg-[#0A5BFF] border-2 border-white flex items-center justify-center text-white" />
              <div>
                <h5 className="font-bold text-gray-900">Token Confirmed</h5>
                <p className="text-[10px] text-gray-400 mt-0.5">MCGM Digital gateway validated</p>
              </div>
            </div>

            {/* Step 2: In Queue */}
            <div className={`relative flex items-start space-x-3 transition-opacity ${
              liveStatus === 'Waiting' ? 'opacity-100' : 'opacity-70'
            }`}>
              <div className={`absolute -left-6 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center transition-all ${
                liveStatus === 'Waiting' 
                  ? 'bg-[#0050cc] ring-4 ring-[#0050cc]/10' 
                  : 'bg-green-500'
              }`} />
              <div>
                <h5 className={`font-bold ${liveStatus === 'Waiting' ? 'text-[#0050cc]' : 'text-gray-900'}`}>
                  {liveStatus === 'Waiting' ? 'In Queue' : 'Queue Stage Cleared'}
                </h5>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {liveStatus === 'Waiting' ? `Position #${peopleAhead + 1} in live stream` : 'Completed wait stream'}
                </p>
              </div>
            </div>

            {/* Step 3: Consulting */}
            <div className={`relative flex items-start space-x-3 transition-opacity ${
              liveStatus === 'In Consultation' ? 'opacity-100' : liveStatus === 'Completed' ? 'opacity-70' : 'opacity-40'
            }`}>
              <div className={`absolute -left-6 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center transition-all ${
                liveStatus === 'In Consultation' 
                  ? 'bg-orange-500 ring-4 ring-orange-500/20' 
                  : liveStatus === 'Completed'
                  ? 'bg-green-500'
                  : 'bg-white border-gray-200'
              }`} />
              <div>
                <h5 className={`font-bold ${liveStatus === 'In Consultation' ? 'text-orange-500' : 'text-gray-900'}`}>
                  {liveStatus === 'In Consultation' ? '🔴 Now Consulting' : 'Consultation Phase'}
                </h5>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {liveStatus === 'In Consultation' ? 'Doctor Patil is examining you now' : liveStatus === 'Completed' ? 'Doctor diagnosis completed' : 'Under review by clinician'}
                </p>
              </div>
            </div>

            {/* Step 4: Completed */}
            <div className={`relative flex items-start space-x-3 transition-opacity ${
              liveStatus === 'Completed' ? 'opacity-100 font-extrabold text-[#0050cc]' : 'opacity-40'
            }`}>
              <div className={`absolute -left-6 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center transition-all ${
                liveStatus === 'Completed' 
                  ? 'bg-green-500 ring-4 ring-green-500/20' 
                  : 'bg-white border-gray-200'
              }`} />
              <div>
                <h5 className="font-bold">Session Completed</h5>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {liveStatus === 'Completed' ? 'Digital prescription uploaded to ABDM' : 'Vitals synchronized to ABHA ID'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advice warning note */}
      <div className="bg-green-50/50 border border-green-100/30 rounded-2xl p-4 flex items-start space-x-3 text-xs text-green-800 leading-normal">
        <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <p>
          {liveStatus === 'Completed' ? (
            <span><strong>Consultation complete!</strong> Your prescription and locker details have been updated. You may visit the pharmacy.</span>
          ) : liveStatus === 'In Consultation' ? (
            <span><strong>Please enter Room #4B.</strong> Dr. Patil is waiting for you now. Please carry your physical papers if any.</span>
          ) : (
            <span><strong>Please stay nearby.</strong> Your turn is expected soon. You will receive a push notification when 3 people are ahead of you.</span>
          )}
        </p>
      </div>

      {/* Grid of details: speed & doctor */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-1 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Avg. Speed</p>
          <p className="text-base font-black text-gray-900">4 mins / pt</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-1 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Doctor Assignment</p>
          <p className="text-base font-black text-gray-900">{appointment.doctor.name}</p>
        </div>
      </div>
    </div>
  );
}
