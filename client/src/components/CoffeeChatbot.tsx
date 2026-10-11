import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Coffee,
  Calendar,
  Compass,
  CheckCircle2,
  Minimize2,
} from 'lucide-react';
import { api } from '../services/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export const CoffeeChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      role: 'model',
      text: "Namaskara! I am Aarav, Master Roaster & Concierge at Kaapi Works. Looking for bean recommendations, brewing advice, or would you like to book our in-person Roastery Tasting Tour in Bengaluru?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const handleCustomOpen = (e: any) => {
      setIsOpen(true);
      if (e.detail?.prompt) {
        handleSend(e.detail.prompt);
      }
    };
    window.addEventListener('open-coffee-chat', handleCustomOpen as EventListener);
    return () => {
      window.removeEventListener('open-coffee-chat', handleCustomOpen as EventListener);
    };
  }, [messages, isTyping]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isTyping) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Build conversation history for context awareness
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const reply = await api.sendChatMessage(textToSend, historyPayload);

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'model',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'model',
        text: "I apologize, my tasting connection momentarily wavered. Please ask again or feel free to reach our team at care@kaapiworks.in.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    'Book a Roastery Tasting Tour',
    'Best bean for South Indian Brass Filter?',
    'Tell me about Araku Honey Micro-Lot',
    'Book Pour-Over Masterclass for 2',
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#2B1D16] text-[#FAF6F0] p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl hover:bg-[#C2622D] transition-all duration-200 flex items-center gap-2.5 group hover:scale-105 border border-[#C2622D]/30 cursor-pointer"
          aria-label="Open Coffee Sommelier Assistant"
        >
          <div className="relative">
            <Coffee className="w-5 h-5 text-[#C2622D] group-hover:text-[#FAF6F0] transition-colors" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#88C498]" />
          </div>
          <span className="hidden sm:inline text-xs font-semibold tracking-wide">
            Coffee Sommelier & Bookings
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Coffee Sommelier Chat"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[420px] h-[580px] max-h-[85vh] bg-[#FAF6F0] rounded-2xl shadow-2xl border border-[#2B1D16]/15 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="bg-[#2B1D16] text-[#FAF6F0] p-4 flex items-center justify-between border-b border-[#3F2C22]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#C2622D] flex items-center justify-center text-[#FAF6F0] shrink-0">
                <Coffee className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-sm font-bold tracking-tight">
                    Sommelier Aarav
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#88C498]" />
                </div>
                <span className="text-[10px] text-[#FAF6F0]/65">
                  Concierge · Tasting Tours & Advice
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-[#FAF6F0]/70 hover:text-[#FAF6F0] hover:bg-[#FAF6F0]/10 transition-colors cursor-pointer"
              aria-label="Close chat"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Booking Prompt Pill Bar */}
          <div className="bg-[#F4EDE3] px-3 py-2 border-b border-[#2B1D16]/8 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="px-2.5 py-1 rounded-lg bg-[#FAF6F0] border border-[#2B1D16]/12 text-[#2B1D16]/80 hover:text-[#C2622D] hover:border-[#C2622D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 text-xs leading-relaxed">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-[#2B1D16] text-[#FAF6F0] rounded-tr-xs'
                      : 'bg-[#F4EDE3] text-[#2B1D16] border border-[#2B1D16]/10 rounded-tl-xs'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-[#2B1D16]/40 mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start gap-2">
                <div className="bg-[#F4EDE3] text-[#2B1D16] border border-[#2B1D16]/10 rounded-2xl rounded-tl-xs p-3.5 flex items-center gap-1.5 text-xs">
                  <span className="text-[#C2622D] font-medium text-[11px]">Aarav is pouring thoughts</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C2622D] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C2622D] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C2622D] animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#F4EDE3] border-t border-[#2B1D16]/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about roasts or say 'Book tour for 2'..."
              className="flex-1 bg-[#FAF6F0] border border-[#2B1D16]/20 rounded-xl px-3.5 py-2 text-xs text-[#2B1D16] focus:outline-none focus:border-[#C2622D]"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2.5 rounded-xl bg-[#C2622D] text-[#FAF6F0] hover:bg-[#A85022] disabled:opacity-40 transition-colors cursor-pointer shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
