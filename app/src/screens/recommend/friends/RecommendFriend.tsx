import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../../../lib/supabase';
import { getSupabaseFileUrl } from '../../../api/image/route';
import Header from '../../../components/Header';
import {
  Users,
  UserPlus,
  Star,
  RefreshCw,
  Sparkles,
  Award,
  Heart,
  ArrowLeft,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';

interface Friend {
  id: string;
  name: string;
  avatar: string;
  nick_name: string;
  level: number;
  isFoF: boolean;
  isSameOrHigherLevel: boolean;
  mutualCount: number;
  matchCount: number;
}

const RecommendFriend = () => {
  const navigation = useNavigation<any>();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError('Vui lòng đăng nhập để xem gợi ý bạn bè');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        'recommend-friends',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (error) throw new Error(error.message);

      setFriends(data || []);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tải gợi ý bạn bè');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleAddFriend = (item: Friend) => {
    Alert.alert('Kết bạn', `Gửi lời mời kết bạn tới ${item.name}?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Gửi lời mời',
        onPress: () => {
          Alert.alert('Thành công', `Đã gửi lời mời tới ${item.name}`);
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Friend }) => {
    const avatarUrl = item.avatar ? getSupabaseFileUrl(item.avatar) : null;

    return (
      <View style={styles.friendCard}>
        <TouchableOpacity
          style={styles.friendInfo}
          onPress={() =>
            navigation.navigate('UserFollow', {
              userSearch: item,
            })
          }
          activeOpacity={0.8}
        >
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarText}>
                  {item.name?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
            {item.isSameOrHigherLevel && (
              <View style={styles.levelBadge}>
                <Award size={12} color="#fff" />
              </View>
            )}
          </View>

          {/* Info */}
          <View style={styles.userDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{item.name}</Text>
              {item.isFoF && item.mutualCount > 0 && (
                <View style={styles.mutualBadge}>
                  <Heart size={10} color="#ef4444" />
                  <Text style={styles.mutualText}>{item.mutualCount}</Text>
                </View>
              )}
            </View>

            <Text style={styles.userNickname}>{item.nick_name}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Star size={12} color="#fbbf24" />
                <Text style={styles.statText}>Level {item.level}</Text>
              </View>
              <View style={styles.statItem}>
                <Sparkles size={12} color="#667eea" />
                <Text style={styles.statText}>{item.matchCount} phù hợp</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Add Friend Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddFriend(item)}
          activeOpacity={0.8}
        >
          <UserPlus size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderLoadingState = () => (
    <View style={styles.centerContainer}>
      <View style={styles.loadingIconContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
      <Text style={styles.loadingTitle}>Đang tìm gợi ý bạn bè</Text>
      <Text style={styles.loadingDescription}>
        Chúng tôi đang phân tích để tìm những người phù hợp với bạn...
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.centerContainer}>
      <View style={styles.errorIconContainer}>
        <Text style={styles.errorIcon}>❌</Text>
      </View>
      <Text style={styles.errorTitle}>Có lỗi xảy ra</Text>
      <Text style={styles.errorDescription}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={fetchFriends}
        activeOpacity={0.8}
      >
        <RefreshCw size={16} color="#fff" />
        <Text style={styles.retryButtonText}>Thử lại</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.centerContainer}>
      <View style={styles.emptyIconContainer}>
        <Users size={48} color="#9ca3af" />
      </View>
      <Text style={styles.emptyTitle}>Chưa có gợi ý bạn bè</Text>
      <Text style={styles.emptyDescription}>
        Hãy thử follow một số người để có thêm gợi ý phù hợp
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Text style={styles.exploreButtonText}>Khám phá ngay</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
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
            <ArrowLeft size={20} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Gợi ý bạn bè</Text>
          </View>

          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {loading && renderLoadingState()}
        {error && !loading && renderErrorState()}
        {!loading && !error && friends.length === 0 && renderEmptyState()}
        {!loading && !error && friends.length > 0 && (
          <FlatList
            data={friends}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default RecommendFriend;

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
  backButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f4ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  loadingDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorIcon: {
    fontSize: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarFallback: {
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fbbf24',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 8,
  },
  mutualBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  mutualText: {
    fontSize: 10,
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 2,
  },
  userNickname: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
