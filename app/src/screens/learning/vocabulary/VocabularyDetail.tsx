import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { getPersonalVocabById } from '../../../api/learning/vocabulary/route';

import {
  ArrowLeft,
  BookOpen,
  Volume2,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Link2,
} from 'lucide-react-native';
import Tts from 'react-native-tts';

const Skeleton = ({ style }: { style: any }) => (
  <Animated.View style={[styles.skeleton, style]} />
);

const SkeletonLoader = () => (
  <View style={styles.container}>
    <View style={{ padding: 16 }}>
      <Skeleton style={{ height: 40, width: 120, borderRadius: 8 }} />
      <Skeleton style={{ height: 250, marginTop: 24, borderRadius: 24 }} />
      <View style={{ marginTop: 24, gap: 16 }}>
        <Skeleton style={{ height: 150, borderRadius: 24 }} />
        <Skeleton style={{ height: 150, borderRadius: 24 }} />
      </View>
    </View>
  </View>
);

const RelatedWordCard = ({
  word,
  onSpeak,
  index,
}: {
  word: any;
  onSpeak: (text: string) => void;
  index: number;
}) => {
  return (
    <Animated.View style={[styles.relatedCard]}>
      <View style={styles.relatedHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.relatedWordText}>
            {word.word}:{' '}
            <Text style={styles.relatedTranslation}>{word.word_vi}</Text>
          </Text>
          {word.ipa && <Text style={styles.relatedIpa}>{word.ipa}</Text>}
        </View>
        <TouchableOpacity onPress={() => onSpeak(word.word)}>
          <Volume2 size={22} color="#9ca3af" />
        </TouchableOpacity>
      </View>
      {word.word_type && (
        <View style={styles.relatedTypeBadge}>
          <Text style={styles.relatedTypeText}>{word.word_type}</Text>
        </View>
      )}
      <View style={styles.relatedMeaningBox}>
        <Text style={styles.relatedMeaningText}>{word.meaning}</Text>
        <Text style={styles.relatedMeaningViText}>{word.meaning_vi}</Text>
      </View>
      <View style={styles.relatedExampleBox}>
        <Text style={styles.relatedMeaningText}>{word.example}</Text>
        <Text style={styles.relatedMeaningViText}>{word.example_vi}</Text>
      </View>
    </Animated.View>
  );
};

export default function VocabularyDetail() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { vocabId } = route.params; // Lấy vocabId từ params

  const [personalVocab, setPersonalVocab] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!vocabId) return;
      setLoading(true);
      try {
        const res = await getPersonalVocabById({ personalVocabId: vocabId });
        if (res.success) {
          setPersonalVocab(res.data);
        } else {
          Alert.alert('Lỗi', 'Không thể tải dữ liệu từ vựng.');
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Lỗi', 'Đã có lỗi xảy ra.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [vocabId]);

  // --- Chức năng phát âm ---
  useEffect(() => {
    // Khởi tạo Tts engine
    Tts.getInitStatus().then(() => {
      Tts.setDefaultLanguage('en-US');
      Tts.setDefaultRate(0.5);
    });
  }, []);

  const speakWord = useCallback((text: string) => {
    Tts.stop(); // Dừng âm thanh cũ
    Tts.speak(text);
  }, []);

  const getMasteryColors = (score: number) => {
    if (score >= 70) return ['#22c55e', '#10b981'];
    if (score >= 40) return ['#f59e0b', '#fbbf24'];
    return ['#ef4444', '#f87171'];
  };

  const getMasteryLabel = (score: number) => {
    if (score >= 70) return 'Thành thạo';
    if (score >= 40) return 'Trung bình';
    return 'Cần luyện tập';
  };

  const masteryProgress = useAnimatedStyle(() => {
    if (!personalVocab) return { width: '0%' };
    return {
      width: withDelay(
        300,
        withTiming(`${personalVocab.mastery_score}%`, { duration: 1000 }),
      ),
    };
  });

  if (loading) {
    return <SkeletonLoader />;
  }

  if (!personalVocab) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFoundContainer}>
          <AlertCircle size={60} color="#f59e0b" style={{ marginBottom: 16 }} />
          <Text style={styles.notFoundTitle}>Không tìm thấy từ vựng</Text>
          <Text style={styles.notFoundSub}>
            Từ này có thể không tồn tại hoặc đã bị xóa.
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <LinearGradient
              colors={['#f59e0b', '#ef4444']}
              style={styles.backButton}
            >
              <ArrowLeft size={16} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.backButtonText}>Quay lại danh sách</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const vocabData = personalVocab.related_words?.[0] || {};

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative Background */}
      <Animated.View style={[styles.bgCircle, { top: -50, right: -80 }]} />
      <Animated.View
        style={[
          styles.bgCircle,
          { bottom: -50, left: -80, transform: [{ scale: 1.2 }] },
        ]}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View style={styles.header}>
          <TouchableOpacity
            style={styles.backButtonGhost}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={18} color="#374151" style={{ marginRight: 8 }} />
            <Text>Quay lại</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Main Card */}
        <Animated.View style={styles.mainCard}>
          <View style={styles.mainCardHeader}>
            <LinearGradient
              colors={['#f97316', '#ef4444']}
              style={styles.mainCardIcon}
            >
              <BookOpen size={32} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={styles.wordTitle}>{personalVocab.word}</Text>
              <View style={styles.ipaContainer}>
                <Text style={styles.ipaText}>{vocabData.ipa}</Text>
                <View style={styles.wordTypeBadge}>
                  <Text style={styles.wordTypeText}>{vocabData.word_type}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.translationBox}>
            <Text style={styles.translationText}>{vocabData.word_vi}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>Độ thành thạo</Text>
                <TrendingUp size={16} color="#f97316" />
              </View>
              <View style={styles.progressBarBg}>
                <Animated.View
                  style={[
                    styles.progressBar,
                    {
                      backgroundColor: getMasteryColors(
                        personalVocab.mastery_score,
                      )[0],
                    },
                    masteryProgress,
                  ]}
                />
              </View>
              <View style={styles.statFooter}>
                <Text
                  style={[
                    styles.statValue,
                    { color: getMasteryColors(personalVocab.mastery_score)[0] },
                  ]}
                >
                  {personalVocab.mastery_score}%
                </Text>
                <Text style={styles.statDescription}>
                  {getMasteryLabel(personalVocab.mastery_score)}
                </Text>
              </View>
            </View>

            <View style={[styles.statBox, { backgroundColor: '#fff7f7' }]}>
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>Số lần trả lời sai</Text>
                <AlertCircle size={16} color="#ef4444" />
              </View>
              <View style={styles.statFooter}>
                <Text style={[styles.statValue, { color: '#ef4444' }]}>
                  {personalVocab.error_count}
                </Text>
                <Text style={styles.statDescription}>lần</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity>
              <LinearGradient
                colors={['#f97316', '#ef4444']}
                style={styles.actionButton}
              >
                <Sparkles size={16} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.actionButtonText}>Luyện tập ngay</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButtonOutline}
              onPress={() => speakWord(personalVocab.word)}
            >
              <Volume2 size={16} color="#f97316" style={{ marginRight: 8 }} />
              <Text style={styles.actionButtonOutlineText}>Phát âm</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Related Words */}
        {personalVocab.related_words &&
          personalVocab.related_words.length > 0 && (
            <Animated.View style={styles.relatedSection}>
              <View style={styles.relatedSectionTitleContainer}>
                <Link2 size={20} color="#f97316" />
                <Text style={styles.relatedSectionTitle}>Từ liên quan</Text>
              </View>
              {personalVocab.related_words.map((word: any, index: number) => (
                <RelatedWordCard
                  key={word.id || index}
                  word={word}
                  onSpeak={speakWord}
                  index={index}
                />
              ))}
            </Animated.View>
          )}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- StyleSheet ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEFBF9' },
  scrollContent: { padding: 16, paddingBottom: 50 },
  bgCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonGhost: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  mainCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFF0E5',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  mainCardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  mainCardIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordTitle: { fontSize: 36, fontWeight: 'bold', color: '#1f2937' },
  ipaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  ipaText: { fontSize: 18, color: '#6b7280' },
  wordTypeBadge: {
    backgroundColor: '#FFF0E5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
  },
  wordTypeText: { color: '#f97316', fontWeight: '500', fontSize: 12 },
  translationBox: {
    backgroundColor: '#FEFBF9',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FFF0E5',
  },
  translationText: { fontSize: 18, color: '#374151', fontWeight: '500' },
  statsContainer: { marginTop: 20, gap: 12 },
  statBox: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: { color: '#6b7280', fontWeight: '500' },
  progressBarBg: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: { height: '100%', borderRadius: 4 },
  statFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  statValue: { fontSize: 28, fontWeight: 'bold' },
  statDescription: { color: '#6b7280', fontSize: 12 },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionButtonOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
    backgroundColor: '#fff',
  },
  actionButtonOutlineText: {
    color: '#f97316',
    fontWeight: 'bold',
    fontSize: 16,
  },
  relatedSection: {
    marginTop: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFF0E5',
  },
  relatedSectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  relatedSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  relatedCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F5F5F5',
    padding: 16,
    marginBottom: 12,
  },
  relatedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  relatedWordText: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  relatedTranslation: { fontWeight: '500', color: '#374151' },
  relatedIpa: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  relatedTypeBadge: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 12,
  },
  relatedTypeText: { color: '#B45309', fontSize: 12, fontWeight: '500' },
  relatedMeaningBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  relatedExampleBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
  },
  relatedMeaningText: { color: '#374151', fontSize: 14 },
  relatedMeaningViText: {
    color: '#6b7280',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notFoundTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  notFoundSub: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  skeleton: {
    backgroundColor: '#e5e7eb',
    opacity: 0.8,
  },
});
