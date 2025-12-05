import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../../../../hooks/useAuth';
import { getListPersonalVocabByUserIdAndCreated } from '../../../api/learning/vocabulary/route';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  TrendingUp,
} from 'lucide-react-native';
import Tts from 'react-native-tts';
import OverviewRangeView from './components/RangeView';
import MasteredTab from './components/MasteredTab';
import TopicsTab from './components/TopicsTab';

const CustomButton = ({ onPress, title, style, textStyle }: any) => (
  <TouchableOpacity onPress={onPress} style={[style]}>
    <Text style={[styles.buttonText, textStyle]}>{title}</Text>
  </TouchableOpacity>
);

export default function Vocabulary() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [listPersonalVocab, setListPersonalVocab] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const isInitialLoad = useRef(true);

  // Load dữ liệu
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

    if (res.success) {
      setListPersonalVocab(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    Tts.getInitStatus().then(
      () => {},
      err => {
        if (err.code === 'no_engine') {
          console.warn('No TTS engine installed.');
        }
      },
    );
  }, []);

  const speakWord = async (text: string) => {
    Tts.stop();
    const voices = await Tts.voices();
    const englishVoices = voices.filter(
      (v: any) =>
        v.language.startsWith('en-US') && !v.networkConnectionRequired,
    );

    if (englishVoices.length > 0) {
      const randomVoice =
        englishVoices[Math.floor(Math.random() * englishVoices.length)];
      Tts.setDefaultLanguage(randomVoice.language);
      Tts.setDefaultVoice(randomVoice.id);
    } else {
      Tts.setDefaultLanguage('en-US');
    }

    Tts.setDefaultRate(0.5);
    Tts.setDefaultPitch(1.0);
    Tts.speak(text);
  };

  // Tính stats
  const totalWords = listPersonalVocab.length;
  const averageMastery =
    totalWords > 0
      ? Math.round(
          listPersonalVocab.reduce((sum, v) => sum + v.mastery_score, 0) /
            totalWords,
        )
      : 0;
  const wordsToReview = listPersonalVocab.filter(
    v => v.mastery_score < 70,
  ).length;

  const lowCount = listPersonalVocab.filter(v => v.mastery_score <= 29).length;
  const midCount = listPersonalVocab.filter(
    v => v.mastery_score >= 30 && v.mastery_score <= 69,
  ).length;
  const highCount = listPersonalVocab.filter(
    v => v.mastery_score >= 70 && v.mastery_score <= 99,
  ).length;

  // Render Skeleton
  const renderLoadingSkeleton = () => {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6347" />
      </View>
    );
  };

  // Render Empty State
  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <View style={styles.emptyIconBackground}>
            <BookOpen size={80} color="#FF6347" />
          </View>
        </View>
        <Text style={styles.emptyTitle}>
          {searchQuery ? 'Không tìm thấy từ vựng' : 'Chưa có từ vựng'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {searchQuery
            ? 'Hãy thử điều chỉnh truy vấn tìm kiếm của bạn'
            : 'Bắt đầu học và thêm từ mới vào bộ sưu tập từ vựng cá nhân của bạn'}
        </Text>
        {searchQuery && (
          <CustomButton
            title={'learning.clearSearch'}
            onPress={() => setSearchQuery('')}
            style={styles.emptyButton}
          />
        )}
      </View>
    );
  };

  // Các card cho tab "Overview"
  const overviewCards = [
    {
      key: 'low',
      title: 'Cần ôn gấp',
      count: lowCount,
      icon: AlertCircle,
      background: '#FEE2E2',
      color: '#B91C1C',
    },
    {
      key: 'mid',
      title: 'Đang tiến bộ',
      count: midCount,
      icon: TrendingUp,
      background: '#FEF3C7',
      color: '#B45309',
    },
    {
      key: 'high',
      title: 'Sắp thành thạo',
      count: highCount,
      icon: BookOpen,
      background: '#D1FAE5',
      color: '#065F46',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#78BBA0', '#96CEB4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View>
              <Text style={styles.headerTitle}>Từ vựng của tôi</Text>
              <Text style={styles.headerSubtitle}>
                Quản lý và ôn tập từ vựng
              </Text>
            </View>
          </View>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <View style={styles.contentArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.container}
        >
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            {/* Card 1: Total Words */}
            <View style={styles.statCard}>
              <View style={styles.statContent}>
                <View>
                  <Text style={styles.statValue}>{totalWords}</Text>
                  <Text style={styles.statLabel}>Tổng số từ</Text>
                </View>
              </View>
            </View>
            {/* Card 2: Average Mastery */}
            <View style={styles.statCard}>
              <View style={styles.statContent}>
                <View>
                  <Text style={[styles.statValue, { color: '#34D399' }]}>
                    {averageMastery}%
                  </Text>
                  <Text style={styles.statLabel}>Trung bình thành thạo</Text>
                </View>
              </View>
            </View>
            {/* Card 3: Words to Review */}
            <View style={styles.statCard}>
              <View style={styles.statContent}>
                <View>
                  <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                    {wordsToReview}
                  </Text>
                  <Text style={styles.statLabel}>Cần xem lại</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <View style={styles.tabList}>
              <TouchableOpacity
                style={[
                  styles.tabTrigger,
                  activeTab === 'overview' && styles.tabTriggerActive,
                ]}
                onPress={() => {
                  setActiveTab('overview');
                  setSelectedTopic(null);
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'overview' && styles.tabTextActive,
                  ]}
                >
                  Tổng quan
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabTrigger,
                  activeTab === 'mastered' && styles.tabTriggerActive,
                ]}
                onPress={() => setActiveTab('mastered')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'mastered' && styles.tabTextActive,
                  ]}
                >
                  Đã thành thạo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabTrigger,
                  activeTab === 'topics' && styles.tabTriggerActive,
                ]}
                onPress={() => setActiveTab('topics')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'topics' && styles.tabTextActive,
                  ]}
                >
                  Chủ đề
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tabs Content */}
          <View>
            {activeTab === 'overview' && (
              <View>
                {selectedTopic ? (
                  <OverviewRangeView
                    topicKey={selectedTopic}
                    listPersonalVocab={listPersonalVocab}
                    speakWord={speakWord}
                    onBack={() => setSelectedTopic(null)}
                    onSelectWord={(id: string) =>
                      navigation.navigate('VocabularyDetail', { id: id })
                    }
                  />
                ) : (
                  <View style={styles.overviewGrid}>
                    {overviewCards.map(card => {
                      const Icon = card.icon;
                      return (
                        <View key={card.key} style={styles.overviewCard}>
                          <TouchableOpacity
                            onPress={() => setSelectedTopic(card.key)}
                          >
                            <View style={styles.overviewCardContent}>
                              <View>
                                <Text style={styles.overviewCardTitle}>
                                  {card.title}
                                </Text>
                                <Text style={styles.overviewCardCount}>
                                  {loading ? '…' : card.count}
                                </Text>
                              </View>
                              <View style={[styles.overviewCardIconWrapper, { backgroundColor: card.background }]}>
                                <Icon size={28} color={card.color} />
                              </View>
                            </View>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            {activeTab === 'mastered' && (
              <MasteredTab
                user={user}
                listPersonalVocab={listPersonalVocab}
                loading={loading}
                speakWord={speakWord}
                renderLoadingSkeleton={renderLoadingSkeleton}
                renderEmptyState={renderEmptyState}
              />
            )}

            {activeTab === 'topics' && (
              <TopicsTab
                loading={loading}
                user={user}
                renderLoadingSkeleton={renderLoadingSkeleton}
                renderEmptyState={renderEmptyState}
              />
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },

  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  headerRight: { width: 40 },
  contentArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -16,
    overflow: 'hidden',
    padding: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 28,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },

  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statLabel: {
    fontSize: 16,
    color: '#4B5563',
  },

  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6347',
  },

  statIconWrapper: {
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
  },

  tabsContainer: {
    marginBottom: 16,
  },

  tabList: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  tabTrigger: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
  },

  tabTriggerActive: {
    backgroundColor: '#FFFFFF',
    elevation: 3,
  },

  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    textAlign: 'center',
  },

  tabTextActive: {
    color: '#FF6347',
  },

  overviewGrid: {
    gap: 16,
    paddingBottom: 12,
  },

  overviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },

  overviewCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  overviewCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  overviewCardCount: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 8,
  },

  overviewCardIconWrapper: {
    padding: 12,
    borderRadius: 12,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },

  emptyIconBackground: {
    padding: 32,
    backgroundColor: 'rgba(255, 99, 71, 0.1)',
    borderRadius: 9999,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    maxWidth: 350,
  },

  emptyButton: {
    marginTop: 24,
    backgroundColor: '#FF6347',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
});
