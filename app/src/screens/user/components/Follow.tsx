import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import useAuth from '../../../../hooks/useAuth';
import {
  checkIsFollowing,
  followUser,
  getFollowers,
  getFollowing,
  unfollowUser,
} from '../../../api/follow/route';
import Avatar from '../../../components/Avatar';
import { theme } from '../../../../constants/theme';
import Header from '../../../components/Header';
import Toast from 'react-native-toast-message';
import { getUserImageSrc } from '../../../api/image/route';
import { Search, Users } from 'lucide-react-native';

export default function Follow() {
  const route = useRoute<any>();
  const { type, userId } = route.params;
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const [data, setData] = useState<any[]>([]);
  const [keyword, setKeyword] = useState('');
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [type, userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      let list: any[] = [];
      if (type === 'followers') {
        const res = await getFollowers(userId);
        if (res?.success) list = res.data || [];
      } else {
        const res = await getFollowing(userId);
        if (res?.success) list = res.data || [];
      }

      setData(list);
      await fetchStatus(list);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatus = async (users: any[]) => {
    try {
      const arr = await Promise.all(
        users.map(async u => {
          try {
            const res = await checkIsFollowing(user?.id!, u.id);
            return { id: u.id, isFollowing: res.isFollowing };
          } catch {
            return { id: u.id, isFollowing: false };
          }
        }),
      );
      const map: Record<string, boolean> = {};
      arr.forEach(r => (map[r.id] = r.isFollowing));
      setFollowStatus(map);
    } catch {}
  };

  const filtered = data.filter(
    u =>
      (u.name || '').toLowerCase().includes(keyword.toLowerCase()) ||
      (u.nick_name || '').toLowerCase().includes(keyword.toLowerCase()),
  );

  const handleFollow = async (targetId: string) => {
    setFollowStatus(s => ({ ...s, [targetId]: true }));
    try {
      await followUser(user?.id!, targetId);

      if (type === 'following') {
        const exists = data.find(u => u.id === targetId);
        if (!exists) {
          setData(prev => [...prev, { id: targetId }]);
        }
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Không thể theo dõi người dùng này',
        visibilityTime: 2000,
      });
      setFollowStatus(s => ({ ...s, [targetId]: false }));
    }
  };

  const handleUnfollow = async (targetId: string) => {
    setFollowStatus(s => ({ ...s, [targetId]: false }));
    try {
      await unfollowUser(user?.id!, targetId);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Không thể hủy theo dõi người dùng này',
        visibilityTime: 2000,
      });
      setFollowStatus(s => ({ ...s, [targetId]: true }));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header
          title={type === 'followers' ? 'Người theo dõi' : 'Đang theo dõi'}
        />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#9ca3af" />
          <TextInput
            placeholder="Tìm kiếm người dùng..."
            value={keyword}
            onChangeText={setKeyword}
            style={styles.searchInput}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isF = followStatus[item.id] ?? false;
            return (
              <View style={styles.userRow}>
                <TouchableOpacity
                  style={styles.userInfo}
                  onPress={() =>
                    navigation.navigate('UserFollow', { userSearch: item })
                  }
                  activeOpacity={0.7}
                >
                  <Avatar
                    uri={getUserImageSrc(item?.avatar)}
                    size={48}
                    rounded={theme.radius.xxl * 100}
                  />
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userNickname}>{item.nick_name}</Text>
                  </View>
                </TouchableOpacity>

                {item.id !== user?.id && (
                  <TouchableOpacity
                    onPress={() =>
                      isF ? handleUnfollow(item.id) : handleFollow(item.id)
                    }
                    style={[
                      styles.followButton,
                      isF ? styles.unfollowButton : styles.followButtonPrimary,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.followButtonText,
                      { color: isF ? '#374151' : '#fff' }
                    ]}>
                      {isF
                        ? type === 'following'
                          ? 'Hủy theo dõi'
                          : 'Đang theo dõi'
                        : 'Theo dõi'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Users size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>
                {keyword ? 'Không tìm thấy người dùng' : 'Chưa có người dùng nào'}
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  listContainer: {
    flexGrow: 1,
  },
  userRow: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  userNickname: {
    fontSize: 14,
    color: '#6b7280',
  },
  followButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  followButtonPrimary: {
    backgroundColor: '#667eea',
  },
  unfollowButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});