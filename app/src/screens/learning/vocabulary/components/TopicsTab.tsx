import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react-native';
import { getUserTopics } from '../../../../api/learning/vocabulary/route';

interface Props {
  user: any;
  loading: boolean;
  renderLoadingSkeleton: () => any;
  renderEmptyState: () => any;
}

export default function TopicsTab({
  loading,
  user,
  renderLoadingSkeleton,
  renderEmptyState,
}: Props) {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 4;

  useEffect(() => {
    getTopics();
  }, [user]);

  const getTopics = async () => {
    if (!user) return;
    try {
      const res = await getUserTopics({ userId: user.id });
      if (res.success) {
        setTopics(res.data);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const getAlphabet = () => {
    const letters = new Set<string>();
    topics.forEach(topic => {
      const firstLetter = topic.name_en.charAt(0).toUpperCase();
      if (/[A-Z]/.test(firstLetter)) letters.add(firstLetter);
    });
    return Array.from(letters).sort();
  };

  const getFilteredTopics = () => {
    let filtered = topics;
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(
        topic =>
          topic.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
          topic.name_vi.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    if (selectedLetter) {
      filtered = filtered.filter(
        topic => topic.name_en.charAt(0).toUpperCase() === selectedLetter,
      );
    }
    return filtered;
  };

  const alphabet = getAlphabet();
  const filteredTopics = getFilteredTopics();
  const totalPages = Math.ceil(filteredTopics.length / itemsPerPage);

  const displayedTopics = filteredTopics.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleLetterClick = (letter: string) => {
    setSelectedLetter(selectedLetter === letter ? null : letter);
    setCurrentPage(1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(p => p + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1);
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

      {loading ? (
        renderLoadingSkeleton()
      ) : filteredTopics.length > 0 ? (
        <>
          <View style={styles.listContainer}>
            {displayedTopics.map((topic, index) => (
              <TouchableOpacity
                // Thay thế router.push bằng navigation.navigate
                onPress={() =>
                  navigation.navigate('VocabularyTopicDetail', { id: topic.id })
                }
                key={topic.id}
                style={styles.topicCard}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardTopRow}>
                    <View style={styles.cardTextContainer}>
                      <Text style={styles.cardTitle}>{topic.name_en}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardDescription}>
                    {topic.name_vi || 'learning.noDescription'}
                  </Text>
                  {topic.total_vocab && (
                    <View style={styles.cardFooter}>
                      <Text style={styles.cardFooterText}>
                        {topic.total_vocab} từ vựng
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Pagination Controls */}
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              onPress={handlePrev}
              disabled={currentPage === 1}
              style={[
                styles.pageButton,
                currentPage === 1 && styles.buttonDisabled,
              ]}
            >
              <ChevronLeft size={16} color="#4B5563" />
            </TouchableOpacity>

            <Text style={styles.pageText}>
              {currentPage} / {totalPages}
            </Text>

            <TouchableOpacity
              onPress={handleNext}
              disabled={currentPage === totalPages}
              style={[
                styles.pageButton,
                currentPage === totalPages && styles.buttonDisabled,
              ]}
            >
              <ChevronRight size={16} color="#4B5563" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        renderEmptyState()
      )}
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
  // Topic List
  listContainer: {
    paddingVertical: 16,
    gap: 16,
  },
  topicCard: {
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
  cardTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cardDescription: {
    fontSize: 14,
    color: '#4B5563',
  },
  cardFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cardFooterText: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Pagination
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    gap: 16,
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
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});
