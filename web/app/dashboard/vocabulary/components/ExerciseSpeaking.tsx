"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Mic, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ClickToSpeak from "./ClickToSpeak";
import { JSX } from "react/jsx-runtime";

export default function ExerciseSpeaking({
  exercise,
  onCheck,
  isChecking,
}: any) {
  const { sentence, ipa, sentence_vi } = exercise.data;

  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const [result, setResult] = useState<JSX.Element | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [browserSupports, setBrowserSupports] = useState(false);

  // State Text-to-Speech
  const [voiceForSentence, setVoiceForSentence] =
    useState<SpeechSynthesisVoice | null>(null);

  // State đếm lần sai
  const [attemptCount, setAttemptCount] = useState(0);
  const MAX_WRONG_ATTEMPTS = 3;
  const wasListeningRef = useRef(false);

  // Setup (chạy 1 lần)
  useEffect(() => {
    setIsClient(true);
    setBrowserSupports(SpeechRecognition.browserSupportsSpeechRecognition());

    const synth = window.speechSynthesis;
    const updateVoices = () => {
      const availableVoices = synth
        .getVoices()
        .filter((v) => v.lang.startsWith("en-"));

      let bestVoice: any = availableVoices.find(
        (v) => v.name === "Google US English"
      );
      if (!bestVoice)
        bestVoice = availableVoices.find((v) => v.lang === "en-US");
      if (!bestVoice) bestVoice = availableVoices[0];
      setVoiceForSentence(bestVoice);
    };
    synth.onvoiceschanged = updateVoices;
    updateVoices();
  }, []);

  useEffect(() => {
    resetTranscript();
    setResult(null);
    setAttemptCount(0);
    wasListeningRef.current = false;
  }, [exercise.id, resetTranscript]);

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[.,!?;:\\"'()[\]{}]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  const speak = () => {
    if (!voiceForSentence || !isClient) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.voice = voiceForSentence;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const checkPronunciation = () => {
    const sample = normalize(sentence);
    const spoken = normalize(transcript || "");
    const sampleWords = sample.split(" ");
    const spokenWords = spoken.split(" ");
    let isCorrect = sampleWords.length === spokenWords.length;
    const compared = sampleWords.map((word, i) => {
      if (spokenWords[i] === word) {
        return (
          <span key={i} className="text-green-600 font-semibold mr-2">
            {word}
          </span>
        );
      } else {
        isCorrect = false;
        return (
          <span key={i} className="text-red-600 font-semibold mr-2">
            {spokenWords[i] || "___"}
          </span>
        );
      }
    });
    if (spokenWords.length > sampleWords.length) {
      isCorrect = false;
      for (let i = sampleWords.length; i < spokenWords.length; i++) {
        compared.push(
          <span
            key={i}
            className="text-red-600 line-through font-semibold mr-2"
          >
            {spokenWords[i]}
          </span>
        );
      }
    }
    setResult(
      <div className="mt-2 flex flex-wrap justify-center">{compared}</div>
    );
    return isCorrect;
  };

  const handleCheck = () => {
    const isCorrect = checkPronunciation();

    if (isCorrect) {
      toast.success("Chính xác!", { autoClose: 1500 });
      setAttemptCount(0);
      onCheck(true, sentence);
    } else {
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      if (newAttemptCount > MAX_WRONG_ATTEMPTS) {
        toast.error(
          `Bạn đã sai quá ${MAX_WRONG_ATTEMPTS} lần. Câu này bị tính là sai.`,
          { autoClose: 1500 }
        );
        setAttemptCount(0);
        onCheck(false, sentence);
      } else {
        const attemptsLeft = MAX_WRONG_ATTEMPTS - newAttemptCount;
        toast.warn(
          `Sai rồi! Bạn còn ${attemptsLeft} lần thử.${
            attemptsLeft === 0 ? " Đây là lần cuối!" : ""
          }`,
          { autoClose: 1500 }
        );
        resetTranscript();
        setResult(null);
      }
    }
  };

  const startListening = () => {
    resetTranscript();
    setResult(null);
    SpeechRecognition.startListening({ continuous: false, language: "en-US" });
  };

  useEffect(() => {
    if (listening) {
      // Đánh dấu là chúng ta *đang* nghe
      wasListeningRef.current = true;
    }

    // Kiểm tra nếu:
    // 1. Vừa mới dừng nghe (listening: false)
    // 2. Và trước đó chúng ta *đã* nghe (wasListeningRef: true)
    // 3. Và component cha không đang check (isChecking: false)
    if (!listening && wasListeningRef.current && !isChecking) {
      console.log("Trình duyệt tự động dừng, bắt đầu check...");
      handleCheck();
      wasListeningRef.current = false; // Đặt lại ref
    }
  }, [listening, isChecking]); // Chạy lại khi `listening` hoặc `isChecking` thay đổi

  const clickableSentence = useMemo(() => {
    return sentence.split(/(\s+)/g).map((part: string, index: number) => {
      if (part.trim() === "") return <span key={index}>{part}</span>;
      return <ClickToSpeak key={index} word={part} />;
    });
  }, [sentence]);

  if (!isClient)
    return <div className="text-center p-6 text-gray-500">Đang tải...</div>;
  if (!browserSupports)
    return <div className="text-center p-6 text-red-500">...</div>;

  return (
    <div className="space-y-4 text-center">
      <h2 className="text-lg font-semibold">{exercise.question}</h2>

      <div className="flex items-center justify-center gap-2 bg-gray-50 p-4 rounded-lg">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={speak}
          className="p-2 text-blue-500 hover:bg-blue-100 rounded-full cursor-pointer"
        >
          <Volume2 className="w-6 h-6" />
        </motion.button>
        <p className="text-3xl font-bold text-blue-600 leading-relaxed">
          {clickableSentence}
        </p>
      </div>
      <p className="text-gray-500 italic">{ipa}</p>
      <p className="text-gray-400">"{sentence_vi}"</p>

      <div className="pt-6">
        <motion.button
          onClick={startListening}
          whileTap={{ scale: 0.95 }}
          disabled={listening || isChecking} // Vô hiệu hóa khi đang nghe
          className={`px-8 py-4 rounded-full text-lg font-bold text-white transition-all shadow-lg cursor-pointer ${
            listening
              ? "bg-gray-400 animate-pulse cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {listening ? (
            <span className="flex items-center gap-2">
              <Mic className="animate-ping" /> Đang nghe...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Mic /> Bắt đầu nói
            </span>
          )}
        </motion.button>
      </div>
      <div className="min-h-[100px] p-4 bg-gray-50 rounded-lg shadow-inner">
        <h3 className="text-sm font-bold text-gray-500 mb-2">BẠN ĐÃ NÓI:</h3>
        {result ? (
          result
        ) : (
          <p className="text-gray-700 italic">{transcript || "..."}</p>
        )}
      </div>
    </div>
  );
}
