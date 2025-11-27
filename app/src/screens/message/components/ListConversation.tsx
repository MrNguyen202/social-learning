import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../../../../hooks/useAuth';
import { getSocket } from '../../../../socket/socketClient';
import { fetchConversations } from '../../../api/chat/conversation/route';
import UserCard from './UserCard';
import GroupCard from './GroupCard';
import {
  FlatList,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { MessageCircle, Users } from 'lucide-react-native';

export default function ListConversation() {
  const navigation = useNavigation<any>();
  const { user, loading } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);

  // Lấy danh sách cuộc trò chuyện của người dùng từ API hoặc context
  useEffect(() => {
    const socket = getSocket();
    const fetchData = async () => {
      if (!user?.id || loading) return;
      setLoadingConversations(true);
      try {
        const res = await fetchConversations();
        setConversations(res);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoadingConversations(false);
      }
    };

    // Lắng nghe sự kiện 'newMessage' từ server để cập nhật danh sách cuộc trò chuyện
    socket.on('notificationNewMessage', () => {
      fetchData();
    });

    socket.on('notificationMessagesRead', () => {
      fetchData();
    });

    fetchData();

    // Đóng socket khi unmount
    return () => {
      socket.off('notificationNewMessage');
      socket.off('notificationMessagesRead');
    };
  }, [user?.id, loading]);

  //Handle card click
  const handleCardClick = async (conversationId: string, conversation: any) => {
    navigation.navigate('ChatDetail', { conversationId, conversation });
  };

  const renderLoadingState = () => (
    <View style={styles.centerContainer}>
      <View style={styles.loadingIconContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
      <Text style={styles.loadingTitle}>Đang tải tin nhắn...</Text>
      <Text style={styles.loadingDescription}>Vui lòng chờ trong giây lát</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.centerContainer}>
      <View style={styles.emptyIconContainer}>
        <MessageCircle size={48} color="#9ca3af" />
      </View>
      <Text style={styles.emptyTitle}>Chưa có tin nhắn</Text>
      <Text style={styles.emptyDescription}>
        Bắt đầu cuộc trò chuyện mới với bạn bè của bạn
      </Text>
    </View>
  );

  if (loadingConversations) {
    return renderLoadingState();
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Users size={20} color="#667eea" />
          <Text style={styles.sectionTitle}>Tin nhắn</Text>
        </View>
        {conversations.length > 0 && (
          <Text style={styles.conversationCount}>
            {conversations.length} cuộc trò chuyện
          </Text>
        )}
      </View>

      <FlatList
        data={conversations}
        keyExtractor={item => item.id}
        renderItem={({ item }) =>
          item.type === 'private' ? (
            <UserCard
              key={item.id}
              conversation={item}
              onClick={() => handleCardClick(item.id, item)}
            />
          ) : (
            <GroupCard
              key={item.id}
              conversation={item}
              onClick={() => handleCardClick(item.id, item)}
            />
          )
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          conversations.length === 0
            ? styles.emptyListContainer
            : styles.listContainer
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  conversationCount: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  loadingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f4ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  loadingDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
