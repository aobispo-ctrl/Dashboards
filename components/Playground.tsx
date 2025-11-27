import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { sendChatMessage } from '../services/geminiService';
import { ChatMessage } from '../types';

const Playground: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', content: "Hello! I'm ready to help you experiment with Gemini. What's on your mind?", timestamp: Date.now() }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Format history for the service
      const history = messages.map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
      }));

      const responseText = await sendChatMessage(history, input);
      
      const botMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        content: responseText, 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      const errorMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        content: "I encountered an error connecting to the API. Please check your network or API key.", 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
      <div className="bg-slate-900/50 p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white">Interactive Playground</h2>
        <p className="text-xs text-slate-400">Model: gemini-2.5-flash</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={16} className="text-white" />
              </div>
            )}
            
            <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
              msg.role === 'user' 
                ? 'bg-cyan-600 text-white rounded-tr-sm' 
                : 'bg-slate-700 text-slate-100 rounded-tl-sm'
            }`}>
              <div className="prose prose-invert prose-sm">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0 mt-1">
                <User size={16} className="text-slate-300" />
              </div>
            )}
          </div>
        ))}
        {loading && (
             <div className="flex gap-4 justify-start">
                 <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={16} className="text-white" />
                  </div>
                 <div className="bg-slate-700 rounded-2xl px-5 py-3 rounded-tl-sm flex items-center">
                    <Loader2 className="animate-spin text-slate-400" size={18} />
                 </div>
             </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-700">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white p-3 rounded-xl transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Playground;
