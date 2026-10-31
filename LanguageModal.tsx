import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Globe, 
  Check, 
  Sparkles,
  MapPin,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageInfo } from '../../data/languages';
import confetti from 'canvas-confetti';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REGIONS = ['All', 'Asia', 'Europe', 'Americas', 'Middle East', 'Africa', 'Oceania'] as const;

export const LanguageModal: React.FC<LanguageModalProps> = ({ isOpen, onClose }) => {
  const { currentLanguage, setLanguage, t, allLanguages } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Quick access popular languages
  const popularCodes = ['en', 'bn', 'es', 'zh', 'hi', 'ar', 'fr', 'pt', 'ru', 'ja', 'de', 'ko', 'tr', 'vi', 'id'];

  const filteredLanguages = useMemo(() => {
    return allLanguages.filter(lang => {
      const matchesSearch = 
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRegion = selectedRegion === 'All' || lang.region === selectedRegion;

      return matchesSearch && matchesRegion;
    });
  }, [allLanguages, searchQuery, selectedRegion]);

  if (!isOpen) return null;

  const handleSelectLanguage = (lang: LanguageInfo) => {
    setLanguage(lang.code);
    setSuccessToast(`${lang.flag} ${lang.nativeName} (${lang.name})`);
    
    // Quick burst confetti
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      setSuccessToast(null);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#080d1e] border border-cyan-500/30 shadow-2xl p-5 sm:p-7 text-slate-100 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          id="close-language-modal-btn"
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pr-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-black font-bold shadow-lg shadow-cyan-500/20 flex-shrink-0">
            <Globe className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white font-heading">
                {t('settings_select_lang_title', 'Select Language (99 Countries Supported)')}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-mono text-[10px] border border-cyan-800">
                99 Languages
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Instant UI translation across all menus, dashboard, wallet, trading & alerts with persistent preference.
            </p>
          </div>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="mb-3 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              {t('settings_saved_success', 'Language preference saved successfully!')} <strong>{successToast}</strong>
            </span>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            id="search-language-input"
            autoFocus
            placeholder={t('settings_search_lang', 'Search language by name, country or native text...')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder-slate-500 font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Popular Quick-Select Carousel */}
        {!searchQuery && selectedRegion === 'All' && (
          <div className="mb-3">
            <div className="text-[11px] font-mono text-cyan-400/90 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Popular Global Languages</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-800">
              {popularCodes.map(code => {
                const lang = allLanguages.find(l => l.code === code);
                if (!lang) return null;
                const isCurrent = currentLanguage.code === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelectLanguage(lang)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all border ${
                      isCurrent
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-sm'
                        : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-800/80'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="font-medium">{lang.nativeName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Region Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-2 border-b border-slate-800/80 text-[11px] font-mono">
          {REGIONS.map(region => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
                selectedRegion === region
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {region}
            </button>
          ))}
          <span className="ml-auto text-[10px] text-slate-500 hidden sm:inline-block">
            {filteredLanguages.length} of {allLanguages.length}
          </span>
        </div>

        {/* 99 Languages Grid (Scrollable) */}
        <div className="overflow-y-auto flex-1 pr-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 py-1 max-h-[50vh]">
          {filteredLanguages.map(lang => {
            const isSelected = currentLanguage.code === lang.code;
            return (
              <button
                key={lang.code}
                id={`lang-btn-${lang.code}`}
                onClick={() => handleSelectLanguage(lang)}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all group ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border-cyan-400 text-white shadow-md shadow-cyan-950/50'
                    : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/80 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl flex-shrink-0 select-none">{lang.flag}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-semibold truncate ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                        {lang.nativeName}
                      </span>
                      {lang.rtl && (
                        <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60">
                          RTL
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono truncate">
                      {lang.name} • <span className="text-slate-500">{lang.country}</span>
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0 ml-2">
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-cyan-400 text-black flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-700 group-hover:border-cyan-500/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-3 h-3 text-cyan-400" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {filteredLanguages.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-400 space-y-2">
              <Globe className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs font-mono">No matching language found for "{searchQuery}"</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedRegion('All'); }}
                className="text-xs text-cyan-400 hover:underline"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Current Active:</span>
            <span className="text-cyan-300 font-bold flex items-center gap-1">
              <span>{currentLanguage.flag}</span>
              <span>{currentLanguage.nativeName} ({currentLanguage.name})</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            {t('btn_close', 'Close')}
          </button>
        </div>

      </div>
    </div>
  );
};
