import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

type ThemeMode = 'light' | 'dark';

interface SiteTheme {
  logoUrl: string;
  logoDarkUrl: string;
  logoSize: number;
  primaryColor: string;
  secondaryColor: string;
  fontSans: string;
  fontSerif: string;
  navbarBg: string;
  bannerUrl: string;
  bannerDarkUrl: string;
  bannerText: string;
  bannerHeight: number;
  chapterBannerUrl: string;
  chapterBannerDarkUrl: string;
  chapterBannerHeight: number;
}

interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  siteTheme: SiteTheme;
  updateSiteTheme: (newTheme: Partial<SiteTheme>) => Promise<void>;
  isSuperAdmin: boolean;
}

const defaultSiteTheme: SiteTheme = {
  logoUrl: '',
  logoDarkUrl: '',
  logoSize: 40,
  primaryColor: '#e11d48', // Rose 600
  secondaryColor: '#6a9fda', 
  fontSans: '"Inter", sans-serif',
  fontSerif: '"Playfair Display", serif',
  navbarBg: 'rgba(255, 255, 255, 0.8)',
  bannerUrl: '',
  bannerDarkUrl: '',
  bannerText: 'Chào mừng đến với Dưới Mái Hiên 🌧️',
  bannerHeight: 180,
  chapterBannerUrl: '',
  chapterBannerDarkUrl: '',
  chapterBannerHeight: 200,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme-mode');
      return (saved as ThemeMode) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    return 'light';
  });
  
  const [siteTheme, setSiteTheme] = useState<SiteTheme>(defaultSiteTheme);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  useEffect(() => {
    // Listen to theme settings
    const unsubTheme = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        setSiteTheme({ ...defaultSiteTheme, ...docSnap.data() });
      }
    });

    // Check admin status
    const unsubAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsSuperAdmin(user.email === "dreamsofocean2614@gmail.com");
      } else {
        setIsSuperAdmin(false);
      }
    });

    return () => {
      unsubTheme();
      unsubAuth();
    };
  }, []);

  useEffect(() => {
    // Apply site theme to document body and CSS variables
    const root = document.documentElement;
    root.style.setProperty('--primary-color', siteTheme.primaryColor);
    root.style.setProperty('--secondary-color', siteTheme.secondaryColor);
    root.style.setProperty('--font-sans', siteTheme.fontSans);
    root.style.setProperty('--font-serif', siteTheme.fontSerif);
  }, [siteTheme]);

  const toggleMode = () => setMode(prev => prev === 'light' ? 'dark' : 'light');

  const updateSiteTheme = async (newTheme: Partial<SiteTheme>) => {
    if (!isSuperAdmin) return;
    try {
      const { setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'settings', 'general'), newTheme, { merge: true });
    } catch (error) {
      console.error("Error updating theme:", error);
    }
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, siteTheme, updateSiteTheme, isSuperAdmin }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
