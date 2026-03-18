"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = 'USD' | 'TZS';
type Language = 'EN' | 'SW';

const USD_TO_TZS_RATE = 2600; // Adjustable exchange rate

interface SettingsContextType {
  currency: Currency;
  language: Language;
  setCurrency: (c: Currency) => void;
  setLanguage: (l: Language) => void;
  formatPrice: (usdPrice: number) => string;
  t: (text: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const translations: Record<string, string> = {
  "Discover": "Gundua",
  "Collections": "Mikusanyiko",
  "Concierge": "Msaada",
  "Shop All": "Nunua Zote",
  "Sign In": "Ingia",
  "Sign Out": "Toka",
  "Add to Cart": "Weka Kikapuni",
  "Add to Wishlist": "Weka Kwenye Vipendwa",
  "Free Shipping": "Usafirishaji Bure",
  "Secure Payment": "Malipo Salama",
  "Easy Returns": "Kurudisha Rasihisi",
  "Buyer Protection guarantee": "Ulinzi wa Mnunuzi",
  "Description": "Maelezo",
  "Size": "Ukubwa",
  "Color": "Rangi",
  "Quantity": "Idadi",
  "Category": "Kundi",
  "Price": "Bei",
  "Price Range": "Viwango Vya Bei",
  "Clear Filters": "Ondoa Vichungi",
  "Clear All": "Futa Zote",
  "Buy Now": "Nunua Sasa",
  "Trending Now": "Inayovuma Sasa",
  "New Arrivals": "Vya Hivi Karibuni",
  "Welcome Back!": "Karibu Tena!",
  "Order History": "Historia ya Oda",
  "Terminate Session": "Funga Kikao",
  "Extraordinary pieces": "Vitu vya kipekee",
  "Free Worldwide Shipping": "Usafirishaji Bure Duniani",
  "Product Details": "Maelezo ya Bidhaa",
  "Size Guide": "Mwongozo wa Ukubwa",
  "Free International Delivery": "Usafirishaji Bure Kimataifa",
  "Automatically applied at checkout": "Huongezwa moja kwa moja maliponi",
  "Safe & secure payments with full refunds": "Malipo salama na kurejeshewa pesa kamili",
  "Checkout": "Nenda Kulipa",
  "Subtotal": "Jumla Ndogo",
  "Total": "Jumla",
  "Shipping": "Usafirishaji"
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('TZS');
  const [language, setLanguageState] = useState<Language>('EN');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const savedCur = localStorage.getItem('currency') as Currency;
    const savedLang = localStorage.getItem('language') as Language;
    if (savedCur && (savedCur === 'USD' || savedCur === 'TZS')) setCurrencyState(savedCur);
    if (savedLang && (savedLang === 'EN' || savedLang === 'SW')) setLanguageState(savedLang);
    setIsMounted(true);
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('currency', c);
  };

  const setLanguage = (l: Language) => {
    setLanguageState(l);
    localStorage.setItem('language', l);
  };

  const formatPrice = (usdPrice: number) => {
    if (!isMounted) return `TSh ${(usdPrice * USD_TO_TZS_RATE).toLocaleString()}`;
    if (currency === 'TZS') {
      return `TSh ${(usdPrice * USD_TO_TZS_RATE).toLocaleString()}`;
    }
    return `$${usdPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const t = (text: string) => {
    if (!isMounted) return text; 
    if (language === 'EN') return text;
    return translations[text] || text;
  };

  return (
    <SettingsContext.Provider value={{ currency, language, setCurrency, setLanguage, formatPrice, t }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  // No error on server, just return a dummy object or null
  if (context === undefined) {
    if (typeof window === 'undefined') {
      return {
        currency: 'USD' as Currency,
        language: 'EN' as Language,
        setCurrency: () => {},
        setLanguage: () => {},
        formatPrice: (p: number) => `$${p}`,
        t: (txt: string) => txt
      };
    }
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
