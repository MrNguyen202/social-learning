import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  PermissionsAndroid,
  StatusBar,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AudioRecord from 'react-native-audio-record';
import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';

import LinearGradient from 'react-native-linear-gradient';
import ConfettiCannon from 'react-native-confetti-cannon';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  List,
  Lock,
  Mic,
  Trophy,
  Volume2,
  X,
  Sparkles,
  Star,
  Square,
} from 'lucide-react-native';
import useAuth from '../../../../../hooks/useAuth';
import { supabase } from '../../../../../lib/supabase';
import { insertOrUpdateVocabularyErrors } from '../../../../api/learning/vocabulary/route';
import {
  generateSpeakingExerciseByAI,
  speechToText,
} from '../../../../api/learning/speaking/route';
import {
  addSkillScore,
  getScoreUserByUserId,
} from '../../../../api/learning/score/route';
import { speakText } from '../../../../../utils/tts';

interface Lesson {
  id: number;
  content: string;
}

const { width, height } = Dimensions.get('window');

export default function LessonSpeakingAI() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [currentSentence, setCurrentSentence] = useState<string>('');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);
  const [completedSentences, setCompletedSentences] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showExerciseList, setShowExerciseList] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(
    new Set(),
  );

  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // State loading khi gọi API
  const [result, setResult] = useState<React.ReactNode | null>(null);
  const [sentenceComplete, setSentenceComplete] = useState(false);
  const [error, setError] = useState('');
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalScore, setTotalScore] = useState<number>(0);

  // Cấu hình ghi âm
  const audioConfig = {
    sampleRate: 16000, // Google Speech thường dùng 16000Hz tốt nhất
    channels: 1,
    bitsPerSample: 16,
    audioSource: 6, // VoiceRecognition source
    wavFile: 'test.wav', // Tên file tạm
  };

  useEffect(() => {
    const setup = async () => {
      await requestPermission();
      // Khởi tạo Audio Recorder
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        AudioRecord.init(audioConfig);
      }
      await loadLessonData();
      setIsLoading(false);
    };
    setup();
  }, []);

  const requestPermission = async () => {
    let granted = false;
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);

        if (
          grants['android.permission.RECORD_AUDIO'] ===
          PermissionsAndroid.RESULTS.GRANTED
        ) {
          granted = true;
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      granted = true; // iOS xử lý qua Info.plist
    }
    setHasPermission(granted);
  };

  const loadLessonData = async () => {
    try {
      const levelSlug = (await AsyncStorage.getItem('levelSlug')) || 'null';
      const topicSlug = (await AsyncStorage.getItem('topicSlug')) || 'null';

      if (levelSlug && topicSlug) {
        const res = await generateSpeakingExerciseByAI(levelSlug, topicSlug);
        setLessons(res.data || []);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải bài học');
    }
  };

  useEffect(() => {
    if (lessons.length > 0) {
      setCurrentSentence(lessons[currentLessonIndex]?.content || '');
      setTranscript('');
      setResult(null);
      setSentenceComplete(false);
    }
  }, [lessons, currentLessonIndex]);

  // LOGIC CHECK KẾT QUẢ
  useEffect(() => {
    if (transcript && !isListening && !isProcessing && !showCelebration) {
      const correct = buildResultAndCheck();

      if (correct) {
        setSentenceComplete(true);
        setCompletedSentences(prev => prev + 1);
        setCompletedLessons(prev => new Set(prev).add(currentLessonIndex));

        setTimeout(() => {
          if (currentLessonIndex < lessons.length - 1) {
            setCurrentLessonIndex(idx => idx + 1);
          } else {
            handleLessonComplete();
          }
        }, 1500);
      } else {
        checkPronunciation();
        // Không tự động reset transcript ngay lập tức để user xem lỗi
      }
    }
  }, [transcript, isListening, isProcessing, showCelebration]);

  const normalize = useCallback(
    (s: string) =>
      s
        .toLowerCase()
        .replace(/[.,!?;:\\"'()[\]{}]/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
    [],
  );

  const updateMasteryOnSuccess = useCallback(
    async (userId: string, word: string) => {
      if (word && isNaN(Number(word))) {
        try {
          await supabase.rpc('update_mastery_on_success', {
            user_id: userId,
            word_input: word,
          });
        } catch (error) {
          console.error('Error updating mastery:', error);
        }
      }
    },
    [],
  );

  const buildResultAndCheck = (): boolean => {
    if (!currentSentence) return false;

    const sample = normalize(currentSentence);
    const spoken = normalize(transcript || '');
    const sampleWords = sample.split(' ');
    const spokenWords = spoken.split(' ');

    const compared = sampleWords.map((word, i) => {
      const spokenWord = spokenWords[i];
      const isCorrect = spokenWord === word;

      if (isCorrect && user) {
        updateMasteryOnSuccess(user.id, word);
      }

      // - Đúng: hiện từ {word} màu xanh
      // - Sai: hiện từ {spokenWord || '___'} màu đỏ
      return (
        <Text
          key={i}
          style={[
            styles.resultWord,
            isCorrect ? styles.resultWordCorrect : styles.resultWordIncorrect,
          ]}
        >
          {isCorrect ? word : spokenWord || '___'}
        </Text>
      );
    });

    setResult(<View style={styles.resultContainer}>{compared}</View>);

    const isCorrect =
      sampleWords.length === spokenWords.length &&
      sampleWords.every((w, i) => spokenWords[i] === w);

    return isCorrect;
  };

  const checkPronunciation = () => {
    if (!currentSentence || !user) return;

    // Dùng hàm normalize đã chuẩn hóa
    const cleanSample = normalize(currentSentence);
    const cleanTranscript = normalize(transcript);

    const sampleWords = cleanSample.split(' ');
    const spokenWords = cleanTranscript.split(' ');

    sampleWords.forEach((word, i) => {
      if (spokenWords[i] !== word) {
        // Chỉ lưu lỗi nếu từ đó tồn tại và không phải là số
        if (word && isNaN(Number(word))) {
          insertOrUpdateVocabularyErrors({
            userId: user.id,
            vocabData: {
              word: word,
              error_type: 'pronunciation',
              skill: 'speaking',
            },
          });
        }
      }
    });
  };

  const handleLessonComplete = async () => {
    setShowCelebration(true);
    if (user) {
      try {
        await addSkillScore(user.id, 'speaking', 10);
        // Có thể lấy totalScore và hiển thị nếu muốn
        const res = await getScoreUserByUserId(user.id);
        setTotalScore(res?.data?.practice_score ?? 0);
      } catch (error) {
        console.error('Error adding score:', error);
      }
    }
  };

  // --- HÀM BẮT ĐẦU GHI ÂM ---
  const startRecording = async () => {
    if (!hasPermission) {
      Alert.alert('Lỗi', 'Cần cấp quyền microphone');
      return;
    }
    setError('');
    setResult(null);
    setTranscript('');

    try {
      setIsListening(true);
      AudioRecord.start(); // Bắt đầu ghi file
    } catch (e) {
      console.error('Error starting audio record:', e);
      setError('Không thể bắt đầu ghi âm');
      setIsListening(false);
    }
  };

  // --- HÀM DỪNG GHI ÂM VÀ GỬI API ---
  const stopRecording = async () => {
    if (!isListening) return;

    setIsListening(false);
    setIsProcessing(true); // Bắt đầu loading

    try {
      // 1. Dừng ghi âm và lấy đường dẫn file
      const audioFile = await AudioRecord.stop();

      // 2. Đọc file và chuyển sang Base64
      const base64String = await RNFS.readFile(audioFile, 'base64');

      // 3. Gửi lên Server (Google Cloud API)
      const data = await speechToText(base64String);

      // 4. Xử lý kết quả trả về
      if (data && data.data && data.data.transcript) {
        setTranscript(data.data.transcript);
      } else {
        setTranscript('');
        setError('Không nhận diện được giọng nói.');
      }
    } catch (e) {
      console.error('Error processing audio:', e);
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setIsProcessing(false);
    }
  };

  const speak = useCallback((text: string) => {
    speakText(text);
  }, []);

  const jumpToLesson = (index: number) => {
    if (index <= completedSentences) {
      setCurrentLessonIndex(index);
      setShowExerciseList(false);
    }
  };

  const progress =
    lessons.length > 0 ? (completedSentences / lessons.length) * 100 : 0;

  const clickableSentence = useMemo(() => {
    if (!currentSentence)
      return <Text style={styles.sentenceText}>Đang tải...</Text>;

    return currentSentence.split(/(\s+)/g).map((part, index) => {
      if (part.trim() === '')
        return (
          <Text key={index} style={styles.sentenceText}>
            {part}
          </Text>
        );
      return (
        <TouchableOpacity key={index} onPress={() => speak(part)}>
          <Text style={styles.sentenceText}>{part}</Text>
        </TouchableOpacity>
      );
    });
  }, [currentSentence, speak]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Đang tải bài học...</Text>
      </SafeAreaView>
    );
  }

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>
          Cần cấp quyền microphone để sử dụng tính năng này
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <ArrowLeft size={24} color="#374151" />
          <Text style={styles.headerButtonText}>Quay lại</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowExerciseList(true)}
          style={[styles.headerButton, styles.listButton]}
        >
          <List size={20} color="#fff" />
          <Text style={[styles.headerButtonText, { color: '#fff' }]}>
            Danh sách
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>
              Tiến độ: {completedSentences}/{lessons.length}
            </Text>
            <Text style={[styles.progressText, { color: '#8b5cf6' }]}>
              {Math.round(progress)}%
            </Text>
          </View>
          <View style={styles.progressBarBackground}>
            <LinearGradient
              colors={['#8b5cf6', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: '100%', width: `${progress}%` }}
            />
          </View>
        </View>

        {/* Main Lesson Card */}
        <View style={styles.cardContainer}>
          <LinearGradient
            colors={['#3b82f6', '#8b5cf6', '#ec4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mainCard}
          >
            {sentenceComplete && (
              <View style={styles.starBadge}>
                <Star size={32} color="#fff" fill="#fff" />
              </View>
            )}

            <View style={styles.cardHeader}>
              <Sparkles size={28} color="#fff" />
              <Text style={styles.cardTitle}>Câu {currentLessonIndex + 1}</Text>
            </View>

            {/* TỐI ƯU: Clickable Sentence */}
            <View style={styles.sentenceBox}>
              <View style={styles.sentenceWrap}>{clickableSentence}</View>
            </View>

            <TouchableOpacity
              onPress={() => currentSentence && speak(currentSentence)}
              style={styles.speakButton}
            >
              <Volume2 size={24} color="#fff" />
              <Text style={styles.speakButtonText}>Nghe mẫu</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={styles.controlsSection}>
          <TouchableOpacity
            // Nếu đang nghe -> Stop, nếu chưa -> Start
            onPress={isListening ? stopRecording : startRecording}
            disabled={isProcessing} // Disable khi đang gửi API
            style={[
              styles.micButton,
              isProcessing
                ? styles.micButtonProcessing
                : isListening
                ? styles.micButtonListening
                : styles.micButtonActive,
            ]}
          >
            {isProcessing ? (
              <ActivityIndicator
                color="#fff"
                size="small"
                style={{ marginRight: 8 }}
              />
            ) : isListening ? (
              <Square size={24} color="#fff" fill="#fff" />
            ) : (
              <Mic size={24} color="#fff" />
            )}

            <Text style={styles.micButtonText}>
              {isProcessing
                ? 'Đang xử lý...'
                : isListening
                ? 'Dừng nói'
                : 'Bắt đầu'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        <View style={styles.resultsSection}>
          <View>
            <Text style={styles.resultTitle}>Lời nói của bạn:</Text>
            <View style={styles.resultDisplayBox}>
              <Text style={styles.transcriptText}>
                {transcript || 'Chưa có dữ liệu...'}
              </Text>
            </View>
          </View>

          <View>
            <Text style={styles.resultTitle}>Kết quả:</Text>
            <View style={styles.resultDisplayBox}>
              {result || (
                <Text style={styles.transcriptPlaceholder}>
                  Chưa có kết quả...
                </Text>
              )}
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      </ScrollView>

      {/* Exercise List Modal */}
      <Modal
        isVisible={showExerciseList}
        onBackdropPress={() => setShowExerciseList(false)}
        style={styles.modal}
        backdropOpacity={0.5}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <List size={24} color="#f59e0b" />
              <Text style={styles.modalTitle}>Danh sách bài</Text>
            </View>
            <TouchableOpacity onPress={() => setShowExerciseList(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollView}>
            {lessons.map((lesson, index) => {
              const isCompleted = completedLessons.has(index);
              const isCurrent = index === currentLessonIndex;
              const isLocked = index > completedSentences;

              return (
                <TouchableOpacity
                  key={lesson.id}
                  onPress={() => jumpToLesson(index)}
                  disabled={isLocked}
                  style={[
                    styles.lessonItem,
                    isCurrent && styles.lessonItemCurrent,
                    isCompleted && styles.lessonItemCompleted,
                    isLocked && styles.lessonItemLocked,
                  ]}
                  activeOpacity={isLocked ? 1 : 0.7}
                >
                  <View
                    style={[
                      styles.lessonIconContainer,
                      isCurrent && styles.lessonIconCurrent,
                      isCompleted && styles.lessonIconCompleted,
                      isLocked && styles.lessonIconLocked,
                    ]}
                  >
                    {isCompleted ? (
                      <Check size={20} color="#fff" />
                    ) : isLocked ? (
                      <Lock size={16} color="#6b7280" />
                    ) : (
                      <Text
                        style={[
                          styles.lessonNumber,
                          isCurrent && styles.lessonNumberCurrent,
                        ]}
                      >
                        {index + 1}
                      </Text>
                    )}
                  </View>
                  <View style={styles.lessonTextContainer}>
                    <Text
                      style={[
                        styles.lessonText,
                        isCurrent && styles.lessonTextCurrent,
                        isCompleted && styles.lessonTextCompleted,
                        isLocked && styles.lessonTextLocked,
                      ]}
                    >
                      Câu {index + 1}
                    </Text>
                  </View>
                  {isCurrent && <ChevronRight size={24} color="#fff" />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>

      {/* Celebration Modal */}
      <Modal
        isVisible={showCelebration}
        onBackdropPress={() => setShowCelebration(false)}
        style={styles.centerModal}
        backdropOpacity={0.7}
      >
        <LinearGradient
          colors={['#f59e0b', '#ef4444']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.celebrationModal}
        >
          <View style={styles.celebrationIcon}>
            <Trophy size={40} color="#f59e0b" fill="#fff" />
          </View>
          <Text style={styles.celebrationTitle}>Chúc mừng!</Text>
          <Text style={styles.celebrationText}>
            Bạn đã hoàn thành tất cả các câu!
          </Text>
          {/* Show điểm user */}
          <Text style={styles.celebrationScore}>
            Điểm hiện tại của bạn: {totalScore} điểm
          </Text>
          <TouchableOpacity
            onPress={() => {
              setShowCelebration(false);
              navigation.goBack();
            }}
            style={styles.celebrationButton}
          >
            <Text style={styles.celebrationButtonText}>Thử bài khác</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Modal>

      {showCelebration && (
        <ConfettiCannon
          count={200}
          origin={{ x: width / 2, y: -10 }}
          fallSpeed={3000}
        />
      )}
    </SafeAreaView>
  );
}

// --- StyleSheet ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb', // Match scrollview bg
  },
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerButtonText: {
    marginLeft: 8,
    fontWeight: '600',
    color: '#374151',
  },
  listButton: {
    backgroundColor: '#f59e0b',
  },
  progressSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  cardContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  mainCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  starBadge: {
    position: 'absolute',
    top: -16,
    right: -16,
    backgroundColor: '#f59e0b',
    borderRadius: 50,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  sentenceBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    minHeight: 100,
    justifyContent: 'center',
  },
  sentenceWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  sentenceText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 32,
  },
  speakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  speakButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  controlsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  micButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 99,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  micButtonActive: {
    backgroundColor: '#10B981',
  },
  micButtonListening: {
    backgroundColor: '#9CA3AF', // Màu xám khi đang nghe
  },
  micButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  micButtonProcessing: { backgroundColor: '#9CA3AF' },
  resultsSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  resultDisplayBox: {
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#fff',
    minHeight: 60,
    justifyContent: 'center',
  },
  transcriptText: {
    color: '#374151',
    fontSize: 16,
    lineHeight: 24,
  },
  transcriptPlaceholder: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  resultContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  resultWord: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
    lineHeight: 24,
  },
  resultWordCorrect: {
    color: '#10B981',
  },
  resultWordIncorrect: {
    color: '#EF4444',
  },
  // Modal Styles
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  centerModal: {
    margin: 16,
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalScrollView: {
    padding: 16,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  lessonItemCurrent: {
    borderColor: '#f59e0b',
    backgroundColor: '#f59e0b',
  },
  lessonItemCompleted: {
    borderColor: '#10b981',
    backgroundColor: '#d1fae5',
  },
  lessonItemLocked: {
    borderColor: '#d1d5db',
    backgroundColor: '#f3f4f6',
    opacity: 0.6,
  },
  lessonIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonIconCurrent: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  lessonIconCompleted: {
    backgroundColor: '#10b981',
  },
  lessonIconLocked: {
    backgroundColor: '#d1d5db',
  },
  lessonNumber: {
    fontWeight: 'bold',
    color: '#c2410c',
    fontSize: 16,
  },
  lessonNumberCurrent: {
    color: '#fff',
  },
  lessonTextContainer: {
    flex: 1,
  },
  lessonText: {
    fontWeight: '600',
    color: '#374151',
  },
  lessonTextCurrent: {
    color: '#fff',
  },
  lessonTextCompleted: {
    color: '#065f46',
  },
  lessonTextLocked: {
    color: '#6b7280',
  },
  // Celebration Modal
  celebrationModal: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  celebrationIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#fff',
  },
  celebrationText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 24,
  },
  celebrationScore: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 24,
  },
  celebrationButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  celebrationButtonText: {
    color: '#8b5cf6',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
