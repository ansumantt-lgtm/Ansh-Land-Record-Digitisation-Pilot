import React, { createContext, useContext, useState, useEffect } from "react";
import { TRANSLATIONS } from "../utils/translations";

type LanguageType = "en" | "mr";

interface LanguageContextType {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  t: (key: string) => string;
  translateStatus: (status: string) => string;
  translateDept: (dept: string) => string;
  translateRole: (role: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageType>("en");

  // Load language preference from localstorage if exists
  useEffect(() => {
    const cachedLanguage = localStorage.getItem("lao_selected_language");
    if (cachedLanguage === "en" || cachedLanguage === "mr") {
      setLanguageState(cachedLanguage);
    }
  }, []);

  const setLanguage = (lang: LanguageType) => {
    setLanguageState(lang);
    localStorage.setItem("lao_selected_language", lang);
  };

  // Safe translation key search
  const t = (key: string): string => {
    const activeDict = TRANSLATIONS[language];
    if (!activeDict) return key;
    return (activeDict as any)[key] ?? key;
  };

  // Helper to translate File statuses
  const translateStatus = (status: string): string => {
    const activeDict = TRANSLATIONS[language];
    if (!activeDict) return status;
    return (activeDict as any)[status] ?? status;
  };

  // Helper to translate Departments
  const translateDept = (dept: string): string => {
    const activeDict = TRANSLATIONS[language];
    if (!activeDict) return dept;
    return (activeDict as any)[dept] ?? dept;
  };

  // Helper to translate Roles
  const translateRole = (role: string): string => {
    const activeDict = TRANSLATIONS[language];
    if (!activeDict) return role;
    return (activeDict as any)[role] ?? role;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateStatus, translateDept, translateRole }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
