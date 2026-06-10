'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TbWorld, TbChevronDown } from 'react-icons/tb';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', label: 'EN', fullName: 'English' },
    { code: 'rw', label: 'RW', fullName: 'Kinyarwanda' },
  ];

  const currentLang = languages.find(l => l.code === (i18n.language?.split('-')[0] || 'en')) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLanguage = (code) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium hover:text-accent transition-colors duration-200"
      >
        <TbWorld size={18} className="text-accent" />
        <span>{currentLang.label}</span>
        <TbChevronDown
          size={14}
          className={cn("transition-transform duration-200", isOpen && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-40 rounded-lg border border-border bg-white shadow-xl py-1 z-[100]"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => toggleLanguage(lang.code)}
                className={cn(
                  "w-full text-left px-4 py-2.5 text-sm transition-colors",
                  lang.code === currentLang.code
                    ? "bg-accent/10 text-accent font-bold"
                    : "hover:bg-muted text-primary"
                )}
              >
                {lang.fullName}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
