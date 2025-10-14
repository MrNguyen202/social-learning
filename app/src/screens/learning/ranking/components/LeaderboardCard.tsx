// components/LeaderboardCard.tsx
import { AwardIcon, CrownIcon, MedalIcon } from 'lucide-react-native';
import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
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

  const getRankColor = () => {
    switch (index + 1) {
      case 1:
        return ['#ffd700', '#ffa500'];
      case 2:
        return ['#c0c0c0', '#a9a9a9'];
      case 3:
        return ['#cd7f32', '#c68e17'];
      default:
        return ['#f59e0b', '#ef4444'];
    }
  };

  const getRankIcon = () => {
    switch (index + 1) {
      case 1:
        return <CrownIcon size={20} />;
      case 2:
        return <MedalIcon size={20} />;
      case 3:
        return <AwardIcon size={20} />;
      default:
        return null;
    }
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
          marginBottom: 8,
          borderRadius: 12,
          backgroundColor: isCurrentUser
            ? 'rgba(249, 115, 22, 0.1)'
            : 'rgba(255,255,255,0.9)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          borderWidth: 1,
          borderColor: isCurrentUser ? '#f59e0b' : '#e5e7eb',
        }}
      >
        <View style={{ width: 40, alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: isCurrentUser ? '#f59e0b' : '#1f2937',
            }}
          >
            #{index + 1}
          </Text>
          {getRankIcon()}
        </View>
        <View
          style={{
            width: 40,
            height: 40,
            marginRight: 12,
            borderRadius: 20,
            overflow: 'hidden',
          }}
        >
          <Image
            source={{ uri: getUserImageSrc(entry.users?.avatar) }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: isCurrentUser ? '#fff' : '#1f2937',
              marginBottom: 2,
            }}
            numberOfLines={1}
          >
            {entry.users?.name || 'Ẩn danh'}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: isCurrentUser ? '#fff' : '#6b7280',
            }}
            numberOfLines={1}
          >
            {entry.users?.nick_name}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: isCurrentUser ? '#fff' : '#1f2937',
            }}
          >
            {entry.score}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: isCurrentUser ? '#fff' : '#6b7280',
            }}
          >
            điểm
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
