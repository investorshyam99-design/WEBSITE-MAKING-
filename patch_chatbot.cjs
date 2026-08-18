const fs = require('fs');
let code = fs.readFileSync('src/components/AIChatbot.tsx', 'utf8');

const searchSend = `  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    const newMessagesUser = [...messages, { role: 'user' as const, text: userMessage }];
    setMessages(newMessagesUser);
    saveChatToDb(newMessagesUser);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini', {`;

const replaceSend = `  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;
    
    const newMessagesUser = [...messages, { role: 'user' as const, text: userMessage }];
    setMessages(newMessagesUser);
    saveChatToDb(newMessagesUser);
    setInput('');
    setIsLoading(true);

    try {
      // For static deployments (GitHub Pages), use the Firebase Function URL.
      // For local dev, it still falls back to the local proxy.
      const functionUrl = import.meta.env.VITE_GEMINI_FUNCTION_URL || '/api/gemini';
      const response = await fetch(functionUrl, {`;

if (code.includes(searchSend)) {
  code = code.replace(searchSend, replaceSend);
} else {
  console.log("Could not find searchSend");
}

const searchHandleSend = `    } finally {
      setIsLoading(false);
    }
  };`;

const replaceHandleSend = `    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };`;

if (code.includes(searchHandleSend)) {
  code = code.replace(searchHandleSend, replaceHandleSend);
}

const searchForm = `            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2 shrink-0 items-center">`;

const replaceForm = `            {/* Quick Actions */}
            <div className="bg-[#F8F9FA] px-4 pb-2 pt-2 overflow-x-auto shrink-0 flex items-center gap-2 [&::-webkit-scrollbar]:hidden">
              {['Track Order', 'Exchange Policy', 'COD Available', 'Customisation'].map((action) => (
                <button
                  key={action}
                  onClick={() => sendMessage(action)}
                  className="whitespace-nowrap px-3 py-1.5 bg-white border border-gray-200 text-[#1B1B1B] text-xs font-semibold rounded-full hover:border-[#14213D] hover:bg-gray-50 transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
            
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2 shrink-0 items-center">`;

if (code.includes(searchForm)) {
  code = code.replace(searchForm, replaceForm);
}

fs.writeFileSync('src/components/AIChatbot.tsx', code);
console.log("Patched AIChatbot.tsx");
