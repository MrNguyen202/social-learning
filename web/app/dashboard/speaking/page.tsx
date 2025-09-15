"use client";

import React, { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { JSX } from "react/jsx-runtime";

export default function SpeechPage() {
  const sampleSentence = "Refreshments will be provided";
  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const [result, setResult] = useState<JSX.Element | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [browserSupports, setBrowserSupports] = useState(false);

  // Ensure this only runs on client side
  useEffect(() => {
    setIsClient(true);
    setBrowserSupports(SpeechRecognition.browserSupportsSpeechRecognition());
  }, []);

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="max-w-xl mx-auto p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-6"></div>
          <div className="flex gap-3 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Check browser support after client-side hydration
  if (!browserSupports) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <p className="text-red-500 font-semibold">
          ❌ Trình duyệt không hỗ trợ Speech Recognition.
        </p>
      </div>
    );
  }

  const checkPronunciation = () => {
    const sampleWords = sampleSentence.toLowerCase().split(" ");
    const spokenWords = transcript.toLowerCase().split(" ");

    const compared = sampleWords.map((word, i) => {
      if (spokenWords[i] === word) {
        return (
          <span key={i} className="text-green-600 font-semibold mr-2">
            {word}
          </span>
        );
      } else {
        return (
          <span key={i} className="text-red-600 font-semibold mr-2">
            {word}
          </span>
        );
      }
    });

    setResult(<div className="mt-2">{compared}</div>);
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">
        🎯 Nói theo câu mẫu:{" "}
        <span className="text-blue-600">"{sampleSentence}"</span>
      </h2>

      <p className="text-sm text-gray-600">
        Trạng thái:{" "}
        <span
          className={`font-semibold ${
            listening ? "text-green-600" : "text-gray-500"
          }`}
        >
          {listening ? "🎙️ Đang nghe..." : "⏹️ Dừng"}
        </span>
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => {
            resetTranscript();
            SpeechRecognition.startListening({
              continuous: true,
              language: "en-US",
            });
          }}
          className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
        >
          Start
        </button>
        <button
          onClick={SpeechRecognition.stopListening}
          className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
        >
          Stop
        </button>
        <button
          onClick={resetTranscript}
          className="px-4 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500"
        >
          Reset
        </button>
        <button
          onClick={checkPronunciation}
          className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:blue-600"
        >
          Check
        </button>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800">Bạn đã nói:</h3>
        <p className="mt-1 p-2 border rounded bg-gray-50 text-gray-700">
          {transcript || "Chưa có dữ liệu"}
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800">
          Kết quả kiểm tra:
        </h3>
        <div className="mt-1 p-2 border rounded bg-gray-50">{result}</div>
      </div>
    </div>
  );
}
