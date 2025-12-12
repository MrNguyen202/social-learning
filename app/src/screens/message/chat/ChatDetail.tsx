import { useEffect, useRef, useState } from 'react';
import useAuth from '../../../../hooks/useAuth';
import { getSocket } from '../../../../socket/socketClient';
import {
  fetchMessages,
  markMessagesAsRead
} from '../../../api/chat/message/route';
import MessageSender from './components/MessageSender';
import MessageReceiver from './components/MessageReceiver';
import {
  ArrowLeft,
  Info,
  Phone,
  Smile,
  Send,
  Image,
  Mic,
  Reply,
  X,
} from 'lucide-react-native';
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { checkUserOnline } from '../../../api/user/route';
import Toast from 'react-native-toast-message';
import MessageSystem from './components/MessageSystem';
import { useChat } from '../../../../hooks/useChat';
import MessageOptionsModal from './components/MessageOptionsModal';
import { EmojiKeyboard } from 'rn-emoji-keyboard';
import ConversationInfoModal from '../components/ConversationInfoModal';

const ChatDetail = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { conversation } = route.params;
  const [text, setText] = useState<string>('');
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  const [conversationData, setConversationData] = useState(conversation);

  // State cho Modal Option
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isOptionModalVisible, setOptionModalVisible] = useState(false);

  const {
    messages,
    sendMessage,
    addMessage,
    setInitialMessages,
    retryMessage,
    setMessages,
    handleRevokeMessage,
    handleDeleteMessage,
    handleToggleLike
  } = useChat(conversationData?.id, user);

  const [onlineStatus, setOnlineStatus] = useState<boolean>(false);
  const [offlineTime, setOfflineTime] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);

  // STATE PHÂN TRANG TIN NHẮN
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Lắng nghe sự kiện tin nhắn mới từ socket
  useEffect(() => {
    const socket = getSocket();
    const conversationId = conversationData?.id;
    if (conversationId) {
      socket.emit('joinRoom', conversationId);
    }

    socket.on('newMessage', (newMessage: any) => {
      if (newMessage.senderId === user?.id) return;

      setMessages(prev => {
        if (prev.some(msg => msg._id === newMessage._id)) return prev;
        return [newMessage, ...prev];
      });
    });

    // Lắng nghe sự kiện system message (cập nhật nhóm)
    socket.on("groupUpdated", (updatedData: any) => {
      // Kiểm tra đúng conversation
      const currentId = conversationData?.id;
      const updateId = updatedData.id || updatedData._id;

      if (currentId && currentId === updateId) {
        setConversationData((prev: any) => {
          if (!prev) return null;

          // 1. Merge danh sách thành viên
          const mergedMembers = updatedData.members.map((newMemberData: any) => {
            // Lấy ID chuẩn từ data mới (có thể là id hoặc userId)
            const newMemberId = newMemberData.id || newMemberData.userId;

            // Tìm thành viên cũ khớp ID
            const existingMember = prev.members.find((m: any) => m.id === newMemberId);

            if (existingMember) {
              // Giữ nguyên tên/avatar cũ, chỉ update role
              return {
                ...existingMember,
                role: newMemberData.role,
                // Nếu backend có trả về admin mới thì update luôn
              };
            }

            return {
              ...newMemberData,
              id: newMemberId, // Chuẩn hóa về 'id'
              name: newMemberData.name || "Unknown", // Fallback tránh crash
              avatarUrl: newMemberData.avatarUrl || ""
            };
          });

          // 2. Trả về State mới
          return {
            ...prev,
            ...updatedData,         // Update các thông tin chung
            id: updateId,           // Đảm bảo id chuẩn
            admin: updatedData.admin, // Cập nhật chủ phòng (quan trọng cho chuyển quyền)
            members: mergedMembers,   // Danh sách đã merge
            avatar: updatedData.avatar
          };
        });
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
  }, [user?.id, conversationData?.id]);

  // Lấy tin nhắn từ server
  useEffect(() => {
    const fetchDataMessages = async () => {
      const conversationId = conversationData?.id;
      if (!conversationId) return;

      // Reset state
      setCurrentPage(1);
      setHasMore(true);
      setLoadingStatus(true);

      const data = await fetchMessages(conversationId, 1, 20);
      setMessages(data);

      if (data.length < 20) {
        setHasMore(false);
      }

      if (user) {
        await markMessagesAsRead(conversationId, user.id);
      }
    };
    fetchDataMessages();
  }, [conversationData?.id]);

  useEffect(() => {
    const checkOnlineStatus = async () => {
      if (!conversationData?.members || !user) return;
      setLoadingStatus(true); // Bắt đầu loading

      const otherMembers = conversationData.members.filter(
        (m: any) => m.id !== user?.id,
      );

      if (conversationData.type === 'private') {
        if (otherMembers.length > 0) {
          const otherMember = otherMembers[0];
          try {
            const res = await checkUserOnline(otherMember.id);
            setOnlineStatus(res.data.isOnline);
            setOfflineTime(res.data.isOnline ? null : res.data.offlineTime);
          } catch (error) {
            console.error('Failed to check user online status:', error);
            setOnlineStatus(false);
            setOfflineTime(null);
          }
        }
      } else {
        if (otherMembers.length > 0) {
          try {
            const statusPromises = otherMembers.map((member: any) =>
              checkUserOnline(member.id),
            );
            const statusResults = await Promise.all(statusPromises);
            const isAnyoneOnline = statusResults.some(res => res.data.isOnline);
            setOnlineStatus(isAnyoneOnline);
            setOfflineTime(null);
          } catch (error) {
            console.error('Failed to check group online status:', error);
            setOnlineStatus(false);
            setOfflineTime(null);
          }
        }
      }
      setLoadingStatus(false);
    };

    checkOnlineStatus();
    const unsubscribe = navigation.addListener('focus', checkOnlineStatus);
    return unsubscribe;
  }, [conversationData, user?.id, navigation]);

  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if (text.trim() === '' && files.length === 0) return;
    if (!user) return;
    const formData = new FormData();
    formData.append('conversationId', conversationData?.id || '');
    formData.append('senderId', user.id);
    if (text) formData.append('text', text);
    if (files.length > 0) {
      files.forEach(f => formData.append('files', f));
    }

    await sendMessage(
      text,
      files,
      replyingTo
    );
    setText('');
    setFiles([]);
    setReplyingTo(null);
  };

  // Bắt đầu cuộc gọi
  const handleStartCall = () => {
    if (!onlineStatus) {
      const message =
        conversationData?.type === 'private'
          ? 'Người dùng không online'
          : 'Thành viên không online';
      Toast.show({ type: 'info', text1: message });
      return;
    }
    const socket = getSocket();
    const callPayload = {
      conversationId: conversationData?.id,
      callerId: user?.id,
      callerName: user?.name,
      members: conversationData?.members,
    };

    socket.emit('startCall', callPayload);

    navigation.navigate('ConferenceCall', {
      userID: user?.id,
      conferenceID: conversationData?.id,
    });
  };

  // Lấy tên cuộc trò chuyện
  const getConversationName = () => {
    if (conversationData?.type === 'private') {
      return conversationData?.members.filter(
        (member: { id: string }) => member.id !== user?.id,
      )[0]?.name;
    }
    return (
      conversationData?.name ||
      `Bạn, ${conversationData?.members
        .filter((m: { id: string }) => m.id !== user?.id)
        .map((m: { name: string }) => m.name)
        .join(', ')}`
    );
  };

  // Hàm xử lý khi long press vào tin nhắn
  const handleLongPressMessage = (message: any) => {
    setSelectedMessage(message);
    setOptionModalVisible(true);
  };

  // Hàm xử lý khi chọn trả lời tin nhắn
  const onReply = (message: any) => {
    setReplyingTo(message);
  };

  // STATE VÀ HÀM XỬ LÝ CHO BÀN PHÍM EMOJI
  const [isShowEmoji, setIsShowEmoji] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Hàm khi bấm vào icon Mặt cười
  const handleToggleEmoji = () => {
    if (isShowEmoji) {
      // Nếu đang mở Emoji -> Bấm lần nữa thì focus lại vào Input để hiện bàn phím
      inputRef.current?.focus();
      setIsShowEmoji(false);
    } else {
      // Nếu đang tắt -> Tắt bàn phím trước, sau đó mới hiện khung Emoji
      Keyboard.dismiss();
      setIsShowEmoji(true);
    }
  };

  // Hàm chọn Emoji
  const handlePickEmoji = (emojiObject: any) => {
    setText((prev) => prev + emojiObject.emoji);
  };

  // Lắng nghe sự kiện bàn phím
  useEffect(() => {
    // Khi bàn phím hệ thống hiện lên -> Bắt buộc phải ẩn khung Emoji
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsShowEmoji(false);
    });

    return () => {
      showSubscription.remove();
    };
  }, []);

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(35);
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // STATE CONVERSATION INFO MODAL
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Hàm callback khi Modal cập nhật dữ liệu (VD: đổi tên nhóm xong)
  const handleInfoUpdate = () => {
    // Nếu cần fetch lại dữ liệu mới nhất từ API, gọi ở đây.
    // Hoặc đơn giản là log ra.
    console.log("Thông tin nhóm đã thay đổi");
  };

  // HÀM TẢI THÊM TIN NHẮN (KHI KÉO LÊN ĐẦU)
  const loadMoreMessages = async () => {
    // Nếu hết tin, đang load, hoặc chưa có ID -> dừng
    if (!hasMore || isLoadingMore || !conversationData?.id) return;

    setIsLoadingMore(true);

    try {
      const nextPage = currentPage + 1;
      // Gọi API lấy trang tiếp theo
      const olderMessages = await fetchMessages(conversationData.id, nextPage, 20);

      if (olderMessages.length < 20) {
        setHasMore(false);
      }

      if (olderMessages.length > 0) {
        // FlatList inverted: Tin mới nhất ở đầu mảng [0], tin cũ ở cuối mảng.
        // Nên ta nối tin cũ vào CUỐI mảng hiện tại: [...prev, ...olderMessages]
        setMessages((prev) => {
          // Lọc trùng lặp để an toàn (giống Web)
          const existingIds = new Set(prev.map(m => m._id));
          const newUniqueMessages = olderMessages.filter((m: any) => !existingIds.has(m._id));
          return [...prev, ...newUniqueMessages];
        });

        setCurrentPage(nextPage);
      }
    } catch (error) {
      console.error("Load more error:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f9fafb]">
      {/* Header Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-5 pt-3 pb-5"
      >
        {/* ... (Header code giữ nguyên từ câu trả lời trước, chỉ lưu ý dùng className) ... */}
        <View className="flex-row items-center justify-between">
          {/* Back Button */}
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>

          {/* Title */}
          <View className="flex-1 ml-4">
            <Text className="text-lg font-bold text-white" numberOfLines={1}>{getConversationName()}</Text>
            {onlineStatus && <Text className="text-xs text-green-300">Đang hoạt động</Text>}
          </View>

          {/* Call Button */}
          <View className="flex-row items-center space-x-3 gap-4">
            <TouchableOpacity onPress={handleStartCall} className="w-10 h-10 rounded-full bg-white/15 items-center justify-center">
              <Phone size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowInfoModal(true)}
              className="w-10 h-10 rounded-full bg-white/15 items-center justify-center"
            >
              <Info size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Body Chat */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 bg-white -mt-3 rounded-t-3xl overflow-hidden">
          <FlatList
            data={messages}
            inverted
            contentContainerStyle={{ paddingBottom: 20 }}
            keyExtractor={item => item?._id}
            onEndReached={loadMoreMessages}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isLoadingMore ? (
                <View className="py-4">
                  <ActivityIndicator size="small" color="#3b82f6" />
                </View>
              ) : null
            }
            renderItem={({ item, index }) => {
              const isMe = item?.senderId === user?.id;
              // ... logic tính showTimestamp ...
              const nextMessage = messages[index - 1];
              const isLastInSequence = !nextMessage || nextMessage.senderId !== item.senderId;
              const showTimestamp = isLastInSequence;

              if (item.content.type === "system") {
                return <MessageSystem message={item} />;
              }

              return (
                <View className="px-4 py-0.5">
                  {isMe ? (
                    <MessageSender
                      message={item}
                      showTimestamp={showTimestamp}
                      isLastInSequence={isLastInSequence}
                      onLongPress={() => handleLongPressMessage(item)} // <--- THÊM
                    />
                  ) : (
                    <MessageReceiver
                      message={item}
                      showAvatar={!messages[index + 1] || messages[index + 1].senderId !== item.senderId}
                      showTimestamp={showTimestamp}
                      onLongPress={() => handleLongPressMessage(item)} // <--- THÊM
                    />
                  )}
                </View>
              );
            }}
          // ...
          />

          {/* INPUT BAR AREA */}
          <View style={{ paddingBottom: Platform.OS === "android" ? keyboardHeight : 0 }} className="border-t border-gray-100 bg-white shadow-sm">

            {/* UI: HIỂN THỊ TIN NHẮN ĐANG REPLY (Tương tự Web) */}
            {replyingTo && (
              <View className="flex-row items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
                <View className="flex-1 border-l-4 border-blue-500 pl-3 mr-2">
                  <View className="flex-row items-center gap-1 mb-1">
                    <Reply size={12} color="#3b82f6" />
                    <Text className="text-xs font-bold text-blue-600">
                      Trả lời {replyingTo.sender?.name || "Người dùng"}
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-600" numberOfLines={1}>
                    {replyingTo.content.text || (replyingTo.content.images?.length ? "[Hình ảnh]" : "[File]")}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setReplyingTo(null)} className="p-1 bg-gray-200 rounded-full">
                  <X size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
            )}

            {/* Input chính */}
            <View className="p-3 flex-row items-center bg-white">
              {/* Giữ nguyên code input cũ của bạn */}
              <View className="flex-row items-center bg-gray-100 rounded-3xl px-2 py-1 border border-gray-200 flex-1">
                <TouchableOpacity onPress={handleToggleEmoji} className="p-2">
                  <Smile size={24} color={isShowEmoji ? "#3b82f6" : "#9ca3af"} />
                </TouchableOpacity>

                <TextInput
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 text-base max-h-24 text-gray-800"
                  multiline
                  value={text}
                  onChangeText={setText}
                  onFocus={() => setIsShowEmoji(false)}
                />

                {text.trim() || files.length > 0 ? (
                  <TouchableOpacity onPress={handleSendMessage} className="bg-blue-600 w-9 h-9 rounded-full items-center justify-center ml-2">
                    <Send size={18} color="white" />
                  </TouchableOpacity>
                ) : (
                  <View className="flex-row">
                    <TouchableOpacity className="p-2"><Mic size={24} color="#9ca3af" /></TouchableOpacity>
                    <TouchableOpacity className="p-2"><Image size={24} color="#9ca3af" /></TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>
          <View style={{ height: isShowEmoji ? 250 : 0, overflow: 'hidden' }}>
            {isShowEmoji && (
              <EmojiKeyboard
                onEmojiSelected={handlePickEmoji}
                enableSearchBar={false}
                categoryPosition="top"
                enableRecentlyUsed={true}
                styles={{
                  container: {
                    borderRadius: 0,
                    backgroundColor: '#fff',
                  },
                  header: {
                    paddingHorizontal: 0,
                    height: 0,
                  }
                }}
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* --- MODAL OPTION --- */}
      <MessageOptionsModal
        isVisible={isOptionModalVisible}
        onClose={() => setOptionModalVisible(false)}
        message={selectedMessage}
        user={user}
        onReply={onReply}
        onDelete={handleDeleteMessage} // Gọi hàm từ useChat
        onRevoke={handleRevokeMessage} // Gọi hàm từ useChat
        onLike={handleToggleLike}      // Gọi hàm từ useChat
      />

      {/* CONVERSATION INFO MODAL */}
      <ConversationInfoModal
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        conversation={conversationData} // Truyền state conversation hiện tại
        currentUser={user}
        onUpdate={handleInfoUpdate}
      />
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
  // Status (Mới)
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusOnline: {
    backgroundColor: '#22C55E', // green-500
  },
  statusOffline: {
    backgroundColor: '#EF4444', // red-500
  },
  // Content (Giữ nguyên)
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: -12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden', // Quan trọng để bo góc
  },
  messageContainer: {
    marginBottom: 8,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  // Input (Giữ nguyên)
  inputSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
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
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
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
    paddingHorizontal: 2,
    paddingVertical: 8,
    fontSize: 16,
    color: '#374151',
    maxHeight: 100,
    textAlignVertical: 'center',
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
