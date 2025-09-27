import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../../../../hooks/useAuth';
import {
  getFollowers,
  getFollowing,
  checkIsFollowing,
  followUser,
  unfollowUser,
} from '../../../api/follow/route';
import { getUserImageSrc } from '../../../api/image/route';
import Avatar from '../../../components/Avatar';
import { hp } from '../../../../helpers/common';
import { theme } from '../../../../constants/theme';

export default function ProfileHeader({ userSearch }: { userSearch: any }) {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (userSearch?.id) {
      loadFollows();
      checkFollowStatus();
    }
  }, [userSearch?.id]);

  const loadFollows = async () => {
    try {
      const resF = await getFollowers(userSearch.id);
      const resG = await getFollowing(userSearch.id);
      if (resF?.success) setFollowers(resF.data || []);
      if (resG?.success) setFollowing(resG.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      if (user?.id && userSearch?.id) {
        const res = await checkIsFollowing(user.id, userSearch.id);
        setIsFollowing(res.isFollowing);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFollowToggle = async () => {
    if (!user || !userSearch) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(user.id, userSearch.id);
        setIsFollowing(false);
      } else {
        await followUser(user.id, userSearch.id);
        setIsFollowing(true);
      }
      // reload follower list
      loadFollows();
    } catch (e) {
      console.error(e);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <ActivityIndicator size="small" />
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Avatar
          uri={
            userSearch?.avatar ? getUserImageSrc(userSearch.avatar) : undefined
          }
          size={hp(12)}
          rounded={theme.radius.xxl * 100}
        />

        <View style={styles.info}>
          <Text style={styles.nick}>{userSearch?.nick_name}</Text>
          <Text style={styles.name}>{userSearch?.name}</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>0</Text>
              <Text style={styles.statLabel}>bài viết</Text>
            </View>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Follow', {
                  type: 'followers',
                  userId: userSearch.id,
                })
              }
              style={styles.stat}
            >
              <Text style={styles.statNum}>{followers.length}</Text>
              <Text style={styles.statLabel}>người theo dõi</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Follow', {
                  type: 'following',
                  userId: userSearch.id,
                })
              }
              style={styles.stat}
            >
              <Text style={styles.statNum}>{following.length}</Text>
              <Text style={styles.statLabel}>đang theo dõi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.button,
            isFollowing ? styles.unfollowBtn : styles.followBtn,
          ]}
          onPress={handleFollowToggle}
          disabled={followLoading}
        >
          <Text style={[styles.buttonText, isFollowing && { color: '#000' }]}>
            {followLoading ? '...' : isFollowing ? 'Bỏ theo dõi' : 'Theo dõi'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Nhắn tin</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bio}>
        <Text>{userSearch?.bio}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  info: { flex: 1 },
  nick: { fontSize: 20, fontWeight: '600' },
  name: { fontSize: 14, color: '#666' },
  statsRow: { flexDirection: 'row', marginTop: 20 },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontWeight: '700' },
  statLabel: { fontSize: 12, color: '#888' },
  actions: { flexDirection: 'row', marginTop: 12, gap: 8 },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  followBtn: { backgroundColor: '#1DA1F2' },
  unfollowBtn: { backgroundColor: '#f2f2f2' },
  buttonText: { color: '#fff' },
  bio: { marginTop: 12 },
});
