"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Headphones, Volume2 } from "lucide-react";
import { ListeningParagraphs } from "./components/ListeningParagraphs";
import { WritingExercises } from "./components/WritingExercises";
import { SpeakingLessons } from "./components/SpeakingLessons";
import { useLanguage } from "@/components/contexts/LanguageContext";
export default function Content() {
  const { t } = useLanguage();
  const [view, setView] = useState<"listening" | "writing" | "speaking">(
    "listening"
  );

  return (
    <div className="flex-1 pr-6 py-4 pl-12 space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <Button
              variant={view === "listening" ? "default" : "outline"}
              onClick={() => setView("listening")}
              className="cursor-pointer"
            >
              <Headphones className="w-4 h-4 mr-2" />
              {t("dashboard.listeningParagraphs")}
            </Button>
            <Button
              variant={view === "writing" ? "default" : "outline"}
              onClick={() => setView("writing")}
              className="cursor-pointer"
            >
              <FileText className="w-4 h-4 mr-2" />
              {t("dashboard.writingExercises")}
            </Button>
            <Button
              variant={view === "speaking" ? "default" : "outline"}
              onClick={() => setView("speaking")}
              className="cursor-pointer"
            >
              <Volume2 className="w-4 h-4 mr-2" />
              {t("dashboard.speakingLessons")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {view === "listening" && <ListeningParagraphs t={t} />}
      {view === "writing" && <WritingExercises t={t} />}
      {view === "speaking" && <SpeakingLessons t={t} />}
    </div>
  );
}
