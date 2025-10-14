import React, { useEffect, useState, useRef, useCallback } from 'react';
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
} from 'react-native';
import Voice from '@react-native-voice/voice';
import LinearGradient from 'react-native-linear-gradient';
import ConfettiCannon from 'react-native-confetti-cannon';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { JSX } from 'react/jsx-runtime';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Flower,
  List,
  Lock,
  Mic,
  MicOff,
  Pen,
  RefreshCcwDot,
  Star,
  Volume,
  X,
} from 'lucide-react-native';
import useAuth from '../../../../../hooks/useAuth';
import { supabase } from '../../../../../lib/supabase';
import { insertOrUpdateVocabularyErrors } from '../../../../api/learning/vocabulary/route';
import {
  generateSpeakingExerciseByAI,
  getSpeakingByTopicAndLevel,
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
const isSmallDevice = height < 700;

export default function LessonSpeakingAI() {
  const navigation = useNavigation();
  const { user } = useAuth();

  // States
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
  const [result, setResult] = useState<JSX.Element | null>(null);
  const [sentenceComplete, setSentenceComplete] = useState(false);
  const [error, setError] = useState('');
  const [hasPermission, setHasPermission] = useState(false);

  const finishDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckedTranscriptRef = useRef<string>('');
  const ttsRef = useRef<any>(null);

  // Voice recognition setup
  useEffect(() => {
    Voice.removeAllListeners();

    Voice.onSpeechStart = () => {
      setError('');
      setIsListening(true);
    };

    Voice.onSpeechEnd = () => {
      setIsListening(false);
    };

    Voice.onSpeechResults = event => {
      if (event.value && event.value.length > 0) {
        setTranscript(event.value[0]);
      }
    };

    Voice.onSpeechPartialResults = event => {
      if (event.value && event.value.length > 0) {
        setTranscript(event.value[0]);
      }
    };

    Voice.onSpeechError = e => {
      setIsListening(false);
      setError('Lỗi nhận diện giọng nói. Vui lòng thử lại.');
    };

    requestPermission();
    loadLessonData();

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Quyền sử dụng microphone',
          message: 'Ứng dụng cần quyền microphone để nhận diện giọng nói.',
          buttonNeutral: 'Hỏi lại sau',
          buttonNegative: 'Hủy',
          buttonPositive: 'Đồng ý',
        },
      );
      setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
    } else {
      setHasPermission(true);
    }
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

  // Speech processing
  useEffect(() => {
    if (!transcript || transcript === lastCheckedTranscriptRef.current) return;

    if (finishDebounceRef.current) {
      clearTimeout(finishDebounceRef.current);
    }

    finishDebounceRef.current = setTimeout(() => {
      lastCheckedTranscriptRef.current = transcript;
      const isCorrect = buildResultAndCheck();

      if (isCorrect) {
        stopListening();
        setSentenceComplete(true);
        setCompletedSentences(prev => prev + 1);
        setCompletedLessons(prev => new Set([...prev, currentLessonIndex]));

        setTimeout(() => {
          if (currentLessonIndex < lessons.length - 1) {
            setCurrentLessonIndex(idx => idx + 1);
          } else {
            handleLessonComplete();
          }
        }, 1500);
      } else {
        stopListening();
        setTimeout(() => {
          checkPronunciation();
        }, 700);
      }
    }, 2000);

    return () => {
      if (finishDebounceRef.current) {
        clearTimeout(finishDebounceRef.current);
      }
    };
  }, [transcript]);

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[.,!?;:\\"'()[\]{}]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const buildResultAndCheck = (): boolean => {
    if (!currentSentence) return false;

    const sample = normalize(currentSentence);
    const spoken = normalize(transcript || '');
    const sampleWords = sample.split(' ');
    const spokenWords = spoken.split(' ');

    const compared = sampleWords.map((word, i) => {
      const isCorrect = spokenWords[i] === word;
      if (isCorrect && user) {
        updateMasteryOnSuccess(user.id, word);
      }

      return (
        <Text
          key={i}
          style={{
            color: isCorrect ? '#10B981' : '#EF4444',
            fontWeight: '600',
            marginRight: 4,
          }}
        >
          {spokenWords[i] || '___'}
        </Text>
      );
    });

    setResult(
      <View style={{ flexWrap: 'wrap', flexDirection: 'row', marginTop: 8 }}>
        {compared}
      </View>,
    );

    const isCorrect =
      sampleWords.length === spokenWords.length &&
      sampleWords.every((w, i) => spokenWords[i] === w);

    return isCorrect;
  };

  const updateMasteryOnSuccess = async (userId: string, word: string) => {
    try {
      await supabase.rpc('update_mastery_on_success', {
        user_id: userId,
        word_input: word,
      });
    } catch (error) {
      console.error('Error updating mastery:', error);
    }
  };

  const checkPronunciation = () => {
    if (!currentSentence || !user) return;

    const cleanSample = currentSentence
      .toLowerCase()
      .replace(/[.,!?]/g, '')
      .trim();
    const cleanTranscript = transcript
      .toLowerCase()
      .replace(/[.,!?]/g, '')
      .trim();

    const sampleWords = cleanSample.split(' ');
    const spokenWords = cleanTranscript.split(' ');

    const wrongPairs = sampleWords
      .map((word, i) => ({
        correct: word,
        spoken: spokenWords[i] || '(bỏ qua)',
      }))
      .filter((_, i) => spokenWords[i] !== sampleWords[i]);

    wrongPairs.forEach(({ correct }) => {
      insertOrUpdateVocabularyErrors({
        userId: user.id,
        vocabData: {
          word: correct,
          error_type: 'pronunciation',
          skill: 'speaking',
        },
      });
    });
  };

  const handleLessonComplete = async () => {
    setShowCelebration(true);
    if (user) {
      try {
        await addSkillScore(user.id, 'speaking', 10);
        const res = await getScoreUserByUserId(user.id);
        const totalScore = res?.data?.practice_score ?? 0;
        // Update UI with score if needed
      } catch (error) {
        console.error('Error adding score:', error);
      }
    }
  };

  // Voice controls
  const startListening = async () => {
    if (!hasPermission) {
      Alert.alert('Lỗi', 'Cần cấp quyền microphone');
      return;
    }

    try {
      setTranscript('');
      setError('');
      await Voice.stop();
      await Voice.start('en-US');
      setIsListening(true);
    } catch (e) {
      console.error('Error starting voice:', e);
      setError('Không thể bắt đầu nhận diện giọng nói');
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.error('Error stopping voice:', e);
    }
  };

  const resetTranscript = () => {
    setTranscript('');
    setResult(null);
  };

  // TTS Nghe mẫu
  const speak = useCallback((text: string) => {
    speakText(text);
  }, []);

  const progress =
    lessons.length > 0 ? (completedSentences / lessons.length) * 100 : 0;

  const jumpToLesson = (index: number) => {
    if (index <= completedSentences) {
      setCurrentLessonIndex(index);
      setShowExerciseList(false);
    }
  };

  if (!hasPermission) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fef3c7',
        }}
      >
        <Text style={{ color: '#dc2626', fontSize: 16, textAlign: 'center' }}>
          Cần cấp quyền microphone để sử dụng tính năng này
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          style={{
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
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
            }}
          >
            <ArrowLeft size={24} color="#374151" />
            <Text
              style={{ marginLeft: 8, fontWeight: '600', color: '#374151' }}
            >
              Quay lại
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowExerciseList(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 8,
              borderRadius: 12,
              backgroundColor: '#f59e0b',
            }}
          >
            <List size={20} color="#fff" />
            <Text style={{ marginLeft: 4, color: '#fff', fontWeight: '600' }}>
              Danh sách
            </Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
              Tiến độ: {completedSentences}/{lessons.length}
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#8b5cf6' }}>
              {Math.round(progress)}%
            </Text>
          </View>
          <View
            style={{
              height: 8,
              backgroundColor: '#e5e7eb',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <LinearGradient
              colors={['#8b5cf6', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: '100%', width: `${progress}%` }}
            />
          </View>
        </View>

        {/* Main Lesson Card */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <LinearGradient
            colors={['#3b82f6', '#8b5cf6', '#ec4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 24,
              padding: 24,
              marginBottom: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            {sentenceComplete && (
              <View
                style={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  backgroundColor: '#f59e0b',
                  borderRadius: 50,
                  padding: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                <Star size={32} color="#fff" />
              </View>
            )}

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <View style={{ marginRight: 12 }}>
                <Pen size={28} color="#fff" />
              </View>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
                Câu {currentLessonIndex + 1}
              </Text>
            </View>

            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.3)',
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: isSmallDevice ? 18 : 24,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  lineHeight: 32,
                }}
              >
                "{currentSentence || 'Đang tải...'}"
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => currentSentence && speak(currentSentence)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 12,
                borderRadius: 12,
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.3)',
              }}
            >
              <Volume size={24} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 8 }}>
                Nghe mẫu
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Controls */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <View style={{ alignItems: 'center', marginBottom: 8 }}>
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: isListening ? '#10B981' : '#9CA3AF',
                marginBottom: 8,
                shadowColor: isListening ? '#10B981' : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3,
              }}
            />
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151' }}>
              Trạng thái:{' '}
              <Text
                style={{
                  color: isListening ? '#10B981' : '#6B7280',
                  fontWeight: 'bold',
                }}
              >
                {isListening ? 'Đang nghe' : 'Dừng'}
              </Text>
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginBottom: 24,
            }}
          >
            <TouchableOpacity
              onPress={startListening}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: '#10B981',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Mic size={20} color="#fff" />
              <Text
                style={{ color: '#fff', fontWeight: 'bold', marginLeft: 8 }}
              >
                Bắt đầu
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={stopListening}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: '#EF4444',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <MicOff size={20} color="#fff" />
              <Text
                style={{ color: '#fff', fontWeight: 'bold', marginLeft: 8 }}
              >
                Dừng
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={resetTranscript}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: '#6B7280',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <RefreshCcwDot size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Results */}
          <View style={{ gap: 20 }}>
            <View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#1F2937',
                  marginBottom: 12,
                }}
              >
                Lời nói của bạn:
              </Text>
              <View
                style={{
                  padding: 16,
                  borderWidth: 2,
                  borderColor: '#E5E7EB',
                  borderRadius: 12,
                  backgroundColor: '#F9FAFB',
                  minHeight: 60,
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{ color: '#374151', fontSize: 16, lineHeight: 24 }}
                >
                  {transcript || 'Chưa có dữ liệu...'}
                </Text>
              </View>
            </View>

            <View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#1F2937',
                  marginBottom: 12,
                }}
              >
                Kết quả:
              </Text>
              <View
                style={{
                  padding: 16,
                  borderWidth: 2,
                  borderColor: '#E5E7EB',
                  borderRadius: 12,
                  backgroundColor: '#F9FAFB',
                  minHeight: 60,
                  justifyContent: 'center',
                }}
              >
                {result || (
                  <Text style={{ color: '#9CA3AF' }}>Chưa có kết quả...</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Exercise List Modal */}
      <Modal
        isVisible={showExerciseList}
        onBackdropPress={() => setShowExerciseList(false)}
        style={{ margin: 0, justifyContent: 'flex-end' }}
        backdropOpacity={0.5}
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: height * 0.7,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: '#E5E7EB',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <List size={24} color="#f59e0b" />
              <Text style={{ marginLeft: 8, fontSize: 18, fontWeight: 'bold' }}>
                Danh sách bài
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowExerciseList(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 20 }}>
            {lessons.map((lesson, index) => {
              const isCompleted = completedLessons.has(index);
              const isCurrent = index === currentLessonIndex;
              const isLocked = index > completedSentences;

              return (
                <TouchableOpacity
                  key={lesson.id}
                  onPress={() => jumpToLesson(index)}
                  disabled={isLocked}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    marginBottom: 12,
                    borderRadius: 12,
                    backgroundColor: isCurrent
                      ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                      : isCompleted
                      ? '#d1fae5'
                      : isLocked
                      ? '#f3f4f6'
                      : '#fff',
                    borderWidth: 2,
                    borderColor: isCompleted
                      ? '#10b981'
                      : isLocked
                      ? '#d1d5db'
                      : '#e5e7eb',
                    opacity: isLocked ? 0.5 : 1,
                  }}
                  activeOpacity={isLocked ? 1 : 0.7}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: isCurrent
                        ? 'rgba(255,255,255,0.2)'
                        : isCompleted
                        ? '#10b981'
                        : isLocked
                        ? '#d1d5db'
                        : '#fed7aa',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                    }}
                  >
                    {isCompleted ? (
                      <Check size={20} color="#fff" />
                    ) : isLocked ? (
                      <Lock size={16} color="#6b7280" />
                    ) : (
                      <Text
                        style={{
                          fontWeight: 'bold',
                          color: isCurrent ? '#fff' : '#c2410c',
                          fontSize: 16,
                        }}
                      >
                        {index + 1}
                      </Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontWeight: '600',
                        color: isCurrent
                          ? '#fff'
                          : isCompleted
                          ? '#065f46'
                          : isLocked
                          ? '#6b7280'
                          : '#374151',
                        marginBottom: 4,
                      }}
                    >
                      Câu {index + 1}
                    </Text>
                    {isCurrent && (
                      <Text
                        style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}
                      >
                        {lesson.content}
                      </Text>
                    )}
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
        style={{ marginLeft: 23, justifyContent: 'center' }}
        backdropOpacity={0.7}
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 24,
            padding: 32,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
            maxWidth: width * 0.9,
          }}
        >
          <LinearGradient
            colors={['#f59e0b', '#ef4444']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <Flower size={40} color="#fff" />
          </LinearGradient>
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            Chúc mừng!
          </Text>
          <Text
            style={{
              fontSize: 16,
              textAlign: 'center',
              color: '#6b7280',
              marginBottom: 24,
            }}
          >
            Bạn đã hoàn thành tất cả các câu!
          </Text>
          <TouchableOpacity
            onPress={() => {
              setShowCelebration(false);
              navigation.goBack();
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: '#8b5cf6',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', marginRight: 8 }}>
              Thử bài khác
            </Text>
            <ArrowRight size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>

      {showCelebration && (
        <ConfettiCannon count={200} origin={{ x: width / 2, y: 0 }} />
      )}
    </SafeAreaView>
  );
}
