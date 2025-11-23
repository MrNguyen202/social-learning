"use client";

import useAuth from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  TrendingUp,
  AlertCircle,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getListPersonalVocabByUserIdAndCreated } from "@/app/apiClient/learning/vocabulary/vocabulary";
import { useLanguage } from "@/components/contexts/LanguageContext";
import OverviewRangeView from "./components/RangeView";
import TopicsTab from "./components/TopicsTab";
import MasteredTab from "./components/MasteredTab";

export default function VocabularyPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [listPersonalVocab, setListPersonalVocab] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (loading || !user?.id) return;
    if (isInitialLoad.current) {
      loadVocab();
      isInitialLoad.current = false;
    }
  }, [loading, user?.id]);

  const loadVocab = async () => {
    setLoading(true);
    if (!user) return;
    const res = await getListPersonalVocabByUserIdAndCreated({
      userId: user.id,
    });
    if (res.success) setListPersonalVocab(res.data);
    setLoading(false);
  };

  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const speakWord = (text: string) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter((v) => v.lang.startsWith("en-US"));
    if (englishVoices.length > 0)
      utterance.voice =
        englishVoices[Math.floor(Math.random() * englishVoices.length)];
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // Stats Calculation
  const totalWords = listPersonalVocab.length;
  const averageMastery =
    totalWords > 0
      ? Math.round(
          listPersonalVocab.reduce((sum, v) => sum + v.mastery_score, 0) /
            totalWords
        )
      : 0;
  const lowCount = listPersonalVocab.filter(
    (v) => v.mastery_score <= 29
  ).length;
  const midCount = listPersonalVocab.filter(
    (v) => v.mastery_score >= 30 && v.mastery_score <= 69
  ).length;
  const highCount = listPersonalVocab.filter(
    (v) => v.mastery_score >= 70
  ).length;

  return (
    <div className="mx-auto w-full max-w-md pt-4 pb-8 sm:max-w-2xl lg:max-w-3xl xl:max-w-6xl pr-5 sm:pl-10">
      {/* Background Decorative */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-orange-300/30 to-pink-300/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-30 -left-20 w-96 h-96 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-4 -translate-x-1/2 animate-bounce"
          >
            <BookOpen className="w-8 h-8 text-orange-500" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent tracking-tight mb-2">
            {t("learning.myVocabulary")}
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            {t("learning.myVocabularyDescription")}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard
            title={t("learning.totalWords")}
            value={totalWords}
            icon={Layers}
            color="text-blue-600"
            bg="bg-blue-50"
            border="border-blue-100"
            delay={0.1}
          />
          <StatCard
            title={t("learning.averageMastery")}
            value={`${averageMastery}%`}
            icon={TrendingUp}
            color="text-green-600"
            bg="bg-green-50"
            border="border-green-100"
            delay={0.2}
          />
          <StatCard
            title={t("learning.needReview")}
            value={lowCount}
            icon={AlertCircle}
            color="text-orange-600"
            bg="bg-orange-50"
            border="border-orange-100"
            delay={0.3}
          />
        </div>

        {/* Tabs Navigation */}
        <Tabs
          defaultValue="overview"
          className="space-y-8"
          onValueChange={(v) => {
            setActiveTab(v);
            if (v !== "topics") setSelectedTopic(null);
          }}
        >
          <div className="flex justify-center">
            <TabsList className="bg-white p-1 rounded-full border border-slate-200 shadow-sm">
              {["overview", "mastered", "topics"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-full px-6 py-3 text-md font-bold data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all"
                >
                  {t(`learning.${tab === "topics" ? "byTopic" : tab}`)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="overview" className="mt-0">
                {selectedTopic ? (
                  <OverviewRangeView
                    t={t}
                    topicKey={selectedTopic}
                    listPersonalVocab={listPersonalVocab}
                    speakWord={speakWord}
                    onBack={() => setSelectedTopic(null)}
                    onSelectWord={(id) =>
                      window.open(`/dashboard/vocabulary/${id}`, "_blank")
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <CategoryCard
                      title={t("learning.urgentReview")}
                      count={lowCount}
                      icon={AlertCircle}
                      color="red"
                      onClick={() => setSelectedTopic("low")}
                      t={t}
                    />
                    <CategoryCard
                      title={t("learning.inProgress")}
                      count={midCount}
                      icon={TrendingUp}
                      color="yellow"
                      onClick={() => setSelectedTopic("mid")}
                      t={t}
                    />
                    <CategoryCard
                      title={t("learning.wellMastered")}
                      count={highCount}
                      icon={CheckCircle2}
                      color="green"
                      onClick={() => setSelectedTopic("high")}
                      t={t}
                    />
                  </div>
                )}
              </TabsContent>
              <TabsContent value="mastered" className="mt-0">
                <MasteredTab
                  user={user}
                  listPersonalVocab={listPersonalVocab}
                  loading={loading}
                  t={t}
                  speakWord={speakWord}
                  renderLoadingSkeleton={() => null}
                  renderEmptyState={() => <EmptyState t={t} />}
                />
              </TabsContent>
              <TabsContent value="topics" className="mt-0">
                <TopicsTab
                  loading={loading}
                  user={user}
                  t={t}
                  renderLoadingSkeleton={() => null}
                  renderEmptyState={() => <EmptyState t={t} />}
                />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  bg,
  border,
  delay,
}: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`bg-white p-6 rounded-2xl border-2 ${border} shadow-sm flex items-center justify-between hover:shadow-md transition-shadow`}
  >
    <div>
      <p className="text-slate-500 font-medium text-sm mb-1">{title}</p>
      <h3 className="text-3xl font-black text-slate-800">{value}</h3>
    </div>
    <div className={`p-3 rounded-xl ${bg} ${color}`}>
      <Icon size={24} />
    </div>
  </motion.div>
);

const CategoryCard = ({ title, count, icon: Icon, color, onClick, t }: any) => {
  const colors: any = {
    red: "bg-red-50 border-red-100 text-red-700 hover:border-red-300 hover:shadow-red-100",
    yellow:
      "bg-amber-50 border-amber-100 text-amber-700 hover:border-amber-300 hover:shadow-amber-100",
    green:
      "bg-emerald-50 border-emerald-100 text-emerald-700 hover:border-emerald-300 hover:shadow-emerald-100",
  };
  const iconColors: any = {
    red: "text-red-500",
    yellow: "text-amber-500",
    green: "text-emerald-500",
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group w-full p-6 rounded-3xl border-2 text-left transition-all shadow-sm hover:shadow-lg ${colors[color]}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-3 bg-white rounded-2xl shadow-sm ${iconColors[color]}`}
        >
          <Icon size={24} />
        </div>
        <span className="text-4xl font-black opacity-90">{count}</span>
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-sm opacity-75 mt-1 font-medium">
        {t("learning.tapToViewDetails")}
      </p>
    </motion.button>
  );
};

const EmptyState = ({ t }: any) => (
  <div className="text-center py-12">
    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <BookOpen className="text-slate-400" size={32} />
    </div>
    <h3 className="text-lg font-bold text-slate-700">
      {t("learning.noVocabulary")}
    </h3>
    <p className="text-slate-500">{t("learning.startLearning")}</p>
  </div>
);
