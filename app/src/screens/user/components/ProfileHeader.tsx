import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import useAuth from '../../../../hooks/useAuth';
import { getFollowers, getFollowing } from '../../../api/follow/route';
import { getUserImageSrc } from '../../../api/image/route';
import Avatar from '../../../components/Avatar';
import { hp } from '../../../../helpers/common';
import { theme } from '../../../../constants/theme';
import { Edit3, Archive, Crown } from 'lucide-react-native';
import { Image } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

export default function ProfileHeader() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        loadFollows();
      }
    }, [user?.id]),
  );

  const loadFollows = async () => {
    try {
      const resF = await getFollowers(user.id);
      const resG = await getFollowing(user.id);
      if (resF?.success) setFollowers(resF.data || []);
      if (resG?.success) setFollowing(resG.data || []);
    } catch (e) {}
  };

  const getLevelBadgeColor = (level: number) => {
    if (level >= 8) return 'bg-purple-100 text-purple-800';
    if (level >= 6) return 'bg-blue-100 text-blue-800';
    if (level >= 4) return 'bg-green-100 text-green-800';
    if (level >= 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getLevelName = (level: number) => {
    if (level >= 10) return 'Master';
    if (level >= 8) return 'Expert';
    if (level >= 6) return 'Advanced';
    if (level >= 4) return 'Intermediate';
    if (level >= 2) return 'Beginner';
    return 'Newbie';
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {(user?.avatar && (
            <Avatar
              uri={getUserImageSrc(user?.avatar)}
              size={moderateScale(80)}
              rounded={theme.radius.xxl * 100}
            />
          )) || (
            <Image
              source={require('../../../../assets/images/default-avatar-profile-icon.jpg')}
              style={[
                {
                  height: hp(12),
                  width: hp(12),
                  borderRadius: theme.radius.xxl * 100,
                  borderColor: theme.colors.darkLight,
                },
              ]}
            />
          )}
        </View>

        <View style={styles.infoSection}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.nickname}>{user?.nick_name}</Text>
            {/* <Text style={[styles.level, { marginRight: scale(8) }]}>
              Level {user?.level || 1} {getLevelName(user?.level || 1)}
            </Text> */}
            {user.isPremium && (
              <Crown
                size={moderateScale(40)}
                color="#fbbf24"
                style={styles.nickname}
              />
            )}
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>bài viết</Text>
            </View>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Follow', {
                  type: 'followers',
                  userId: user.id,
                })
              }
              style={styles.statItem}
              activeOpacity={0.7}
            >
              <Text style={styles.statNumber}>{followers.length}</Text>
              <Text style={styles.statLabel}>người theo dõi</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate(
                  'Follow' as never,
                  {
                    type: 'following',
                    userId: user.id,
                  } as never,
                )
              }
              style={styles.statItem}
              activeOpacity={0.7}
            >
              <Text style={styles.statNumber}>{following.length}</Text>
              <Text style={styles.statLabel}>đang theo dõi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('EditProfile' as never)}
          activeOpacity={0.8}
        >
          <Edit3 size={moderateScale(18)} color="#667eea" />
          <Text style={styles.primaryButtonText}>Chỉnh sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
          <Archive size={moderateScale(18)} color="#6b7280" />
          <Text style={styles.secondaryButtonText}>Kho lưu trữ</Text>
        </TouchableOpacity>
      </View>

      {user?.bio && (
        <View style={styles.bioContainer}>
          <Text style={styles.bioText}>{user.bio}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: scale(12),
    backgroundColor: '#ffffff',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(20),
  },
  avatarContainer: {
    marginRight: scale(20),
  },
  infoSection: {
    flex: 1,
  },
  nickname: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: verticalScale(16),
  },
  level: {
    fontSize: moderateScale(14),
    color: '#6b7280',
    marginBottom: verticalScale(16),
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: verticalScale(4),
  },
  statLabel: {
    fontSize: moderateScale(12),
    color: '#6b7280',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: scale(12),
    marginBottom: verticalScale(16),
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    borderRadius: moderateScale(12),
    backgroundColor: '#f0f4ff',
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  primaryButtonText: {
    color: '#667eea',
    fontWeight: '600',
    marginLeft: scale(8),
    fontSize: moderateScale(14),
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    borderRadius: moderateScale(12),
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  secondaryButtonText: {
    color: '#6b7280',
    fontWeight: '600',
    marginLeft: scale(8),
    fontSize: moderateScale(14),
  },
  bioContainer: {
    marginTop: verticalScale(8),
  },
  bioText: {
    fontSize: moderateScale(14),
    color: '#374151',
    lineHeight: verticalScale(20),
  },
});
