"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Import từng module
import enLayout from "@/translate/en/layout.json";
import enAuth from "@/translate/en/auth.json";
import enChatbot from "@/translate/en/chatbot.json";
import enDashboard from "@/translate/en/dashboard.json";
import enLearning from "@/translate/en/learning.json";
import enChat from "@/translate/en/chat.json";

import viLayout from "@/translate/vi/layout.json";
import viAuth from "@/translate/vi/auth.json";
import viChatbot from "@/translate/vi/chatbot.json";
import viDashboard from "@/translate/vi/dashboard.json";
import viLearning from "@/translate/vi/learning.json";
import viChat from "@/translate/vi/chat.json";

type Language = "en" | "vi";

const resources = {
  en: {
    layout: enLayout,
    auth: enAuth,
    chatbot: enChatbot,
    dashboard: enDashboard,
    learning: enLearning,
    chat: enChat,
  },
  vi: {
    layout: viLayout,
    auth: viAuth,
    chatbot: viChatbot,
    dashboard: viDashboard,
    learning: viLearning,
    chat: viChat,
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

function getNestedValue(obj: any, path: string): string {
  return path.split(".").reduce((acc, part) => acc?.[part], obj) ?? path;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("vi");

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language;
    if (saved) setLanguage(saved);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string) => getNestedValue(resources[language], key);

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
