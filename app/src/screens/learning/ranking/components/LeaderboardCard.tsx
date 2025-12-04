import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { getUserImageSrc } from '../../../../api/image/route';

interface LeaderboardCardProps {
  entry: any;
  index: number;
  isCurrentUser: boolean;
  onPress?: () => void;
}

export default function LeaderboardCard({
  entry,
  index,
  isCurrentUser,
  onPress,
}: LeaderboardCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  // Màu sắc rank chỉ dùng cho text số thứ tự
  const getRankColor = (rank: number) => {
    if (rank === 1) return '#EAB308'; // Gold
    if (rank === 2) return '#94A3B8'; // Silver
    if (rank === 3) return '#B45309'; // Bronze
    return '#6B7280'; // Gray
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[
          styles.card,
          isCurrentUser && styles.currentUserCard
        ]}
      >
        {/* Rank Number */}
        <View style={styles.rankContainer}>
          <Text style={[styles.rankText, { color: getRankColor(index + 1) }]}>
            #{index + 1}
          </Text>
        </View>

        {/* Avatar */}
        <Image
          source={{
            uri: getUserImageSrc(entry.users?.avatar) || require('../../../../../assets/images/default-avatar-profile-icon.jpg'),
          }}
          style={styles.avatar}
          resizeMode="cover"
        />

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {entry.users?.name || 'Unknown'}
          </Text>
          <Text style={styles.nickname} numberOfLines={1}>
            @{entry.users?.nick_name || 'user'}
          </Text>
        </View>

        {/* Score */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{entry.score}</Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  currentUserCard: {
    borderColor: '#7C3AED',
    backgroundColor: '#F5F3FF'
  },
  rankContainer: {
    width: 30,
    justifyContent: 'center',
    marginRight: 8,
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  nickname: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  scoreContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#7C3AED', 
  },
  pointsLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});