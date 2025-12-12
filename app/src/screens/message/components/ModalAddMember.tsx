import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    FlatList,
    Image,
    ActivityIndicator,
    SafeAreaView,
    Platform,
    KeyboardAvoidingView
} from 'react-native';
import { Search, X, CheckCircle2, Circle, UserCheck, Users } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import useAuth from '../../../../hooks/useAuth';
// Điều chỉnh đường dẫn import API cho đúng với project của bạn
import { getFollowing, getFollowers } from '../../../../src/api/follow/route';
import { addMembersToGroup } from '../../../../src/api/chat/conversation/route';
import { getUserImageSrc } from '../../../../src/api/image/route';

interface ModalAddMemberProps {
    visible: boolean;
    onClose: () => void;
    conversationId: string;
    currentMembers: any[];
}

type TabType = 'following' | 'followers';

export default function ModalAddMember({
    visible,
    onClose,
    conversationId,
    currentMembers
}: ModalAddMemberProps) {
    const { user } = useAuth();

    // State
    const [activeTab, setActiveTab] = useState<TabType>('following');
    const [followingList, setFollowingList] = useState<any[]>([]);
    const [followersList, setFollowersList] = useState<any[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [adding, setAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // 1. Load Data khi Modal mở
    useEffect(() => {
        if (visible && user?.id) {
            const fetchData = async () => {
                setLoadingData(true);
                try {
                    // Gọi song song 2 API lấy danh sách
                    const [resFollowing, resFollowers] = await Promise.all([
                        getFollowing(user.id),
                        getFollowers(user.id)
                    ]);
                    if (resFollowing.success) setFollowingList(resFollowing.data);
                    if (resFollowers.success) setFollowersList(resFollowers.data);
                } catch (error) {
                    console.error("Lỗi fetch contact:", error);
                    Toast.show({ type: 'error', text1: 'Không thể tải danh sách bạn bè' });
                } finally {
                    setLoadingData(false);
                }
            };

            fetchData();
            // Reset state mỗi khi mở lại modal
            setSelectedUsers([]);
            setSearchTerm("");
            setActiveTab('following');
        }
    }, [visible, user?.id]);

    // 2. Hàm chọn/bỏ chọn user
    const toggleSelectUser = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    // 3. Lọc danh sách hiển thị (Filter logic)
    const displayList = useMemo(() => {
        let sourceList = activeTab === 'following' ? followingList : followersList;

        // Lọc bỏ những người ĐÃ CÓ trong nhóm
        sourceList = sourceList.filter(u => !currentMembers.some(member => member.id === u.id));

        // Lọc theo từ khóa tìm kiếm
        if (!searchTerm.trim()) return sourceList;

        const lowerTerm = searchTerm.toLowerCase();
        return sourceList.filter(u =>
            (u.name && u.name.toLowerCase().includes(lowerTerm)) ||
            (u.nick_name && u.nick_name.toLowerCase().includes(lowerTerm))
        );
    }, [activeTab, followingList, followersList, searchTerm, currentMembers]);

    // 4. Submit thêm thành viên
    const handleAddMembers = async () => {
        if (selectedUsers.length === 0) return;

        setAdding(true);
        try {
            await addMembersToGroup(conversationId, selectedUsers);
            Toast.show({ type: 'success', text1: `Đã thêm ${selectedUsers.length} thành viên` });
            onClose();
        } catch (error) {
            console.error("Error adding members:", error);
            Toast.show({ type: 'error', text1: 'Lỗi khi thêm thành viên' });
        } finally {
            setAdding(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet" // iOS UI chuẩn
            onRequestClose={onClose}
        >
            <SafeAreaView className="flex-1 bg-white">
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    className="flex-1"
                >
                    {/* HEADER */}
                    <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
                        <Text className="text-lg font-bold text-gray-800">Thêm thành viên</Text>
                        <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
                            <X size={20} color="#374151" />
                        </TouchableOpacity>
                    </View>

                    {/* TABS SELECTOR */}
                    <View className="flex-row border-b border-gray-100">
                        <TouchableOpacity
                            onPress={() => setActiveTab('following')}
                            className={`flex-1 flex-row items-center justify-center py-3 gap-2 border-b-2 ${activeTab === 'following' ? 'border-blue-600' : 'border-transparent'}`}
                        >
                            <UserCheck size={16} color={activeTab === 'following' ? '#2563eb' : '#6b7280'} />
                            <Text className={`font-semibold ${activeTab === 'following' ? 'text-blue-600' : 'text-gray-500'}`}>
                                Đang theo dõi
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setActiveTab('followers')}
                            className={`flex-1 flex-row items-center justify-center py-3 gap-2 border-b-2 ${activeTab === 'followers' ? 'border-blue-600' : 'border-transparent'}`}
                        >
                            <Users size={16} color={activeTab === 'followers' ? '#2563eb' : '#6b7280'} />
                            <Text className={`font-semibold ${activeTab === 'followers' ? 'text-blue-600' : 'text-gray-500'}`}>
                                Người theo dõi
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* SEARCH BAR */}
                    <View className="p-3 bg-white">
                        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2 border border-gray-200">
                            <Search size={18} color="#9ca3af" />
                            <TextInput
                                placeholder="Tìm kiếm tên, nickname..."
                                className="flex-1 ml-2 text-base text-gray-800 py-1"
                                value={searchTerm}
                                onChangeText={setSearchTerm}
                                autoCapitalize="none"
                            />
                            {searchTerm.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchTerm("")}>
                                    <X size={16} color="#9ca3af" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* USER LIST */}
                    {loadingData ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator size="large" color="#2563eb" />
                        </View>
                    ) : (
                        <FlatList
                            data={displayList}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                            ListEmptyComponent={() => (
                                <View className="items-center justify-center mt-12 opacity-50">
                                    <Users size={48} color="#d1d5db" />
                                    <Text className="text-gray-500 mt-2 text-center">
                                        Không tìm thấy người dùng phù hợp.{"\n"}
                                        (Có thể họ đã ở trong nhóm)
                                    </Text>
                                </View>
                            )}
                            renderItem={({ item }) => {
                                const isSelected = selectedUsers.includes(item.id);
                                return (
                                    <TouchableOpacity
                                        onPress={() => toggleSelectUser(item.id)}
                                        className={`flex-row items-center justify-between p-3 mb-2 rounded-xl border ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-transparent'}`}
                                    >
                                        <View className="flex-row items-center gap-3 flex-1">
                                            <Image
                                                source={{ uri: getUserImageSrc(item.avatar) }}
                                                className="w-10 h-10 rounded-full bg-gray-200"
                                            />
                                            <View className="flex-1">
                                                <Text numberOfLines={1} className="font-semibold text-gray-900 text-base">{item.name}</Text>
                                                <Text numberOfLines={1} className="text-xs text-gray-500">@{item.nick_name}</Text>
                                            </View>
                                        </View>
                                        {isSelected ? (
                                            <CheckCircle2 size={24} color="#2563eb" />
                                        ) : (
                                            <Circle size={24} color="#d1d5db" />
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    )}

                    {/* FOOTER ACTION */}
                    <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 pb-8">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-sm text-gray-500">Đã chọn:</Text>
                            <Text className="text-sm font-bold text-blue-600">{selectedUsers.length} người</Text>
                        </View>
                        <TouchableOpacity
                            disabled={selectedUsers.length === 0 || adding}
                            onPress={handleAddMembers}
                            className={`w-full py-3.5 rounded-xl flex-row justify-center items-center ${selectedUsers.length === 0 ? 'bg-gray-200' : 'bg-blue-600'}`}
                        >
                            {adding && <ActivityIndicator color="white" className="mr-2" />}
                            <Text className={`font-bold text-base ${selectedUsers.length === 0 ? 'text-gray-500' : 'text-white'}`}>
                                Thêm vào nhóm
                            </Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
}