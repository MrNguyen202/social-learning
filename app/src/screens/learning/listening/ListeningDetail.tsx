import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  FileText,
  Snowflake,
  CircleEqual,
  Menu,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { listeningService } from '../../../api/learning/listening/route';
import useAuth from '../../../../hooks/useAuth';
import FloatingMenu from './components/FloatingMenu';
import HistoryModal from './components/HistoryModal';
import ProgressModal from './components/ProgressModal';
import SubmitModal from './components/SubmitModal';
import SubmittingModal from "./components/SubmittingModal";
import { getScoreUserByUserId } from '../../../api/learning/score/route';
import Video from 'react-native-video';
import { hp } from '../../../../helpers/common';

export default function ListeningDetail() {
  const route = useRoute();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const { id } = route.params as { id: string };

  // --- State gốc ---
  const [exercise, setExercise] = useState<any>(null);
  const [score, setScore] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checkResult, setCheckResult] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resSubmit, setResSubmit] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([]);
  const [showTopMenu, setShowTopMenu] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ correct: number, total: number }>({ correct: 0, total: 0 });


  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await listeningService.getListeningExerciseById(id);
        setExercise(data);

        if (user) {
          const scoreData = await getScoreUserByUserId(user?.id)
          setScore(scoreData.data)
          const prog = await listeningService.getUserProgress(user.id, id as string)
          setProgress(prog)
          const hist = await listeningService.getSubmissionHistory(user.id, data.id);
          setHistory(hist);
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Lỗi', 'Không thể tải bài nghe');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user, isSubmitting]);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  }

  if (!exercise) {
    return (
      <Text style={{ textAlign: 'center', marginTop: 40 }}>
        Không tìm thấy bài nghe
      </Text>
    );
  }

  const hiddenMap: Record<number, string> = {};
  exercise.wordHidden?.forEach((wh: any) => {
    hiddenMap[wh.position] = wh.answer;
  });

  const words = exercise.text_content.split(/\s+/);

  const handleCheckAnswers = () => {
    const result: Record<number, boolean> = {}
    Object.keys(hiddenMap).forEach((pos) => {
      const position = parseInt(pos)
      const correct = hiddenMap[position].toLowerCase()
      const userAns = (answers[position] || "").toLowerCase()
      result[position] = userAns === correct
    })
    setCheckResult(result)
  }

  const handleSuggestHint = () => {
    const unansweredPositions = Object.keys(hiddenMap).filter((pos) => !answers[parseInt(pos)]);
    if (unansweredPositions.length === 0) return;

    const randomPos = unansweredPositions[Math.floor(Math.random() * unansweredPositions.length)];
    const correctWord = hiddenMap[parseInt(randomPos)];

    setAnswers(prev => ({ ...prev, [parseInt(randomPos)]: correctWord }));
    setCheckResult(prev => ({ ...prev, [parseInt(randomPos)]: true }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const wordAnswers = exercise.wordHidden.map((wh: any) => ({
      word_hidden_id: wh.id,
      position: wh.position,
      answer_input: answers[wh.position] || "",
      is_correct:
        (answers[wh.position] || "").trim().toLowerCase() ===
        wh.answer.trim().toLowerCase(),
    }));

    try {
      const res = await listeningService.submitListeningResults(
        user?.id,
        exercise?.id,
        wordAnswers
      );

      setResSubmit(res)
      const correctCount = wordAnswers.filter((a: { is_correct: boolean }) => a.is_correct).length;
      setSubmitResult({ correct: correctCount, total: wordAnswers.length });
      const newCheckResult: Record<number, boolean> = {};
      wordAnswers.forEach((ans: { position: number; is_correct: boolean }) => {
        newCheckResult[ans.position] = ans.is_correct;
      });
      setCheckResult(newCheckResult);
      setShowSubmitModal(true);
    } catch (error) {
      console.error("Error submitting results:", error);
      Alert.alert("Lỗi", "Không thể nộp bài. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHistory = (historyItem: any) => {
    if (!historyItem || !historyItem.answers) {
      console.error("Dữ liệu lịch sử không hợp lệ");
      return;
    }
    const wordIdToPositionMap = new Map(
      exercise.wordHidden.map((wh: any) => [wh.id, wh.position])
    );
    const historicalAnswers: Record<number, string> = {};
    const historicalCheckResult: Record<number, boolean> = {};

    for (const ans of historyItem.answers) {
      const position = wordIdToPositionMap.get(ans.word_hidden_id);
      if (typeof position === "number") {
        historicalAnswers[position] = ans.answer_input;
        historicalCheckResult[position] = ans.is_correct;
      }
    }
    setAnswers(historicalAnswers);
    setCheckResult(historicalCheckResult);
    setShowHistoryModal(false)
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#4ECDC4', '#6DD5DB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View className='flex flex-row justify-between items-center'>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className='w-10 h-10 rounded-full bg-[rgba(255,255,255,0.2)] flex items-center justify-center'
            activeOpacity={0.8}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>

          <View className='flex-row items-center justify-end gap-10'>
            <View className='flex flex-row items-center justify-center gap-2'>
              <Text className='text-[#0000FF] text-xl'>{score?.number_snowflake || 0}</Text>
              <Snowflake className="h-5 w-5" color={"#0000FF"} />
            </View>
            <View className='flex flex-row items-center justify-center gap-2'>
              <Text className='text-[#FFFF00] text-xl'>{score?.practice_score || 0}</Text>
              <CircleEqual className="h-5 w-5" color={"#FFFF00"} />
            </View>
          </View>

          {/* Nút menu */}
          <View style={{ position: 'relative' }}>
            <TouchableOpacity
              onPress={() => setShowTopMenu((prev) => !prev)}
              activeOpacity={0.8}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}
            >
              <Menu size={24} color="#fff" />
            </TouchableOpacity>
            {showTopMenu && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setShowTopMenu(false);
                    setShowHistoryModal(true);
                  }}
                >
                  <Text style={styles.dropdownText}>📜 History</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setShowTopMenu(false);
                    setShowProgressModal(true);
                  }}
                >
                  <Text style={styles.dropdownText}>📈 Progress</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {exercise?.audio_url && (
          <Video
            source={{ uri: exercise.audio_url }}
            style={styles.mediaContent}
            controls={true}
            paused={true}
          />
        )}
        {/* ScrollView */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Text with blanks */}
          <View style={styles.textContainer}>
            <View style={styles.textHeader}>
              <FileText size={20} color="#4ECDC4" />
              <Text style={styles.textTitle}>{exercise.title_vi}</Text>
            </View>

            <View style={styles.textContent}>
              {words.map((word: string, idx: number) => {
                const position = idx + 1;
                const correctAnswer = hiddenMap[position];
                const isCorrect = checkResult[position];
                const userAnswer = answers[position] || '';

                if (correctAnswer) {
                  return (
                    <View key={idx} style={styles.inputWrapper}>
                      <TextInput
                        maxLength={correctAnswer.length}
                        placeholder={"_ ".repeat(correctAnswer.length)}
                        className={`text-[16px] border-b-2 text-center bg-white px-1 py-0.5 rounded-sm tracking-widest
                      ${isCorrect === true
                            ? "border-green-500 text-green-500"
                            : isCorrect === false
                              ? "border-red-500 text-red-500"
                              : "border-gray-400 text-blue-700"
                          }`}
                        value={userAnswer}
                        onChangeText={text =>
                          setAnswers({ ...answers, [position]: text })
                        }
                      />
                    </View>
                  );
                } else {
                  return (
                    <Text key={idx} style={styles.wordText}>
                      {word}{' '}
                    </Text>
                  );
                }
              })}
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>


      {/* Floating Menu */}
      <FloatingMenu
        onCheck={handleCheckAnswers}
        onHint={handleSuggestHint}
        onSubmit={handleSubmit}
      />

      {/* Modals */}
      <HistoryModal
        visible={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        history={history}
        handle={handleHistory}
      />

      <ProgressModal
        visible={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        progress={progress}
      />

      <SubmittingModal visible={isSubmitting} />

      <SubmitModal
        visible={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        correctCount={submitResult.correct}
        total={submitResult.total}
        practice_score={resSubmit?.score}
        snowflake={resSubmit?.snowflake}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: -12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 100,
  },
  textContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  textHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
  },
  textTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
    textAlign: 'center',
  },
  textContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    lineHeight: 28,
  },
  inputWrapper: {
    position: 'relative',
    marginHorizontal: 2,
    marginVertical: 4,
  },
  textInput: {
    borderBottomWidth: 2,
    borderColor: '#d1d5db',
    minWidth: 60,
    textAlign: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  wordText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 28,
    marginHorizontal: 2,
  },
  bottomSpacing: {
    height: 32,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 48,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: 150,
    zIndex: 999,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  mediaContent: {
    width: '100%',
    height: hp(24),
  }
});