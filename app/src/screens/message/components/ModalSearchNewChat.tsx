import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from "react-native";

// Icons
import { Search, Users, UserCheck, Send, ArrowLeft, X } from "lucide-react-native";

// Navigation
import { useNavigation } from "@react-navigation/native";

// Hooks & API
import useAuth from "../../../../hooks/useAuth";
import { createConversation, findConversationBetweenUsers } from "../../../api/chat/conversation/route";
import { getFollowers, getFollowing } from "../../../api/follow/route";
import { sendMessage } from "../../../api/chat/message/route";
import { getUserImageSrc } from "../../../api/image/route";

interface ModalSearchNewChatProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = 'following' | 'followers';
type StepType = 'search' | 'compose';

const SUGGESTIONS = [
  "Xin chào! 👋",
  "Chào bạn, mình muốn kết nối! 🤝",
  "Hi! Long time no see.",
  "Hế lô! 😺"
];

export default function ModalSearchNewChat({ visible, onClose }: ModalSearchNewChatProps) {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  // -- Data State --
  const [activeTab, setActiveTab] = useState<TabType>('following');
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [followersList, setFollowersList] = useState<any[]>([]);

  // -- UI State --
  const [step, setStep] = useState<StepType>('search');
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [firstMessage, setFirstMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const [processing, setProcessing] = useState(false);

  // 1. Load Data
  useEffect(() => {
    if (visible && user?.id) {
      const fetchData = async () => {
        setLoadingData(true);
        try {
          const [resFollowing, resFollowers] = await Promise.all([
            getFollowing(user.id),
            getFollowers(user.id)
          ]);
          if (resFollowing.success) setFollowingList(resFollowing.data);
          if (resFollowers.success) setFollowersList(resFollowers.data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();

      // Reset
      setSearchTerm("");
      setActiveTab('following');
      setStep('search');
      setSelectedPartner(null);
      setFirstMessage("");
      setProcessing(false);
    }
  }, [visible, user?.id]);

  // 2. Filter Logic
  const displayList = useMemo(() => {
    const sourceList = activeTab === 'following' ? followingList : followersList;
    if (!searchTerm.trim()) return sourceList;
    const lowerTerm = searchTerm.toLowerCase();
    return sourceList.filter(u =>
      (u.name && u.name.toLowerCase().includes(lowerTerm)) ||
      (u.nick_name && u.nick_name.toLowerCase().includes(lowerTerm))
    );
  }, [activeTab, followingList, followersList, searchTerm]);

  console.log("Display List:", displayList);

  // 3. Handle Click User
  const handleUserClick = async (targetUser: any) => {
    if (!user || processing) return;
    setProcessing(true);
    try {
      const checkRes = await findConversationBetweenUsers(targetUser.id);
      
      if (checkRes.message === "Yes" && checkRes.conversation) {
        onClose();
        
        // Điều hướng và truyền params
        navigation.navigate('ChatDetail', { 
            conversationId: checkRes.conversation.id,
            conversation: checkRes.conversation 
        });

      } else {
        setSelectedPartner(targetUser);
        setStep('compose');
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể kiểm tra cuộc trò chuyện");
    } finally {
      setProcessing(false);
    }
  };

  // 4. Handle Send
  const handleSendFirstMessage = async () => {
    if (!firstMessage.trim() || !selectedPartner || !user) return;
    setProcessing(true);
    try {
      const newConv = await createConversation({
        type: "private",
        members: [
          { userId: user.id, role: "member" },
          { userId: selectedPartner.id, role: "member" }
        ]
      });

      await sendMessage({
        conversationId: newConv.id,
        senderId: user.id,
        text: firstMessage,
        files: [],
        replyTo: null
      });

      onClose();

      // Điều hướng và truyền params
      navigation.navigate('ChatDetail', { 
        conversationId: newConv.id,
        conversation: newConv 
      });

    } catch (error) {
      console.error("Failed to start chat:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setProcessing(false);
    }
  };

  // --- Render Item ---
  const renderUserItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="flex-row items-center p-3 mx-3 mb-1 rounded-xl bg-white active:bg-blue-50"
      onPress={() => handleUserClick(item)}
      disabled={processing}
    >
      <View className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-gray-200 justify-center items-center">
        {item.avatar ? (
          <Image source={{ uri: getUserImageSrc(item?.avatar) }} className="w-full h-full" />
        ) : (
          <Text className="text-gray-500 font-semibold text-lg">{item?.name?.[0]?.toUpperCase()}</Text>
        )}
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-gray-900 text-base">{item.name}</Text>
        <Text className="text-gray-500 text-xs">@{item.nick_name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView 
           behavior={Platform.OS === "ios" ? "padding" : "height"}
           className="flex-1"
        >
          
          {/* HEADER */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
            {step === 'compose' ? (
              <TouchableOpacity onPress={() => setStep('search')} className="p-1">
                <ArrowLeft size={24} color="#374151" />
              </TouchableOpacity>
            ) : (
              <View className="w-6" /> // Spacer
            )}
            
            <Text className="text-lg font-bold text-gray-900">
              {step === 'search' ? "Tin nhắn mới" : "Soạn tin nhắn"}
            </Text>

            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* BODY */}
          <View className="flex-1">
            
            {/* VIEW 1: SEARCH */}
            {step === 'search' && (
              <>
                {/* Tabs */}
                <View className="flex-row border-b border-gray-100 bg-gray-50/50">
                  <TouchableOpacity
                    onPress={() => { setActiveTab('following'); setSearchTerm(""); }}
                    className={`flex-1 flex-row items-center justify-center py-3 gap-2 border-b-2 ${
                      activeTab === 'following' ? 'border-blue-600 bg-white' : 'border-transparent'
                    }`}
                  >
                    <UserCheck size={16} color={activeTab === 'following' ? "#2563eb" : "#6b7280"} />
                    <Text className={`font-medium text-sm ${
                      activeTab === 'following' ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      Đang theo dõi
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => { setActiveTab('followers'); setSearchTerm(""); }}
                    className={`flex-1 flex-row items-center justify-center py-3 gap-2 border-b-2 ${
                      activeTab === 'followers' ? 'border-blue-600 bg-white' : 'border-transparent'
                    }`}
                  >
                    <Users size={16} color={activeTab === 'followers' ? "#2563eb" : "#6b7280"} />
                    <Text className={`font-medium text-sm ${
                      activeTab === 'followers' ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      Người theo dõi
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Search Input */}
                <View className="px-3 py-3">
                  <View className="flex-row items-center bg-gray-100 rounded-lg px-3 h-11 border border-transparent focus:border-blue-500">
                    <Search size={18} color="#9ca3af" />
                    <TextInput
                      className="flex-1 ml-2 text-gray-900 text-base h-full"
                      placeholder="Tìm người dùng..."
                      value={searchTerm}
                      onChangeText={setSearchTerm}
                      placeholderTextColor="#9ca3af"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* User List */}
                {loadingData ? (
                  <View className="mt-10">
                    <ActivityIndicator size="large" color="#2563eb" />
                  </View>
                ) : (
                  <FlatList
                    data={displayList}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderUserItem}
                    contentContainerClassName="pb-6"
                    ListEmptyComponent={
                      <Text className="text-center text-gray-500 mt-10">Không tìm thấy kết quả.</Text>
                    }
                  />
                )}
              </>
            )}

            {/* VIEW 2: COMPOSE */}
            {step === 'compose' && selectedPartner && (
              <View className="flex-1 p-5">
                
                {/* User Summary Card */}
                <View className="flex-row items-center bg-gray-50 p-3 rounded-xl border border-gray-100 mb-6">
                  <View className="w-12 h-12 rounded-full overflow-hidden mr-3 bg-gray-200 justify-center items-center">
                      {selectedPartner.avatar ? (
                        <Image source={{ uri: getUserImageSrc(selectedPartner.avatar) }} className="w-full h-full" />
                      ) : (
                        <Text className="text-gray-500 font-bold text-lg">{selectedPartner.name[0]}</Text>
                      )}
                  </View>
                  <View>
                    <Text className="font-bold text-gray-900 text-base">{selectedPartner.name}</Text>
                    <Text className="text-gray-500 text-xs">Bắt đầu cuộc trò chuyện mới</Text>
                  </View>
                </View>

                {/* Suggestions */}
                <View className="mb-6">
                  <Text className="text-xs font-semibold text-gray-500 mb-2 uppercase">Gợi ý lời chào:</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {SUGGESTIONS.map((sug, idx) => (
                      <TouchableOpacity
                        key={idx}
                        className="px-3 py-2 rounded-full border border-gray-200 bg-white active:bg-blue-50 active:border-blue-200"
                        onPress={() => setFirstMessage(sug)}
                      >
                        <Text className="text-gray-700 text-xs font-medium">{sug}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Input Area */}
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Tin nhắn:</Text>
                  <TextInput
                    className="w-full border border-gray-300 rounded-xl p-3 text-base text-gray-900 bg-white h-32"
                    multiline
                    numberOfLines={4}
                    placeholder="Nhập lời chào của bạn..."
                    value={firstMessage}
                    onChangeText={setFirstMessage}
                    textAlignVertical="top"
                  />
                </View>

                {/* Footer Action */}
                <View className="mt-4 pb-4">
                    <TouchableOpacity
                      className={`flex-row items-center justify-center py-3.5 rounded-xl ${
                        (!firstMessage.trim() || processing) ? 'bg-blue-300' : 'bg-blue-600'
                      }`}
                      onPress={handleSendFirstMessage}
                      disabled={!firstMessage.trim() || processing}
                    >
                      {processing ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <>
                          <Send size={18} color="white" />
                          <Text className="text-white font-bold text-base ml-2">Gửi & Bắt đầu</Text>
                        </>
                      )}
                    </TouchableOpacity>
                </View>

              </View>
            )}

          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}