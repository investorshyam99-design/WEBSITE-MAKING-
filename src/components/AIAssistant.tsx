import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

type Message = {
  role: 'user' | 'ai';
  content: string;
};

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: "Hey! I'm Jersey Unicorn AI. Need help finding the perfect fit, or curious about the differences between player and fan versions?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMessage }] })
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', content: "Oops, something went wrong on our end. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

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
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center gap-2 group bg-[#14213D] text-[#EDE3D8] hover:bg-[#1D3557] px-6 py-4 rounded-full shadow-[0_8px_30px_rgba(20,33,61,0.3)] transition-all duration-300 transform hover:-translate-y-1"
          >
            <Sparkles className="w-5 h-5 text-[#E6C9A8]" />
            <span className="font-bold text-sm tracking-widest uppercase">Ask Jersey Unicorn AI</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 sm:bottom-6 sm:right-6 w-[calc(100vw-32px)] sm:w-[400px] h-[600px] max-h-[80vh] z-50 flex flex-col bg-[#0B1325] text-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(20,33,61,0.7)] border border-[#1D3557] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#14213D] border-b border-[#1D3557]">
              <div className="flex items-center gap-3">
                <div className="bg-[#1D3557] p-2 rounded-xl">
                  <Sparkles className="w-5 h-5 text-[#E6C9A8]" />
                </div>
                <div>
                  <h3 className="font-bold text-white tracking-widest uppercase text-sm">Jersey Unicorn AI</h3>
                  <p className="text-[#EDE3D8]/60 text-xs font-medium">Premium Styling Assistant</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-[#EDE3D8]/60 hover:text-white p-2 rounded-full hover:bg-[#1D3557] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 scroll-smooth bg-[#0B1325] space-y-6">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                      msg.role === 'user' 
                        ? 'bg-[#1D3557] text-[#FFFFFF] rounded-br-sm' 
                        : 'bg-[#14213D] text-[#EDE3D8] border border-[#1D3557] rounded-bl-sm'
                    }`}
                  >
                    <div className="text-sm leading-relaxed prose prose-invert max-w-none prose-p:my-1 prose-a:text-[#E6C9A8]">
                      {msg.role === 'ai' ? (
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#14213D] border border-[#1D3557] rounded-2xl rounded-bl-sm px-5 py-4">
                    <Loader2 className="w-5 h-5 text-[#E6C9A8] animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#14213D] border-t border-[#1D3557]">
              <form onSubmit={handleSubmit} className="flex items-end gap-2 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Ask about sizes, styles, or teams..."
                  className="w-full bg-[#0B1325] text-white placeholder-[#EDE3D8]/40 border border-[#1D3557] rounded-2xl pl-4 pr-12 py-3.5 focus:outline-none focus:border-[#E6C9A8] focus:ring-1 focus:ring-[#E6C9A8] resize-none h-[54px] min-h-[54px] max-h-[120px] text-sm"
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 bottom-[9px] p-2 bg-[#E6C9A8] text-[#0B1325] rounded-xl hover:bg-[#D5B796] disabled:opacity-50 disabled:hover:bg-[#E6C9A8] transition-colors"
                >
                  <Send className="w-4 h-4 translate-x-[1px] translate-y-[1px]" />
                </button>
              </form>
              <div className="text-center mt-2">
                <span className="text-[10px] text-[#EDE3D8]/40 uppercase tracking-widest">Powered by Gemini AI</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
