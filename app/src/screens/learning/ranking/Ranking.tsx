import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { ArrowLeft, Crown, Trophy } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { getUserImageSrc } from '../../../api/image/route';
import { getLeaderBoardByType } from '../../../api/learning/ranking/route';
import useAuth from '../../../../hooks/useAuth';
import LeaderboardCard from './components/LeaderboardCard';

const { width } = Dimensions.get('window');

// Component hiển thị Top 1, 2, 3 (Podium)
const PodiumItem = ({
  item,
  rank,
  isUser,
}: {
  item: any;
  rank: number;
  isUser: boolean;
}) => {
  if (!item) return <View style={styles.podiumPlaceholder} />;

  // Cấu hình kích thước và màu sắc dựa trên thứ hạng
  const isFirst = rank === 1;
  const isSecond = rank === 2;

  const size = isFirst ? 100 : 80;
  const podiumHeight = isFirst ? 160 : isSecond ? 130 : 110;
  const borderColor = isFirst ? '#FFD700' : isSecond ? '#C0C0C0' : '#CD7F32';
  const crownColor = isFirst ? '#FFD700' : isSecond ? '#C0C0C0' : '#CD7F32';

  // Animation delay dựa trên thứ hạng để tạo hiệu ứng xuất hiện lần lượt
  const delay = isFirst ? 200 : isSecond ? 100 : 300;

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      style={[styles.podiumItemContainer, { marginTop: isFirst ? 0 : 30 }]}
    >
      <View style={styles.avatarContainer}>
        {isFirst && (
          <View style={styles.crownContainer}>
            <Crown size={32} color="#FFD700" fill="#FFD700" />
          </View>
        )}
        <View
          style={[
            styles.avatarBorder,
            { width: size, height: size, borderRadius: size / 2, borderColor },
          ]}
        >
          <Image
            source={{
              uri:
                getUserImageSrc(item.users?.avatar) ||
                require('../../../../assets/images/default-avatar-profile-icon.jpg'),
            }}
            style={{
              width: size - 6,
              height: size - 6,
              borderRadius: (size - 6) / 2,
            }}
            resizeMode="cover"
          />
        </View>
        <View style={[styles.rankBadge, { backgroundColor: borderColor }]}>
          <Text style={styles.rankText}>{rank}</Text>
        </View>
      </View>

      <Text
        numberOfLines={1}
        style={[styles.podiumName, isUser && styles.highlightName]}
      >
        {item.users?.nick_name || item.users?.name}
      </Text>

      <Text style={styles.podiumScore}>{item.score}</Text>

      {/* Cột bục vinh quang */}
      <LinearGradient
        colors={
          isFirst
            ? ['rgba(255, 215, 0, 0.3)', 'rgba(255, 215, 0, 0.05)']
            : ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']
        }
        style={[styles.podiumBase, { height: podiumHeight }]}
      >
        <Text
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: 10,
            marginTop: 10,
          }}
        >
          {isFirst ? 'TOP 1' : rank === 2 ? 'TOP 2' : 'TOP 3'}
        </Text>
      </LinearGradient>
    </Animated.View>
  );
};

export default function Ranking() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<'practice' | 'test'>('practice');
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchLeaderboardData();
  }, [user, activeTab]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      const res = await getLeaderBoardByType(activeTab);
      setLeaderboardData(res.data || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const userRank = leaderboardData.find(entry => entry.users?.id === user?.id);

  // Logic sắp xếp cho Podium: 2 - 1 - 3
  const top1 = leaderboardData[0];
  const top2 = leaderboardData[1];
  const top3 = leaderboardData[2];

  // Danh sách còn lại (từ hạng 4 trở đi)
  const restOfList = leaderboardData.slice(3);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

      {/* Background Header Lớn */}
      <LinearGradient
        colors={['#4F46E5', '#4F46E5', '#4F46E5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 10 }]}
      >
        {/* Header Navigation */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Bảng Xếp Hạng</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <View style={styles.tabWrapper}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'practice' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('practice')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'practice' && styles.activeTabText,
                ]}
              >
                Luyện tập
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'test' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('test')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'test' && styles.activeTabText,
                ]}
              >
                Kiểm tra
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Podium Section (Hiển thị Top 3 ngay trên nền Gradient) */}
        {!loading && leaderboardData.length > 0 && (
          <View style={styles.podiumContainer}>
            <PodiumItem
              item={top2}
              rank={2}
              isUser={top2?.users?.id === user?.id}
            />
            <PodiumItem
              item={top1}
              rank={1}
              isUser={top1?.users?.id === user?.id}
            />
            <PodiumItem
              item={top3}
              rank={3}
              isUser={top3?.users?.id === user?.id}
            />
          </View>
        )}
      </LinearGradient>

      {/* Body Content */}
      <View style={styles.bodyContainer}>
        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#7C3AED" />
          </View>
        ) : (
          <FlatList
            data={restOfList}
            keyExtractor={item => item.users?.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 100,
              paddingTop: 20,
              paddingHorizontal: 16,
            }}
            ListHeaderComponent={() =>
              // Thẻ Rank của user hiện tại (nếu user nằm ngoài top 3)
              userRank && userRank.rank > 3 ? (
                <View style={styles.currentUserContainer}>
                  <Text style={styles.sectionTitle}>Vị trí của bạn</Text>
                  <LeaderboardCard
                    entry={userRank}
                    index={userRank.rank - 1}
                    isCurrentUser={true}
                  />
                  <View style={styles.divider} />
                </View>
              ) : null
            }
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInUp.delay(index * 50).springify()}>
                <LeaderboardCard
                  entry={item}
                  index={index + 3} // +3 vì đã trừ top 3
                  isCurrentUser={item.users?.id === user?.id}
                  onPress={() =>
                    navigation.navigate('UserFollow', {
                      userSearch: item.users,
                    })
                  }
                />
              </Animated.View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Trophy size={60} color="#E5E7EB" />
                <Text style={styles.emptyText}>Chưa có dữ liệu xếp hạng</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  headerGradient: {
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 10,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 50,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },

  // Tabs
  tabContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  tabWrapper: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    padding: 4,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#fff',
  },
  tabText: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#7C3AED',
    fontWeight: '700',
  },

  // Podium
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  podiumPlaceholder: {
    width: width * 0.28,
  },
  podiumItemContainer: {
    alignItems: 'center',
    width: width * 0.28,
  },
  avatarContainer: {
    marginBottom: 8,
    alignItems: 'center',
  },
  avatarBorder: {
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  crownContainer: {
    position: 'absolute',
    top: -24,
    zIndex: 1,
  },
  rankBadge: {
    position: 'absolute',
    bottom: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  rankText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  podiumName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
    maxWidth: '90%',
  },
  highlightName: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  podiumScore: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  podiumBase: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignItems: 'center',
  },

  // Body
  bodyContainer: {
    flex: 1,
    marginTop: 0,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentUserContainer: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    marginTop: 10,
    color: '#9CA3AF',
    fontSize: 14,
  },
});
