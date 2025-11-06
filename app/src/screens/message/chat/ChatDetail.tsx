// import { useEffect, useState } from "react";
// import useAuth from "../../../../hooks/useAuth";
// import { getSocket } from "../../../../socket/socketClient";
// import { fetchMessages, markMessagesAsRead, sendMessage } from "../../../api/chat/message/route";
// import MessageSender from "./components/MessageSender";
// import MessageReceiver from "./components/MessageReceiver";
// import { hp } from "../../../../helpers/common";
// import { ArrowLeft, Info, Paperclip, Phone, Smile, Video } from "lucide-react-native";
// import { Text, TextInput, View, TouchableOpacity, ScrollView, FlatList } from "react-native";
// import { useRoute, useNavigation } from '@react-navigation/native';

// const ChatDetail = () => {
//     const route = useRoute<any>();
//     const navigation = useNavigation();
//     const { conversation } = route.params;
//     const [text, setText] = useState<string>("");
//     const { user } = useAuth();
//     const [files, setFiles] = useState<File[]>([]);
//     const [messages, setMessages] = useState<any[]>([]);

//     // Lắng nghe sự kiện tin nhắn mới từ socket
//     useEffect(() => {
//         const socket = getSocket();
//         const conversationId = conversation?.id;
//         if (conversationId) {
//             console.log("User joined conversation:", conversationId);
//             socket.emit("joinRoom", conversationId);
//         }

//         socket.on("newMessage", (newMessage: any) => {
//             console.log("New message received:", newMessage);
//             setMessages(prev => [newMessage, ...prev]);
//             if (newMessage.senderId !== user?.id && conversation && user) {
//                 markMessagesAsRead(conversation.id, user.id);
//             }
//         });

//         socket.on("markMessagesAsRead", ({ userId, seenAt, messageIds }: { userId: string, seenAt: string, messageIds: string[] }) => {
//             setMessages(prevMessages => prevMessages.map(msg => {
//                 if (messageIds.includes(msg._id)) {
//                     if (!msg.seens.some((seen: { userId: string }) => seen.userId === userId)) {
//                         msg.seens.push({ userId, seenAt });
//                     }
//                 }
//                 return msg;
//             }));
//         });

//         return () => {
//             socket.off("newMessage");
//             socket.off("markMessagesAsRead");
//             if (conversationId) {
//                 socket.emit("leaveRoom", conversationId);
//             }
//         };
//     }, [user?.id, conversation?.id]);

//     // Lấy tin nhắn từ server
//     useEffect(() => {
//         const fetchDataMessages = async () => {
//             const conversationId = conversation?.id;
//             if (!conversationId) return;
//             const data = await fetchMessages(conversationId);
//             setMessages(data);
//             if (user) {
//                 await markMessagesAsRead(conversationId, user.id);
//             }
//         };
//         fetchDataMessages();
//     }, [conversation?.id]);

//     // Gửi tin nhắn
//     const handleSendMessage = async () => {
//         if (text.trim() === "" && files.length === 0) return;
//         if (!user) return;
//         const formData = new FormData();
//         formData.append("conversationId", conversation?.id || "");
//         formData.append("senderId", user.id);
//         if (text) formData.append("text", text);
//         if (files.length > 0) {
//             files.forEach(f => formData.append("files", f));
//         }

//         const res = await sendMessage({
//             conversationId: conversation?.id || "",
//             senderId: user.id,
//             text,
//             files
//         });
//         setText("");
//     };

//     return (
//         <View className="flex-1 bg-white">
//             {/* Chat header */}
//             <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
//                 <View className="flex flex-row items-center justify-between w-full">
//                     <View className="flex-row items-center gap-3">
//                         <ArrowLeft size={28} className="text-gray-600" onPress={() => navigation.goBack()} />
//                         <Text className="text-lg font-semibold text-gray-800">
//                             {conversation?.type === "private"
//                                 ? conversation?.members.filter((member: { id: string }) => member.id !== user?.id)[0]?.name
//                                 : conversation?.name || `Bạn, ${conversation?.members.filter((m: { id: string }) => m.id !== user?.id).map((m: { name: string }) => m.name).join(", ")}`}
//                         </Text>
//                     </View>
//                     <View className="flex flex-row items-center gap-6">
//                         {conversation?.type === "private" && <Phone size={24} className="text-gray-500" />}
//                         <Video size={28} className="text-gray-500" />
//                         <Info size={28} className="text-gray-500" />
//                     </View>
//                 </View>
//             </View>

//             {/* Chat messages */}
//             <FlatList
//                 data={messages}
//                 keyExtractor={(item) => item?._id}
//                 renderItem={({ item }) => (
//                     <View key={item?._id} className="mb-2">
//                         {item?.senderId === user?.id ? (
//                             <MessageSender message={item} />
//                         ) : (
//                             <MessageReceiver message={item} />
//                         )}
//                     </View>
//                 )}
//                 inverted
//                 contentContainerStyle={{ padding: 12 }}
//             />

//             {/* Input area */}
//             <View style={{ height: hp(10) }} className="flex-row items-start gap-3 p-3 border-t border-gray-200 bg-white">
//                 <View className="flex flex-row items-center gap-3">
//                     <TouchableOpacity onPress={() => console.log("Smile clicked")}>
//                         <Smile className="text-gray-500 w-6 h-6" />
//                     </TouchableOpacity>
//                     <TouchableOpacity onPress={() => console.log("Paperclip clicked")}>
//                         <Paperclip className="text-gray-500 w-6 h-6" />
//                     </TouchableOpacity>
//                     <TextInput
//                         placeholder="Nhập tin nhắn..."
//                         className="flex-1 p-3 bg-gray-100 rounded-lg text-gray-800"
//                         value={text}
//                         onChangeText={setText}
//                         onKeyPress={(e) => {
//                             if (e.nativeEvent.key === "Enter") {
//                                 e.preventDefault?.();
//                                 handleSendMessage();
//                             }
//                         }}
//                     />
//                     <TouchableOpacity
//                         onPress={handleSendMessage}
//                         className="px-4 py-2 bg-blue-500 rounded-lg"
//                     >
//                         <Text className="text-white font-medium">Gửi</Text>
//                     </TouchableOpacity>
//                 </View>
//             </View>
//         </View>
//     );
// };

// export default ChatDetail;

import { useEffect, useState } from 'react';
import useAuth from '../../../../hooks/useAuth';
import { getSocket } from '../../../../socket/socketClient';
import {
  fetchMessages,
  markMessagesAsRead,
  sendMessage,
} from '../../../api/chat/message/route';
import MessageSender from './components/MessageSender';
import MessageReceiver from './components/MessageReceiver';
import { hp } from '../../../../helpers/common';
import {
  ArrowLeft,
  Info,
  Paperclip,
  Phone,
  Smile,
  Video,
  Send,
  MessageSquare,
  Users,
} from 'lucide-react-native';
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const ChatDetail = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { conversation } = route.params;
  const [text, setText] = useState<string>('');
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  // Lắng nghe sự kiện tin nhắn mới từ socket
  useEffect(() => {
    const socket = getSocket();
    const conversationId = conversation?.id;
    if (conversationId) {
      socket.emit('joinRoom', conversationId);
    }

    socket.on('newMessage', (newMessage: any) => {
      setMessages(prev => [newMessage, ...prev]);
      if (newMessage.senderId !== user?.id && conversation && user) {
        markMessagesAsRead(conversation.id, user.id);
      }
    });

    socket.on(
      'markMessagesAsRead',
      ({
        userId,
        seenAt,
        messageIds,
      }: {
        userId: string;
        seenAt: string;
        messageIds: string[];
      }) => {
        setMessages(prevMessages =>
          prevMessages.map(msg => {
            if (messageIds.includes(msg._id)) {
              if (
                !msg.seens.some(
                  (seen: { userId: string }) => seen.userId === userId,
                )
              ) {
                msg.seens.push({ userId, seenAt });
              }
            }
            return msg;
          }),
        );
      },
    );

    return () => {
      socket.off('newMessage');
      socket.off('markMessagesAsRead');
      if (conversationId) {
        socket.emit('leaveRoom', conversationId);
      }
    };
  }, [user?.id, conversation?.id]);

  // Lấy tin nhắn từ server
  useEffect(() => {
    const fetchDataMessages = async () => {
      const conversationId = conversation?.id;
      if (!conversationId) return;
      const data = await fetchMessages(conversationId);
      setMessages(data);
      if (user) {
        await markMessagesAsRead(conversationId, user.id);
      }
    };
    fetchDataMessages();
  }, [conversation?.id]);

  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if (text.trim() === '' && files.length === 0) return;
    if (!user) return;
    const formData = new FormData();
    formData.append('conversationId', conversation?.id || '');
    formData.append('senderId', user.id);
    if (text) formData.append('text', text);
    if (files.length > 0) {
      files.forEach(f => formData.append('files', f));
    }

    const res = await sendMessage({
      conversationId: conversation?.id || '',
      senderId: user.id,
      text,
      files,
    });
    setText('');
  };

  const getConversationName = () => {
    if (conversation?.type === 'private') {
      return conversation?.members.filter(
        (member: { id: string }) => member.id !== user?.id,
      )[0]?.name;
    }
    return (
      conversation?.name ||
      `Bạn, ${conversation?.members
        .filter((m: { id: string }) => m.id !== user?.id)
        .map((m: { name: string }) => m.name)
        .join(', ')}`
    );
  };

  const getMemberCount = () => {
    if (conversation?.type === 'group') {
      return conversation?.members?.length || 0;
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header với gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {getConversationName()}
              </Text>
              {getMemberCount() && (
                <Text style={styles.headerSubtitle}>
                  {getMemberCount()} thành viên
                </Text>
              )}
            </View>
          </View>

          <View style={styles.headerActions}>
            {conversation?.type === 'private' && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => console.log('Phone clicked')}
                activeOpacity={0.8}
              >
                <Phone size={20} color="#fff" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => console.log('Video clicked')}
              activeOpacity={0.8}
            >
              <Video size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => console.log('Info clicked')}
              activeOpacity={0.8}
            >
              <Info size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {/* Chat messages */}
        <FlatList
          data={messages}
          keyExtractor={item => item?._id}
          renderItem={({ item }) => (
            <View key={item?._id} style={styles.messageContainer}>
              {item?.senderId === user?.id ? (
                <MessageSender message={item} />
              ) : (
                <MessageReceiver message={item} />
              )}
            </View>
          )}
          inverted
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {/* Input area */}
        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <TouchableOpacity
                onPress={() => console.log('Smile clicked')}
                style={styles.inputButton}
                activeOpacity={0.8}
              >
                <Smile size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => console.log('Paperclip clicked')}
                style={styles.inputButton}
                activeOpacity={0.8}
              >
                <Paperclip size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TextInput
                placeholder="Nhập tin nhắn..."
                style={styles.textInput}
                value={text}
                onChangeText={setText}
                onKeyPress={e => {
                  if (e.nativeEvent.key === 'Enter') {
                    e.preventDefault?.();
                    handleSendMessage();
                  }
                }}
                placeholderTextColor="#9ca3af"
                multiline
                maxLength={1000}
              />

              <TouchableOpacity
                onPress={handleSendMessage}
                style={[
                  styles.sendButton,
                  text.trim()
                    ? styles.sendButtonActive
                    : styles.sendButtonInactive,
                ]}
                disabled={!text.trim()}
                activeOpacity={0.8}
              >
                <Send size={18} color={text.trim() ? '#fff' : '#9ca3af'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ChatDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: -12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  messageContainer: {
    marginBottom: 8,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  inputContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  inputButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    color: '#374151',
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#667eea',
    elevation: 2,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sendButtonInactive: {
    backgroundColor: '#f3f4f6',
  },
});
