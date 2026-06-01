import React, { useState, useEffect } from 'react';
import { X, Phone, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { auth } from '../lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

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
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Close modal when user successfully logs in
  useEffect(() => {
    if (user && isLoginOpen) {
      setIsLoginOpen(false);
      resetState();
    }
  }, [user, isLoginOpen, setIsLoginOpen]);

  const resetState = () => {
    setLoginMethod('selection');
    setPhoneNumber('');
    setOtp('');
    setError('');
    setIsLoading(false);
    setConfirmationResult(null);
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

  const onSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      setupRecaptcha();
      let formattedPhone = phoneNumber;
      if (!formattedPhone.startsWith('+')) {
        // Assume India by default if no country code
        formattedPhone = '+91' + formattedPhone;
      }

      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
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

  const onVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setIsLoading(true);
    setError('');

    try {
      await confirmationResult.confirm(otp);
      // user states are handled by ShopContext auth listener
    } catch (err: any) {
      console.error(err);
      setError('Invalid OTP code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoginOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col relative overflow-hidden transform animate-in zoom-in-95 duration-200"
      >
        <button 
          onClick={handleClose}
          className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#1E2A44]">
              {loginMethod === 'selection' ? "Welcome Back" : "Phone Login"}
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              {loginMethod === 'selection' 
                ? "Sign in to access your orders and saved items." 
                : confirmationResult 
                  ? "Enter the 6-digit code sent to your phone." 
                  : "We'll send you an OTP to verify your number."}
            </p>
          </div>

          <div id="recaptcha-container"></div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {loginMethod === 'selection' && (
            <div className="space-y-4">
              <button
                onClick={loginWithGoogle}
                className="w-full h-14 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold text-gray-700 hover:border-[#1E2A44] hover:bg-gray-50 transition-all"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Sign in with Google
              </button>

              <div className="relative flex items-center justify-center py-2">
                <div className="absolute border-t border-gray-200 w-full"></div>
                <span className="bg-white px-4 text-xs font-bold text-gray-400 relative uppercase tracking-wider">or</span>
              </div>

              <button
                onClick={() => setLoginMethod('phone')}
                className="w-full h-14 bg-[#1E2A44] text-white rounded-2xl flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-wider hover:bg-[#2A3A5A] transition-all shadow-md shadow-[#1E2A44]/20"
              >
                <Phone className="w-5 h-5" />
                Continue with Phone
              </button>
            </div>
          )}

          {loginMethod === 'phone' && (
            <div>
              {!confirmationResult ? (
                <form onSubmit={onSignInSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full pl-12 pr-4 h-14 bg-gray-50 border-2 border-transparent focus:border-[#1E2A44] focus:bg-white rounded-2xl font-semibold transition-all outline-none"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !phoneNumber}
                    className="w-full h-14 bg-[#1E2A44] disabled:opacity-50 text-white rounded-2xl flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-wider hover:bg-[#2A3A5A] transition-all shadow-md mt-6"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={onVerifyOtp} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                      6-Digit OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="• • • • • •"
                      className="w-full px-4 h-14 bg-gray-50 border-2 border-transparent focus:border-[#1E2A44] focus:bg-white rounded-2xl font-bold text-center tracking-[0.5em] text-2xl transition-all outline-none"
                      required
                      maxLength={6}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || otp.length < 6}
                    className="w-full h-14 bg-[#1E2A44] disabled:opacity-50 text-white rounded-2xl flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-wider hover:bg-[#2A3A5A] transition-all shadow-md mt-6"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Login'}
                  </button>
                </form>
              )}
              
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => resetState()}
                  className="text-xs font-bold uppercase text-gray-500 hover:text-[#1E2A44]"
                >
                  ← Back to options
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
