import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, Plus, ArrowUpRight, Landmark, FileText, CheckCircle2, Shield, X, IndianRupee, QrCode, Camera, AlertTriangle, Bell, Check } from 'lucide-react';
import { Transaction } from '../types';

interface WalletTabProps {
  balance: number;
  transactions: Transaction[];
  onAddMoney: (amount: number) => void;
  onPayBill: (amount: number, billTitle: string) => void;
}

export default function WalletTab({ balance, transactions, onAddMoney, onPayBill }: WalletTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const [showPayModal, setShowPayModal] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [payTarget, setPayTarget] = useState({ title: 'OPD Medicine Bill', amount: 350 });
  
  // QR Scan simulator states
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanStep, setScanStep] = useState<'scanning' | 'scanned' | 'success'>('scanning');
  const [scannedBill, setScannedBill] = useState({ title: 'Sion Hospital OPD Pharmacy Receipt #RX-4821', amount: 180 });

  // Auto scan trigger
  useEffect(() => {
    if (showScanModal && scanStep === 'scanning') {
      const timer = setTimeout(() => {
        setScanStep('scanned');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showScanModal, scanStep]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amountInput);
    if (isNaN(amt) || amt <= 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      onAddMoney(amt);
      setIsProcessing(false);
      setShowAddModal(false);
      setAmountInput('');
    }, 1500);
  };

  const handlePaySubmit = () => {
    if (balance < payTarget.amount) {
      setToast({
        title: 'Insufficient Balance',
        message: 'Insufficient wallet balance. Please add money first.',
        type: 'warning'
      });
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      onPayBill(payTarget.amount, payTarget.title);
      setIsProcessing(false);
      setShowPayModal(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-br from-[#0A5BFF] via-[#003399] to-[#0050cc] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        {/* Abstract background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-10 -translate-y-10" />
        
        <p className="text-xs font-semibold tracking-wider text-blue-100 uppercase">
          Wallet Balance
        </p>
        <h2 className="text-4xl font-extrabold tracking-tight mt-1 flex items-center">
          <IndianRupee className="w-8 h-8 mr-1 stroke-[2.5]" />
          {balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h2>

        <div className="grid grid-cols-3 gap-2 mt-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white text-[#0A5BFF] py-3.5 px-2 rounded-xl font-bold flex items-center justify-center space-x-1.5 hover:bg-gray-50 active:scale-95 transition-all text-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#0A5BFF] stroke-[3]" />
            <span>Add Money</span>
          </button>
          
          <button
            onClick={() => setShowPayModal(true)}
            className="bg-white/10 hover:bg-white/15 border border-white/20 text-white py-3.5 px-2 rounded-xl font-bold flex items-center justify-center space-x-1.5 active:scale-95 transition-all text-xs"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-white stroke-[2.5]" />
            <span>Pay Bill</span>
          </button>

          <button
            onClick={() => {
              setShowScanModal(true);
              setScanStep('scanning');
            }}
            className="bg-white/10 hover:bg-white/15 border border-white/20 text-white py-3.5 px-2 rounded-xl font-bold flex items-center justify-center space-x-1.5 active:scale-95 transition-all text-xs"
          >
            <QrCode className="w-3.5 h-3.5 text-white stroke-[2.5]" />
            <span>Scan QR</span>
          </button>
        </div>
      </div>

      {/* Grid Menu: Bank Accounts & Statements */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setToast({
            title: 'UPI Link',
            message: 'Bank account linking: Secure UPI mandate system coming soon.',
            type: 'info'
          })}
          className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-2xl p-4 flex items-center space-x-3 text-left hover:border-gray-200 dark:hover:border-slate-700 transition-all shadow-sm active:scale-98"
        >
          <div className="w-10 h-10 bg-[#0050cc]/5 dark:bg-[#0050cc]/10 rounded-xl flex items-center justify-center text-[#0050cc] dark:text-blue-400">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Bank Accounts</h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Manage links</p>
          </div>
        </button>

        <button 
          onClick={() => setToast({
            title: 'Account Statements',
            message: 'Downloading statements is available for verified ABHA accounts.',
            type: 'info'
          })}
          className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-2xl p-4 flex items-center space-x-3 text-left hover:border-gray-200 dark:hover:border-slate-700 transition-all shadow-sm active:scale-98"
        >
          <div className="w-10 h-10 bg-[#0050cc]/5 dark:bg-[#0050cc]/10 rounded-xl flex items-center justify-center text-[#0050cc] dark:text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Statements</h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">View logs</p>
          </div>
        </button>
      </div>

      {/* Recent Transactions List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-base">Recent Transactions</h3>
          <button 
            onClick={() => setToast({
              title: 'Verification Needed',
              message: 'Statement log contains entries matching the verified central Aadhaar session.',
              type: 'info'
            })}
            className="text-[#0050cc] dark:text-blue-400 text-xs font-bold hover:underline"
          >
            View All
          </button>
        </div>

        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  tx.type === 'credit' 
                    ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400' 
                    : 'bg-blue-50 dark:bg-blue-950/30 text-[#0A5BFF] dark:text-blue-400'
                }`}>
                  {tx.type === 'credit' ? (
                    <Plus className="w-5 h-5" />
                  ) : (
                    <Wallet className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">{tx.title}</h4>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{tx.dateStr}</p>
                </div>
              </div>

              <div className="text-right">
                <p className={`font-bold text-sm ${
                  tx.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-[#ba1a1a] dark:text-red-400'
                }`}>
                  {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <span className={`inline-block text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full mt-1 ${
                  tx.status === 'SUCCESS' || tx.status === 'COMPLETED'
                    ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300'
                    : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
                }`}>
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security compliance banner */}
      <div className="flex items-center justify-center space-x-2 py-4 border-t border-gray-100 dark:border-slate-800 text-gray-400 dark:text-gray-500 text-xs">
        <Shield className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        <span className="font-bold uppercase tracking-wider text-[10px]">
          PCI-DSS COMPLIANT SECURE GATEWAY
        </span>
      </div>

      {/* Add Money Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white dark:bg-slate-900 rounded-t-3xl w-full max-w-md p-6 pb-8 space-y-6"
            >
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Money to Wallet</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                    Enter Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400 dark:text-gray-600">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-slate-800 bg-[#F8FAFD] dark:bg-slate-950 font-bold text-2xl text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0A5BFF] dark:focus:ring-blue-500 focus:border-transparent"
                      required
                      min="1"
                    />
                  </div>
                </div>

                {/* Preset Fast Actions */}
                <div className="grid grid-cols-3 gap-3">
                  {[500, 1000, 2000].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setAmountInput(preset.toString())}
                      className="py-2.5 px-3 border border-gray-200 dark:border-slate-800 hover:border-[#0050cc] dark:hover:border-blue-500 hover:bg-[#0050cc]/5 dark:hover:bg-[#0050cc]/10 text-gray-700 dark:text-gray-300 hover:text-[#0050cc] dark:hover:text-blue-400 rounded-xl font-semibold text-sm transition-all"
                    >
                      + ₹{preset}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-[#0A5BFF] dark:bg-[#0050cc] text-white py-4 rounded-xl font-bold hover:bg-[#00164e] dark:hover:bg-blue-700 transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Proceed to Recharge</span>
                      <CheckCircle2 className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pay Modal */}
      <AnimatePresence>
        {showPayModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white dark:bg-slate-900 rounded-t-3xl w-full max-w-md p-6 pb-8 space-y-6"
            >
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pay Medical Bill</h3>
                <button onClick={() => setShowPayModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="p-4 bg-[#F8FAFD] dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{payTarget.title}</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">MCGM Digital billing system ID: #B-88390</p>
                  </div>
                  <span className="text-xs font-bold bg-[#0A5BFF]/5 dark:bg-[#0A5BFF]/20 text-[#0A5BFF] dark:text-[#38bdf8] px-2.5 py-1 rounded-full">
                    PENDING
                  </span>
                </div>
                <div className="border-t border-gray-200/50 dark:border-slate-800/80 pt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Payable amount</span>
                  <span className="text-lg font-bold text-[#ba1a1a] dark:text-red-400">₹{payTarget.amount}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs px-1">
                  <span className="text-gray-500 dark:text-gray-400">Your Current Balance</span>
                  <span className="font-bold text-[#0A5BFF] dark:text-blue-400">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <button
                  type="button"
                  onClick={handlePaySubmit}
                  disabled={isProcessing || balance < payTarget.amount}
                  className="w-full bg-[#0A5BFF] dark:bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-[#00164e] dark:hover:bg-blue-700 transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Pay From Health Wallet</span>
                      <ArrowUpRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                {balance < payTarget.amount && (
                  <p className="text-xs text-[#ba1a1a] dark:text-red-400 text-center font-semibold">
                    ⚠️ Wallet balance too low. Please top up first.
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Scanner Overlay Simulator */}
      <AnimatePresence>
        {showScanModal && (
          <div className="fixed inset-0 z-50 bg-[#020617] flex flex-col justify-between p-6 text-white">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h3 className="text-base font-extrabold tracking-wide uppercase">Scan OPD Receipt QR</h3>
              <button 
                onClick={() => setShowScanModal(false)}
                className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {scanStep === 'scanning' ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                {/* Visual Viewfinder box */}
                <div className="relative w-64 h-64 border-2 border-dashed border-blue-500 rounded-3xl flex items-center justify-center overflow-hidden bg-slate-950/40 shadow-2xl">
                  <Camera className="w-12 h-12 text-blue-500/20" />
                  
                  {/* Scanning active laser line */}
                  <motion.div 
                    initial={{ top: 0 }}
                    animate={{ top: '100%' }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-lg"
                  />
                  
                  {/* Corner bounds overlay */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br" />
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm font-bold text-gray-200 animate-pulse">Scanning Receipt QR Code...</p>
                  <p className="text-xs text-gray-500">Hold receipt steady in front of the camera</p>
                </div>
              </div>
            ) : scanStep === 'scanned' ? (
              <div className="flex-grow flex flex-col justify-center items-center">
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl text-left"
                >
                  <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
                    <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white">Receipt Detected</h4>
                      <p className="text-[10px] text-gray-500">OPD Bill Reference: #MCGM-PH-99120</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between py-1 text-xs">
                      <span className="text-gray-400">Merchant/Facility</span>
                      <span className="font-bold text-white">Sion Hospital OPD Pharmacy</span>
                    </div>
                    <div className="flex justify-between py-1 text-xs">
                      <span className="text-gray-400">Bill description</span>
                      <span className="font-bold text-white">{scannedBill.title}</span>
                    </div>
                    <div className="flex justify-between py-1 text-xs border-t border-dashed border-slate-800 pt-3">
                      <span className="text-gray-400">Amount Due</span>
                      <span className="font-extrabold text-lg text-red-400">₹{scannedBill.amount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Health Wallet Balance</span>
                      <span className="font-bold text-white">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <button
                      onClick={() => {
                        if (balance < scannedBill.amount) {
                          setToast({
                            title: 'Insufficient Balance',
                            message: 'Insufficient balance. Please add funds to your wallet.',
                            type: 'warning'
                          });
                          return;
                        }
                        setIsProcessing(true);
                        setTimeout(() => {
                          onPayBill(scannedBill.amount, scannedBill.title);
                          setIsProcessing(false);
                          setScanStep('success');
                        }, 1500);
                      }}
                      disabled={isProcessing || balance < scannedBill.amount}
                      className="w-full bg-[#0050cc] text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Approve Health Wallet Payment</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    {balance < scannedBill.amount && (
                      <p className="text-[11px] text-red-400 text-center font-bold">
                        ⚠️ Please add funds first to make this payment.
                      </p>
                    )}
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center">
                <div className="w-20 h-20 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center border-4 border-green-500/30">
                  <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-white">Payment Successful</h3>
                  <p className="text-xs text-gray-400 px-8">
                    ₹{scannedBill.amount.toFixed(2)} was successfully paid to Sion Hospital OPD Pharmacy from your Health Wallet.
                  </p>
                </div>
                <button
                  onClick={() => setShowScanModal(false)}
                  className="bg-[#0A5BFF] hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold text-xs transition-all w-full max-w-xs"
                >
                  Back to Wallet
                </button>
              </div>
            )}

            {/* Compliance footer */}
            <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-500 tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>SECURED BY AYUSHMAN BHARAT SANDBOX</span>
            </div>
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
