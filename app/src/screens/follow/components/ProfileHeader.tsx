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
import { theme } from '../../../../constants/theme';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

export default function ProfileHeader({ userSearch }: { userSearch: any }) {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
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
      loadFollows();
    } catch (e) {
      console.error(e);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" />
        <Text style={styles.loadingText}>Đang tải...</Text>
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
          // Thay hp(12) bằng moderateScale(80) để đồng bộ thư viện
          size={moderateScale(80)}
          rounded={theme.radius.xxl * 100}
        />

        <View style={styles.info}>
          <Text style={styles.nick}>{userSearch?.nick_name}</Text>
          {/* <Text style={styles.name}>{userSearch?.name}</Text> */}

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
          <Text style={styles.buttonTextMessage}>Nhắn tin</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bio}>
        <Text style={styles.bioText}>{userSearch?.bio}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
  },
  loadingContainer: {
    padding: scale(20),
    alignItems: 'center',
  },
  loadingText: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(14),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  info: {
    flex: 1,
  },
  nick: {
    fontSize: moderateScale(20),
    fontWeight: '600',
    color: '#000',
  },
  name: {
    fontSize: moderateScale(14),
    color: '#666',
    marginTop: verticalScale(2),
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: verticalScale(12),
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontWeight: '700',
    fontSize: moderateScale(16),
    color: '#000',
  },
  statLabel: {
    fontSize: moderateScale(10),
    color: '#888',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    marginTop: verticalScale(16),
    gap: scale(8),
  },
  button: {
    flex: 1,
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  followBtn: {
    backgroundColor: '#1DA1F2',
  },
  unfollowBtn: {
    backgroundColor: '#f2f2f2',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    color: '#fff',
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  buttonTextMessage: {
    color: '#000',
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  bio: {
    marginTop: verticalScale(12),
  },
  bioText: {
    fontSize: moderateScale(14),
    color: '#333',
    lineHeight: verticalScale(20),
  },
});
