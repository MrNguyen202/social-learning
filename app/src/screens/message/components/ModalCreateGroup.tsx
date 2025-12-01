import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Search, Loader2, CheckCircle2, Circle, Users, UserCheck, X } from "lucide-react-native";
import useAuth from "../../../../hooks/useAuth";
import { getFollowers, getFollowing } from "../../../api/follow/route";
import { createConversation } from "../../../api/chat/conversation/route";
import { getUserImageSrc } from "../../../api/image/route";


// Hooks & API Imports (Giữ nguyên logic) 
interface ModalCreateGroupProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

type TabType = 'following' | 'followers';

export default function ModalCreateGroup({ open, setOpen }: ModalCreateGroupProps) {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  // -- State --
  const [groupName, setGroupName] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>('following');
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Load Data
  useEffect(() => {
    if (open && user?.id) {
      const fetchData = async () => {
        setLoadingData(true);
        try {
          const [resFollowing, resFollowers] = await Promise.all([
            getFollowing(user.id),
            getFollowers(user.id)
          ]);
          if (resFollowing.success) setFollowingList(resFollowing.data);
          if (resFollowers.success) setFollowersList(resFollowers.data);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
      // Reset form
      setGroupName("");
      setSelectedUsers([]);
      setSearchTerm("");
      setActiveTab('following');
    }
  }, [open, user?.id]);

  // 2. Toggle Selection
  const toggleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  // 3. Filter List
  const displayList = useMemo(() => {
    const sourceList = activeTab === 'following' ? followingList : followersList;
    if (!searchTerm.trim()) return sourceList;
    return sourceList.filter(u =>
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.nick_name && u.nick_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [activeTab, followingList, followersList, searchTerm]);

  // 4. Create Group Handler
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên nhóm");
      return;
    }
    if (selectedUsers.length < 2) {
      Alert.alert("Chưa đủ thành viên", "Nhóm cần tối thiểu 3 thành viên (Bạn và 2 người khác).");
      return;
    }
    if (!user) return;

    setCreating(true);

    try {
      const allLoadedUsers = [...followingList, ...followersList];
      const uniqueSelectedMembers = new Map();

      selectedUsers.forEach(id => {
        const userInfo = allLoadedUsers.find(u => u.id === id);
        if (userInfo) uniqueSelectedMembers.set(id, userInfo);
      });

      const members = [
        { userId: user.id, role: "admin" },
        ...Array.from(uniqueSelectedMembers.values()).map((u: any) => ({ userId: u.id, role: "member" }))
      ];

      const newGroup = await createConversation({
        name: groupName,
        type: "group",
        members: members,
        admin: user.id,
      });

      setOpen(false);
      
      // Navigate to Chat Detail (Thay đổi tên màn hình phù hợp với Stack Navigator của bạn)
      navigation.navigate('ChatScreen', { conversationId: newGroup.id, conversation: newGroup });
      
      Alert.alert("Thành công", "Tạo nhóm thành công!");
    } catch (error) {
      console.error("Error creating group:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi tạo nhóm");
    } finally {
      setCreating(false);
    }
  };

  // Render Item cho FlatList
  const renderUserItem = ({ item }: { item: any }) => {
    const isSelected = selectedUsers.includes(item.id);
    return (
      <TouchableOpacity
        onPress={() => toggleSelectUser(item.id)}
        activeOpacity={0.7}
        className={`flex-row items-center justify-between p-3 rounded-lg border mb-2 ${
          isSelected 
            ? "bg-blue-50 border-blue-200" 
            : "bg-white border-transparent"
        }`}
      >
        <View className="flex-row items-center gap-3">
          {item.avatar ? (
            <Image source={{ uri: getUserImageSrc(item.avatar) }} className="w-10 h-10 rounded-full" />
            ) : (
            <View className="w-10 h-10 rounded-full bg-gray-300 justify-center items-center">
              <Text className="text-gray-500 font-semibold text-lg">{item?.name?.[0]?.toUpperCase()}</Text>
            </View>
          )}
          <View>
            <Text className="font-medium text-gray-900 text-sm">{item.name}</Text>
            <Text className="text-xs text-gray-500">@{item.nick_name}</Text>
          </View>
        </View>
        
        {isSelected ? (
          <CheckCircle2 size={20} color="#2563eb" /> // text-blue-600
        ) : (
          <Circle size={20} color="#d1d5db" /> // text-gray-300
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={open}
      animationType="slide"
      onRequestClose={() => setOpen(false)}
      presentationStyle="pageSheet" // Hiệu ứng native iOS đẹp
    >
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 flex-col"
        >
          {/* --- Header --- */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
            <Text className="text-lg font-bold text-gray-900">Tạo nhóm mới</Text>
            <TouchableOpacity onPress={() => setOpen(false)} className="p-1">
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* --- Body --- */}
          <View className="flex-1 px-4 pt-4">
            
            {/* Input Group Name */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Tên nhóm <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Nhập tên nhóm..."
                placeholderTextColor="#9ca3af"
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900"
              />
            </View>

            {/* Tabs */}
            <View className="flex-row border-b border-gray-200 mb-3">
              <TouchableOpacity
                onPress={() => { setActiveTab('following'); setSearchTerm(""); }}
                className={`flex-1 pb-3 flex-row items-center justify-center gap-2 border-b-2 ${
                  activeTab === 'following' ? 'border-blue-600' : 'border-transparent'
                }`}
              >
                <UserCheck size={16} color={activeTab === 'following' ? '#2563eb' : '#6b7280'} />
                <Text className={`text-sm font-medium ${
                  activeTab === 'following' ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  Đang theo dõi ({followingList.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setActiveTab('followers'); setSearchTerm(""); }}
                className={`flex-1 pb-3 flex-row items-center justify-center gap-2 border-b-2 ${
                  activeTab === 'followers' ? 'border-blue-600' : 'border-transparent'
                }`}
              >
                <Users size={16} color={activeTab === 'followers' ? '#2563eb' : '#6b7280'} />
                <Text className={`text-sm font-medium ${
                  activeTab === 'followers' ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  Người theo dõi ({followersList.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View className="relative mb-3">
              <View className="absolute left-3 top-3 z-10">
                <Search size={16} color="#9ca3af" />
              </View>
              <TextInput
                placeholder="Tìm trong danh sách..."
                placeholderTextColor="#9ca3af"
                value={searchTerm}
                onChangeText={setSearchTerm}
                className="pl-9 h-10 border border-gray-200 rounded-lg text-sm bg-white text-gray-900"
              />
            </View>

            {/* User List */}
            <View className="flex-1">
              {loadingData ? (
                <View className="flex-1 justify-center items-center">
                  <ActivityIndicator size="large" color="#2563eb" />
                </View>
              ) : displayList.length > 0 ? (
                <FlatList
                  data={displayList}
                  keyExtractor={(item) => item.id}
                  renderItem={renderUserItem}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              ) : (
                <View className="flex-1 justify-center items-center">
                  <Text className="text-gray-500 text-sm">Không tìm thấy ai.</Text>
                </View>
              )}
            </View>
          </View>

          {/* --- Footer --- */}
          <View className="p-4 border-t border-gray-100 bg-gray-50 flex-row justify-between items-center pb-8">
            {/* Info Selection */}
            <View className="flex-col">
              <Text className="text-sm text-gray-600">
                Đã chọn: <Text className={`font-bold ${selectedUsers.length < 2 ? 'text-red-500' : 'text-blue-600'}`}>
                  {selectedUsers.length}
                </Text>
              </Text>
              {selectedUsers.length < 2 && (
                <Text className="text-[10px] text-red-500 italic mt-0.5">
                  *Cần thêm {2 - selectedUsers.length} người
                </Text>
              )}
            </View>

            {/* Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity 
                onPress={() => setOpen(false)}
                className="px-4 py-2 rounded-md border border-gray-300 bg-white"
              >
                <Text className="text-sm font-medium text-gray-700">Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCreateGroup}
                disabled={!groupName.trim() || selectedUsers.length < 2 || creating}
                className={`flex-row items-center px-4 py-2 rounded-md bg-gray-900 ${
                  (!groupName.trim() || selectedUsers.length < 2 || creating) ? "opacity-50" : "opacity-100"
                }`}
              >
                {creating && <Loader2 size={14} color="white" style={{ marginRight: 6 }} />}
                <Text className="text-sm font-medium text-white">Tạo nhóm</Text>
              </TouchableOpacity>
            </View>
          </View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}