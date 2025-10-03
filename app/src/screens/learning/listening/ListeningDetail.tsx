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
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  XCircle,
  Volume2,
  FileText,
  Award,
  Headphones,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { listeningService } from '../../../api/learning/listening/route';

export default function ListeningDetail() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { id } = route.params as { id: string };

  const [exercise, setExercise] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checkResult, setCheckResult] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await listeningService.getListeningExerciseById(id);
        setExercise(data);
      } catch (error) {
        console.error(error);
        Alert.alert('Lỗi', 'Không thể tải bài nghe');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

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

  // map vị trí từ bị ẩn
  const hiddenMap: Record<number, string> = {};
  exercise.wordHidden?.forEach((wh: any) => {
    hiddenMap[wh.position] = wh.answer;
  });

  const words = exercise.text_content.split(/\s+/);

  const handleCheckAnswers = () => {
    const result: Record<number, boolean> = {};
    Object.entries(hiddenMap).forEach(([pos, correctAnswer]) => {
      const position = parseInt(pos);
      const userAns = (answers[position] || '').trim().toLowerCase();
      result[position] = userAns === correctAnswer.toLowerCase();
    });
    setCheckResult(result);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header với gradient */}
      <LinearGradient
        colors={['#4ECDC4', '#6DD5DB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerBackButton}
            activeOpacity={0.8}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.headerIconContainer}>
              <Headphones size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.headerTitle}>{exercise.title}</Text>
              <Text style={styles.headerSubtitle}>
                {exercise.level} • {exercise.topic}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <View style={styles.instructionHeader}>
              <FileText size={20} color="#4ECDC4" />
              <Text style={styles.instructionTitle}>Hướng dẫn</Text>
            </View>
            <Text style={styles.instructionText}>
              Nghe đoạn audio và điền từ còn thiếu vào chỗ trống
            </Text>
          </View>

          {/* Audio Player */}
          <View style={styles.audioContainer}>
            <View style={styles.audioHeader}>
              <Volume2 size={20} color="#4ECDC4" />
              <Text style={styles.audioTitle}>Audio Player</Text>
            </View>

            <View style={styles.audioControls}>
              <TouchableOpacity
                style={styles.audioButton}
                activeOpacity={0.8}
              >
                {isPlaying ? (
                  <Pause size={24} color="#fff" />
                ) : (
                  <Play size={24} color="#fff" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.audioButtonSecondary}
                activeOpacity={0.8}
              >
                <RotateCcw size={20} color="#4ECDC4" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Text with blanks */}
          <View style={styles.textContainer}>
            <View style={styles.textHeader}>
              <FileText size={20} color="#4ECDC4" />
              <Text style={styles.textTitle}>Điền từ vào chỗ trống</Text>
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
                        maxLength={correctAnswer.length + 2}
                        placeholder={`(${correctAnswer.length} chữ)`}
                        style={[
                          styles.textInput,
                          isSubmitted && {
                            borderColor: isCorrect ? '#10b981' : '#ef4444',
                            backgroundColor: isCorrect ? '#f0fdf4' : '#fef2f2',
                          },
                        ]}
                        value={userAnswer}
                        onChangeText={text =>
                          setAnswers({ ...answers, [position]: text })
                        }
                        editable={!isSubmitted}
                      />
                      {isSubmitted && (
                        <View style={styles.resultIcon}>
                          {isCorrect ? (
                            <CheckCircle size={16} color="#10b981" />
                          ) : (
                            <XCircle size={16} color="#ef4444" />
                          )}
                        </View>
                      )}
                      {isSubmitted && !isCorrect && (
                        <Text style={styles.correctAnswer}>
                          Đáp án: {correctAnswer}
                        </Text>
                      )}
                    </View>
                  );
                }

                return (
                  <Text key={idx} style={styles.wordText}>
                    {word}{' '}
                  </Text>
                );
              })}
            </View>
          </View>

          {/* Results */}
          {isSubmitted && (
            <View style={styles.resultsContainer}>
              <View style={styles.resultsHeader}>
                <Award size={20} color="#4ECDC4" />
                <Text style={styles.resultsTitle}>Kết quả</Text>
              </View>

              {/* <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>{score}%</Text>
                <Text style={styles.scoreDescription}>
                  {correctCount}/{totalQuestions} câu đúng
                </Text>
              </View>

              <View style={styles.scoreBar}>
                <View style={[styles.scoreProgress, { width: `${score}%` }]} />
              </View> */}
            </View>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {!isSubmitted ? (
            <TouchableOpacity
              style={[
                styles.submitButton,
                Object.keys(answers).length === 0 &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleCheckAnswers}
              disabled={Object.keys(answers).length === 0}
              activeOpacity={0.8}
            >
              <CheckCircle size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Nộp bài</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.resetButton}
                activeOpacity={0.8}
              >
                <RotateCcw size={18} color="#6b7280" />
                <Text style={styles.resetButtonText}>Làm lại</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <Text style={styles.continueButtonText}>Tiếp tục</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
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
  loadingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e8fffe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  spinner: {
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  loadingDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
  },
  headerRight: {
    width: 40,
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
    paddingBottom: 100,
  },
  instructionsContainer: {
    backgroundColor: '#f0fdfa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  audioContainer: {
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
  audioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  audioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  audioButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  audioButtonSecondary: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0fdfa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#a7f3d0',
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  textTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
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
  resultIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 2,
  },
  correctAnswer: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    fontSize: 12,
    color: '#ef4444',
    textAlign: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  wordText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 28,
    marginHorizontal: 2,
  },
  resultsContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 4,
  },
  scoreDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  scoreBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreProgress: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  bottomSpacing: {
    height: 32,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    elevation: 0,
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  resetButtonText: {
    color: '#6b7280',
    fontWeight: '600',
    marginLeft: 8,
  },
  continueButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  continueButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
