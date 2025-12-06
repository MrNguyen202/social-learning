// import React, { useEffect, useState, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   ScrollView,
//   Modal,
//   ActivityIndicator,
//   TouchableOpacity,
//   useWindowDimensions,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import ConfettiCannon from 'react-native-confetti-cannon';
// import Toast from 'react-native-toast-message';
// import { Loader2, Trophy } from 'lucide-react-native';
// import useAuth from '../../../../hooks/useAuth';
// import ExerciseFooter, { FeedbackStatus } from './components/ExerciseFooter';
// import {
//   generateExerciseByVocabList,
//   updateMasteryScoreRPC,
// } from '../../../api/learning/vocabulary/route';
// import { ProgressBar } from './components/ProgressBar';
// import LivesIndicator from './components/LivesIndicator';
// import ExerciseItem from './components/ExerciseItem';
// import OutOfLivesModal from './components/OutOfLivesModal';

// const shuffle = (array: any[]) => {
//   let currentIndex = array.length,
//     randomIndex;
//   while (currentIndex !== 0) {
//     randomIndex = Math.floor(Math.random() * currentIndex);
//     currentIndex--;
//     [array[currentIndex], array[randomIndex]] = [
//       array[randomIndex],
//       array[currentIndex],
//     ];
//   }
//   return array;
// };

// const PRACTICE_DELAY = {
//   CORRECT: 1500,
//   INCORRECT: 2500,
// };

// export default function VocabularyPracticeAI() {
//   const navigation = useNavigation<any>();
//   const [exercises, setExercises] = useState<any[]>([]);
//   const [current, setCurrent] = useState(0);
//   const [progress, setProgress] = useState(0);
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [words, setWords] = useState<string[]>([]);
//   const [showCelebration, setShowCelebration] = useState(false);
//   const { width, height } = useWindowDimensions();
//   const [feedbackStatus, setFeedbackStatus] = useState<FeedbackStatus>(null);
//   const [lives, setLives] = useState(3);
//   const [hasUsedRefill, setHasUsedRefill] = useState(false);
//   const [showOutOfLivesModal, setShowOutOfLivesModal] = useState(false);
//   const [wrongPile, setWrongPile] = useState<any[]>([]);
//   const [implicitlyHardWords, setImplicitlyHardWords] = useState<string[]>([]);

//   const update_mastery_on_success = async (userId: string, word: string) => {
//     await updateMasteryScoreRPC({ userId, word });
//   };

//   useEffect(() => {
//     const loadWords = async () => {
//       const data = await AsyncStorage.getItem('practiceWords');
//       setWords(data ? JSON.parse(data) : []);
//     };
//     loadWords();
//   }, []);

//   useEffect(() => {
//     if (words.length === 0 || !user?.id) return;
//     const fetchExercises = async () => {
//       setLoading(true);
//       setError('');
//       try {
//         const res = await generateExerciseByVocabList({
//           userId: user.id,
//           words,
//         });
//         setExercises(res.data || []);
//         await AsyncStorage.removeItem('practiceWords');
//       } catch (err) {
//         console.error(err);
//         setError('learning.createExerciseError');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchExercises();
//   }, [words, user?.id]);

//   useEffect(() => {
//     if (exercises.length > 0)
//       setProgress(((current + 1) / exercises.length) * 100);
//   }, [current, exercises]);

//   const handleNext = () => {
//     setFeedbackStatus(null);

//     if (current < exercises.length - 1) {
//       setCurrent(c => c + 1);
//     } else {
//       if (wrongPile.length > 0) {
//         Toast.show({
//           type: 'info',
//           text1: `Bắt đầu vòng thử thách! Bạn sẽ làm lại ${wrongPile.length} câu đã sai.`,
//         });
//         setExercises(shuffle(wrongPile));
//         setWrongPile([]);
//         setCurrent(0);
//       } else {
//         // HOÀN THÀNH
//         if (implicitlyHardWords.length > 0) {
//           console.log('Gửi các từ khó này về server:', implicitlyHardWords);
//         }

//         if (words && user) {
//           words.forEach((word: string) => {
//             update_mastery_on_success(user.id, word);
//           });
//         }
//         setShowCelebration(true);
//       }
//     }
//   };

//   const getCorrectAnswer = (exercise: any): string => {
//     switch (exercise.type) {
//       case 'multiple_choice':
//         return exercise.data.options[exercise.data.correct_index];
//       case 'sentence_order':
//         return exercise.data.answer_en;
//       case 'synonym_match':
//         return 'Hoàn thành ghép cặp';
//       case 'speaking':
//         return exercise.data.sentence;
//       case 'word_build':
//         return exercise.data.answer;
//       case 'fill_in_blank':
//         return exercise.data.correct_answer;
//       default:
//         return '';
//     }
//   };

//   const handleCheck = (isCorrect: boolean, correctAnswer: string) => {
//     if (isCorrect) {
//       setFeedbackStatus({
//         status: 'correct',
//         correctAnswer: correctAnswer,
//       });
//       setTimeout(handleNext, PRACTICE_DELAY.CORRECT);
//       return;
//     }

//     const exercise = exercises[current];
//     const wordToMark = getCorrectAnswer(exercise);

//     if (wordToMark && !implicitlyHardWords.includes(wordToMark)) {
//       setImplicitlyHardWords(prev => [...prev, wordToMark]);
//     }
//     setWrongPile(prevPile => {
//       const isAlreadyInPile = prevPile.some(ex => ex.id === exercise.id);
//       if (isAlreadyInPile) return prevPile;
//       return [...prevPile, exercise];
//     });

//     const newLives = lives - 1;
//     setLives(newLives);

//     if (newLives === 0) {
//       setShowOutOfLivesModal(true);
//     } else {
//       setFeedbackStatus({
//         status: 'incorrect',
//         correctAnswer: correctAnswer,
//       });
//       setTimeout(handleNext, PRACTICE_DELAY.INCORRECT);
//     }
//   };

//   const handleRefillLives = () => {
//     Toast.show({
//       type: 'success',
//       text1: 'Bạn đã dùng 5 ❄️ và được cộng 1 mạng!',
//     });
//     setLives(1);
//     setHasUsedRefill(true);
//     setShowOutOfLivesModal(false);

//     const currentExercise = exercises[current];
//     let answer = getCorrectAnswer(currentExercise);
//     setFeedbackStatus({
//       status: 'incorrect',
//       correctAnswer: answer,
//     });
//     setTimeout(handleNext, PRACTICE_DELAY.INCORRECT);
//   };

//   const handleGoBack = () => {
//     setShowOutOfLivesModal(false);
//     navigation.goBack();
//   };

//   if (loading) {
//     return (
//       <Modal visible={loading} transparent={true} animationType="fade">
//         <View style={styles.loadingBackdrop}>
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color="#EA580C" />
//             <Text style={styles.loadingText}>Đang tạo bài tập...</Text>
//             <Text style={styles.loadingSubText}>Vui lòng chờ...</Text>
//           </View>
//         </View>
//       </Modal>
//     );
//   }

//   if (error) {
//     return (
//       <SafeAreaView style={styles.centeredContainer}>
//         <Text style={styles.errorText}>{error}</Text>
//       </SafeAreaView>
//     );
//   }

//   if (exercises.length === 0) {
//     return (
//       <SafeAreaView style={styles.centeredContainer}>
//         <Text style={styles.errorText}>Không có bài tập nào.</Text>
//       </SafeAreaView>
//     );
//   }

//   const currentExercise = exercises[current];

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       {showCelebration && (
//         <ConfettiCannon
//           count={200}
//           origin={{ x: width / 2, y: -10 }}
//           autoStart={true}
//           fadeOut={true}
//         />
//       )}

//       {/* (Đã bỏ div blur) */}
//       <ScrollView style={styles.container}>
//         <View style={styles.content}>
//           <View style={styles.headerRow}>
//             <View style={styles.progressContainer}>
//               <ProgressBar progress={progress} />
//             </View>
//             <LivesIndicator lives={lives} />
//           </View>

//           <Text style={styles.progressText}>
//             {current + 1}/{exercises.length}
//           </Text>

//           {/* Đã bỏ AnimatePresence */}
//           <View style={styles.exerciseItemContainer}>
//             <ExerciseItem
//               exercise={currentExercise}
//               onCheck={handleCheck}
//               isChecking={feedbackStatus !== null || showOutOfLivesModal}
//             />
//           </View>
//         </View>

//         {/* Render Footer */}
//         <ExerciseFooter feedback={feedbackStatus} />
//       </ScrollView>

//       {/* Dialog chúc mừng (Thay bằng Modal) */}
//       <Modal visible={showCelebration} transparent={true} animationType="slide">
//         <View style={styles.celebrationBackdrop}>
//           <View style={styles.celebrationContainer}>
//             <Trophy size={100} color="#FFFFFF" style={styles.trophyIcon} />
//             <Text style={styles.celebrationTitle}>Chúc mừng!</Text>
//             <Text style={styles.celebrationSubtitle}>
//               Bạn đã hoàn thành tất cả các câu.
//             </Text>

//             <TouchableOpacity
//               style={styles.celebrationButton}
//               onPress={() => {
//                 setShowCelebration(false);
//                 navigation.goBack();
//               }}
//             >
//               <Text style={styles.celebrationButtonText}>Thực hành từ mới</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       <OutOfLivesModal
//         isOpen={showOutOfLivesModal}
//         onRefill={handleRefillLives}
//         onGoBack={handleGoBack}
//         canRefill={!hasUsedRefill}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#F9FAFB',
//   },
//   container: {
//     flex: 1,
//   },
//   content: {
//     flex: 1,
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//   },
//   // Loading Modal
//   loadingBackdrop: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0, 0, 0, 0.3)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 16,
//   },
//   loadingContainer: {
//     backgroundColor: 'white',
//     padding: 24,
//     borderRadius: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 8,
//     elevation: 10,
//     alignItems: 'center',
//     gap: 16,
//     maxWidth: 384,
//     width: '100%',
//   },
//   loadingText: {
//     color: '#1F2937',
//     fontWeight: '600',
//     fontSize: 18,
//     textAlign: 'center',
//   },
//   loadingSubText: {
//     color: '#6B7280',
//     fontSize: 14,
//     textAlign: 'center',
//   },
//   centeredContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 40,
//   },
//   errorText: {
//     color: '#DC2626',
//     fontSize: 16,
//     textAlign: 'center',
//   },
//   // Main Layout
//   headerRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 16,
//     marginBottom: 8,
//   },
//   progressContainer: {
//     flex: 1,
//   },
//   progressText: {
//     fontSize: 14,
//     color: '#6B7280',
//     textAlign: 'right',
//     marginTop: 8,
//   },
//   exerciseItemContainer: {
//     marginTop: 24,
//     minHeight: 350,
//   },
//   // Celebration Modal
//   celebrationBackdrop: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   celebrationContainer: {
//     margin: 20,
//     backgroundColor: '#F97316',
//     borderRadius: 24,
//     padding: 35,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//     borderWidth: 4,
//     borderColor: 'white',
//   },
//   trophyIcon: {
//     marginBottom: 24,
//   },
//   celebrationTitle: {
//     fontSize: 30,
//     fontWeight: 'bold',
//     color: 'white',
//     marginBottom: 12,
//   },
//   celebrationSubtitle: {
//     fontSize: 20,
//     color: 'rgba(255, 255, 255, 0.9)',
//     marginBottom: 32,
//     fontWeight: '600',
//     textAlign: 'center',
//   },
//   celebrationButton: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     paddingVertical: 16,
//     paddingHorizontal: 40,
//     elevation: 5,
//     shadowColor: '#000',
//   },
//   celebrationButtonText: {
//     color: '#8B5CF6',
//     fontWeight: 'bold',
//     fontSize: 18,
//   },
// });

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfettiCannon from 'react-native-confetti-cannon';
import Toast from 'react-native-toast-message';
import { Loader2, Trophy } from 'lucide-react-native';
import useAuth from '../../../../hooks/useAuth';
import ExerciseFooter, { FeedbackStatus } from './components/ExerciseFooter';
import {
  generateExerciseByVocabList,
  updateMasteryScoreRPC,
  archiveMasteredWordRPC,
  deletePersonalVocabRPC,
  deleteUserVocabErrorsRPC,
  resetReviewWordRPC,
} from '../../../api/learning/vocabulary/route';

import { ProgressBar } from './components/ProgressBar';
import LivesIndicator from './components/LivesIndicator';
import ExerciseItem from './components/ExerciseItem';
import OutOfLivesModal from './components/OutOfLivesModal';
import {
  deductSnowflakeFromUser,
  getScoreUserByUserId,
} from '../../../api/learning/score/route';
import { deleteNotificationLearning } from '../../../api/notification/route';

// --- Hàm tiện ích ---
const shuffle = (array: any[]) => {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

const PRACTICE_DELAY = {
  CORRECT: 1500,
  INCORRECT: 2500,
};

export default function VocabularyPracticeAI() {
  const navigation = useNavigation<any>();
  const [exercises, setExercises] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [words, setWords] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const { width, height } = useWindowDimensions();
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackStatus>(null);

  const [lives, setLives] = useState(3);
  const [hasUsedRefill, setHasUsedRefill] = useState(false);
  const [showOutOfLivesModal, setShowOutOfLivesModal] = useState(false);

  // State logic vòng lặp & tốt nghiệp
  const [wrongPile, setWrongPile] = useState<any[]>([]);
  const [implicitlyHardWords, setImplicitlyHardWords] = useState<string[]>([]);
  const [graduationType, setGraduationType] = useState<string | null>(null);
  const nextTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Lưu các ID đặc biệt (Review/Mastery)
  const [reviewContext, setReviewContext] = useState<{
    firstGraduationId: string | null;
    firstGraduationScore: string | null;
    reviewGraduationId: string | null;
    notifiId: string | null;
  }>({
    firstGraduationId: null,
    firstGraduationScore: null,
    reviewGraduationId: null,
    notifiId: null,
  });

  const isFinishedRef = useRef(false);

  const update_mastery_on_success = async (userId: string, word: string) => {
    await updateMasteryScoreRPC({ userId, word });
  };

  // 1. Load Words và Context IDs từ AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const [wordsData, firstGradId, firstGradScore, reviewGradId, notifiId] =
          await Promise.all([
            AsyncStorage.getItem('practiceWords'),
            AsyncStorage.getItem('masteryReviewId'),
            AsyncStorage.getItem('masteryReviewScore'),
            AsyncStorage.getItem('reviewGraduationId'),
            AsyncStorage.getItem('notifiId'),
          ]);

        setWords(wordsData ? JSON.parse(wordsData) : []);

        // Parse reviewGradId vì ở web nó dùng JSON.parse
        let parsedReviewId = null;
        if (reviewGradId) {
          try {
            parsedReviewId = JSON.parse(reviewGradId);
          } catch {
            parsedReviewId = reviewGradId;
          }
        }

        let parsedNotifiId = null;
        if (notifiId) {
          try {
            parsedNotifiId = JSON.parse(notifiId);
          } catch {
            parsedNotifiId = notifiId;
          }
        }

        setReviewContext({
          firstGraduationId: firstGradId,
          firstGraduationScore: firstGradScore,
          reviewGraduationId: parsedReviewId,
          notifiId: parsedNotifiId,
        });
      } catch (e) {
        console.error('Lỗi load data:', e);
      }
    };
    loadData();
  }, []);

  // 2. Generate Bài tập
  useEffect(() => {
    if (words.length === 0 || !user?.id) return;
    const fetchExercises = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await generateExerciseByVocabList({
          userId: user.id,
          words,
        });
        setExercises(res.data || []);

        // Xóa words khỏi storage sau khi load xong (để tránh lặp lại nếu back)
        await AsyncStorage.removeItem('practiceWords');
      } catch (err) {
        console.error(err);
        setError('Lỗi tạo bài tập');
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, [words, user?.id]);

  useEffect(() => {
    if (exercises.length > 0)
      setProgress(((current + 1) / exercises.length) * 100);
  }, [current, exercises]);

  useEffect(() => {
    return () => {
      if (nextTimeoutRef.current) {
        clearTimeout(nextTimeoutRef.current);
      }
    };
  }, []);

  // 3. Logic Handle Next (Bao gồm Logic Tốt nghiệp)
  const handleNext = async () => {
    if (nextTimeoutRef.current) {
      clearTimeout(nextTimeoutRef.current);
      nextTimeoutRef.current = null;
    }

    setFeedbackStatus(null);

    if (current < exercises.length - 1) {
      setCurrent(c => c + 1);
    } else {
      if (isFinishedRef.current) return;
      isFinishedRef.current = true;

      const {
        firstGraduationId,
        firstGraduationScore,
        reviewGraduationId,
        notifiId,
      } = reviewContext;
      const score = parseInt(firstGraduationScore || '0', 10);

      // --- USER THẤT BẠI (Có wrongPile) ---
      if (wrongPile.length > 0) {
        if (reviewGraduationId) {
          // Reset điểm thông thạo về 70%
          await resetReviewWordRPC({ personalVocabId: reviewGraduationId });
          setGraduationType('review_fail');
        } else if (firstGraduationId && score === 100) {
          // Thất bại ẩn từ
          setGraduationType('first_fail');
        } else {
          setGraduationType(null);
        }

        Toast.show({
          type: 'info',
          text1: 'Thử thách!',
          text2: `Bạn sẽ làm lại ${wrongPile.length} câu đã sai.`,
        });

        // Loop lại
        setExercises(shuffle(wrongPile));
        setWrongPile([]);
        setCurrent(0);
        setLoading(false);
        isFinishedRef.current = false; // Mở lại flag để làm tiếp
        return;
      } else {
        // --- USER THÀNH CÔNG ---
        try {
          setLoading(true);

          if (reviewGraduationId) {
            // Thành công "Luyện tập Tái tốt nghiệp" (sau 7 ngày) -> XÓA
            await deletePersonalVocabRPC({
              personalVocabId: reviewGraduationId,
            });
            await deleteUserVocabErrorsRPC({
              userId: user?.id,
              word: words[0],
            });

            if (notifiId) {
              await deleteNotificationLearning(notifiId, reviewGraduationId);
              await AsyncStorage.removeItem('notifiId');
            }
            setGraduationType('review_pass_delete');
          } else if (firstGraduationId && score === 100) {
            // Thành công "Luyện lần đầu 100%" -> ẨN (Archive)
            await archiveMasteredWordRPC({
              personalVocabId: firstGraduationId,
            });
            setGraduationType('first_pass_archive');
          } else {
            // Luyện tập bình thường
            if (words && user) {
              await Promise.all(
                words.map((word: string) =>
                  update_mastery_on_success(user.id, word),
                ),
              );
            }
            setGraduationType('normal_pass');
          }

          // Clean storage
          await AsyncStorage.multiRemove([
            'masteryReviewId',
            'masteryReviewScore',
            'reviewGraduationId',
          ]);

          setShowCelebration(true);
        } catch (err) {
          console.error('Lỗi save progress:', err);
          Toast.show({ type: 'error', text1: 'Lỗi lưu kết quả!' });
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const getCorrectAnswer = (exercise: any): string => {
    switch (exercise.type) {
      case 'multiple_choice':
        return exercise.data.options[exercise.data.correct_index];
      case 'sentence_order':
        return exercise.data.answer_en;
      case 'synonym_match':
        return 'Hoàn thành ghép cặp';
      case 'speaking':
        return exercise.data.sentence;
      case 'word_build':
        return exercise.data.answer;
      case 'fill_in_blank':
        return exercise.data.correct_answer;
      default:
        return '';
    }
  };

  const handleCheck = (isCorrect: boolean, correctAnswer: string) => {
    if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current);

    if (isCorrect) {
      setFeedbackStatus({
        status: 'correct',
        correctAnswer: correctAnswer,
      });
      nextTimeoutRef.current = setTimeout(() => {
        handleNext();
      }, PRACTICE_DELAY.CORRECT);
      return;
    }

    // Xử lý SAI
    const exercise = exercises[current];
    const wordToMark = getCorrectAnswer(exercise);

    if (wordToMark && !implicitlyHardWords.includes(wordToMark)) {
      setImplicitlyHardWords(prev => [...prev, wordToMark]);
    }
    setWrongPile(prevPile => {
      const isAlreadyInPile = prevPile.some(ex => ex.id === exercise.id);
      if (isAlreadyInPile) return prevPile;
      return [...prevPile, exercise];
    });

    const newLives = lives - 1;
    setLives(newLives);

    if (newLives === 0) {
      setShowOutOfLivesModal(true);
    } else {
      setFeedbackStatus({
        status: 'incorrect',
        correctAnswer: correctAnswer,
      });
      nextTimeoutRef.current = setTimeout(() => {
        handleNext();
      }, PRACTICE_DELAY.INCORRECT);
    }
  };

  // --- Logic Score / Refill (Giả lập giống web) ---
  const getSnowFlakeBalance = async (userId: string) => {
    try {
      const res = await getScoreUserByUserId(userId);
      return res.data ? res.data.number_snowflake : 0;
    } catch {
      return 0;
    }
  };

  const handleRefillLives = async () => {
    if (!user) return;
    const balance = await getSnowFlakeBalance(user.id);

    if (balance < 5) {
      Toast.show({ type: 'error', text1: 'Không đủ ❄️ để mua mạng!' });
      return;
    }

    await deductSnowflakeFromUser(user.id, -5);
    Toast.show({
      type: 'success',
      text1: 'Bạn đã dùng 5 ❄️ và được cộng 1 mạng!',
    });
    setLives(1);
    setHasUsedRefill(true);
    setShowOutOfLivesModal(false);

    const currentExercise = exercises[current];
    let answer = getCorrectAnswer(currentExercise);
    setFeedbackStatus({
      status: 'incorrect',
      correctAnswer: answer,
    });
    setTimeout(handleNext, PRACTICE_DELAY.INCORRECT);
  };

  const handleGoBack = () => {
    setShowOutOfLivesModal(false);
    navigation.goBack();
  };

  if (loading) {
    return (
      <Modal visible={loading} transparent={true} animationType="fade">
        <View style={styles.loadingBackdrop}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#EA580C" />
            <Text style={styles.loadingText}>Đang tạo bài tập...</Text>
            <Text style={styles.loadingSubText}>Vui lòng chờ...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (exercises.length === 0) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Text style={styles.errorText}>Không có bài tập nào.</Text>
      </SafeAreaView>
    );
  }

  const currentExercise = exercises[current];

  // Helper để lấy title cho Dialog chúc mừng
  const getCelebrationTitle = () => {
    if (graduationType === 'review_pass_delete') return 'Đã hoàn toàn làm chủ!';
    if (graduationType === 'first_pass_archive') return 'Chúc mừng Tốt nghiệp!';
    return 'Chúc mừng bạn!';
  };

  const getCelebrationDesc = () => {
    if (graduationType === 'review_pass_delete')
      return 'Từ vựng này sẽ được xóa khỏi bộ nhớ cá nhân.';
    if (graduationType === 'first_pass_archive')
      return 'Từ vựng sẽ được ẩn và hẹn ngày ôn tập.';
    return 'Bạn đã hoàn thành tất cả các câu.';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {showCelebration && (
        <ConfettiCannon
          count={200}
          origin={{ x: width / 2, y: -10 }}
          autoStart={true}
          fadeOut={true}
        />
      )}

      <ScrollView style={styles.container} scrollEnabled={!showOutOfLivesModal}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.progressContainer}>
              <ProgressBar progress={progress} />
            </View>
            <LivesIndicator lives={lives} />
          </View>

          <Text style={styles.progressText}>
            {current + 1}/{exercises.length}
          </Text>

          <View style={styles.exerciseItemContainer}>
            <ExerciseItem
              key={currentExercise?.id || current}
              exercise={currentExercise}
              onCheck={handleCheck}
              isChecking={feedbackStatus !== null || showOutOfLivesModal}
            />
          </View>
        </View>

        <ExerciseFooter feedback={feedbackStatus} />
      </ScrollView>

      {/* Dialog chúc mừng (Đã update dynamic text) */}
      <Modal visible={showCelebration} transparent={true} animationType="slide">
        <View style={styles.celebrationBackdrop}>
          <View style={styles.celebrationContainer}>
            <Trophy size={80} color="#FFFFFF" style={styles.trophyIcon} />
            <Text style={styles.celebrationTitle}>{getCelebrationTitle()}</Text>
            <Text style={styles.celebrationSubtitle}>
              {getCelebrationDesc()}
            </Text>

            <TouchableOpacity
              style={styles.celebrationButton}
              onPress={() => {
                setShowCelebration(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.celebrationButtonText}>
                {graduationType === 'normal_pass'
                  ? 'Luyện tập từ mới'
                  : 'Tuyệt vời!'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <OutOfLivesModal
        isOpen={showOutOfLivesModal}
        onRefill={handleRefillLives}
        onGoBack={handleGoBack}
        canRefill={!hasUsedRefill}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  // Loading Modal
  loadingBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
    alignItems: 'center',
    gap: 16,
    maxWidth: 384,
    width: '100%',
  },
  loadingText: {
    color: '#1F2937',
    fontWeight: '600',
    fontSize: 18,
    textAlign: 'center',
  },
  loadingSubText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
    textAlign: 'center',
  },
  // Main Layout
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  progressContainer: {
    flex: 1,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 8,
  },
  exerciseItemContainer: {
    marginTop: 24,
    minHeight: 350,
  },
  // Celebration Modal
  celebrationBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  celebrationContainer: {
    margin: 20,
    backgroundColor: '#F97316', // Orange
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 4,
    borderColor: 'white',
    maxWidth: '90%',
  },
  trophyIcon: {
    marginBottom: 16,
  },
  celebrationTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  celebrationSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 24,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },
  celebrationButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 30,
    elevation: 5,
    shadowColor: '#000',
    width: '100%',
  },
  celebrationButtonText: {
    color: '#F97316',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});
