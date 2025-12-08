import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
} from 'react-native';
import {
  ArrowLeft,
  Volume2,
  Sparkles,
  ArrowRight,
  Mic,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Level } from '../../../components/Level';
import { Topic } from '../../../components/Topic';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Speaking() {
  const navigation = useNavigation<any>();
  const [selectedLevel, setSelectedLevel] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const isReady = selectedLevel && selectedTopic;

  useFocusEffect(
    useCallback(() => {
      setLoading(false);

      return () => {};
    }, []),
  );

  const handleStart = async () => {
    if (isReady) {
      // Trước khi navigate đến SpeakingLesson
      await AsyncStorage.setItem('levelId', selectedLevel.id.toString());
      await AsyncStorage.setItem('topicId', selectedTopic.id.toString());
      navigation.navigate('LessonSpeaking');
    }
  };

  const handleGenerateAI = async () => {
    if (isReady) {
      // Trước khi navigate đến SpeakingLessonAI
      await AsyncStorage.setItem('levelSlug', selectedLevel.slug.toString());
      await AsyncStorage.setItem('topicSlug', selectedTopic.slug.toString());
      setLoading(true);
      navigation.navigate('LessonSpeakingAI');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header với gradient */}
      <LinearGradient
        colors={['#45B7D1', '#6BC5E8']}
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
              <Text style={styles.headerTitle}>Luyện nói</Text>
              <Text style={styles.headerSubtitle}>
                Phát triển kỹ năng giao tiếp
              </Text>
            </View>
          </View>

          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        <FlatList
          data={[1]} // danh sách giả chỉ để render 1 item chứa toàn bộ nội dung
          renderItem={() => (
            <>
              {/* Description */}
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionTitle}>
                  Tự tin giao tiếp bằng tiếng Anh
                </Text>
                <Text style={styles.descriptionText}>
                  Luyện tập phát âm và kỹ năng nói qua các bài tập tương tác thú
                  vị
                </Text>
              </View>

              <Level
                selectedLevel={selectedLevel}
                setSelectedLevel={setSelectedLevel}
              />

              <Topic
                selectedTopic={selectedTopic}
                setSelectedTopic={setSelectedTopic}
              />

              <View style={styles.bottomSpacing} />
            </>
          )}
          keyExtractor={() => 'main-content'}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        />

        {/* Footer Actions */}
        {isReady && (
          <View style={styles.footer}>
            <View style={styles.selectionSummary}>
              <Text style={styles.summaryText}>
                <Text style={styles.summaryLabel}>Mức độ: </Text>
                <Text style={styles.summaryValue}>{selectedLevel?.name}</Text>
              </Text>
              <Text style={styles.summaryText}>
                <Text style={styles.summaryLabel}>Chủ đề: </Text>
                <Text style={styles.summaryValue}>{selectedTopic?.name}</Text>
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.aiButton}
                onPress={handleGenerateAI}
                activeOpacity={0.8}
              >
                <Text style={styles.aiButtonText}>Tạo bài AI</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleStart}
                activeOpacity={0.8}
              >
                <Text style={styles.nextButtonText}>Bắt đầu</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Loading Modal */}
      <Modal visible={loading} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.loadingIconContainer}>
              <Mic size={32} color="#45B7D1" />
            </View>
            <ActivityIndicator
              size="large"
              color="#45B7D1"
              style={styles.spinner}
            />
            <Text style={styles.modalTitle}>Đang tạo bài nói</Text>
            <Text style={styles.modalText}>
              AI đang tạo bài luyện nói phù hợp với bạn...
            </Text>
          </View>
        </View>
      </Modal>
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
  headerTitle: {
    textAlign: 'center',
    fontSize: 20,
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
    paddingBottom: 140,
  },
  descriptionContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 32,
  },
  footer: {
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
  selectionSummary: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryLabel: {
    color: '#6b7280',
    fontWeight: '500',
  },
  summaryValue: {
    color: '#1f2937',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  aiButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#45B7D1',
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#45B7D1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  aiButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  nextButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 40,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  loadingIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  spinner: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
