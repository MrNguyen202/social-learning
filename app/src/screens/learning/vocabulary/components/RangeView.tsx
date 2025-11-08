import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable, // Dùng để thay thế stopPropagation
  TextInput,
  ScrollView, // Dùng cho phần alphabet filter
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Volume2,
  Search,
  X,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Định nghĩa Interface (giữ nguyên)
interface VocabItem {
  id: string;
  word: string;
  mastery_score: number;
  translation?: string;
  related_words?: { word_vi: string }[];
}

interface Props {
  // t: (key: string) => string; // ĐÃ XÓA
  topicKey: string;
  listPersonalVocab: VocabItem[];
  speakWord: (text: string) => void;
  onBack: () => void;
  onSelectWord?: (id: string) => void;
}

// Component Button tùy chỉnh (để thay thế shadcn/ui)
const CustomButton = ({ onPress, style, children, disabled = false }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.buttonBase, style, disabled && styles.buttonDisabled]}
    disabled={disabled}
  >
    {children}
  </TouchableOpacity>
);

export default function OverviewRangeView({
  // t, // ĐÃ XÓA
  topicKey,
  listPersonalVocab = [],
  speakWord,
  onBack,
  onSelectWord,
}: Props) {
  const ranges: Record<string, [number, number]> = {
    low: [0, 29],
    mid: [30, 69],
    high: [70, 99],
  };
  const navigation = useNavigation<any>(); // Thay thế useRouter
  const [min, max] = ranges[topicKey] ?? [0, 100];

  // Đã thay t() bằng string
  const title =
    topicKey === 'low'
      ? 'learning.urgentReview'
      : topicKey === 'mid'
      ? 'learning.inProgress'
      : 'learning.wellMastered';

  const [vocabs, setVocabs] = useState<VocabItem[]>([]);
  const [shuffle, setShuffle] = useState(false); // Logic shuffle có thể giữ lại
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Flashcard states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const currentVocab = vocabs[currentIndex];

  // Filter theo mastery (logic giữ nguyên)
  useEffect(() => {
    if (!listPersonalVocab || !Array.isArray(listPersonalVocab)) {
      setVocabs([]);
      return;
    }

    const withTranslation = listPersonalVocab.map(v => {
      if (!v.translation && v.related_words?.length) {
        return { ...v, translation: v.related_words[0].word_vi };
      }
      return v;
    });

    const filtered = withTranslation.filter(
      v => v.mastery_score >= min && v.mastery_score <= max,
    );

    setVocabs(filtered);
    setCurrentPage(1);
    setCurrentIndex(0);
  }, [listPersonalVocab, min, max]);

  // Shuffle (logic giữ nguyên)
  useEffect(() => {
    if (shuffle && vocabs.length > 0) {
      setVocabs(prev => [...prev].sort(() => Math.random() - 0.5));
      setCurrentPage(1);
    }
  }, [shuffle]);

  // Flashcard controls (logic giữ nguyên)
  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev < vocabs.length - 1 ? prev + 1 : prev));
  };

  const handlePreviousCard = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev));
  };

  const handleResetCard = () => {
    setIsFlipped(false);
    setCurrentIndex(0);
  };

  // Helpers trả về mã màu thay vì class
  const getMasteryColor = (score: number) => {
    if (score >= 70) return '#16A34A'; // green-600
    if (score >= 30) return '#D97706'; // yellow-600
    return '#DC2626'; // red-600
  };

  const getMasteryBarColor = (score: number) => {
    if (score >= 70) return '#10B981'; // green-500
    if (score >= 30) return '#F59E0B'; // yellow-500
    return '#EF4444'; // red-500
  };

  // Alphabet filtering (logic giữ nguyên)
  const alphabet = useMemo(() => {
    const letters = new Set<string>();
    vocabs.forEach(v => {
      const firstLetter = v.word.charAt(0).toUpperCase();
      if (/[A-Z]/.test(firstLetter)) letters.add(firstLetter);
    });
    return Array.from(letters).sort();
  }, [vocabs]);

  const filteredVocabs = useMemo(() => {
    let filtered = vocabs;
    if (searchQuery)
      filtered = filtered.filter(v =>
        v.word.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    if (selectedLetter)
      filtered = filtered.filter(
        v => v.word.charAt(0).toUpperCase() === selectedLetter,
      );
    return filtered;
  }, [vocabs, searchQuery, selectedLetter]);

  const totalPages = Math.ceil(filteredVocabs.length / itemsPerPage);
  const displayedVocabs = filteredVocabs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(p => p + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(p => p - 1);
    }
  };

  const getWords = filteredVocabs.map(v => v.word);

  const handlePracticePress = async () => {
    try {
      await AsyncStorage.setItem('practiceWords', JSON.stringify(getWords));
      navigation.navigate('VocabularyPracticeAI'); // Tên màn hình giả định
    } catch (e) {
      console.error('Failed to save practice words to AsyncStorage', e);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <CustomButton onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={20} color="#4B5563" />
            <Text style={styles.backButtonText}>learning.back</Text>
          </CustomButton>
          <Text style={styles.title}>{title}</Text>
        </View>
        <CustomButton
          onPress={handlePracticePress}
          style={styles.practiceButton}
        >
          <Text style={styles.practiceButtonText}>learning.practice</Text>
        </CustomButton>
      </View>

      {/* ✅ Flashcard Section */}
      <View style={styles.flashcardSection}>
        {currentVocab ? (
          <>
            {/* Flashcard: ĐÃ BỎ HIỆU ỨNG LẬT, thay bằng HIỂN THỊ CÓ ĐIỀU KIỆN */}
            <Pressable
              onPress={() => setIsFlipped(!isFlipped)}
              style={styles.cardContainer}
            >
              {!isFlipped ? (
                // Front
                <View style={styles.cardFace}>
                  <Pressable
                    style={styles.listenButton}
                    onPress={() => speakWord(currentVocab.word)}
                  >
                    <Volume2 size={16} color="#F97316" />
                    <Text style={styles.listenButtonText}>
                      learning.listenSample
                    </Text>
                  </Pressable>
                  <Text style={styles.cardWord}>{currentVocab.word}</Text>
                </View>
              ) : (
                // Back
                <View style={styles.cardFace}>
                  <Text style={styles.cardWord}>
                    {currentVocab.translation}
                  </Text>
                </View>
              )}
            </Pressable>

            {/* Flashcard navigation */}
            <View style={styles.flashcardNav}>
              <CustomButton
                onPress={handlePreviousCard}
                disabled={currentIndex === 0}
                style={styles.navButton}
              >
                <ChevronLeft size={20} color="#4B5563" />
              </CustomButton>
              <CustomButton onPress={handleResetCard} style={styles.navButton}>
                <RotateCcw size={20} color="#4B5563" />
              </CustomButton>
              <CustomButton
                onPress={handleNextCard}
                disabled={currentIndex === vocabs.length - 1}
                style={styles.navButton}
              >
                <ChevronRight size={20} color="#4B5563" />
              </CustomButton>
            </View>
          </>
        ) : (
          <Text style={styles.emptyText}>learning.noWordsInRange</Text>
        )}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            placeholder={'learning.searchVocab'}
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
      {alphabet.length > 0 && (
        <View style={styles.alphabetContainer}>
          <Text style={styles.alphabetTitle}>learning.filterByLetter</Text>
          {/* Dùng ScrollView ngang để chứa các chữ cái */}
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
                learning.all
              </Text>
            </TouchableOpacity>
            {alphabet.map(letter => (
              <TouchableOpacity
                key={letter}
                onPress={() =>
                  setSelectedLetter(selectedLetter === letter ? null : letter)
                }
                style={[
                  styles.letterButton,
                  selectedLetter === letter && styles.letterButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.letterButtonText,
                    selectedLetter === letter && styles.letterButtonTextActive,
                  ]}
                >
                  {letter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Pagination Header */}
      <View style={styles.paginationHeader}>
        <Text style={styles.totalText}>
          learning.total:{' '}
          <Text style={{ color: '#F97316' }}>{filteredVocabs.length}</Text>{' '}
          learning.vocabulary
        </Text>
        <View style={styles.paginationControls}>
          <CustomButton
            onPress={handlePrevPage}
            disabled={currentPage === 1}
            style={styles.pageButton}
          >
            <ChevronLeft size={16} color="#4B5563" />
          </CustomButton>
          <Text style={styles.pageText}>
            {currentPage} / {totalPages}
          </Text>
          <CustomButton
            onPress={handleNextPage}
            disabled={currentPage === totalPages}
            style={styles.pageButton}
          >
            <ChevronRight size={16} color="#4B5563" />
          </CustomButton>
        </View>
      </View>

      {/* Grid/List -> Đã chuyển thành List (1 cột) */}
      <View style={styles.listContainer}>
        {displayedVocabs.map(v => (
          <Pressable
            key={v.id}
            style={styles.vocabCard}
            onPress={() => onSelectWord?.(v.id)}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardTopRow}>
                <View style={styles.cardWordContainer}>
                  <Text style={styles.cardWordText}>{v.word}</Text>
                  <Text style={styles.cardTranslationText}>
                    {v.translation}
                  </Text>
                </View>
                <Pressable onPress={() => speakWord(v.word)}>
                  <Volume2 size={24} color="#F97316" />
                </Pressable>
              </View>
              <View style={styles.cardBottomRow}>
                <Text style={styles.masteryLabel}>learning.masteryLevel</Text>
                <Text
                  style={[
                    styles.masteryScore,
                    { color: getMasteryColor(v.mastery_score) },
                  ]}
                >
                  {v.mastery_score}%
                </Text>
              </View>
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${v.mastery_score}%`,
                      backgroundColor: getMasteryBarColor(v.mastery_score),
                    },
                  ]}
                />
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// --- StyleSheet ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16, // px-6
    paddingBottom: 20,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 0, // Tương tự variant="ghost"
  },
  backButtonText: {
    fontSize: 16,
    color: '#4B5563',
    marginLeft: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  practiceButton: {
    backgroundColor: '#FF6347', // Gradient fallback
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20, // rounded-4xl
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  practiceButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Flashcard
  flashcardSection: {
    marginBottom: 40,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 450,
    height: 256, // h-64
    alignSelf: 'center',
    marginBottom: 24,
  },
  cardFace: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  listenButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: '#FDBA74', // border-orange-200
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  listenButtonText: {
    color: '#F97316',
    marginLeft: 8,
  },
  cardWord: {
    fontSize: 36, // text-4xl
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  flashcardNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  navButton: {
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 99,
  },
  emptyText: {
    color: '#4B5563',
    textAlign: 'center',
    paddingVertical: 48,
  },
  // Divider
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 32,
  },
  // Search
  searchContainer: {
    marginBottom: 24,
  },
  searchInputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  searchInput: {
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 48, // pl-12
    paddingRight: 40, // pr-10
    fontSize: 16,
  },
  clearIcon: {
    position: 'absolute',
    right: 16,
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
    marginRight: 8, // gap-2
  },
  letterButtonActive: {
    backgroundColor: '#FF6347', // Gradient fallback
  },
  letterButtonText: {
    fontWeight: '600',
    color: '#374151',
  },
  letterButtonTextActive: {
    color: '#FFFFFF',
  },
  // Pagination
  paginationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pageButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  pageText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
  },
  // Vocab List
  listContainer: {
    gap: 16,
  },
  vocabCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardContent: {},
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardWordContainer: {
    flex: 1,
  },
  cardWordText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cardTranslationText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 2, // Gần giống ml-2
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  masteryLabel: {
    fontSize: 12,
    color: '#4B5563',
  },
  masteryScore: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBg: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  // Base button
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});
