import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
  speakWord: (text: string) => void;
  renderLoadingSkeleton: () => any;
  renderEmptyState: () => any;
}

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
  speakWord,
  renderLoadingSkeleton,
  renderEmptyState,
}: Props) {
  const navigation = useNavigation<any>();
  const masteredList = useMemo(
    () => listPersonalVocab.filter(v => v.mastery_score === 100),
    [listPersonalVocab],
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(p => p + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(p => p - 1);
    }
  };

  const getMasteryColor = (score: number) => {
    if (score >= 70) return '#16A34A';
    if (score >= 30) return '#D97706';
    return '#DC2626';
  };

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
    setCurrentPage(1);
  };

  return (
    <View>
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

      <View>
        {loading ? (
          renderLoadingSkeleton()
        ) : masteredList.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <View style={styles.paginationHeader}>
              <Text style={styles.totalText}>
                Đã thành thạo:{' '}
                <Text style={{ color: '#F97316' }}>{masteredList.length}</Text>{' '}
                từ
              </Text>
              <View style={styles.paginationControls}>
                <CustomButton
                  onPress={handlePrev}
                  disabled={currentPage === 1}
                  style={styles.pageButton}
                >
                  <ChevronLeft size={16} color="#4B5563" />
                </CustomButton>
                <Text style={styles.pageText}>
                  {currentPage} / {totalPages}
                </Text>
                <CustomButton
                  onPress={handleNext}
                  disabled={currentPage === totalPages}
                  style={styles.pageButton}
                >
                  <ChevronRight size={16} color="#4B5563" />
                </CustomButton>
              </View>
            </View>

            <View style={styles.listContainer}>
              {displayedVocab.map((vocab, index) => (
                <Pressable
                  key={vocab.id}
                  onPress={() =>
                    navigation.navigate('VocabularyDetail', { id: vocab.id })
                  }
                  style={styles.vocabCard}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.cardTopRow}>
                      <Text style={styles.cardWordText}>{vocab.word}</Text>
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
                        Trình độ thành thạo
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
    paddingLeft: 48,
    paddingRight: 40,
    fontSize: 16,
    color: '#1F2937',
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
    marginRight: 8,
  },
  letterButtonActive: {
    backgroundColor: '#FF6347',
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
    flexShrink: 1,
    marginRight: 8,
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageButtonText: {
    color: '#4B5563',
    marginHorizontal: 4,
    fontSize: 14,
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
    marginBottom: 32,
  },
  vocabCard: {
    backgroundColor: 'white',
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
    flex: 1,
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
