import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([
    { role: 'ai', text: 'Hi! I am the Jersey Unicorn Smart Assistant. How can I help you find the perfect fit, track your order, or learn about our collections?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.text })),
            { role: 'user', content: userMessage }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.text }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'ai', text: "I'm having trouble connecting right now. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[160px] md:bottom-[100px] right-6 z-[200] w-14 h-14 bg-gradient-to-tr from-[#14213D] to-[#1E2A44] text-[#E6C9A8] rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(20,33,61,0.3)] hover:shadow-[0_8px_40px_rgb(230,201,168,0.2)] hover:-translate-y-1 active:scale-95 transition-all duration-300 group"
        aria-label="Open AI Assistant"
      >
        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-24 right-4 md:right-6 z-[200] w-[340px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#14213D] to-[#1E2A44] p-4 flex items-center justify-between text-[#E6C9A8] shrink-0 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="bg-[#E6C9A8]/10 p-2 rounded-full">
                  <Sparkles className="w-5 h-5 text-[#E6C9A8]" />
                </div>
                <div>
                  <h3 className="font-bold tracking-wide text-sm text-white">Smart Assistant</h3>
                  <p className="text-[10px] text-[#E6C9A8]/80 uppercase tracking-widest">Jersey Unicorn AI</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="hover:bg-white/10 p-2 rounded-full transition-colors relative z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-[#F8F9FA] scroll-smooth">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'ai' && (
                    <div className="w-6 h-6 rounded-full bg-[#14213D] flex items-center justify-center shrink-0 mr-2 mt-1">
                      <Sparkles className="w-3 h-3 text-[#E6C9A8]" />
                    </div>
                  )}
                  <div className={`max-w-[80%] p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-[#14213D] text-white rounded-br-sm' 
                      : 'bg-white border border-gray-100 text-[#1B1B1B] rounded-bl-sm whitespace-pre-wrap'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 rounded-full bg-[#14213D] flex items-center justify-center shrink-0 mr-2 mt-1">
                    <Sparkles className="w-3 h-3 text-[#E6C9A8]" />
                  </div>
                  <div className="bg-white border border-gray-100 p-3.5 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2 shrink-0 items-center">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about sizing, tracking..." 
                className="flex-1 bg-[#F8F9FA] border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#14213D] focus:ring-1 focus:ring-[#14213D] transition-colors"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-[#14213D] text-[#E6C9A8] rounded-full flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-[#1E2A44] hover:shadow-md"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
