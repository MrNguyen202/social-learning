"use client";

import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useLanguage } from "./contexts/LanguageContext";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "vi" ? "en" : "vi");
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-full px-3 py-2 mr-5 cursor-pointer"
    >
      <Globe className="w-4 h-4 transition-transform duration-300 hover:rotate-12" />
      <span className="text-sm font-medium">
        {language === "vi" ? "Tiếng Anh" : "Vietnamese"}
      </span>
    </Button>
  );
}
