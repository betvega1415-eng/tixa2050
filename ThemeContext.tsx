import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { soundEngine } from '../core/soundEngine';

export type AppTheme = 'cyber-blue' | 'minimalist-mono';

export interface ThemeOption {
  id: AppTheme;
  name: string;
  tagline: string;
  badge: string;
  primaryColor: string;
  accentColor: string;
}

export const THEME_OPTIONS: Record<AppTheme, ThemeOption> = {
  'cyber-blue': {
    id: 'cyber-blue',
    name: 'Cyber Blue',
    tagline: 'Futuristic Neon, Cyan Glow & Glassmorphism',
    badge: 'DEFAULT',
    primaryColor: '#06b6d4',
    accentColor: '#3b82f6'
  },
  'minimalist-mono': {
    id: 'minimalist-mono',
    name: 'Minimalist Mono',
    tagline: 'Monochrome Obsidian & High-Contrast Precision',
    badge: 'PRO MONO',
    primaryColor: '#ffffff',
    accentColor: '#a1a1aa'
  }
};

const STORAGE_KEY = 'tixa_app_theme';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  isCyberBlue: boolean;
  isMinimalistMono: boolean;
  currentOption: ThemeOption;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'cyber-blue' || stored === 'minimalist-mono') {
        return stored;
      }
    }
    return 'cyber-blue';
  });

  const applyThemeToDOM = (activeTheme: AppTheme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;

    root.classList.remove('theme-cyber-blue', 'theme-minimalist-mono');
    root.classList.add(`theme-${activeTheme}`);
    root.setAttribute('data-theme', activeTheme);

    body.classList.remove('theme-cyber-blue', 'theme-minimalist-mono');
    body.classList.add(`theme-${activeTheme}`);
    body.setAttribute('data-theme', activeTheme);
  };

  useEffect(() => {
    applyThemeToDOM(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme]);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    applyThemeToDOM(newTheme);
    try {
      soundEngine.play('toggle');
    } catch {
      // safe sound invocation
    }
  };

  const toggleTheme = () => {
    const nextTheme: AppTheme = theme === 'cyber-blue' ? 'minimalist-mono' : 'cyber-blue';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isCyberBlue: theme === 'cyber-blue',
        isMinimalistMono: theme === 'minimalist-mono',
        currentOption: THEME_OPTIONS[theme]
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
