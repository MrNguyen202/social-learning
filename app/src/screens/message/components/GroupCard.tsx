import { useEffect, useState } from 'react';
import useAuth from '../../../../hooks/useAuth';
import { fetchUnreadCount } from '../../../api/chat/conversation/route';
import AvatarGroup from '../../../components/AvatarGroup';
import Badge from '../../../components/Badge';
import { convertToTime } from '../../../../helpers/formatTime';
import { Text, TouchableOpacity, View, StyleSheet, Image } from 'react-native';
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
  avatar: string;
  members: User[];
  lastMessage: LastMessage | null;
}

interface SystemContent {
  action: "user_joined" | "user_left" | "conversation_renamed" | "member_added" | "member_removed" | "admin_transferred" | "conversation_avatar_updated";
  actor: {
    id: string;
    name: string;
  };
  target?: {
    id: string;
    name: string;
  }[];
  newName?: string;
}

type MessageContent = {
  type: 'text' | 'image' | 'file' | 'system';
  text?: string;
  images?: string[];
  file?: {
    name: string;
    url: string;
  } | null;
  system?: SystemContent;
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
        const response = await fetchUnreadCount(conversation.id);
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

  const renderLastMessage = () => {
    const lastMsg = conversation.lastMessage;
    if (!lastMsg) return null;

    const { type, content, senderId } = {
      type: lastMsg.content.type,
      content: lastMsg.content,
      senderId: lastMsg.senderId
    };

    // 1. Tin nhắn hệ thống
    if (type === "system" && content.system) {
      const sys = content.system;
      const actorName = sys.actor.id === user?.id ? 'Bạn' : sys.actor.name;
      const targetName = sys.target && sys.target.length > 0
        ? (sys.target[0].id === user?.id ? 'Bạn' : sys.target[0].name)
        : "";

      let systemText = "Thông báo hệ thống";
      switch (sys.action) {
        case "user_left":
          systemText = `${actorName} đã rời nhóm`;
          break;
        case "member_added":
          systemText = `${actorName} đã thêm ${targetName} vào nhóm`;
          break;
        case "member_removed":
          systemText = `${actorName} đã mời ${targetName} ra khỏi nhóm`;
          break;
        case "admin_transferred":
          systemText = `${actorName} đã chuyển quyền admin cho ${targetName}`;
          break;
        case "conversation_renamed":
          systemText = `${actorName} đã đổi tên nhóm thành "${sys.newName}"`;
          break;
        case "conversation_avatar_updated":
          systemText = `${actorName} đã đổi ảnh nhóm`;
          break;
        case "user_joined":
          systemText = `${actorName} đã tham gia nhóm`;
          break;
      }
      return (
        <Text style={[styles.messageText, isUnread && styles.unreadMessageText]} numberOfLines={1}>
          {systemText}
        </Text>
      );
    }

    // 2. Tin nhắn thường
    let senderName = "";
    if (senderId === user?.id) {
      senderName = "Bạn: ";
    } else {
      const member = conversation.members.find((m) => m.id === senderId);
      senderName = member ? `${member.name}: ` : "";
    }

    let messageText = "";
    if (type === "image") messageText = `[Hình ảnh]`;
    else if (type === "file") messageText = `[Tập tin]`;
    else messageText = content.text || "";

    return (
      <Text style={[styles.messageText, isUnread && styles.unreadMessageText]} numberOfLines={1}>
        <Text style={{ fontWeight: senderId === user?.id ? '400' : '600', color: isUnread ? '#374151' : '#4b5563' }}>
          {senderName}
        </Text>
        {messageText}
      </Text>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.container, isUnread && styles.unreadContainer]}
      onPress={onClick}
      activeOpacity={0.8}
    >
      <View style={styles.avatarContainer}>
        {
          conversation.avatar ? (
            <Image
              source={{ uri: conversation.avatar }}
              width={hp(6)}
              height={hp(6)}
              className="rounded-full bg-gray-200"
            />
          ) : (
            <AvatarGroup size={hp(6)} members={conversation.members} />
          )
        }
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
            {renderLastMessage() || (
              <Text style={[styles.messageText, isUnread && styles.unreadMessageText]}>
                Chưa có tin nhắn
              </Text>
            )}
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
