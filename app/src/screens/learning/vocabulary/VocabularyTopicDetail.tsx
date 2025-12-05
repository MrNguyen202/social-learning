import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  TextInput,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Volume2,
  Search,
  X,
  Check,
} from 'lucide-react-native';
import Tts from 'react-native-tts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuth from '../../../../hooks/useAuth';
import { getVocabByTopic } from '../../../api/learning/vocabulary/route';

interface VocabItem {
  id: string;
  word: string;
  mastery_score: number;
  translation?: string;
  related_words?: { word_vi: string }[];
}

const CustomButton = ({ onPress, style, children, disabled = false }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.buttonBase, style, disabled && styles.buttonDisabled]}
    disabled={disabled}
    activeOpacity={0.7}
  >
    {children}
  </TouchableOpacity>
);

export default function VocabularyTopicDetail() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id: topicId } = route.params;
  const { user } = useAuth();

  const [originalVocabs, setOriginalVocabs] = useState<VocabItem[]>([]);
  const [nameEn, setNameEn] = useState('');
  const [nameVi, setNameVi] = useState('');
  const [loading, setLoading] = useState(false);
  const isInitialLoad = useRef(true);

  const [shuffle, setShuffle] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const slideAnim = useRef(new Animated.Value(150)).current;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (user?.id && isInitialLoad.current) {
      loadVocab();
      isInitialLoad.current = false;
    }
  }, [user?.id, topicId]);

  const loadVocab = async () => {
    setLoading(true);
    if (!user || !topicId) return;
    const res = await getVocabByTopic({ userId: user.id, topicId: topicId });

    if (res.success) {
      const withTranslation = res.data.map((v: any) => ({
        ...v,
        translation: v.related_words?.[0]?.word_vi || '',
      }));

      setOriginalVocabs(withTranslation);
      setNameEn(res.name_en);
      setNameVi(res.name_vi);
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

  // Animation cho Sticky Bottom Bar
  useEffect(() => {
    if (selectedWords.length > 0) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 150,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedWords]);

  const speakWord = useCallback(async (text: string) => {
    Tts.stop();
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultRate(0.5);
    Tts.speak(text);
  }, []);

  const shuffledVocabs = useMemo(() => {
    if (shuffle) {
      return [...originalVocabs].sort(() => Math.random() - 0.5);
    }
    return originalVocabs;
  }, [originalVocabs, shuffle]);

  const alphabet = useMemo(() => {
    const letters = new Set<string>();
    originalVocabs.forEach(v => {
      const firstLetter = v.word.charAt(0).toUpperCase();
      if (/[A-Z]/.test(firstLetter)) letters.add(firstLetter);
    });
    return Array.from(letters).sort();
  }, [originalVocabs]);

  const filteredVocabs = useMemo(() => {
    let filtered = shuffledVocabs;
    if (searchQuery)
      filtered = filtered.filter(v =>
        v.word.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    if (selectedLetter)
      filtered = filtered.filter(
        v => v.word.charAt(0).toUpperCase() === selectedLetter,
      );
    return filtered;
  }, [shuffledVocabs, searchQuery, selectedLetter]);

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSelectedWords([]); // Reset selection khi filter/shuffle
  }, [shuffle, originalVocabs]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedWords([]); // Reset selection khi filter đổi
  }, [searchQuery, selectedLetter]);

  const currentVocab = shuffledVocabs[currentIndex];

  // Flashcard
  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentIndex(prev =>
      prev < shuffledVocabs.length - 1 ? prev + 1 : prev,
    );
  };
  const handlePreviousCard = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev));
  };

  // Pagination
  const totalPages = Math.ceil(filteredVocabs.length / itemsPerPage);
  const displayedVocabs = filteredVocabs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(p => p + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1);
  };

  const getMasteryColor = (score: number) => {
    if (score >= 70) return '#16A34A';
    if (score >= 30) return '#D97706';
    return '#DC2626';
  };
  const getMasteryBarColor = (score: number) => {
    if (score >= 70) return '#10B981';
    if (score >= 30) return '#F59E0B';
    return '#EF4444';
  };

  const handleToggleWord = (id: string) => {
    setSelectedWords(prev =>
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (
      selectedWords.length === filteredVocabs.length &&
      filteredVocabs.length > 0
    ) {
      setSelectedWords([]);
    } else {
      setSelectedWords(filteredVocabs.map(v => v.id));
    }
  };

  const handlePracticePress = async () => {
    // Lấy danh sách từ ID
    const wordsToPractice = originalVocabs
      .filter(v => selectedWords.includes(v.id))
      .map(v => v.word);

    if (wordsToPractice.length === 0) return;

    try {
      await AsyncStorage.setItem(
        'practiceWords',
        JSON.stringify(wordsToPractice),
      );
      navigation.navigate('VocabularyPracticeAI');
    } catch (e) {
      console.error('Failed to save practice words to AsyncStorage', e);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          size="large"
          color="#FF6347"
          style={{ marginTop: 50 }}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1, position: 'relative' }}>
        {/* Scrollable Content */}
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTopRow}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                activeOpacity={0.8}
              >
                <ArrowLeft size={20} color="#4B5563" />
                <Text style={styles.backButtonText}>Quay lại</Text>
              </TouchableOpacity>

              {/* Nút Select All */}
              <TouchableOpacity
                onPress={handleSelectAll}
                style={styles.selectAllBtn}
                activeOpacity={0.6}
              >
                <Text style={styles.selectAllText}>
                  {selectedWords.length === filteredVocabs.length &&
                  filteredVocabs.length > 0
                    ? 'Bỏ chọn'
                    : 'Chọn tất cả'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.title}>{nameEn}</Text>
            <Text style={styles.subtitle}>{nameVi}</Text>
          </View>

          {/* Flashcard Section */}
          <View style={styles.flashcardSection}>
            {currentVocab ? (
              <>
                <Pressable
                  onPress={() => setIsFlipped(!isFlipped)}
                  style={styles.cardContainer}
                >
                  {!isFlipped ? (
                    // Front Side
                    <View style={styles.cardFace}>
                      <View style={styles.flashcardLabel}>
                        <Text style={styles.flashcardLabelText}>Word</Text>
                      </View>
                      <Pressable
                        style={styles.listenButton}
                        onPress={() => speakWord(currentVocab.word)}
                      >
                        <Volume2 size={16} color="#F97316" />
                        <Text style={styles.listenButtonText}>Nghe mẫu</Text>
                      </Pressable>
                      <Text style={styles.cardWord}>{currentVocab.word}</Text>
                    </View>
                  ) : (
                    // Back Side
                    <View style={[styles.cardFace, styles.cardFaceBack]}>
                      <View
                        style={[
                          styles.flashcardLabel,
                          { backgroundColor: '#1E293B' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.flashcardLabelText,
                            { color: '#94A3B8' },
                          ]}
                        >
                          Meaning
                        </Text>
                      </View>
                      <Text style={styles.cardWordBack}>
                        {currentVocab.translation}
                      </Text>
                    </View>
                  )}
                </Pressable>

                {/* Flashcard Navigation */}
                <View style={styles.flashcardNav}>
                  <CustomButton
                    onPress={handlePreviousCard}
                    disabled={currentIndex === 0}
                    style={styles.navButton}
                  >
                    <ChevronLeft size={20} color="#4B5563" />
                  </CustomButton>
                  <Text style={styles.flashcardCountText}>
                    {currentIndex + 1} / {shuffledVocabs.length}
                  </Text>
                  <CustomButton
                    onPress={handleNextCard}
                    disabled={currentIndex === shuffledVocabs.length - 1}
                    style={styles.navButton}
                  >
                    <ChevronRight size={20} color="#4B5563" />
                  </CustomButton>
                </View>
              </>
            ) : (
              <Text style={styles.emptyText}>
                Không có từ vựng trong chủ đề này
              </Text>
            )}
          </View>

          {/* Search */}
          <View style={styles.searchSection}>
            <View style={styles.searchInputWrapper}>
              <Search size={20} color="#6B7280" style={styles.searchIcon} />
              <TextInput
                placeholder={'Tìm kiếm từ vựng...'}
                placeholderTextColor="#6B7280"
                value={searchQuery}
                onChangeText={text => {
                  setSearchQuery(text);
                  setCurrentPage(1);
                }}
                style={styles.searchInput}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearIcon}
                >
                  <X size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Alphabet Filter */}
          {!searchQuery && alphabet.length > 0 && (
            <View style={styles.alphabetContainer}>
              <Text style={styles.alphabetTitle}>Lọc theo chữ cái</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  onPress={() => setSelectedLetter(null)}
                  style={[
                    styles.letterButton,
                    selectedLetter === null && styles.letterButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.letterButtonText,
                      selectedLetter === null && styles.letterButtonTextActive,
                    ]}
                  >
                    Tất cả
                  </Text>
                </TouchableOpacity>

                {alphabet.map(letter => (
                  <TouchableOpacity
                    key={letter}
                    onPress={() => {
                      setSelectedLetter(
                        selectedLetter === letter ? null : letter,
                      );
                      setCurrentPage(1);
                      setSelectedWords([]);
                    }}
                    style={[
                      styles.letterButton,
                      selectedLetter === letter && styles.letterButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.letterButtonText,
                        selectedLetter === letter &&
                          styles.letterButtonTextActive,
                      ]}
                    >
                      {letter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Pagination Info */}
          <View style={styles.paginationHeader}>
            <Text style={styles.totalText}>
              Tổng:{' '}
              <Text style={{ color: '#F97316' }}>{filteredVocabs.length}</Text>{' '}
              từ
            </Text>
            <View style={styles.paginationControls}>
              <CustomButton
                onPress={handlePrevPage}
                disabled={currentPage === 1}
                style={styles.pageButton}
              >
                <ChevronLeft size={18} color="#4B5563" />
              </CustomButton>
              <Text style={styles.pageText}>
                {currentPage} / {totalPages > 0 ? totalPages : 1}
              </Text>
              <CustomButton
                onPress={handleNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
                style={styles.pageButton}
              >
                <ChevronRight size={18} color="#4B5563" />
              </CustomButton>
            </View>
          </View>

          {/* Vocab List with Selection */}
          <View style={styles.listContainer}>
            {displayedVocabs.map(v => {
              const isSelected = selectedWords.includes(v.id);
              return (
                <Pressable
                  key={v.id}
                  style={[
                    styles.vocabCard,
                    isSelected && styles.vocabCardSelected,
                  ]}
                  onPress={() =>
                    // Navigate to detail on card press
                    navigation.navigate('VocabularyDetail', { id: v.id })
                  }
                >
                  {/* Checkbox Touch Area - Top Right */}
                  <TouchableOpacity
                    style={styles.checkboxArea}
                    onPress={() => handleToggleWord(v.id)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        isSelected
                          ? styles.checkboxChecked
                          : styles.checkboxUnchecked,
                      ]}
                    >
                      {isSelected && (
                        <Check size={14} color="white" strokeWidth={3} />
                      )}
                    </View>
                  </TouchableOpacity>

                  <View>
                    <View style={styles.cardTopRow}>
                      <View style={styles.cardWordContainer}>
                        <Text
                          style={[
                            styles.cardWordText,
                            isSelected && { color: '#EA580C' },
                          ]}
                        >
                          {v.word}
                        </Text>
                        <Text style={styles.cardTranslationText}>
                          {v.translation}
                        </Text>
                      </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    <View style={styles.cardBottomRow}>
                      <Pressable
                        style={styles.miniSpeaker}
                        onPress={() => speakWord(v.word)}
                      >
                        <Volume2
                          size={20}
                          color={isSelected ? '#EA580C' : '#9CA3AF'}
                        />
                      </Pressable>

                      <View style={styles.scoreGroup}>
                        <View style={styles.progressBg}>
                          <View
                            style={[
                              styles.progressBar,
                              {
                                width: `${v.mastery_score}%`,
                                backgroundColor: getMasteryBarColor(
                                  v.mastery_score,
                                ),
                              },
                            ]}
                          />
                        </View>
                        <Text
                          style={[
                            styles.masteryScore,
                            { color: getMasteryColor(v.mastery_score) },
                          ]}
                        >
                          {v.mastery_score}%
                        </Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Sticky Bottom Action Bar */}
        {selectedWords.length > 0 && (
          <Animated.View
            style={[
              styles.bottomBarContainer,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.bottomBarContent}>
              <View style={styles.selectedCountContainer}>
                <Text style={styles.countNumber}>{selectedWords.length}</Text>
                <Text style={styles.countLabel}>từ đã chọn</Text>
              </View>
              <View style={styles.bottomActions}>
                <TouchableOpacity
                  onPress={() => setSelectedWords([])}
                  style={styles.closeBtn}
                >
                  <Text style={styles.closeBtnText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handlePracticePress}
                  style={styles.practiceBtnSticky}
                >
                  <Text style={styles.practiceBtnTextSticky}>
                    Luyện tập ngay
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Slate 50
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  // Header
  header: {
    marginBottom: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
    marginLeft: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectAllBtn: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  selectAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },

  // Flashcard
  flashcardSection: {
    marginBottom: 40,
  },
  cardContainer: {
    width: '100%',
    height: 256,
    marginBottom: 24,
  },
  cardFace: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    position: 'relative',
  },
  cardFaceBack: {
    backgroundColor: '#0F172A', // Slate 900
    borderColor: '#1E293B',
  },
  flashcardLabel: {
    position: 'absolute',
    top: 20,
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 99,
  },
  flashcardLabelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  listenButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEDD5', // Orange 100
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  listenButtonText: {
    color: '#EA580C', // Orange 600
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '700',
  },
  cardWord: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
  },
  cardWordBack: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },
  flashcardNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  navButton: {
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  flashcardCountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 48,
  },

  // Search
  searchSection: {
    marginBottom: 20,
  },
  searchInputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    height: 48,
    backgroundColor: 'white',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 44,
    paddingRight: 40,
    fontSize: 16,
    color: '#1F2937',
  },
  clearIcon: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },

  // Alphabet Filter
  alphabetContainer: {
    marginBottom: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  alphabetTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 12,
  },
  letterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  letterButtonActive: {
    backgroundColor: '#FF6347',
  },
  letterButtonText: {
    fontWeight: 'bold',
    color: '#6B7280',
  },
  letterButtonTextActive: {
    color: 'white',
  },

  // Pagination
  paginationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pageButton: {
    padding: 6,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },

  // Vocab List
  listContainer: {
    gap: 16,
  },
  vocabCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  vocabCardSelected: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
  },
  checkboxArea: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxUnchecked: {
    borderColor: '#CBD5E1',
    backgroundColor: 'white',
  },
  checkboxChecked: {
    borderColor: '#EA580C',
    backgroundColor: '#EA580C',
  },

  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingRight: 32, // Avoid overlap with checkbox
  },
  cardWordContainer: {
    flex: 1,
  },
  cardWordText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardTranslationText: {
    fontSize: 15,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  miniSpeaker: {
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    marginLeft: -8,
  },
  scoreGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  masteryLabel: {
    fontSize: 12,
    color: '#4B5563',
  },
  masteryScore: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressBg: {
    width: 60,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },

  // Sticky Bottom Bar
  bottomBarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#0F172A', // Slate 900
    borderRadius: 20,
    padding: 16,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedCountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  countNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F97316',
    marginRight: 6,
  },
  countLabel: {
    color: '#94A3B8',
    fontSize: 14,
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  closeBtn: {
    padding: 8,
  },
  closeBtnText: {
    color: '#CBD5E1',
    fontWeight: '600',
  },
  practiceBtnSticky: {
    backgroundColor: '#F97316',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  practiceBtnTextSticky: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Shared
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});
