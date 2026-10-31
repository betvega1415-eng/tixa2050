import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { languageEngine } from '../core/languageEngine';
import { LanguageInfo } from '../data/languages';
import { TranslationDictionary } from '../data/translations';

interface LanguageContextType {
  currentLanguage: LanguageInfo;
  languageCode: string;
  setLanguage: (code: string) => void;
  t: (key: keyof TranslationDictionary, fallback?: string) => string;
  isLanguageModalOpen: boolean;
  setIsLanguageModalOpen: (open: boolean) => void;
  openLanguageModal: () => void;
  allLanguages: LanguageInfo[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageInfo>(languageEngine.getCurrentLanguage());
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  useEffect(() => {
    // Set initial document attributes
    if (typeof window !== 'undefined') {
      document.documentElement.lang = currentLanguage.code;
      document.documentElement.dir = currentLanguage.rtl ? 'rtl' : 'ltr';
    }

    const unsubscribe = languageEngine.subscribe(() => {
      const updated = languageEngine.getCurrentLanguage();
      setCurrentLanguage(updated);
      if (typeof window !== 'undefined') {
        document.documentElement.lang = updated.code;
        document.documentElement.dir = updated.rtl ? 'rtl' : 'ltr';
      }
    });

    return () => unsubscribe();
  }, [currentLanguage.code, currentLanguage.rtl]);

  const handleSetLanguage = (code: string) => {
    languageEngine.setLanguage(code);
  };

  const t = (key: keyof TranslationDictionary, fallback?: string): string => {
    return languageEngine.t(key, fallback);
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        languageCode: currentLanguage.code,
        setLanguage: handleSetLanguage,
        t,
        isLanguageModalOpen,
        setIsLanguageModalOpen,
        openLanguageModal: () => setIsLanguageModalOpen(true),
        allLanguages: languageEngine.getAllLanguages()
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
