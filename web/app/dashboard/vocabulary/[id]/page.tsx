"use client";

import { getPersonalVocabById } from "@/app/apiClient/learning/vocabulary/vocabulary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Volume2,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Link2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VocabularyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [personalVocab, setPersonalVocab] = useState<any>(null);
  const [relatedVocab, setRelatedVocab] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      const res = await getPersonalVocabById({ personalVocabId: id });
      if (res.success) {
        setPersonalVocab(res.data);
        setRelatedVocab(res.data.related_words || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const speakWord = (text: string) => {
    if (!window.speechSynthesis) {
      console.warn("Speech Synthesis not supported");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    // Lấy tất cả voice tiếng Anh
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter((v) => v.lang.startsWith("en-US"));

    // Random voice nếu có
    if (englishVoices.length > 0) {
      const randomVoice =
        englishVoices[Math.floor(Math.random() * englishVoices.length)];
      utterance.voice = randomVoice;
      utterance.lang = randomVoice.lang;
    }

    window.speechSynthesis.cancel(); // dừng voice cũ
    window.speechSynthesis.speak(utterance);
  };

  const getMasteryColor = (score: number) => {
    if (score >= 70) return "from-green-500 to-emerald-500";
    if (score >= 40) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  const getMasteryLabel = (score: number) => {
    if (score >= 70) return "Thành thạo";
    if (score >= 40) return "Trung bình";
    return "Cần luyện tập";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="h-12 w-32 animate-pulse rounded-lg bg-white/50" />
          <div className="h-64 animate-pulse rounded-2xl bg-white/50" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-48 animate-pulse rounded-2xl bg-white/50" />
            <div className="h-48 animate-pulse rounded-2xl bg-white/50" />
          </div>
        </div>
      </div>
    );
  }

  const vocab = relatedVocab[0];

  if (!personalVocab) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-pink-50">
        <Card className="mx-4 max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-orange-500" />
            <h2 className="mb-2 text-xl font-semibold">
              Không tìm thấy từ vựng
            </h2>
            <p className="mb-4 text-muted-foreground">
              Từ vựng này không tồn tại hoặc đã bị xóa.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getWords = relatedVocab.map((v) => v.word);

  return (
    <div className="flex-1 px-6 py-6 pb-36 sm:ml-10">
      {/* Decorative Background Elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-orange-200/30 to-pink-200/30 blur-3xl"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gradient-to-br from-pink-200/30 to-orange-200/30 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-6">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden border-0 bg-white/80 shadow-xl backdrop-blur-sm">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-orange-100/50 to-transparent" />
            <CardContent className="relative p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                {/* Word Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 shadow-lg">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h1 className="mb-2 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                        {personalVocab.word}
                      </h1>

                      {/* ipa */}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-lg">{vocab.ipa}</span>
                        <span className="inline-block rounded-full bg-gradient-to-r from-orange-100 to-pink-100 px-3 py-1 text-sm font-medium text-orange-700">
                          {vocab.word_type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Translation */}
                  <div className="rounded-xl bg-gradient-to-r from-orange-50 to-pink-50 p-4">
                    <p className="text-lg font-medium text-gray-700">
                      {vocab.word_vi}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4 md:flex-col">
                  {/* Mastery Score */}
                  <div className="flex-1 rounded-2xl bg-gradient-to-br from-white to-gray-50 p-4 shadow-lg md:w-48">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Độ thành thạo
                      </span>
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="relative mb-2 h-2 overflow-hidden rounded-full bg-gray-200">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${getMasteryColor(
                          personalVocab.mastery_score
                        )}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${personalVocab.mastery_score}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-2xl font-bold bg-gradient-to-r ${getMasteryColor(
                          personalVocab.mastery_score
                        )} bg-clip-text text-transparent`}
                      >
                        {personalVocab.mastery_score}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {getMasteryLabel(personalVocab.mastery_score)}
                      </span>
                    </div>
                  </div>

                  {/* Error Count */}
                  <div className="flex-1 rounded-2xl bg-gradient-to-br from-red-50 to-pink-50 p-4 shadow-lg md:w-48">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Tổng số lần sai
                      </span>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-3xl font-bold text-transparent">
                        {personalVocab.error_count}
                      </span>
                      <span className="text-xs text-gray-500">lần</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="md:mt-[-35px] mt-6 flex flex-wrap gap-3">
                <Button
                  onClick={() => {
                    sessionStorage.setItem(
                      "practiceWords",
                      JSON.stringify(getWords)
                    );
                    router.push("/dashboard/vocabulary/wordPracticesAI");
                  }}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 cursor-pointer"
                >
                  Luyện tập ngay
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard/vocabulary/ipa")}
                  className="border-orange-200 hover:bg-orange-50 bg-transparent cursor-pointer"
                >
                  Bảng IPA
                </Button>
                <Button
                  variant="outline"
                  onClick={() => speakWord(personalVocab.word)}
                  className="border-orange-200 hover:bg-orange-50 bg-transparent cursor-pointer"
                >
                  <Volume2 className="mr-2 h-4 w-4" />
                  Phát âm
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Related Words Section */}
        {relatedVocab.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  <Link2 className="h-5 w-5 text-orange-500" />
                  Từ liên quan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {relatedVocab.map((word, index) => (
                    <motion.div
                      key={word.id || index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="group cursor-pointer rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm transition-all hover:border-orange-300 hover:shadow-md"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                            {word.word} :{" "}
                            <span className="mb-2 text-lg font-medium text-gray-700">
                              {word.word_vi}
                            </span>
                          </h3>
                          {word.ipa && (
                            <p className="text-sm text-gray-500">{word.ipa}</p>
                          )}
                          {word.word_type && (
                            <span className="mt-1 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
                              {word.word_type}
                            </span>
                          )}
                        </div>
                        <Volume2
                          onClick={(e) => {
                            e.stopPropagation();
                            speakWord(word.word);
                          }}
                          className="h-6 w-6 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100"
                        />
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="rounded-lg bg-orange-50/50 p-2">
                          <p className="text-gray-700">{word.meaning}</p>
                          <p className="mt-1 text-gray-600 italic">
                            {word.meaning_vi}
                          </p>
                        </div>
                        <div className="rounded-lg bg-pink-50/50 p-2">
                          <p className="text-gray-700">{word.example}</p>
                          <p className="mt-1 text-gray-600 italic">
                            {word.example_vi}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
