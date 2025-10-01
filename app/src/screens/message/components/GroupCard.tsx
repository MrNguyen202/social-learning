import { useEffect, useState } from 'react';
import useAuth from '../../../../hooks/useAuth';
import { fetchUnreadCount } from '../../../api/chat/conversation/route';
import AvatarGroup from '../../../components/AvatarGroup';
import Badge from '../../../components/Badge';
import { convertToTime } from '../../../../helpers/formatTime';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { hp } from '../../../../helpers/common';
import { MessageCircle, Clock, Users } from 'lucide-react-native';

interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

interface Conversation {
  id: string;
  name: string;
  avatarUrl: string;
  members: User[];
  lastMessage: LastMessage | null;
}

type MessageContent = {
  system?: boolean;
  type: 'text' | 'image' | 'file';
  text?: string;
  images?: string[];
  file?: {
    name: string;
    url: string;
  } | null;
};

type LastMessage = {
  id: string;
  senderId: string;
  content: MessageContent;
  createdAt: string;
  updatedAt: string;
};

type CardGroupProps = {
  conversation: Conversation;
  onClick: () => void;
};

export default function GroupCard({ conversation, onClick }: CardGroupProps) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchUnreadCount(conversation.id, user?.id);
        setUnreadCount(response);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchData();
  }, [conversation.id, user?.id, conversation.lastMessage]);

  const isUnread = unreadCount > 0;
  const groupName = conversation.name
    ? conversation.name
    : `Bạn, ${conversation.members
        .filter(m => m.id !== user?.id)
        .map(m => m.name)
        .join(', ')}`;

  const senderName =
    conversation.lastMessage?.senderId === user?.id
      ? 'Bạn'
      : conversation.members.find(
          m => m.id === conversation.lastMessage?.senderId,
        )?.name;

  return (
    <TouchableOpacity
      style={[styles.container, isUnread && styles.unreadContainer]}
      onPress={onClick}
      activeOpacity={0.8}
    >
      <View style={styles.avatarContainer}>
        <AvatarGroup size={hp(6)} members={conversation.members} />
        {isUnread && <View style={styles.unreadDot} />}
        <View style={styles.groupIndicator}>
          <Users size={12} color="#fff" />
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text
            style={[styles.groupName, isUnread && styles.unreadText]}
            numberOfLines={1}
          >
            {groupName}
          </Text>
          <View style={styles.rightSection}>
            {conversation.lastMessage && (
              <View style={styles.timeContainer}>
                <Clock size={12} color="#9ca3af" />
                <Text
                  style={[styles.timeText, isUnread && styles.unreadTimeText]}
                >
                  {convertToTime(conversation.lastMessage?.createdAt)}
                </Text>
              </View>
            )}
            {isUnread && (
              <View style={styles.badgeContainer}>
                <Badge size="md" variant="count" text={unreadCount} />
              </View>
            )}
          </View>
        </View>

        <View style={styles.messageRow}>
          <View style={styles.messageContainer}>
            <MessageCircle size={14} color="#9ca3af" />
            <Text
              style={[styles.messageText, isUnread && styles.unreadMessageText]}
              numberOfLines={1}
            >
              {senderName}:{' '}
              {typeof conversation.lastMessage?.content === 'string'
                ? conversation.lastMessage?.content
                : conversation.lastMessage?.content?.text ||
                  '[Nội dung không hỗ trợ]'}
            </Text>
          </View>
        </View>

        <View style={styles.membersRow}>
          <Users size={12} color="#9ca3af" />
          <Text style={styles.membersText}>
            {conversation.members.length} thành viên
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
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
    zIndex: 2,
  },
  groupIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  unreadText: {
    color: '#111827',
    fontWeight: 'bold',
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  unreadTimeText: {
    color: '#667eea',
    fontWeight: '600',
  },
  badgeContainer: {
    marginTop: 2,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  messageText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  unreadMessageText: {
    color: '#374151',
    fontWeight: '500',
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  membersText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
