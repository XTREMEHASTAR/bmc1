import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Languages, ShieldCheck, Fingerprint, Key, ChevronRight, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete: (lang: string, aadhaarNo: string | null) => void;
}

type OnboardingStep = 'LANGUAGE' | 'CAROUSEL' | 'AADHAAR';

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<OnboardingStep>('LANGUAGE');
  const [selectedLang, setSelectedLang] = useState<'en' | 'mr' | 'hi'>('en');
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');

  const languages = [
    { code: 'en' as const, label: 'English', desc: 'Default App Language', flag: '🇬🇧' },
    { code: 'mr' as const, label: 'Marathi (मराठी)', desc: 'प्रादेशिक भाषा', flag: '🇮🇳' },
    { code: 'hi' as const, label: 'Hindi (हिंदी)', desc: 'राष्ट्रीय भाषा', flag: '🇮🇳' }
  ];

  const handleLanguageSubmit = () => {
    setStep('CAROUSEL');
  };

  const handleOnboardingNext = () => {
    setStep('AADHAAR');
  };

  const handleAadhaarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aadhaarInput.replace(/\s/g, '').length !== 12) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setOtpSent(true);
    }, 1200);
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.length === 6) {
      onComplete(selectedLang, aadhaarInput);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFD] flex flex-col items-center justify-center p-4" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)', paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}>
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 32px)' }}>
        <AnimatePresence mode="wait">
          {step === 'LANGUAGE' && (
            <motion.div
              key="language"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col p-6 justify-between"
            >
              <div className="flex flex-col items-center text-center mt-6">
                <div className="w-16 h-16 bg-[#0A5BFF] text-white rounded-2xl flex items-center justify-center shadow-lg mb-6">
                  <Languages className="w-8 h-8" />
                </div>
                <h2 className="text-xs font-bold tracking-widest text-[#0A5BFF] uppercase mb-1">
                  MCGM Digital Hospital
                </h2>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight mt-1 mb-2">
                  Choose Language
                </h1>
                <p className="text-gray-500 text-sm max-w-xs mt-1">
                  Please select your preferred language for a better healthcare experience.
                </p>
              </div>

              <div className="space-y-3 my-6">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLang(lang.code)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      selectedLang === lang.code
                        ? 'border-[#0050cc] bg-[#0050cc]/5 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">{lang.flag}</span>
                      <div>
                        <p className="font-semibold text-gray-900 text-base">{lang.label}</p>
                        <p className="text-xs text-gray-500">{lang.desc}</p>
                      </div>
                    </div>
                    {selectedLang === lang.code && (
                      <div className="w-6 h-6 bg-[#0050cc] rounded-full flex items-center justify-center text-white">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleLanguageSubmit}
                  className="w-full bg-[#0A5BFF] text-white py-4 rounded-xl font-semibold hover:bg-[#00164e] transition-colors shadow-md flex items-center justify-center space-x-2"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
                <p className="text-center text-xs text-gray-400">
                  ℹ️ You can change language later from settings
                </p>
              </div>
            </motion.div>
          )}

          {step === 'CAROUSEL' && (
            <motion.div
              key="carousel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col p-6 justify-between"
            >
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-bold text-[#0A5BFF] tracking-wider uppercase">
                  🏥 MCGM Digital
                </span>
                <button
                  onClick={() => setStep('AADHAAR')}
                  className="text-gray-400 hover:text-gray-600 text-sm font-medium"
                >
                  SKIP
                </button>
              </div>

              <div className="flex-1 flex flex-col justify-center items-center my-6">
                <div className="relative w-full aspect-square max-w-[280px] rounded-3xl overflow-hidden shadow-lg border-4 border-white mb-6">
                  <img
                    src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600&h=600"
                    alt="Indian Family Health"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                </div>

                <h1 className="text-2xl font-bold text-[#0A5BFF] text-center tracking-tight leading-tight px-4">
                  Your Health. Our Priority.
                </h1>
                <p className="text-gray-500 text-sm text-center mt-3 max-w-xs leading-relaxed px-2">
                  Access OPD appointments, secure health records, and seamless payments all in one place.
                </p>

                {/* Pagination Indicator */}
                <div className="flex space-x-1.5 mt-6">
                  <div className="w-6 h-1.5 bg-[#0A5BFF] rounded-full" />
                  <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                  <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                </div>
              </div>

              <button
                onClick={handleOnboardingNext}
                className="w-full bg-[#0A5BFF] text-white py-4 rounded-xl font-semibold hover:bg-[#00164e] transition-colors shadow-md flex items-center justify-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 'AADHAAR' && (
            <motion.div
              key="aadhaar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col p-6 justify-between overflow-y-auto no-scrollbar"
            >
              <div className="text-center mt-4 flex flex-col items-center">
                <div className="w-24 h-16 bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200 rounded-xl flex items-center justify-center p-2 mb-4 shadow-sm">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/c/cf/Aadhaar_Logo.svg"
                    alt="Aadhaar Logo"
                    className="h-full object-contain"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback if logo fails
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <ShieldCheck className="w-8 h-8 text-[#0A5BFF] absolute" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Verify Your Identity</h1>
                <p className="text-gray-500 text-xs mt-2 px-4 leading-relaxed">
                  Securely link your Aadhaar with your digital health records to access seamless hospital services.
                </p>
              </div>

              {!otpSent ? (
                <form onSubmit={handleAadhaarSubmit} className="space-y-4 my-6">
                  <div>
                    <label className="block text-xs font-bold tracking-wider text-gray-500 uppercase mb-2">
                      Enter Aadhaar Number
                    </label>
                    <div className="relative">
                      <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        maxLength={14}
                        placeholder="XXXX XXXX 1189"
                        value={aadhaarInput}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          // Format 4-4-4
                          const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                          setAadhaarInput(formatted.slice(0, 14));
                        }}
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-[#F8FAFD] font-semibold text-lg tracking-widest text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A5BFF] focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2 leading-tight">
                      Verification code will be sent to your registered mobile number ending in **89
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50/50 rounded-xl flex items-start space-x-3 border border-blue-100/30">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-800">Secure & Encrypted</h4>
                        <p className="text-[11px] text-gray-500 leading-normal">Your data is protected by industry-standard 256-bit encryption.</p>
                      </div>
                    </div>

                    <div className="p-3 bg-green-50/50 rounded-xl flex items-start space-x-3 border border-green-100/30">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-800">Government Verified</h4>
                        <p className="text-[11px] text-gray-500 leading-normal">Direct integration with UIDAI for official validation.</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={aadhaarInput.replace(/\s/g, '').length !== 12 || isVerifying}
                    className="w-full bg-[#0A5BFF] text-white py-4 rounded-xl font-semibold hover:bg-[#00164e] transition-colors shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifying ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Continue to OTP Verification</span>
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleOtpVerify} className="space-y-4 my-6">
                  <div>
                    <label className="block text-xs font-bold tracking-wider text-gray-500 uppercase mb-2">
                      Enter 6-Digit OTP
                    </label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-[#F8FAFD] font-bold text-xl tracking-[0.5em] text-center text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A5BFF] focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2">
                      OTP successfully sent to +91 *******289. Expires in 10 minutes.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={otpInput.length !== 6}
                    className="w-full bg-[#0A5BFF] text-white py-4 rounded-xl font-semibold hover:bg-[#00164e] transition-colors shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <span>Verify & Link ABHA Card</span>
                    <Check className="w-5 h-5" />
                  </button>
                </form>
              )}

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => onComplete(selectedLang, null)}
                  className="w-full py-3.5 border border-gray-200 hover:border-gray-300 text-[#0A5BFF] rounded-xl font-medium text-sm transition-all text-center flex items-center justify-center space-x-2"
                >
                  <span>Skip Aadhaar Link for Now</span>
                </button>
                <p className="text-[10px] text-gray-400 text-center leading-normal mt-2">
                  By continuing, you agree to the <span className="underline cursor-pointer">Digital Health Terms of Service</span> and authorize MCGM to verify your identity.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
