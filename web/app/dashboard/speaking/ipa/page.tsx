"use client";

import { useRef } from "react";
import IPA_DATA from "@/lib/ipa";

export default function IPAPage() {
  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Bảng phiên âm IPA</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {IPA_DATA.map((item, index) => (
          <IPAEntry key={index} {...item} />
        ))}
      </div>
    </main>
  );
}

function IPAEntry({
  symbol,
  audio,
  shortDescription,
  articulation,
  examples,
}: {
  symbol: string;
  audio?: string | null;
  shortDescription: string;
  articulation?: string;
  examples: { word: string; ipa: string }[];
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  return (
    <div className="p-4 border rounded-2xl shadow-sm hover:shadow-md transition bg-white">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl font-semibold">{symbol}</span>
        {audio ? (
          <>
            <button
              onClick={handlePlay}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700"
            >
              ▶ Play
            </button>
            <audio ref={audioRef} src={audio} preload="auto" />
          </>
        ) : (
          <span className="text-gray-400 text-sm">No audio</span>
        )}
      </div>

      <p className="text-gray-700 text-sm mb-2">{shortDescription}</p>
      {articulation && (
        <p className="text-gray-600 italic text-sm mb-2">{articulation}</p>
      )}

      <div className="text-sm">
        <p className="font-medium mb-1">Ví dụ:</p>
        <ul className="list-disc list-inside text-gray-700">
          {examples.map((ex, i) => (
            <li key={i}>
              <span className="font-semibold">{ex.word}</span>{" "}
              <span className="text-gray-500">{ex.ipa}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
