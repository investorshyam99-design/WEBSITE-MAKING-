import React, { useState, useEffect, useRef } from 'react';
import { X, Phone, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { auth, db } from '../lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
  var grecaptcha: any;
}

export function LoginModal() {
  const { isLoginOpen, setIsLoginOpen, loginWithGoogle, user } = useShop();

  const [loginMethod, setLoginMethod] = useState<'selection' | 'phone'>('selection');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  const [countdown, setCountdown] = useState(30);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Close modal when user successfully logs in
  useEffect(() => {
    if (user && isLoginOpen) {
      setIsLoginOpen(false);
      resetState();
    }
  }, [user, isLoginOpen, setIsLoginOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (confirmationResult && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [confirmationResult, countdown]);

  const resetState = () => {
    setLoginMethod('selection');
    setPhoneNumber('');
    setOtp(['', '', '', '', '', '']);
    setError('');
    setIsLoading(false);
    setConfirmationResult(null);
    setCountdown(30);
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.error(e);
      }
      window.recaptchaVerifier = null;
    }
  };

  const handleClose = () => {
    setIsLoginOpen(false);
    setTimeout(resetState, 300);
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
    }
  };

  const sendOTP = async (isResend = false) => {
    setIsLoading(true);
    setError('');
    try {
      setupRecaptcha();
      let formattedPhone = phoneNumber;
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+91' + formattedPhone;
      }

      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      if (isResend) {
        setCountdown(30);
      }
      
      // Focus first OTP input after short delay
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error sending OTP. Please try again.');
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then((widgetId: any) => {
          grecaptcha.reset(widgetId);
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendOTP(false);
  };

  useEffect(() => {
    if (confirmationResult && 'OTPCredential' in window) {
      const ac = new AbortController();
      navigator.credentials.get({
        otp: { transport: ['sms'] },
        signal: ac.signal
      } as any).then((otpProvider: any) => {
        if (otpProvider && otpProvider.code) {
          const codeString = otpProvider.code.toString();
          const newOtp = codeString.padEnd(6, '').split('').slice(0, 6);
          setOtp(newOtp);
          // Wait for state to settle then verify
          setTimeout(() => verifyOtp(codeString), 100);
        }
      }).catch(err => {
        console.log('Web OTP error or canceled', err);
      });

      return () => {
        ac.abort();
      };
    }
  }, [confirmationResult]);

  const handleOtpChange = (index: number, value: string) => {
    // Handle paste / autocomplete of 6 digits
    if (value.length > 1) {
       const digits = value.replace(/\D/g, '').split('').slice(0, 6);
       if (digits.length > 0) {
          const newOtp = [...otp];
          digits.forEach((d, i) => {
             if (index + i < 6) newOtp[index + i] = d;
          });
          setOtp(newOtp);
          // Focus the next empty or the last input
          const nextIndex = Math.min(index + digits.length, 5);
          otpRefs.current[nextIndex]?.focus();
       }
       return;
    }

    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Auto-submit OTP
  useEffect(() => {
    const otpValue = otp.join('');
    if (otpValue.length === 6 && confirmationResult) {
       verifyOtp(otpValue);
    }
  }, [otp, confirmationResult]);

  const verifyOtp = async (otpValue: string) => {
    if (!confirmationResult) return;
    setIsLoading(true);
    setError('');

    try {
      const result = await confirmationResult.confirm(otpValue);
      // User is verified. Store login session data
      await addDoc(collection(db, 'login_sessions'), {
        uid: result.user.uid,
        phoneNumber: result.user.phoneNumber,
        timestamp: serverTimestamp(),
        device: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      });
      // ShopContext auth listener handles user state update
    } catch (err: any) {
      console.error(err);
      setError('Invalid OTP code. Please try again.');
      // Clear OTP
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoginOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col relative overflow-hidden animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300"
      >
        <div className="p-6 sm:p-8">
          <button 
            onClick={handleClose}
            className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full hover:bg-gray-100 text-gray-500 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-8 pt-4">
             {/* Logo placeholder - premium feel */}
             <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center font-black text-xl mx-auto mb-4 tracking-tighter">
                JU.
             </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#722F37]">
              {loginMethod === 'selection' ? "Welcome Back" : confirmationResult ? "Verify Phone" : "Enter Phone"}
            </h2>
            <p className="text-gray-500 mt-2 text-sm font-medium">
              {loginMethod === 'selection' 
                ? "Sign in to access your orders and saved items." 
                : confirmationResult 
                  ? `OTP sent to ${phoneNumber.startsWith('+') ? phoneNumber : '+91 '+phoneNumber}` 
                  : "We'll send you an OTP to verify your number."}
            </p>
          </div>

          <div id="recaptcha-container"></div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-semibold">{error}</p>
            </div>
          )}

          {loginMethod === 'selection' && (
            <div className="space-y-4">
              <button
                onClick={loginWithGoogle}
                className="w-full h-14 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold text-gray-700 hover:border-gray-300 transition-all active:scale-[0.98]"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Sign in with Google
              </button>
            </div>
          )}

          {loginMethod === 'phone' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              {!confirmationResult ? (
                <form onSubmit={onSignInSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                      Mobile Number
                    </label>
                    <div className="flex bg-gray-50 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-[#722F37] transition-all border border-gray-100">
                      <div className="flex items-center justify-center px-4 border-r border-gray-200 bg-gray-100/50">
                        <span className="text-gray-500 font-bold text-sm">+91</span>
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber.replace('+91', '').trim()} // hide if they pasted it
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="98765 43210"
                        className="w-full p-4 bg-transparent font-bold text-lg text-[#722F37] tracking-wide focus:outline-none placeholder-gray-300"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || phoneNumber.length < 10}
                    className="w-full h-14 bg-[#722F37] disabled:bg-gray-300 disabled:shadow-none text-white rounded-2xl flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-wider hover:bg-[#2A3A5A] transition-all shadow-xl shadow-[#722F37]/20 mt-6 active:scale-[0.98]"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get OTP'}
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between gap-2 sm:gap-3">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => { otpRefs.current[index] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          autoComplete={index === 0 ? "one-time-code" : undefined}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-full h-12 sm:h-14 bg-gray-50 border-2 border-transparent focus:border-[#722F37] focus:bg-white rounded-xl sm:rounded-2xl font-black text-center text-xl sm:text-2xl text-[#722F37] transition-all outline-none pb-1 focus:shadow-md"
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                     <button
                        type="button"
                        onClick={() => {
                          setConfirmationResult(null);
                          setOtp(['', '', '', '', '', '']);
                        }}
                        className="text-xs font-bold uppercase text-gray-500 hover:text-[#722F37]"
                      >
                        Change Number
                      </button>

                     {countdown > 0 ? (
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                           Resend in 00:{countdown.toString().padStart(2, '0')}
                        </span>
                     ) : (
                        <button
                          type="button"
                          onClick={() => sendOTP(true)}
                          disabled={isLoading}
                          className="text-xs font-bold text-[#722F37] uppercase flex items-center gap-1 hover:underline"
                        >
                          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} /> Get new OTP
                        </button>
                     )}
                  </div>
                  
                  {/* Provide manual verify button in case auto-submit fails or is slow */}
                  {otp.join('').length === 6 && (
                    <button
                      onClick={() => verifyOtp(otp.join(''))}
                      disabled={isLoading}
                      className="w-full h-14 bg-[#722F37] text-white rounded-2xl flex items-center justify-center text-sm font-bold uppercase tracking-wider mt-4 animate-in fade-in"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirming...'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="bg-gray-50/50 p-4 text-center border-t border-gray-100">
           <p className="text-[10px] sm:text-xs text-gray-400 font-medium">By continuing, you agree to our <span className="underline">Terms of Service</span> & <span className="underline">Privacy Policy</span></p>
        </div>
      </div>
    </div>
  );
}
