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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../../../lib/supabase';
import { getSupabaseFileUrl } from '../../../api/image/route';
import Header from '../../../components/Header';

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

  const renderItem = ({ item }: { item: Friend }) => {
    const avatarUrl = item.avatar ? getSupabaseFileUrl(item.avatar) : null;
    return (
      <View style={styles.card}>
        {/* Avatar */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('UserFollow', {
              userSearch: item,
            })
          }
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={{ color: '#fff' }}>
                {item.name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Info */}
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.name}>{item.name}</Text>
            {item.isFoF && item.mutualCount > 0 && (
              <Text style={styles.mutualBadge}>
                {item.mutualCount} bạn chung
              </Text>
            )}
          </View>
          <Text style={styles.nickname}>{item.nick_name}</Text>
          <Text style={styles.details}>
            Level: {item.level} • {item.matchCount} tiêu chí phù hợp
          </Text>
        </View>

        {/* Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            Alert.alert('Kết bạn', `Đã gửi lời mời tới ${item.name}`)
          }
        >
          <Text style={styles.buttonText}>Kết bạn</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={{ marginTop: 8 }}>Đang tải gợi ý bạn bè...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red', marginBottom: 8 }}>❌ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchFriends}>
          <Text style={{ color: 'white' }}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (friends.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#666' }}>🔍 Không có gợi ý bạn bè</Text>
        <Text style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
          Hãy thử follow một số người để có thêm gợi ý
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Header title="Gợi ý bạn bè" />
      <FlatList
        data={friends}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12 }}
      />
    </View>
  );
};

export default RecommendFriend;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 2, // shadow Android
    shadowColor: '#000', // shadow iOS
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#eee',
  },
  avatarFallback: {
    backgroundColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontWeight: '600', fontSize: 16 },
  nickname: { fontSize: 13, color: '#666' },
  details: { fontSize: 12, color: '#888', marginTop: 2 },
  mutualBadge: {
    marginLeft: 6,
    fontSize: 11,
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#f97316',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buttonText: { color: 'white', fontSize: 13, fontWeight: '600' },
  retryButton: {
    backgroundColor: 'red',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
