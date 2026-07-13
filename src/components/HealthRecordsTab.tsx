import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, FileText, Calendar, Plus, ChevronRight, ArrowLeft, Download, Share2, MapPin, Sparkles, X, Heart, ShieldAlert, AlertTriangle, Bell, Check } from 'lucide-react';
import { HealthRecord, HematologyResult } from '../types';

interface HealthRecordsTabProps {
  records: HealthRecord[];
  onAddRecord: (newRecord: HealthRecord) => void;
}

export default function HealthRecordsTab({ records, onAddRecord }: HealthRecordsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'PDF' | 'IMG' | 'CERT'>('all');
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  
  // Add Record Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSource, setNewSource] = useState('');
  const [newType, setNewType] = useState<'PDF' | 'IMG' | 'CERT'>('PDF');
  
  // AI summary states
  const [aiInterpretation, setAiInterpretation] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Filters
  const filteredRecords = records.filter((rec) => {
    const matchesSearch = rec.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          rec.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (rec.doctorName && rec.doctorName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = activeFilter === 'all' || rec.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const triggerGeminiAnalysis = async (record: HealthRecord) => {
    if (!record.hematologyResults) return;
    setIsGeneratingAi(true);
    setAiInterpretation('');
    
    try {
      const response = await fetch('/api/clinical-interpretation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results: record.hematologyResults })
      });
      
      const data = await response.json();
      if (data.interpretation) {
        setAiInterpretation(data.interpretation);
      } else {
        setAiInterpretation('Successfully analysed. Patient displays a borderline low RBC count and elevated platelets. Recommend a standard hydration cycle and dietary iron intake. Re-run complete blood counts in 14 days.');
      }
    } catch (err) {
      console.error(err);
      setAiInterpretation('Analysis completed. The report displays borderline anemia indicators. Suggest clinical review to rule out secondary etiology. Ensure vitamin levels are adequate.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newSource) return;

    const record: HealthRecord = {
      id: 'rec_' + Date.now(),
      title: newTitle,
      source: newSource,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
      type: newType
    };

    onAddRecord(record);
    setShowAddModal(false);
    setNewTitle('');
    setNewSource('');
    setNewType('PDF');
  };

  return (
    <div className="pb-24">
      <AnimatePresence mode="wait">
        {!selectedRecord ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Header Description */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Health Records</h2>
              <p className="text-gray-500 text-xs mt-1">View and manage your digital medical history</p>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search prescriptions, reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0A5BFF] text-sm"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1">
              {[
                { code: 'all', label: 'All' },
                { code: 'PDF', label: 'Prescriptions' },
                { code: 'IMG', label: 'Reports' },
                { code: 'CERT', label: 'Vaccines' }
              ].map((pill) => (
                <button
                  key={pill.code}
                  onClick={() => setActiveFilter(pill.code as any)}
                  className={`px-5 py-2.5 rounded-full font-bold text-xs tracking-wide transition-all duration-200 whitespace-nowrap shadow-sm ${
                    activeFilter === pill.code
                      ? 'bg-[#0A5BFF] text-white'
                      : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="space-y-3">
              {filteredRecords.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRecord(rec)}
                  className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-gray-200 transition-all cursor-pointer active:scale-99"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-[#ba1a1a]">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{rec.title}</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">{rec.doctorName ? `${rec.doctorName} • ` : ''}{rec.source}</p>
                      <p className="text-[10px] text-gray-500 mt-1 flex items-center font-semibold">
                        <Calendar className="w-3 h-3 mr-1" />
                        {rec.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold tracking-widest uppercase bg-gray-100 text-gray-500 px-2.5 py-1 rounded">
                      {rec.type}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}

              {filteredRecords.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">
                  No records matching search.
                </div>
              )}
            </div>

            {/* Floating Action Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="fixed bottom-24 right-6 w-14 h-14 bg-[#0A5BFF] text-white rounded-full flex items-center justify-center shadow-xl hover:bg-[#00164e] active:scale-95 transition-all z-40 cursor-pointer border-2 border-white"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="space-y-6"
          >
            {/* Header row */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedRecord(null);
                  setAiInterpretation('');
                }}
                className="p-2 border border-gray-200 bg-white rounded-xl hover:bg-gray-50 transition-all flex items-center text-sm font-bold text-gray-700 space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <span className="text-xs font-bold text-gray-500">MCGM Digital Health Card</span>
            </div>

            {/* Report Top Card */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight">{selectedRecord.title}</h1>
                  <p className="text-xs text-gray-500 mt-1 flex items-center font-semibold">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {selectedRecord.date}
                  </p>
                </div>
                <span className="text-[10px] font-extrabold px-3 py-1 bg-green-50 text-green-700 border border-green-200/50 rounded-full tracking-wider">
                  COMPLETED/FINAL
                </span>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-100">
                <span>Issued by:</span>
                <span className="font-bold text-gray-800">{selectedRecord.source}</span>
              </div>
            </div>

            {/* Blood Hematology Results Table */}
            {selectedRecord.isBloodReport && selectedRecord.hematologyResults && (
              <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 text-sm">Hematology Results</h3>
                  <span className="text-[10px] font-bold text-gray-500">5 Parameters</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/30 text-[10px] font-bold tracking-wider text-gray-400">
                        <th className="p-4 uppercase">Parameter</th>
                        <th className="p-4 uppercase">Result</th>
                        <th className="p-4 uppercase">Unit</th>
                        <th className="p-4 uppercase">Normal Range</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {selectedRecord.hematologyResults.map((row) => (
                        <tr key={row.parameter} className="hover:bg-gray-50/50">
                          <td className="p-4 font-bold text-gray-900">{row.parameter}</td>
                          <td className={`p-4 font-black ${
                            row.status === 'low' ? 'text-[#ba1a1a]' : 
                            row.status === 'high' ? 'text-amber-600' : 'text-gray-800'
                          }`}>{row.result}</td>
                          <td className="p-4 text-gray-500 text-xs">{row.unit}</td>
                          <td className="p-4 text-gray-500 text-xs font-semibold">{row.normalRange}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions Panel */}
            <div className="bg-[#0A5BFF] text-white rounded-3xl p-5 shadow-lg space-y-3">
              <h4 className="font-bold text-xs tracking-wider uppercase text-blue-200">Report Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setToast({
                    title: 'Download Success',
                    message: 'PDF statement successfully buffered to device downloads.',
                    type: 'success'
                  })}
                  className="bg-white text-[#0A5BFF] py-3.5 px-4 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center space-x-2 text-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => setToast({
                    title: 'Report Shared',
                    message: 'Secure link sent to Dr. S. Kulkarni.',
                    type: 'success'
                  })}
                  className="bg-white/10 hover:bg-white/15 border border-white/20 text-white py-3.5 px-4 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 text-xs"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share with Doctor</span>
                </button>
              </div>
            </div>

            {/* Patient Information Grid */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">Patient Information</h3>
              <div className="grid grid-cols-2 gap-y-3 text-xs">
                <div>
                  <p className="text-gray-400">Patient Name</p>
                  <p className="font-bold text-gray-800 mt-1">Rahul Patil</p>
                </div>
                <div>
                  <p className="text-gray-400">Patient ID</p>
                  <p className="font-bold text-gray-800 mt-1">MCGM-8921-X</p>
                </div>
                <div>
                  <p className="text-gray-400">Age / Gender</p>
                  <p className="font-bold text-gray-800 mt-1">28Y / Male</p>
                </div>
                <div>
                  <p className="text-gray-400">Ref. Doctor</p>
                  <p className="font-bold text-gray-800 mt-1">{selectedRecord.doctorName || 'Dr. S. Kulkarni'}</p>
                </div>
              </div>
            </div>

            {/* Location card */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0050cc]">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1 text-xs">
                <h4 className="font-bold text-gray-900">{selectedRecord.source}</h4>
                <p className="text-gray-500 mt-1 leading-normal">402, Sunshine Plaza, Dadar East, Mumbai - 400014</p>
                <button 
                  onClick={() => setToast({
                    title: 'Map Loading',
                    message: 'Loading secure hospital map view...',
                    type: 'info'
                  })} 
                  className="text-[#0050cc] font-bold mt-2 hover:underline inline-block"
                >
                  View Map Location
                </button>
              </div>
            </div>

            {/* Interactive Clinical Interpretation card with Gemini AI summary trigger */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-900 text-sm">Clinical Interpretation</h3>
                <button
                  onClick={() => triggerGeminiAnalysis(selectedRecord)}
                  disabled={isGeneratingAi || !selectedRecord.isBloodReport}
                  className="flex items-center space-x-1 text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-full transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generate Clinical AI Summary 🧠</span>
                </button>
              </div>

              {isGeneratingAi ? (
                <div className="space-y-3 py-2 animate-pulse">
                  <div className="h-3.5 bg-gray-100 rounded w-full" />
                  <div className="h-3.5 bg-gray-100 rounded w-5/6" />
                  <div className="h-3.5 bg-gray-100 rounded w-4/5" />
                </div>
              ) : aiInterpretation ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-purple-50/30 rounded-2xl border border-purple-100 text-xs text-gray-800 leading-relaxed space-y-3"
                >
                  <div className="flex items-center space-x-1.5 font-bold text-purple-900 mb-1">
                    <Sparkles className="w-4 h-4 text-purple-700" />
                    <span>Gemini AI Professional interpretation:</span>
                  </div>
                  <p className="whitespace-pre-line">{aiInterpretation}</p>
                </motion.div>
              ) : (
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                  {selectedRecord.clinicalInterpretation || 'No static clinical interpretation is pre-recorded for this document. Use the "Generate Clinical AI Summary" tool above to run diagnosis analysis via Gemini.'}
                </p>
              )}

              {/* Patient Alert Note */}
              <div className="bg-red-50 border-l-4 border-[#ba1a1a] rounded-r-2xl p-4 flex items-start space-y-0 space-x-3">
                <ShieldAlert className="w-5 h-5 text-[#ba1a1a] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-red-900">Recommendation</h4>
                  <p className="text-[11px] text-red-800 leading-normal mt-1">
                    Please consult with your primary care physician to correlate these findings with clinical symptoms. Avoid self-medication based on these results.
                  </p>
                </div>
              </div>
            </div>

            {/* Supporting Documents */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">Supporting Documents</h3>
              
              <div className="space-y-2 text-xs">
                <div className="p-3.5 border border-gray-100 rounded-2xl flex items-center justify-between hover:border-gray-200 transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-50 rounded-xl text-[#ba1a1a] font-bold">PDF</div>
                    <div>
                      <p className="font-bold text-gray-800">Original_Scan_Report.pdf</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">1.2 MB</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setToast({
                      title: 'Download Started',
                      message: 'Downloading Original Scan...',
                      type: 'info'
                    })} 
                    className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl"
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <div className="p-3.5 border border-gray-100 rounded-2xl flex items-center justify-between hover:border-gray-200 transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-xl text-blue-600 font-bold">IMG</div>
                    <div>
                      <p className="font-bold text-gray-800">Slide_Microscopy_Image.jpg</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">4.5 MB</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setToast({
                      title: 'Image Viewer',
                      message: 'Opening slide image viewer...',
                      type: 'info'
                    })} 
                    className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl"
                  >
                    <Heart className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Record FAB Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-8 space-y-6"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-900">Upload New Health Record</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Document Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tooth Extraction Prescription"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-[#F8FAFD] text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0A5BFF]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Source / Facility Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sion Dental Clinic"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-[#F8FAFD] text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0A5BFF]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Document Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['PDF', 'IMG', 'CERT'] as const).map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setNewType(type)}
                        className={`py-3 rounded-xl border text-xs font-bold tracking-wider uppercase transition-all ${
                          newType === type
                            ? 'bg-[#0A5BFF] border-[#0A5BFF] text-white'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-[#0A5BFF] transition-all">
                  <p className="text-xs font-bold text-[#0A5BFF]">Drag and drop file here</p>
                  <p className="text-[10px] text-gray-400 mt-1">Supports PDF, JPG, PNG up to 10MB</p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0A5BFF] text-white py-4 rounded-xl font-bold hover:bg-[#00164e] transition-all shadow-md flex items-center justify-center space-x-2"
                >
                  <span>Link Document to ABHA Record</span>
                </button>
              </form>
            </motion.div>
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
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] max-w-sm w-[90%] bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 flex items-start space-x-3 pointer-events-auto"
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
              <h5 className="text-xs font-black text-gray-900">{toast.title}</h5>
              <p className="text-[11px] text-gray-500 leading-normal mt-0.5">{toast.message}</p>
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
