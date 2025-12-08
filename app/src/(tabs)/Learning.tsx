import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
} from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  TrendingUp,
  Trophy,
  PenTool,
  Volume2,
  BookOpen,
  AudioLines,
  ChevronRight,
  Star,
  Target,
  ChartSpline,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const { width } = Dimensions.get('window');

const LearningTab = () => {
  const navigation = useNavigation<any>();

  const learningItems = [
    {
      icon: PenTool,
      label: 'Luyện viết tiếng Anh',
      description: 'Cải thiện kỹ năng viết',
      route: 'Writing',
      color: '#FF6B6B',
      lightColor: '#FFE8E8',
      special: true,
    },
    {
      icon: AudioLines,
      label: 'Luyện nghe tiếng Anh',
      description: 'Nâng cao khả năng nghe',
      route: 'Listening',
      color: '#4ECDC4',
      lightColor: '#E8FFFE',
    },
    {
      icon: Volume2,
      label: 'Luyện nói',
      description: 'Phát triển kỹ năng giao tiếp',
      route: 'Speaking',
      color: '#45B7D1',
      lightColor: '#E8F6FF',
    },
    {
      icon: BookOpen,
      label: 'Từ vựng của bạn',
      description: 'Mở rộng vốn từ vựng',
      route: 'Vocabulary',
      color: '#96CEB4',
      lightColor: '#F0F9F4',
    },
  ];

  const statsItems = [
    {
      icon: Trophy,
      label: 'Bảng xếp hạng',
      route: 'Ranking',
      color: '#FFD93D',
    },
    {
      icon: TrendingUp,
      label: 'Tiến trình của tôi',
      route: 'Progress',
      color: '#6BCF7F',
    },
    {
      icon: ChartSpline,
      label: 'Lộ trình học tập',
      route: 'Roadmap',
      color: '#d11dce',
    },
  ];

  const renderLearningCard = (item: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.learningCard}
      onPress={() => navigation.navigate(item.route)}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.cardContainer,
          {
            backgroundColor: item.lightColor,
            borderLeftColor: item.color,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: item.color + '20' },
            ]}
          >
            <item.icon size={28} color={item.color} />
          </View>
        </View>

        <Text style={styles.cardTitle}>{item.label}</Text>

        <Text style={styles.cardDescription}>{item.description}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.starContainer}>
            <Star size={16} color="#FFD93D" />
            <Text style={styles.learnNowText}>Học ngay</Text>
          </View>
          <ChevronRight size={20} color={item.color} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderStatsCard = (item: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.statsCard}
      onPress={() => navigation.navigate(item.route)}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.statsCardContainer,
          {
            backgroundColor: item.color + '15',
            borderColor: item.color + '30',
          },
        ]}
      >
        <item.icon size={24} color={item.color} />
        <Text style={styles.statsCardText}>{item.label}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header với gradient */}
      <LinearGradient
        // colors={['#F97316', '#EC4899']}
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Góc học tập</Text>
            {/* <Text style={styles.headerSubtitle}>
              Nâng cao trình độ tiếng Anh
            </Text> */}
          </View>

          {/* <View style={styles.headerIcon}>
            <Target size={25} color="#fff" />
          </View> */}
        </View>
      </LinearGradient>

      {/* Stats Row */}
      <View style={styles.statsSection}>
        <View style={styles.statsContainer}>
          {statsItems.map((item, index) => renderStatsCard(item, index))}
        </View>
      </View>

      {/* Learning Cards */}
      <View style={styles.learningSection}>
        <Text style={styles.sectionTitle}>Kỹ năng cần luyện tập</Text>

        {learningItems.map((item, index) => renderLearningCard(item, index))}
      </View>

      {/* Bottom spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  headerGradient: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(24),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: moderateScale(30),
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: verticalScale(4),
  },
  headerSubtitle: {
    color: '#ffffff',
    opacity: 0.8,
    fontSize: moderateScale(16),
  },
  headerIcon: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(32),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsSection: {
    paddingHorizontal: scale(16),
    marginTop: verticalScale(-24),
    marginBottom: verticalScale(24),
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(12),
    padding: scale(16),
    flexDirection: 'row',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  statsCard: {
    flex: 1,
    marginHorizontal: scale(4),
  },
  statsCardContainer: {
    borderRadius: moderateScale(12),
    padding: scale(16),
    alignItems: 'center',
    justifyContent: 'center',
    height: verticalScale(80),
    borderWidth: 1,
  },
  statsCardText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#374151',
    marginTop: verticalScale(8),
    textAlign: 'center',
  },
  learningSection: {
    paddingHorizontal: scale(8),
  },
  sectionTitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: verticalScale(16),
    paddingHorizontal: scale(8),
  },
  learningCard: {
    marginBottom: verticalScale(16),
    marginHorizontal: scale(8),
  },
  cardContainer: {
    borderRadius: moderateScale(16),
    padding: scale(20),
    borderLeftWidth: scale(4),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(12),
  },
  iconContainer: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotBadge: {
    backgroundColor: '#FFD93D',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(20),
  },
  hotBadgeText: {
    fontSize: moderateScale(12),
    fontWeight: 'bold',
    color: '#1f2937',
  },
  cardTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: verticalScale(4),
  },
  cardDescription: {
    fontSize: moderateScale(14),
    color: '#6b7280',
    marginBottom: verticalScale(12),
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  learnNowText: {
    fontSize: moderateScale(12),
    color: '#6b7280',
    marginLeft: scale(4),
  },
  bottomSpacing: {
    height: verticalScale(32),
  },
});

export default LearningTab;
