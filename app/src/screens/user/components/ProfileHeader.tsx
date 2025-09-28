import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import useAuth from '../../../../hooks/useAuth';
import { getFollowers, getFollowing } from '../../../api/follow/route';
import { getUserImageSrc } from '../../../api/image/route';
import Avatar from '../../../components/Avatar';
import { hp } from '../../../../helpers/common';
import { theme } from '../../../../constants/theme';
import { Edit3, Archive } from 'lucide-react-native';

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

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Avatar
            uri={getUserImageSrc(user?.avatar)}
            size={hp(12)}
            rounded={theme.radius.xxl * 100}
          />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.nickname}>{user?.nick_name}</Text>

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
          <Edit3 size={18} color="#667eea" />
          <Text style={styles.primaryButtonText}>Chỉnh sửa trang cá nhân</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.8}
        >
          <Archive size={18} color="#6b7280" />
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
    padding: 20,
    backgroundColor: '#ffffff',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 20,
  },
  infoSection: {
    flex: 1,
  },
  nickname: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f0f4ff',
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  primaryButtonText: {
    color: '#667eea',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  secondaryButtonText: {
    color: '#6b7280',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  bioContainer: {
    marginTop: 8,
  },
  bioText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});