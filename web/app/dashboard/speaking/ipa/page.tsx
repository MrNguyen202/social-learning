// "use client";

// import { useRef } from "react";
// import IPA_DATA from "@/lib/ipa";

// export default function IPAPage() {
//   return (
//     <main className="p-6 max-w-5xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6 text-center">Bảng phiên âm IPA</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {IPA_DATA.map((item, index) => (
//           <IPAEntry key={index} {...item} />
//         ))}
//       </div>
//     </main>
//   );
// }

// function IPAEntry({
//   symbol,
//   audio,
//   shortDescription,
//   articulation,
//   examples,
// }: {
//   symbol: string;
//   audio?: string | null;
//   shortDescription: string;
//   articulation?: string;
//   examples: { word: string; ipa: string }[];
// }) {
//   const audioRef = useRef<HTMLAudioElement | null>(null);

//   const handlePlay = () => {
//     if (audioRef.current) {
//       audioRef.current.play();
//     }
//   };

//   return (
//     <div className="p-4 border rounded-2xl shadow-sm hover:shadow-md transition bg-white">
//       <div className="flex items-center justify-between mb-2">
//         <span className="text-2xl font-semibold">{symbol}</span>
//         {audio ? (
//           <>
//             <button
//               onClick={handlePlay}
//               className="px-3 py-1 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700"
//             >
//               ▶ Play
//             </button>
//             <audio ref={audioRef} src={audio} preload="auto" />
//           </>
//         ) : (
//           <span className="text-gray-400 text-sm">No audio</span>
//         )}
//       </div>

//       <p className="text-gray-700 text-sm mb-2">{shortDescription}</p>
//       {articulation && (
//         <p className="text-gray-600 italic text-sm mb-2">{articulation}</p>
//       )}

//       <div className="text-sm">
//         <p className="font-medium mb-1">Ví dụ:</p>
//         <ul className="list-disc list-inside text-gray-700">
//           {examples.map((ex, i) => (
//             <li key={i}>
//               <span className="font-semibold">{ex.word}</span>{" "}
//               <span className="text-gray-500">{ex.ipa}</span>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// }

"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Play, Volume2 } from "lucide-react";
import IPA_DATA from "@/lib/ipa";
import { useLanguage } from "@/components/contexts/LanguageContext";

export default function IPAPage() {
  const { t } = useLanguage();

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t("learning.ipaTitle")}
        </h1>
        <p className="text-center text-gray-600">
          {t("learning.ipaDescription")}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {IPA_DATA.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
          >
            <IPAEntry {...item} />
          </motion.div>
        ))}
      </motion.div>
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
    <motion.div
      whileHover={{ y: -4 }}
      className="p-6 border-2 border-gray-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-300 transition-all bg-white"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-4xl font-bold text-blue-600">{symbol}</span>
        {audio ? (
          <>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePlay}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:from-blue-600 hover:to-purple-600 transition-all shadow-md"
            >
              <Play className="w-4 h-4" />
              <Volume2 className="w-4 h-4" />
            </motion.button>
            <audio ref={audioRef} src={audio} preload="auto" />
          </>
        ) : (
          <span className="text-gray-400 text-sm">No audio</span>
        )}
      </div>

      <p className="text-gray-700 text-sm mb-3 font-medium">
        {shortDescription}
      </p>
      {articulation && (
        <p className="text-gray-600 italic text-sm mb-4 bg-gray-50 p-2 rounded-lg">
          {articulation}
        </p>
      )}

      <div className="text-sm">
        <p className="font-semibold mb-2 text-gray-800">Ví dụ:</p>
        <ul className="space-y-1">
          {examples.map((ex, i) => (
            <li
              key={i}
              className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <span className="font-semibold text-gray-800">{ex.word}</span>
              <span className="text-gray-500 text-xs">{ex.ipa}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
