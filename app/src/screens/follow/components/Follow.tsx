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
import { useRoute } from '@react-navigation/native';
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

export default function Follow() {
  const route = useRoute<any>();
  const { type, userId } = route.params;
  const { user } = useAuth();

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
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.header}>
        <Header
          title={type === 'followers' ? 'Người theo dõi' : 'Đang theo dõi'}
        />
      </View>

      <View style={{ padding: 12 }}>
        <TextInput
          placeholder="Tìm kiếm"
          value={keyword}
          onChangeText={setKeyword}
          style={styles.search}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={({ item }) => {
            const isF = followStatus[item.id] ?? false;
            return (
              <View style={styles.row}>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                  <Avatar
                    uri={getUserImageSrc(item?.avatar)}
                    size={48}
                    rounded={theme.radius.xxl * 100}
                  />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={{ fontWeight: '600' }}>{item.name}</Text>
                    <Text style={{ color: '#888' }}>{item.nick_name}</Text>
                  </View>
                </TouchableOpacity>

                {item.id !== user?.id && (
                  <TouchableOpacity
                    onPress={() =>
                      isF ? handleUnfollow(item.id) : handleFollow(item.id)
                    }
                    style={[
                      styles.followBtn,
                      isF ? styles.unfollowBtn : styles.followBtnPrimary,
                    ]}
                  >
                    <Text style={{ color: isF ? '#000' : '#fff' }}>
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
            <Text style={{ textAlign: 'center', marginTop: 24, color: '#888' }}>
              Không tìm thấy người dùng
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: { fontSize: 18, fontWeight: '700' },
  search: { backgroundColor: '#f3f3f3', padding: 10, borderRadius: 8 },
  row: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  followBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  followBtnPrimary: { backgroundColor: '#1677ff' },
  unfollowBtn: { backgroundColor: '#eee' },
});
