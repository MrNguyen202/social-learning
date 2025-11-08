import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable, // Dùng để xử lý stopPropagation
  TextInput,
  ScrollView, // Dùng cho phần alphabet filter
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Cần import
import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Volume2,
  X,
} from 'lucide-react-native';

interface Props {
  user: any;
  listPersonalVocab: any[];
  loading: boolean;
  // t: (key: string) => string; // ĐÃ XÓA
  speakWord: (text: string) => void;
  renderLoadingSkeleton: () => any;
  renderEmptyState: () => any;
}

// Component Button tùy chỉnh (để thay thế shadcn/ui button)
const CustomButton = ({ onPress, style, children, disabled = false }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.buttonBase, style, disabled && styles.buttonDisabled]}
    disabled={disabled}
  >
    {children}
  </TouchableOpacity>
);

export default function MasteredTab({
  user,
  listPersonalVocab,
  loading,
  // t, // ĐÃ XÓA
  speakWord,
  renderLoadingSkeleton,
  renderEmptyState,
}: Props) {
  const navigation = useNavigation<any>(); // Thay thế cho useRouter/window.open
  const masteredList = useMemo(
    () => listPersonalVocab.filter(v => v.mastery_score === 100),
    [listPersonalVocab],
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  // const vocabRef = useRef<HTMLDivElement>(null); // ĐÃ XÓA (Web-only)

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(p => p + 1);
      // scrollToTop(); // ĐÃ XÓA
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(p => p - 1);
      // scrollToTop(); // ĐÃ XÓA
    }
  };

  // const scrollToTop = () => {}; // ĐÃ XÓA

  // Trả về mã màu (thay vì class)
  const getMasteryColor = (score: number) => {
    if (score >= 70) return '#16A34A'; // green-600
    if (score >= 30) return '#D97706'; // yellow-600
    return '#DC2626'; // red-600
  };

  // const getMasteryBgColor = ...; // ĐÃ XÓA (Không cần cho hover-effect)

  // Logic filter (giữ nguyên)
  const getAlphabet = () => {
    const letters = new Set<string>();
    masteredList.forEach(mastered => {
      const firstLetter = mastered.word.charAt(0).toUpperCase();
      if (/[A-Z]/.test(firstLetter)) letters.add(firstLetter);
    });
    return Array.from(letters).sort();
  };

  const getFilteredTopics = () => {
    let filtered = masteredList;
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(mastered =>
        mastered.word.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    if (selectedLetter) {
      filtered = filtered.filter(
        mastered => mastered.word.charAt(0).toUpperCase() === selectedLetter,
      );
    }
    return filtered;
  };

  const alphabet = getAlphabet();
  const filteredVocab = getFilteredTopics();
  const totalPages = Math.ceil(filteredVocab.length / itemsPerPage);

  const displayedVocab = filteredVocab.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleLetterClick = (letter: string) => {
    setSelectedLetter(selectedLetter === letter ? null : letter);
    setCurrentPage(1); // reset về trang đầu
    // setTimeout(() => ...); // ĐÃ XÓA
  };

  return (
    <View>
      {/* Search Bar (Đã bỏ motion.div) */}
      <View style={styles.searchSection}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
          {/* Thay thế Input bằng TextInput */}
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
            // Thay thế button bằng TouchableOpacity
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearIcon}
            >
              <X size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Alphabet Filter (Đã bỏ motion.div) */}
      {!searchQuery && alphabet.length > 0 && (
        <View style={styles.alphabetContainer}>
          <Text style={styles.alphabetTitle}>learning.filterByLetter</Text>
          {/* Dùng ScrollView ngang cho các chữ cái */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* Clear filter button (Thay thế motion.button) */}
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

            {/* Alphabet buttons (Thay thế motion.button) */}
            {alphabet.map(letter => (
              <TouchableOpacity
                key={letter}
                onPress={() => handleLetterClick(letter)}
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

      {/* Content Area (Đã bỏ div ref) */}
      <View>
        {loading ? (
          renderLoadingSkeleton()
        ) : masteredList.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {/* Header (Đã bỏ motion.div) */}
            <View style={styles.paginationHeader}>
              <Text style={styles.totalText}>
                learning.mastered:{' '}
                <Text style={{ color: '#F97316' }}>{masteredList.length}</Text>{' '}
                learning.vocabulary
              </Text>
              <View style={styles.paginationControls}>
                {/* Thay thế button bằng CustomButton (TouchableOpacity) */}
                <CustomButton
                  onPress={handlePrev}
                  disabled={currentPage === 1}
                  style={styles.pageButton}
                >
                  <ChevronLeft size={16} color="#4B5563" />
                  <Text style={styles.pageButtonText}>learning.prePage</Text>
                </CustomButton>
                <Text style={styles.pageText}>
                  {currentPage} / {totalPages}
                </Text>
                <CustomButton
                  onPress={handleNext}
                  disabled={currentPage === totalPages}
                  style={styles.pageButton}
                >
                  <Text style={styles.pageButtonText}>learning.nextPage</Text>
                  <ChevronRight size={16} color="#4B5563" />
                </CustomButton>
              </View>
            </View>

            {/* Vocabulary Cards (Đã bỏ AnimatePresence và motion.div) */}
            {/* Chuyển layout "grid" thành danh sách (1 cột) */}
            <View style={styles.listContainer}>
              {displayedVocab.map((vocab, index) => (
                // Thay thế motion.div bằng Pressable
                <Pressable
                  key={vocab.id}
                  // Thay thế window.open bằng navigation.navigate
                  onPress={() =>
                    navigation.navigate('VocabularyDetail', { id: vocab.id })
                  }
                  style={styles.vocabCard}
                >
                  {/* Đã bỏ div gradient background (cho hover) */}
                  <View style={styles.cardContent}>
                    <View style={styles.cardTopRow}>
                      <Text style={styles.cardWordText}>{vocab.word}</Text>
                      {/* Xử lý stopPropagation bằng cách lồng Pressable */}
                      <Pressable
                        onPress={() => {
                          speakWord(vocab.word);
                        }}
                      >
                        <Volume2 size={24} color="#F97316" />
                      </Pressable>
                    </View>
                    <View style={styles.cardBottomRow}>
                      <Text style={styles.masteryLabel}>
                        learning.masteryLevel
                      </Text>
                      <Text
                        style={[
                          styles.masteryScore,
                          { color: getMasteryColor(vocab.mastery_score) },
                        ]}
                      >
                        {vocab.mastery_score}%
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

// --- StyleSheet ---
// (StyleSheet giống hệt như component trước, đã tuân thủ yêu cầu)
const styles = StyleSheet.create({
  // Search
  searchSection: {
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
    color: '#1F2937', // Thêm màu chữ cho TextInput
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
    flexShrink: 1, // Cho phép text co lại nếu cần
    marginRight: 8,
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Giảm gap một chút
  },
  pageButton: {
    paddingVertical: 8,
    paddingHorizontal: 10, // Giảm padding ngang
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageButtonText: {
    color: '#4B5563',
    marginHorizontal: 4,
    fontSize: 14, // Giảm cỡ chữ
  },
  pageText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
    marginHorizontal: 4,
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
  cardContent: {
    position: 'relative',
    zIndex: 10,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardWordText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1, // Đảm bảo text không đẩy icon đi
    marginRight: 8,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  masteryLabel: {
    fontSize: 12,
    color: '#4B5563',
  },
  masteryScore: {
    fontSize: 14,
    fontWeight: 'bold',
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
