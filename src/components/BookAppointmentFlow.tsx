import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ArrowLeft, Check, Search, Calendar, Clock, MapPin, Sparkles, Building, ArrowRight, CheckCircle2, CalendarPlus, ChevronLeft, CalendarCheck, AlertTriangle, X, Bell } from 'lucide-react';
import { Hospital, Department, Doctor, Appointment } from '../types';
import { HOSPITALS, DEPARTMENTS, DOCTORS } from '../data';

interface BookAppointmentFlowProps {
  walletBalance: number;
  onBookingComplete: (newAppt: Appointment, bookingFee: number) => void;
  onCancel: () => void;
}

type BookStep = 'HOSPITAL' | 'DEPARTMENT' | 'DOCTOR_SLOT' | 'CONFIRM' | 'SUCCESS';

export default function BookAppointmentFlow({ walletBalance, onBookingComplete, onCancel }: BookAppointmentFlowProps) {
  const [step, setStep] = useState<BookStep>('HOSPITAL');
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  
  // Selection States
  const [selectedHospital, setSelectedHospital] = useState<Hospital>(HOSPITALS[0]);
  const [selectedDept, setSelectedDept] = useState<Department>(DEPARTMENTS[1]); // General Medicine default
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor>(DOCTORS[2]); // Dr. Amit Shah default
  const [selectedDateIndex, setSelectedDateIndex] = useState(1); // Tue 24 default
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM');
  
  // Search state
  const [searchHospitalTerm, setSearchHospitalTerm] = useState('');
  const [searchDeptTerm, setSearchDeptTerm] = useState('');

  // Success Appointment Buffer
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);
  const [isProcessingBooking, setIsProcessingBooking] = useState(false);

  // Stepper Header Data
  const getStepProgress = () => {
    switch (step) {
      case 'HOSPITAL': return { index: 1, label: 'Hospital' };
      case 'DEPARTMENT': return { index: 2, label: 'Department' };
      case 'DOCTOR_SLOT': return { index: 3, label: 'Doctor' };
      case 'CONFIRM': return { index: 4, label: 'Confirm' };
      default: return { index: 4, label: 'Success' };
    }
  };

  const stepsHeader = [
    { num: 1, label: 'Hospital' },
    { num: 2, label: 'Dept' },
    { num: 3, label: 'Slot' },
    { num: 4, label: 'Confirm' }
  ];

  // Helper date lists
  const dates = [
    { dayName: 'MON', dayNum: '23', dot: false },
    { dayName: 'TUE', dayNum: '24', dot: true }, // selected standard
    { dayName: 'WED', dayNum: '25', dot: false },
    { dayName: 'THU', dayNum: '26', dot: false },
    { dayName: 'FRI', dayNum: '27', dot: false }
  ];

  // Filter hospitals/departments
  const filteredHospitals = HOSPITALS.filter(h => h.name.toLowerCase().includes(searchHospitalTerm.toLowerCase()) || h.location.toLowerCase().includes(searchHospitalTerm.toLowerCase()));
  const filteredDepts = DEPARTMENTS.filter(d => d.name.toLowerCase().includes(searchDeptTerm.toLowerCase()) || d.category.toLowerCase().includes(searchDeptTerm.toLowerCase()));

  // Trigger when moving to Step 3: Fetch matching doctors
  const handleSelectDept = (dept: Department) => {
    setSelectedDept(dept);
    // Find doctor matching this specialty and hospital (or fallback)
    const matchedDoc = DOCTORS.find(d => d.specialty === dept.name && d.hospitalId === selectedHospital.id) || 
                       DOCTORS.find(d => d.specialty === dept.name) || 
                       DOCTORS[0];
    setSelectedDoctor(matchedDoc);
    setStep('DOCTOR_SLOT');
  };

  // Complete & trigger Booking deduction
  const handleFinalCheckout = () => {
    if (walletBalance < selectedDoctor.fee) {
      setToast({
        title: 'Insufficient Balance',
        message: 'Your health wallet has insufficient balance for this OPD fee. Please top up in the Wallet tab.',
        type: 'warning'
      });
      return;
    }

    setIsProcessingBooking(true);
    
    setTimeout(() => {
      const uniqueToken = 'OPD' + Math.floor(1000 + Math.random() * 9000);
      const uniqueRef = '#MCGM-2023-' + Math.floor(100000 + Math.random() * 900000);
      const chosenDateStr = `${dates[selectedDateIndex].dayName}, Oct ${dates[selectedDateIndex].dayNum}`;

      const appt: Appointment = {
        id: 'appt_' + Date.now(),
        hospital: selectedHospital,
        department: selectedDept,
        doctor: selectedDoctor,
        dateStr: chosenDateStr,
        timeStr: selectedSlot,
        tokenNo: uniqueToken,
        status: 'CONFIRMED',
        queueAhead: Math.floor(3 + Math.random() * 10),
        waitTimeMinutes: Math.floor(15 + Math.random() * 30),
        referenceId: uniqueRef
      };

      setCreatedAppointment(appt);
      onBookingComplete(appt, selectedDoctor.fee);
      setIsProcessingBooking(false);
      setStep('SUCCESS');
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header back & navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (step === 'HOSPITAL') onCancel();
            else if (step === 'DEPARTMENT') setStep('HOSPITAL');
            else if (step === 'DOCTOR_SLOT') setStep('DEPARTMENT');
            else if (step === 'CONFIRM') setStep('DOCTOR_SLOT');
          }}
          className="p-2 border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center text-xs font-bold text-gray-700 dark:text-gray-300 space-x-1.5"
          disabled={step === 'SUCCESS'}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-sm font-extrabold text-[#0A5BFF] dark:text-blue-400">Book Appointment</span>
      </div>

      {/* Booking Stepper indicator */}
      {step !== 'SUCCESS' && (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm">
          <div className="flex justify-between items-center relative">
            {/* Background progress track line */}
            <div className="absolute left-6 right-6 top-5 h-0.5 bg-gray-100 dark:bg-slate-800 -z-10" />
            <div 
              className="absolute left-6 top-5 h-0.5 bg-[#0050cc] -z-10 transition-all duration-300"
              style={{
                width: step === 'HOSPITAL' ? '0%' :
                       step === 'DEPARTMENT' ? '33%' :
                       step === 'DOCTOR_SLOT' ? '66%' : '100%'
              }}
            />

            {stepsHeader.map((st) => {
              const currentProgress = getStepProgress();
              const isCompleted = currentProgress.index > st.num;
              const isActive = currentProgress.index === st.num;

              return (
                <div key={st.num} className="flex flex-col items-center space-y-1.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                    isCompleted 
                      ? 'bg-[#0A5BFF] dark:bg-blue-600 border-[#0A5BFF] dark:border-blue-600 text-white' 
                      : isActive 
                        ? 'bg-blue-50 dark:bg-blue-950/30 border-[#0050cc] dark:border-blue-500 text-[#0050cc] dark:text-blue-400 ring-4 ring-[#0050cc]/10 dark:ring-blue-500/10' 
                        : 'bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-800 text-gray-400 dark:text-gray-500'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : st.num}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    isActive ? 'text-[#0050cc] dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                  }`}>{st.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Screen Views */}
      <AnimatePresence mode="wait">
        {step === 'HOSPITAL' && (
          <motion.div
            key="hospitals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Select Hospital</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Choose a nearby hospital to proceed with your booking.</p>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for hospitals in Mumbai..."
                value={searchHospitalTerm}
                onChange={(e) => setSearchHospitalTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#0A5BFF] dark:focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-3">
              {filteredHospitals.map((h) => (
                <div
                  key={h.id}
                  onClick={() => setSelectedHospital(h)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedHospital.id === h.id
                      ? 'border-[#0050cc] dark:border-blue-500 bg-[#0050cc]/5 dark:bg-blue-950/20 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      selectedHospital.id === h.id ? 'bg-[#0050cc]/10 dark:bg-blue-950/40 text-[#0050cc] dark:text-blue-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400'
                    }`}>
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{h.name}</h4>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{h.location}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-[10px] font-bold bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded">
                          {h.distance}
                        </span>
                        <span className="text-[10px] font-bold bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">
                          {h.openInfo}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                    selectedHospital.id === h.id
                      ? 'border-[#0050cc] dark:border-blue-500 bg-[#0050cc] dark:bg-blue-500 text-white'
                      : 'border-gray-200 dark:border-slate-750 bg-white dark:bg-slate-800'
                  }`}>
                    {selectedHospital.id === h.id && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep('DEPARTMENT')}
              className="w-full bg-[#0A5BFF] dark:bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-[#00164e] dark:hover:bg-blue-700 transition-all flex items-center justify-center space-x-2"
            >
              <span>Continue to Select Department</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {step === 'DEPARTMENT' && (
          <motion.div
            key="depts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Select Department</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Choose the specialty department for your consultation at {selectedHospital.name}.</p>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search departments (e.g. Heart, Bones)"
                value={searchDeptTerm}
                onChange={(e) => setSearchDeptTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#0A5BFF] dark:focus:ring-blue-500"
              />
            </div>

            {/* Departments Grid layout */}
            <div className="grid grid-cols-2 gap-3.5">
              {filteredDepts.map((d) => (
                <div
                  key={d.id}
                  onClick={() => handleSelectDept(d)}
                  className={`p-4 rounded-2xl border bg-white dark:bg-slate-900 flex flex-col items-center text-center transition-all cursor-pointer hover:border-gray-300 dark:hover:border-slate-700 ${
                    selectedDept.id === d.id
                      ? 'border-[#0050cc] dark:border-blue-500 bg-[#0050cc]/5 dark:bg-blue-950/20 ring-2 ring-[#0050cc]/10 shadow-sm'
                      : 'border-gray-100 dark:border-slate-800'
                  }`}
                >
                  <div className="w-12 h-12 bg-[#0050cc]/5 dark:bg-blue-950/40 text-[#0050cc] dark:text-blue-400 rounded-full flex items-center justify-center mb-3">
                    <Sparkles className="w-5 h-5 text-[#0050cc] dark:text-blue-400" />
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-xs tracking-tight">{d.name}</h4>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{d.category}</p>
                  
                  {selectedDept.id === d.id && (
                    <span className="text-[10px] text-[#0050cc] dark:text-blue-400 font-extrabold flex items-center space-x-1 mt-3">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Selected</span>
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Assistance Card */}
            <div className="bg-blue-50/50 dark:bg-blue-950/10 rounded-2xl p-4 border border-blue-100/30 dark:border-blue-900/20 text-xs text-blue-800 dark:text-blue-300 leading-relaxed flex items-start space-x-3 mt-4">
              <Sparkles className="w-5 h-5 text-[#0050cc] dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Not sure which one to pick?</strong> Book an appointment with <strong>'General Medicine'</strong> and they will refer you to the correct specialist if needed.
              </p>
            </div>
          </motion.div>
        )}

        {step === 'DOCTOR_SLOT' && (
          <motion.div
            key="doctorslot"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Selected Doctor Header */}
            <div className="bg-[#F8FAFD] dark:bg-slate-900 border border-blue-100 dark:border-slate-800 rounded-2xl p-4 flex items-center space-x-4 shadow-sm">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 bg-gray-100 dark:bg-slate-800">
                <img
                  src={selectedDoctor.image}
                  alt={selectedDoctor.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h4 className="font-extrabold text-gray-900 dark:text-white text-sm">{selectedDoctor.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{selectedDoctor.specialty} • {selectedHospital.name}</p>
                <span className="inline-block text-[10px] font-bold bg-[#0A5BFF]/5 dark:bg-blue-950/40 text-[#0A5BFF] dark:text-blue-400 px-2.5 py-0.5 rounded mt-1.5">
                  Consultation Fee: ₹{selectedDoctor.fee}
                </span>
              </div>
            </div>

            {/* Date Strip Calendar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-xs tracking-wider uppercase">October 2026</h3>
                <div className="flex space-x-2 text-gray-500">
                  <button className="p-1 border border-gray-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="p-1 border border-gray-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between space-x-2 overflow-x-auto no-scrollbar py-1">
                {dates.map((d, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDateIndex(index)}
                    className={`flex-1 min-w-[64px] py-3 rounded-2xl border text-center transition-all flex flex-col justify-between items-center ${
                      selectedDateIndex === index
                        ? 'border-[#0050cc] dark:border-blue-500 bg-[#0050cc]/5 dark:bg-blue-950/20 ring-2 ring-[#0050cc]/10 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase">{d.dayName}</span>
                    <span className="text-base font-black text-gray-900 dark:text-white mt-1">{d.dayNum}</span>
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                      selectedDateIndex === index ? 'bg-[#0050cc] dark:bg-blue-400' : 'bg-transparent'
                    }`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Morning Slots */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wider uppercase flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Morning Slots</span>
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {selectedDoctor.availableSlots.morning.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-3.5 rounded-xl font-bold border transition-all text-center ${
                      selectedSlot === slot
                        ? 'border-[#0050cc] dark:border-blue-500 bg-[#0050cc] dark:bg-blue-500 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Afternoon Slots */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-455 tracking-wider uppercase flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Afternoon Slots</span>
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {selectedDoctor.availableSlots.afternoon.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-3.5 rounded-xl font-bold border transition-all text-center ${
                      selectedSlot === slot
                        ? 'border-[#0050cc] dark:border-blue-500 bg-[#0050cc] dark:bg-blue-555 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom selected strip & action */}
            <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">Selected Slot</p>
                <p className="text-sm font-black text-gray-900 dark:text-white mt-1">Oct {dates[selectedDateIndex].dayNum}, {selectedSlot}</p>
              </div>
              <button
                onClick={() => setStep('CONFIRM')}
                className="bg-[#0A5BFF] dark:bg-blue-650 text-white py-3.5 px-6 rounded-xl font-bold hover:bg-[#00164e] dark:hover:bg-blue-700 transition-all flex items-center space-x-1.5 text-xs shadow-md"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'CONFIRM' && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Confirm Booking</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Please review clinical consultation and payment schedule.</p>
            </div>

            {/* Summary Voucher Card */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start border-b border-gray-100 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="font-extrabold text-gray-900 dark:text-white text-sm">{selectedDoctor.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{selectedDoctor.specialty} OPD Specialist</p>
                </div>
                <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800">
                  <img
                    src={selectedDoctor.image}
                    alt={selectedDoctor.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center"><Building className="w-3.5 h-3.5 mr-1" /> Hospital</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{selectedHospital.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> Date</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">Oct {dates[selectedDateIndex].dayNum}, 2026 ({dates[selectedDateIndex].dayName})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> Appointment Time</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{selectedSlot}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-slate-800 pt-3 flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-bold">Consultation Fee</span>
                <span className="text-lg font-black text-[#0A5BFF] dark:text-blue-400">₹{selectedDoctor.fee}</span>
              </div>
            </div>

            {/* Wallet Deduct Panel */}
            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/10 rounded-2xl border border-blue-100/30 dark:border-blue-900/20 flex justify-between items-center text-xs">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Your Health Wallet Balance</p>
                <p className="text-sm font-black text-gray-800 dark:text-white mt-1">₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
              {walletBalance >= selectedDoctor.fee ? (
                <span className="text-[10px] font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border border-green-200/50 dark:border-green-800/30 px-2.5 py-1 rounded-full">
                  Wallet Ready
                </span>
              ) : (
                <span className="text-[10px] font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/30 px-2.5 py-1 rounded-full">
                  Low Balance
                </span>
              )}
            </div>

            {/* Book Button */}
            <button
              onClick={handleFinalCheckout}
              disabled={isProcessingBooking || walletBalance < selectedDoctor.fee}
              className="w-full bg-[#0A5BFF] dark:bg-blue-650 text-white py-4 rounded-xl font-bold hover:bg-[#00164e] dark:hover:bg-blue-700 transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isProcessingBooking ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Pay & Confirm Booking (₹{selectedDoctor.fee})</span>
                  <CalendarCheck className="w-5 h-5" />
                </>
              )}
            </button>
            {walletBalance < selectedDoctor.fee && (
              <p className="text-xs text-[#ba1a1a] dark:text-red-400 text-center font-bold">
                ⚠️ Top up your wallet first to proceed with booking.
              </p>
            )}
          </motion.div>
        )}

        {step === 'SUCCESS' && createdAppointment && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Steps Success header */}
            <div className="flex justify-between items-center p-4 bg-green-50/50 dark:bg-green-950/10 rounded-2xl border border-green-100 dark:border-green-900/30 text-green-800 dark:text-green-400">
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 bg-green-600 text-white rounded-full p-1 stroke-[3]" />
                <span className="text-sm font-bold">Details Confirmed!</span>
              </div>
              <span className="text-xs font-extrabold bg-green-600 text-white px-2.5 py-0.5 rounded-full uppercase">Step 4/4 Success</span>
            </div>

            {/* Ticket Container with dashed border */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-md relative overflow-hidden space-y-6">
              {/* Semi-circular coupon punches in side margins */}
              <div className="absolute left-0 top-[40%] w-4 h-8 bg-[#F8FAFD] dark:bg-slate-950 rounded-r-full -translate-x-2 border-y border-r border-gray-100 dark:border-slate-800" />
              <div className="absolute right-0 top-[40%] w-4 h-8 bg-[#F8FAFD] dark:bg-slate-950 rounded-l-full translate-x-2 border-y border-l border-gray-100 dark:border-slate-800" />

              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-gray-900 dark:text-white">Appointment Confirmed!</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
                  Your booking has been successfully processed. Please arrive 15 minutes early.
                </p>
              </div>

              {/* Token Display Dotted Card */}
              <div className="border-2 border-dashed border-[#0050cc]/40 dark:border-blue-500/40 bg-blue-50/30 dark:bg-blue-950/20 rounded-2xl p-4 text-center">
                <p className="text-[10px] font-bold text-[#0050cc] dark:text-blue-400 uppercase tracking-widest">Your Token Number</p>
                <p className="text-3xl font-black text-[#0A5BFF] dark:text-blue-400 tracking-wider mt-1">
                  {createdAppointment.tokenNo}
                </p>
              </div>

              {/* Ticket Details */}
              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-800 text-xs">
                <div className="flex items-start space-x-3.5">
                  <Building className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-400 dark:text-gray-500">Hospital</p>
                    <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">{createdAppointment.hospital.name}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <Sparkles className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-400 dark:text-gray-500">Department</p>
                    <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">{createdAppointment.department.name} (OPD)</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-400 dark:text-gray-500">Date & Time</p>
                    <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">{createdAppointment.dateStr} • {createdAppointment.timeStr}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => setToast({
                  title: 'Calendar Invitation',
                  message: 'Calendar Invitation generated! Added to local Apple/Google accounts.',
                  type: 'success'
                })}
                className="w-full bg-[#0A5BFF] dark:bg-blue-650 text-white py-4 rounded-xl font-bold hover:bg-[#00164e] dark:hover:bg-blue-700 transition-all shadow-md flex items-center justify-center space-x-2 text-sm"
              >
                <CalendarPlus className="w-5 h-5" />
                <span>Add to Calendar</span>
              </button>

              <button
                onClick={onCancel} // redirecting to Home Screen
                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 py-4 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-all text-sm text-center flex items-center justify-center space-x-2 shadow-sm"
              >
                <span>Go to Home</span>
              </button>
            </div>

            {/* Help Footer */}
            <div className="text-center space-y-1 pt-4 border-t border-gray-100 dark:border-slate-800 text-xs text-gray-400 dark:text-gray-500 leading-normal">
              <p>Need help? Contact Sion Hospital at <span className="text-[#0050cc] dark:text-blue-400 font-bold">022-2407XXXX</span></p>
              <p className="font-semibold text-[10px]">Reference ID: {createdAppointment.referenceId}</p>
            </div>
          </motion.div>
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
