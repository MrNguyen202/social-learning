import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from '../../../../../components/icons/Icon';

interface SystemContent {
    _id: string;
        conversationId: string;
        senderId: string;
        content: {
            type: string;
            text: string;
            images: { url: string; filename: string }[];
            file: any;
            system?: {
                action: "user_joined" | "user_left" | "conversation_renamed" | "member_added" | "member_removed" | "admin_transferred" | "conversation_avatar_updated";
                actor: {
                    id: string;
                    name: string;
                };
                target: [
                    {
                        id: string;
                        name: string;
                    },
                ];
                newName?: string;
            };
        };
        sender: {
            id: string;
            name: string;
            avatar: string;
        };
        createdAt: string;
        seens: any[];

}

interface MessageSystemProps {
    message: SystemContent;
}

const MessageSystem = ({ message }: MessageSystemProps) => {
  const { action, actor, target, newName } = message.content.system || {};
  const actorName = actor?.name || 'User';
  // Xử lý targetName nếu có nhiều người
  const targetName = target?.map((t: any) => t.name).join(', ') || '';

  // Định nghĩa style in đậm ngắn gọn để tái sử dụng
  const Bold = ({ children }: { children: React.ReactNode }) => (
    <Text style={{ fontWeight: '700' }}>{children}</Text>
  );

  let content: React.ReactNode = null;
  let iconName: any = 'information-circle-outline';
  let bgColor = '#f3f4f6';
  let textColor = '#6b7280';
  let iconColor = '#6b7280';

  switch (action) {
    case 'member_added':
      iconName = 'UserPlus';
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-700';
      iconColor = '#3b82f6';
      content = (
        <Text>
          <Bold>{actorName}</Bold> thêm <Bold>{targetName}</Bold> vào nhóm.
        </Text>
      );
      break;
    case 'member_removed':
      iconName = 'UserX';
      bgColor = 'bg-red-100';
      textColor = 'text-red-700';
      iconColor = '#ef4444';
      content = (
        <Text>
          <Bold>{actorName}</Bold> đã xóa <Bold>{targetName}</Bold> khỏi nhóm.
        </Text>
      );
      break;
    case 'user_left':
      iconName = 'LogOut';
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-700';
      iconColor = '#6b7280';
      content = (
        <Text>
          <Bold>{actorName}</Bold> đã rời khỏi nhóm.
        </Text>
      );
      break;
    case 'conversation_renamed':
      iconName = 'Edit3';
      bgColor = 'bg-purple-100';
      textColor = 'text-purple-700';
      iconColor = '#7e22ce';
      content = (
        <Text>
          <Bold>{actorName}</Bold> đã đổi tên nhóm thành "<Bold>{newName}</Bold>".
        </Text>
      );
      break;
    case 'admin_transferred':
      iconName = 'ShieldCheck';
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-700';
      iconColor = '#3b82f6';
      content = (
        <Text>
          <Bold>{actorName}</Bold> đã trao quyền quản trị cho <Bold>{targetName}</Bold>.
        </Text>
      );
      break;
    case 'conversation_avatar_updated':
      iconName = 'Camera';
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-700';
      iconColor = '#3b82f6';
      content = (
        <Text>
          <Bold>{actorName}</Bold> đã cập nhật ảnh đại diện nhóm.
        </Text>
      );
      break;
    case 'user_joined':
      iconName = 'UserPlus';
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-700';
      iconColor = '#3b82f6';
      content = (
        <Text>
          <Bold>{actorName}</Bold> đã tham gia nhóm.
        </Text>
      );
      break;
    default:
      content = <Text>System notification</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.pill]} className={`${bgColor}`}>
        <Icon name={iconName} size={14} color={iconColor} />
        {/* Text bao ngoài sẽ quy định màu sắc và font size chung */}
        <Text style={[styles.text]} className={`${textColor}`}>
          {content}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 6,
    maxWidth: '80%', // Tăng nhẹ max width để tên dài không bị xuống dòng xấu
    alignSelf: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
    justifyContent: 'center',
  },
  text: {
    fontSize: 10,
    fontWeight: '400', // Font thường cho các từ nối
    textAlign: 'center',
  }
});

export default MessageSystem;