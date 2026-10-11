import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const languages = [
    { code: 'en', name: 'English', icon: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', icon: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', icon: '🇮🇳' },
    { code: 'mr', name: 'मराठी', icon: '🇮🇳' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', icon: '🇮🇳' },
    { code: 'bn', name: 'বাংলা', icon: '🇮🇳' }
];

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentLanguage = languages.find(lang => lang.code === (i18n.language?.split('-')[0] || 'en')) || languages[0];

    const changeLanguage = (code) => {
        i18n.changeLanguage(code);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 bg-white border-2 border-slate-200 py-2.5 px-4 rounded-2xl hover:border-primary-500 transition-all font-black text-slate-700 shadow-sm active:scale-95"
            >
                <span className="text-xl">{currentLanguage.icon}</span>
                <span className="uppercase tracking-widest text-xs hidden sm:inline">{currentLanguage.name}</span>
                <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-48 bg-white rounded-[2rem] border-2 border-slate-100 shadow-2xl overflow-hidden z-[100] p-2"
                    >
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                className={`w-full flex items-center justify-between px-5 py-4 rounded-[1.5rem] transition-all ${currentLanguage.code === lang.code
                                    ? 'bg-primary-50 text-primary-600'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <span className="text-xl">{lang.icon}</span>
                                    <span className="font-bold">{lang.name}</span>
                                </div>
                                {currentLanguage.code === lang.code && <Check size={18} strokeWidth={3} />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LanguageSwitcher;
