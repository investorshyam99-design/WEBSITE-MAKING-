import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Loader2, User, MessageCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';

export function AdminChatsList() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedChat, setExpandedChat] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'chats'), orderBy('lastUpdated', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedChats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      // Sort by lastUpdated descending
      fetchedChats.sort((a, b) => {
        const timeA = a.lastUpdated?.toMillis?.() || new Date(a.lastUpdated).getTime() || 0;
        const timeB = b.lastUpdated?.toMillis?.() || new Date(b.lastUpdated).getTime() || 0;
        return timeB - timeA;
      });

      setChats(fetchedChats);
      setLoading(false);
      setError(null);
    }, (error) => {
      console.warn("Error fetching chats:", error);
      setError("Failed to fetch chats: " + error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E2A44]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm font-medium">
        {error}
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm mt-4">
        <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">No AI chats found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {chats.map(chat => {
        const isExpanded = expandedChat === chat.id;
        const msgCount = chat.messages?.length || 0;
        
        const chatDate = chat.lastUpdated?.toDate?.() 
          ? chat.lastUpdated.toDate().toLocaleDateString("en-US", {
              month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
            })
          : "Recently";

        return (
          <div key={chat.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center"
              onClick={() => setExpandedChat(isExpanded ? null : chat.id)}
            >
              <div className="flex items-center gap-3">
                <div className="bg-[#14213D] p-2 rounded-full shrink-0">
                  <User className="w-5 h-5 text-[#E6C9A8]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1E2A44] text-sm">{chat.userName || "Guest Customer"}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {chatDate}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm bg-blue-50 text-blue-700">
                      {msgCount} {msgCount === 1 ? 'Message' : 'Messages'}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>
            </div>
            
            {isExpanded && chat.messages && (
              <div className="p-4 bg-gray-50 border-t border-gray-100 max-h-96 overflow-y-auto flex flex-col gap-3">
                {chat.messages.map((msg: any, i: number) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                      msg.role === 'user'
                         ? 'bg-[#14213D] text-white rounded-br-sm'
                         : 'bg-white border border-gray-200 text-[#1B1B1B] rounded-bl-sm whitespace-pre-wrap'
                    }`}>
                      {msg.text || msg.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
