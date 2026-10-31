import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check, Sparkles, SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageInfo } from '../../data/languages';

interface LanguageSelectorButtonProps {
  variant?: 'navbar' | 'compact' | 'footer' | 'pill';
  className?: string;
  showDropdown?: boolean;
}

export const LanguageSelectorButton: React.FC<LanguageSelectorButtonProps> = ({
  variant = 'navbar',
  className = '',
  showDropdown = true
}) => {
  const { currentLanguage, setLanguage, openLanguageModal, allLanguages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const topQuickLanguages = ['en', 'bn', 'es', 'zh', 'hi', 'ar', 'fr', 'pt', 'ru', 'ja'];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQuickSelect = (code: string) => {
    setLanguage(code);
    setIsOpen(false);
  };

  const handleOpenFullModal = () => {
    setIsOpen(false);
    openLanguageModal();
  };

  if (variant === 'compact') {
    return (
      <button
        type="button"
        id="compact-language-btn"
        onClick={openLanguageModal}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/60 text-xs font-mono text-slate-200 transition-all ${className}`}
        title="Select from 99 Languages"
      >
        <span className="text-sm">{currentLanguage.flag}</span>
        <span className="text-[11px] font-semibold">{currentLanguage.nativeName}</span>
        <Globe className="w-3 h-3 text-cyan-400 ml-0.5" />
      </button>
    );
  }

  if (variant === 'footer') {
    return (
      <button
        type="button"
        id="footer-language-btn"
        onClick={openLanguageModal}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 text-xs font-mono text-slate-300 hover:text-white transition-all ${className}`}
      >
        <Globe className="w-3.5 h-3.5 text-cyan-400" />
        <span>{currentLanguage.flag} {currentLanguage.nativeName} ({currentLanguage.name})</span>
        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
          99 Languages
        </span>
      </button>
    );
  }

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        id="main-language-btn"
        onClick={() => {
          if (showDropdown) {
            setIsOpen(!isOpen);
          } else {
            openLanguageModal();
          }
        }}
        className="flex items-center gap-1 sm:gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 text-xs font-mono text-slate-200 hover:text-white shadow-sm hover:shadow-cyan-500/20 transition-all"
        title="Change language (99 Countries Supported)"
      >
        <Globe className="w-3.5 h-3.5 text-cyan-400 hidden xs:inline-block" />
        <span className="text-xs sm:text-sm select-none leading-none">{currentLanguage.flag}</span>
        <span className="font-semibold text-white hidden lg:inline-block max-w-[70px] truncate">
          {currentLanguage.nativeName}
        </span>
        <ChevronDown className={`w-3 h-3 text-cyan-400 hidden sm:inline-block transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Quick Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#090e1f] border border-cyan-500/40 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 border-b border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Select Language</span>
            </span>
            <span className="text-[9px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
              99 Total
            </span>
          </div>

          <div className="py-1 max-h-56 overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-thumb-slate-800">
            {topQuickLanguages.map(code => {
              const lang = allLanguages.find(l => l.code === code);
              if (!lang) return null;
              const isSelected = currentLanguage.code === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleQuickSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                    isSelected
                      ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/80'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{lang.flag}</span>
                    <span className="truncate">{lang.nativeName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({lang.name})</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              );
            })}
          </div>

          <div className="pt-1 mt-1 border-t border-slate-800">
            <button
              type="button"
              id="view-all-99-languages-btn"
              onClick={handleOpenFullModal}
              className="w-full py-2 px-2.5 rounded-xl bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Browse All 99 Languages...</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
