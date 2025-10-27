"use client";

import { useMemo } from "react";

interface Props {
  word: string;
}

// Lấy giọng đọc 1 lần và tái sử dụng
let speechVoice: SpeechSynthesisVoice | null = null;
if (typeof window !== "undefined" && window.speechSynthesis) {
  const voices = window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.startsWith("en-"));
  speechVoice = voices.find((v) => v.name === "Google US English") || voices[0];
  if (!speechVoice) {
    window.speechSynthesis.onvoiceschanged = () => {
      const voices = window.speechSynthesis
        .getVoices()
        .filter((v) => v.lang.startsWith("en-"));
      speechVoice =
        voices.find((v) => v.name === "Google US English") || voices[0];
    };
  }
}

export default function ClickToSpeak({ word }: Props) {
  // Chuẩn hóa từ, bỏ dấu câu
  const cleanWord = useMemo(() => {
    return word.replace(/[.,!?;:]/g, "").trim();
  }, [word]);

  const speak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cleanWord || !speechVoice) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanWord);
    utterance.voice = speechVoice;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <span
      onClick={speak}
      className="cursor-pointer font-bold hover:bg-white/20 p-1 rounded-md transition-all"
    >
      {word}
    </span>
  );
}
