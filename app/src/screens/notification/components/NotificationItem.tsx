import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import Avatar from '../../../components/Avatar';
import { theme } from '../../../../constants/theme';
import { hp } from '../../../../helpers/common';
import { getUserImageSrc } from '../../../api/image/route';
import { convertToDate } from '../../../../helpers/formatTime';
import { markNotificationAsRead } from '../../../api/notification/route';
import { Bell, MessageCircle, Heart, User } from 'lucide-react-native';

const NotificationItem = ({ item, navigation, onRead }: any) => {
  const handleClick = async () => {
    let { postId, commentId } = JSON.parse(item.content);

    if (!item.is_read) {
      await markNotificationAsRead(item.id);
      onRead?.(item.id);
    }

    navigation.navigate('PostDetail', {
      postId: postId,
      commentId: commentId,
    });
  };

  const createdAt = convertToDate(item?.created_at);

  const getNotificationIcon = () => {
    if (item?.title?.includes('bình luận')) {
      return <MessageCircle size={16} color="#667eea" />;
    }
    if (item?.title?.includes('thích')) {
      return <Heart size={16} color="#ef4444" />;
    }
    if (item?.title?.includes('theo dõi')) {
      return <User size={16} color="#10b981" />;
    }
    return <Bell size={16} color="#667eea" />;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !item.is_read && styles.unreadContainer,
        item.is_read && styles.readContainer,
      ]}
      onPress={handleClick}
      activeOpacity={0.8}
    >
      <View style={styles.avatarContainer}>
        <Avatar
          uri={getUserImageSrc(item?.sender?.avatar)}
          size={hp(5.5)}
          rounded={theme.radius.xxl * 100}
        />
        {!item.is_read && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.senderName}>{item?.sender?.name}</Text>
          <View style={styles.iconContainer}>{getNotificationIcon()}</View>
        </View>

        <Text style={[styles.titleText, !item.is_read && styles.unreadTitle]}>
          {item?.title}
        </Text>

        <Text style={styles.timeText}>{createdAt}</Text>
      </View>

      <View style={styles.actionIndicator}>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  unreadContainer: {
    backgroundColor: '#f8faff',
    borderColor: '#e0e7ff',
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  readContainer: {
    opacity: 0.7,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#667eea',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  contentContainer: {
    flex: 1,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  unreadTitle: {
    color: '#374151',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  actionIndicator: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    fontSize: 20,
    color: '#d1d5db',
    fontWeight: '300',
  },
});
