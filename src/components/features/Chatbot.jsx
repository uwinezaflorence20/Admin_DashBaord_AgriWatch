'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { TbMessageChatbot, TbX, TbSend, TbPlus } from 'react-icons/tb';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function Chatbot() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { role: 'bot', content: t('chatbot.welcome') }
      ]);
    }
  }, [isOpen, messages.length, t]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (text = inputValue) => {
    if (!text.trim()) return;

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInputValue("");

    // Simple rule-based logic
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let response = "";

      if (lowerText.includes("service") || lowerText.includes("serivisi") || lowerText.includes("offer")) {
        response = t('services.subtitle') + " " + t('services.list.corporate.title') + ", " + t('services.list.litigation.title') + ", " + t('services.list.family.title') + "...";
      } else if (lowerText.includes("contact") || lowerText.includes("vugisha") || lowerText.includes("reach")) {
        response = t('chatbot.questions.contact') + " " + t('topbar.email') + " or " + t('topbar.phone');
      } else if (lowerText.includes("location") || lowerText.includes("office") || lowerText.includes("biro")) {
        response = t('topbar.location');
      } else {
        response = t('chatbot.legal_only');
      }

      setMessages(prev => [...prev, { role: 'bot', content: response }]);
    }, 600);
  };

  const predefinedQuestions = [
    { key: 'services', label: t('chatbot.questions.services') },
    { key: 'contact', label: t('chatbot.questions.contact') },
    { key: 'location', label: t('chatbot.questions.location') },
  ];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-accent text-white rounded-full shadow-2xl flex items-center justify-center z-[9999] hover:bg-accent/90 transition-colors"
      >
        {isOpen ? <TbX size={30} /> : <TbMessageChatbot size={30} />}
        {!isOpen && (
          <span className="absolute -top-2 -left-2 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-accent border-2 border-white"></span>
          </span>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-28 right-8 w-[350px] md:w-[400px] h-[550px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-border flex flex-col overflow-hidden z-[9999]"
          >
            {/* Header */}
            <div className="p-4 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                  <TbMessageChatbot size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">AgriWatch Assistant</h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-accent font-medium">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                    Online
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:text-accent p-1"><TbX size={20} /></button>
            </div>

            {/* Disclaimer */}
            <div className="bg-muted/50 p-2 text-[10px] text-center text-muted-foreground border-b border-border italic">
              {t('chatbot.disclaimer')}
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-grow p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-muted"
            >
              {messages.map((msg, idx) => (
                <div key={idx} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] p-3 rounded-2xl text-sm shadow-sm",
                    msg.role === 'user' 
                      ? "bg-accent text-white rounded-tr-none" 
                      : "bg-muted text-primary rounded-tl-none border border-border"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {/* Predefined Questions */}
              {messages.length === 1 && (
                <div className="flex flex-col gap-2 pt-2">
                  {predefinedQuestions.map((q) => (
                    <button
                      key={q.key}
                      onClick={() => handleSend(q.label)}
                      className="text-left py-2 px-4 bg-muted hover:bg-accent/10 border border-border rounded-full text-xs font-medium text-primary hover:text-accent transition-all animate-in fade-in slide-in-from-left-2"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border">
              <div className="relative flex items-center gap-2">
                 <input 
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t('chatbot.prompt')}
                  className="w-full h-11 pl-4 pr-12 rounded-full border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                 />
                 <button 
                  onClick={() => handleSend()}
                  className="absolute right-1 w-9 h-9 bg-accent text-white rounded-full flex items-center justify-center hover:bg-accent/90 transition-colors"
                 >
                   <TbSend size={18} />
                 </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
