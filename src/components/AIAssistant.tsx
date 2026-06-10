import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2, Mic, MicOff, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

type Message = {
  role: 'user' | 'ai';
  content: string;
};

const SUGGESTIONS = [
  "Football Jerseys",
  "Cricket Jerseys",
  "Retro Kits",
  "Under ₹999",
  "Player Version"
];

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: "Yo 👋 I'm Jersey Unicorn AI. Looking for a new kit or want to know your perfect size?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Voice feature states
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  
  const location = useLocation();
  const lastLocationRef = useRef(location.pathname);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Proactive Context Matching
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // If idle for 10 seconds and has only the first message
      if (messages.length === 1 && !isLoading && isOpen) {
        setMessages(prev => [...prev, { role: 'ai', content: "Need help finding your team jersey? Football or cricket?" }]);
      }
    }, 10000);
    return () => clearTimeout(timeoutId);
  }, [messages.length, isLoading, isOpen]);

  useEffect(() => {
    if (location.pathname !== lastLocationRef.current) {
      lastLocationRef.current = location.pathname;
      if (location.pathname.includes('/product/') || location.pathname.includes('/products/')) {
        setTimeout(() => {
          setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && lastMsg.role === 'ai' && lastMsg.content.includes("shorts")) return prev;
            if (!isOpen && prev.length < 5) return prev; // don't spam if unopened and early in interaction
            return [...prev, { role: 'ai', content: "Nice pick 👀 Want matching shorts or track pants to complete the fit?" }];
          });
        }, 3000);
      }
    }
  }, [location.pathname, isOpen]);

  const handleSubmitRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setTimeout(() => {
            if (handleSubmitRef.current) {
              handleSubmitRef.current(undefined, transcript);
            }
          }, 100);
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
    
    return () => {
      stopAudio();
    };
  }, []);

  const initializeAudioContext = () => {
    try {
      if (!audioContextRef.current) {
        const AudioContextCls = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextCls) {
          audioContextRef.current = new (AudioContextCls as any)({ sampleRate: 24000 });
        } else {
          console.warn("AudioContext is not supported in this browser");
          return;
        }
      }
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
    } catch (e) {
      console.error("Audio Context Init Error:", e);
    }
  };

  const stopAudio = () => {
    if (currentAudioSourceRef.current) {
      try {
        currentAudioSourceRef.current.stop();
        currentAudioSourceRef.current.disconnect();
      } catch (e) {}
      currentAudioSourceRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const playPCMBase64 = async (base64Audio: string) => {
    if (!base64Audio) return;
    try {
      if (!audioContextRef.current) {
        const AudioContextCls = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextCls) {
          audioContextRef.current = new AudioContextCls({ sampleRate: 24000 });
        } else {
          console.warn("AudioContext not supported");
          return;
        }
      }
      const audioCtx = audioContextRef.current;
      if (audioCtx.state === 'suspended') await audioCtx.resume();

      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const pcm16 = new Int16Array(bytes.buffer);
      const audioBuffer = audioCtx.createBuffer(1, pcm16.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < pcm16.length; i++) {
        channelData[i] = pcm16[i] / 32768.0;
      }
      
      stopAudio();
      
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.onended = () => setIsSpeaking(false);
      currentAudioSourceRef.current = source;
      
      setIsSpeaking(true);
      source.start();
    } catch (e) {
      console.error("PCM playback error:", e);
      setIsSpeaking(false);
    }
  };

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode);
    if (!isVoiceMode) {
      initializeAudioContext();
    } else {
      stopAudio();
    }
  };

  const toggleListening = () => {
    initializeAudioContext();
    if (!recognitionRef.current) {
      alert("🎙️ Voice recognition is not supported in this browser. Please try using Chrome or Android.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if (!isOpen) setIsOpen(true);
      setIsFullscreen(true);
      if (!isVoiceMode) setIsVoiceMode(true);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Close immersive mode smoothly when silence occurs for a long period
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!isListening && !isSpeaking && isFullscreen) {
      // Do nothing, stay in fullscreen
    }
    return () => clearTimeout(timeout);
  }, [isListening, isSpeaking, isFullscreen]);

  const handleSubmit = async (e?: React.FormEvent, overrideInput?: string, forceVoice?: boolean) => {
    if (e) e.preventDefault();
    initializeAudioContext();
    const textToSubmit = overrideInput !== undefined ? overrideInput : input;
    if (!textToSubmit.trim() || isLoading) return;

    if (isListening) {
      recognitionRef.current?.stop();
    }
    stopAudio();

    const userMessage = textToSubmit.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    
    const shouldUseVoice = forceVoice || isVoiceMode;

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, { role: 'user', content: userMessage }],
          voice: shouldUseVoice 
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'API Error');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.text }]);
      
      if (shouldUseVoice) {
        if (data.audio) {
          playPCMBase64(data.audio);
        } else {
          const utterance = new SpeechSynthesisUtterance(data.text);
          const hasHindiScript = /[\u0900-\u097F]/.test(data.text);
          utterance.lang = hasHindiScript ? 'hi-IN' : 'en-IN';
          
          utterance.onstart = () => setIsSpeaking(true);
          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = () => setIsSpeaking(false);
          
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(v => v.lang === utterance.lang && v.name.includes("Google"))
            || voices.find(v => v.lang === utterance.lang)
            || voices.find(v => (v.lang === 'hi-IN' || v.lang === 'en-IN') && v.name.includes("Google"))
            || voices.find(v => v.lang === 'hi-IN' || v.lang === 'en-IN')
            || voices.find(v => v.name.includes("Google") && !v.name.includes("Microsoft"));
            
          if (preferredVoice) utterance.voice = preferredVoice;
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.message || "Oops, something went wrong on our end. Please try again later.";
      setMessages(prev => [...prev, { role: 'ai', content: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  // Typing Dots Indicator Component
  const TypingIndicator = () => (
    <div className="flex justify-start mb-2">
      <div className="bg-white/5 border border-white/5 backdrop-blur-md rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center shadow-sm">
        <span className="w-1.5 h-1.5 bg-[#E6C9A8]/70 animate-[bounce_1s_infinite] rounded-full" />
        <span className="w-1.5 h-1.5 bg-[#E6C9A8]/70 animate-[bounce_1.2s_infinite] rounded-full" />
        <span className="w-1.5 h-1.5 bg-[#E6C9A8]/70 animate-[bounce_0.8s_infinite] rounded-full" />
      </div>
    </div>
  );

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-28 md:bottom-6 right-4 md:right-6 z-40 flex items-center justify-center gap-2 group bg-[#14213D] text-[#EDE3D8] hover:bg-[#1D3557] p-4 md:px-6 md:py-4 rounded-full shadow-[0_8px_40px_rgba(20,33,61,0.5)] border border-white/10 transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm"
          >
            <Sparkles className="w-6 h-6 md:w-5 md:h-5 text-[#E6C9A8]" />
            <span className="hidden md:inline font-bold text-sm tracking-widest uppercase">Ask Stylist</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && isFullscreen && (
          <motion.div
            key="fullscreen-voice"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "backOut" }}
            className="fixed inset-0 z-[100] flex flex-col bg-[#050B14]/85 backdrop-blur-3xl text-white sm:p-8"
          >
            {/* Cinematic Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#14213D]/30 to-[#050B14] pointer-events-none" />

            {/* Header Controls */}
            <div className="relative z-10 flex justify-between items-center p-6 sm:p-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
                  <Sparkles className="w-6 h-6 text-[#E6C9A8]" />
                </div>
                <div>
                  <h3 className="font-black text-white tracking-widest uppercase text-base">Jersey Unicorn AI</h3>
                  <p className="text-[#E6C9A8] text-xs font-semibold uppercase tracking-wider">Immersive Mode</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleVoiceMode}
                  className={`p-3 rounded-full transition-all backdrop-blur-md border border-white/5 ${isVoiceMode ? 'text-[#E6C9A8] bg-[#E6C9A8]/10' : 'text-white/80 bg-white/5 hover:bg-white/10 hover:text-white'}`}
                  title="Toggle Voice Responses"
                >
                  {isVoiceMode ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-3 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/5 rounded-full transition-all"
                >
                  <X className="w-5 h-5 text-white/80" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-5 py-6 scroll-smooth space-y-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <div className="max-w-4xl mx-auto space-y-5">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[85%] px-5 py-4 shadow-md ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-br from-[#1D3557] to-[#14213D] text-white rounded-3xl rounded-br-sm border border-white/5' 
                          : 'bg-white/5 backdrop-blur-md text-white border border-white/5 rounded-3xl rounded-bl-sm'
                      }`}
                    >
                      <div className="text-[14px] md:text-base leading-relaxed prose prose-invert max-w-none prose-p:my-1 prose-a:text-[#E6C9A8]">
                        {msg.role === 'ai' ? (
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        ) : (
                          msg.content
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            </div>

            {/* Quick Suggestions & Input Area */}
            <div className="bg-[#050B14]/40 border-t border-white/5 p-4 sm:p-6 flex flex-col gap-3 relative z-10 w-full shrink-0">
              <div className="max-w-4xl mx-auto w-full flex flex-col gap-3">
                {/* Quick Action Chips */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide mask-linear-fade">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setIsVoiceMode(true);
                        handleSubmit(undefined, suggestion, true);
                      }}
                      className="whitespace-nowrap px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-[12px] font-semibold tracking-wide uppercase hover:bg-[#1D3557] hover:border-[#E6C9A8]/30 hover:text-[#E6C9A8] transition-all active:scale-95 flex-shrink-0"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="flex items-end gap-2 relative w-full">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder={isListening ? "Listening..." : "Message Stylist..."}
                    className="w-full bg-white/5 backdrop-blur-md text-white placeholder-white/40 border border-white/10 rounded-2xl pl-5 pr-[100px] py-4 focus:outline-none focus:border-[#E6C9A8]/50 focus:bg-white/10 transition-all resize-none h-[60px] min-h-[60px] max-h-[160px] text-base shadow-inner"
                    rows={1}
                  />
                  <div className="absolute right-3 bottom-[11px] flex items-center gap-1.5 z-10">
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`p-2.5 rounded-xl transition-all ${
                        isListening ? 'text-red-400 bg-red-400/10' : 'text-white/60 hover:text-[#E6C9A8] hover:bg-white/10'
                      }`}
                      title="Voice Input"
                    >
                      {isListening ? <Mic className="w-5 h-5 animate-pulse" /> : <MicOff className="w-5 h-5" />}
                    </button>
                    <button
                      type="submit"
                      disabled={(!input.trim() && !isListening) || isLoading}
                      className="p-2.5 bg-[#E6C9A8] text-[#050B14] rounded-xl hover:bg-[#D5B796] disabled:opacity-50 disabled:bg-white/20 disabled:text-white/40 active:scale-95 transition-all"
                    >
                      <Send className="w-5 h-5 translate-x-[1px]" />
                    </button>
                  </div>
                </form>
                <div className="text-center mt-1 flex justify-between items-center px-2">
                  <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Powered by Gemini AI</span>
                  {isListening && <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest animate-[pulse_1s_infinite]">Recording...</span>}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


    </>
  );
}

