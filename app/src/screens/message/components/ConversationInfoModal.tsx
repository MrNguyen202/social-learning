import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    Modal,
    Alert,
    Platform,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
    Camera,
    Crown,
    Edit2,
    LogOut,
    Shield,
    Trash2,
    UserPlus,
    UserX,
    X,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

// Import các Modal con
import ModalAddMember from './ModalAddMember';
import ModalRenameGroup from './ModalRenameGroup';

// Import API và Helper (điều chỉnh đường dẫn cho phù hợp project của bạn)
import { getUserImageSrc } from '../../../api/image/route';
import {
    deleteConversationHistory,
    dissolveGroupConversation,
    grantAdminInGroup,
    leaveGroupConversation,
    removeMemberFromGroup,
    updateGroupAvatar
} from '../../../api/chat/conversation/route';
import { launchImageLibrary } from 'react-native-image-picker';
import AvatarGroup from '../../../components/AvatarGroup';

interface ConversationInfoModalProps {
    visible: boolean;
    onClose: () => void;
    conversation: any;
    currentUser: any;
    onUpdate?: () => void; // Hàm callback để reload dữ liệu ở màn hình cha (nếu cần)
}

const ConversationInfoModal = ({
    visible,
    onClose,
    conversation: initialConversation,
    currentUser,
    onUpdate
}: ConversationInfoModalProps) => {
    const navigation = useNavigation<any>();

    // --- STATE ---
    // Tạo state local để UI phản hồi ngay lập tức (VD: đổi tên xong cập nhật ngay)
    const [conversation, setConversation] = useState(initialConversation);
    const [showAddMember, setShowAddMember] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isTransferMode, setIsTransferMode] = useState(false);

    // State loading riêng cho việc upload ảnh
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // Cập nhật state khi props thay đổi (khi mở modal lại với data mới)
    useEffect(() => {
        setConversation(initialConversation);
    }, [initialConversation]);

    // Check null
    if (!conversation) return null;

    // --- LOGIC QUYỀN HẠN ---
    const currentMember = conversation?.members?.find((m: any) => m.id === currentUser?.id);
    const isAdmin = currentMember?.role === 'admin';
    const isGroup = conversation?.type === 'group';

    // --- CÁC HÀM API ACTIONS ---

    // 1. Rời nhóm
    const handleLeaveGroup = () => {
        Alert.alert("Rời nhóm", "Bạn có chắc chắn muốn rời khỏi nhóm này?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Rời nhóm",
                style: "destructive",
                onPress: async () => {
                    try {
                        setLoading(true);
                        await leaveGroupConversation(conversation.id);
                        onClose();
                        navigation.navigate('Message'); // Quay về danh sách chat
                    } catch (error: any) {
                        Toast.show({ type: 'error', text1: 'Lỗi khi rời nhóm' });
                    } finally {
                        setLoading(false);
                    }
                }
            }
        ]);
    };

    // 2. Xóa lịch sử
    const handleDeleteHistory = () => {
        Alert.alert("Xóa lịch sử", "Hành động này không thể hoàn tác.", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteConversationHistory(conversation.id);
                        Toast.show({ type: 'success', text1: 'Đã xóa lịch sử trò chuyện' });
                        onClose();
                        navigation.navigate('Message');
                    } catch (e) {
                        Toast.show({ type: 'error', text1: 'Lỗi xóa lịch sử' });
                    }
                }
            }
        ]);
    };

    // 3. Giải tán nhóm (Chỉ Admin)
    const handleDissolveGroup = () => {
        Alert.alert("Giải tán nhóm", "Hành động này sẽ xóa nhóm vĩnh viễn với tất cả thành viên.", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Giải tán",
                style: "destructive",
                onPress: async () => {
                    try {
                        await dissolveGroupConversation(conversation.id);
                        Toast.show({ type: 'success', text1: 'Nhóm đã được giải tán' });
                        onClose();
                        navigation.navigate('Message');
                    } catch (e) {
                        Toast.show({ type: 'error', text1: 'Lỗi giải tán nhóm' });
                    }
                }
            }
        ]);
    };

    // 4. Mời thành viên ra khỏi nhóm (Chỉ Admin)
    const handleRemoveMember = (memberId: string, memberName: string) => {
        Alert.alert("Mời ra khỏi nhóm", `Bạn muốn mời ${memberName} ra khỏi nhóm?`, [
            { text: "Hủy", style: "cancel" },
            {
                text: "Đồng ý",
                style: "destructive",
                onPress: async () => {
                    try {
                        await removeMemberFromGroup(conversation.id, memberId);
                        // Cập nhật UI ngay lập tức
                        setConversation((prev: any) => ({
                            ...prev,
                            members: prev.members.filter((m: any) => m.id !== memberId)
                        }));
                        Toast.show({ type: 'success', text1: 'Đã mời thành viên ra khỏi nhóm' });
                        if (onUpdate) onUpdate();
                    } catch (e) {
                        Toast.show({ type: 'error', text1: 'Lỗi xóa thành viên' });
                    }
                }
            }
        ]);
    };

    // 5. Thăng cấp Admin (Chỉ Admin)
    const handlePromote = (memberId: string, memberName: string) => {
        Alert.alert("Thăng cấp", `Chuyển quyền Admin cho ${memberName}?`, [
            { text: "Hủy", style: "cancel" },
            {
                text: "Đồng ý",
                onPress: async () => {
                    try {
                        await grantAdminInGroup(conversation.id, memberId);
                        // Cập nhật UI local
                        setConversation((prev: any) => ({
                            ...prev,
                            members: prev.members.map((m: any) =>
                                m.id === memberId ? { ...m, role: 'admin' } : m
                            )
                        }));
                        Toast.show({ type: 'success', text1: 'Đã thăng cấp thành viên' });
                    } catch (e) {
                        Toast.show({ type: 'error', text1: 'Lỗi thăng cấp' });
                    }
                }
            }
        ]);
    };

    // 6. Logic Chuyển quyền & Rời (Không cần modal vì nút "Chọn" đã là hành động rõ ràng, hoặc thêm nếu muốn)
    const handlePromoteAndLeave = async (newAdminId: string) => {
        // Cái này có thể confirm nhẹ hoặc làm luôn vì user đang ở mode "Chọn Admin"
        try {
            await grantAdminInGroup(conversation.id, newAdminId);
            await leaveGroupConversation(conversation.id);
            navigation.navigate('Message');
        } catch (error) {
            setIsTransferMode(false);
        }
    };

    // 7. Logic Upload Avatar
    const handleAvatarChange = async () => {
        try {
            // 1. Mở thư viện ảnh (Thay thế cho <input type="file" />)
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.8,
                selectionLimit: 1,
            });

            // Nếu user hủy
            if (result.didCancel || !result.assets?.[0]) return;

            const asset = result.assets[0];

            // 2. Validate Size (5MB) giống logic Web
            // fileSize trong RN là bytes, giống web
            if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
                Toast.show({ type: 'error', text1: 'Ảnh quá lớn (tối đa 5MB)' });
                return;
            }

            // 3. Bắt đầu xử lý (Show loading)
            setUploadingAvatar(true); // Dùng state để quay icon loading tại chỗ

            // 4. Convert Asset to File-like object for API
            const file = {
                uri: asset.uri,
                type: asset.type,
                name: asset.fileName,
            } as any;

            // 5. Gọi API (Dùng lại hàm đã sửa ở Bước 1)
            const response = await updateGroupAvatar(conversation.id, file);
            const responseData = response.data;

            // 5. Thành công -> Thông báo & Cập nhật UI
            Toast.show({ type: 'success', text1: 'Cập nhật ảnh thành công' });

            // Nếu backend trả về URL ảnh mới trong responseData.avatar
            const newAvatar = responseData?.avatar;
            if (newAvatar) {
                setConversation((prev: any) => ({ ...prev, avatar: newAvatar }));
                // Gọi onUpdate để reload
            } else {
                // Fallback nếu cần reload lại toàn bộ
                if (onUpdate) onUpdate();
            }

        } catch (error) {
            console.error(error);
            Toast.show({ type: 'error', text1: 'Lỗi khi cập nhật ảnh nhóm' });
        } finally {
            setUploadingAvatar(false); // Tắt loading
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            // iOS: Hiệu ứng thẻ trượt lên. Android: Fullscreen
            presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'overFullScreen'}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-gray-50">
                {/* HEADER */}
                <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
                    <Text className="text-lg font-bold text-gray-800">Thông tin</Text>
                    <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
                        <X size={20} color="#374151" />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1">
                    {/* --- INFO SECTION (Avatar & Name) --- */}
                    <View className="bg-white pb-6 pt-6 items-center mb-3">
                        <View className="relative">
                            {
                                conversation.avatar ? (
                                    <Image
                                        source={{ uri: conversation.avatar }}
                                        className="w-24 h-24 rounded-full border-4 border-gray-100 bg-gray-200"
                                    />
                                ) : (
                                    <AvatarGroup size={12} members={conversation?.members} />
                                )
                            }
                            {isGroup && (
                                <TouchableOpacity
                                    onPress={handleAvatarChange} // <--- Gắn hàm vừa viết vào đây
                                    disabled={uploadingAvatar}
                                    className="absolute bottom-0 right-0 bg-gray-200 rounded-full border-2 border-white items-center justify-center"
                                    style={{ width: 32, height: 32 }}
                                >
                                    {uploadingAvatar ? (
                                        <ActivityIndicator size="small" color="#4b5563" />
                                    ) : (
                                        <Camera size={16} color="#4b5563" />
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>

                        <View className="flex-row items-center mt-3 gap-2 px-8 justify-center">
                            <Text className="text-xl font-bold text-gray-900 text-center">
                                {conversation?.name}
                            </Text>
                            {isGroup && (
                                <TouchableOpacity
                                    onPress={() => setShowRenameModal(true)}
                                    className="p-1.5 bg-gray-100 rounded-full"
                                >
                                    <Edit2 size={14} color="#6b7280" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* --- MEMBERS SECTION (Chỉ hiện nếu là Group) --- */}
                    {isGroup && (
                        <View className="bg-white px-4 py-4 mb-3">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-gray-500 font-semibold text-sm">
                                    Thành viên ({conversation.members?.length})
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setShowAddMember(true)}
                                    className="flex-row items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full"
                                >
                                    <UserPlus size={14} color="#2563eb" />
                                    <Text className="text-blue-600 font-medium text-xs">Thêm</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Danh sách thành viên */}
                            {conversation.members?.map((member: any) => (
                                <View key={member.id} className="flex-row items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                    <View className="flex-row items-center gap-3 flex-1">
                                        <Image
                                            source={{ uri: getUserImageSrc(member.avatarUrl) }}
                                            className="w-10 h-10 rounded-full bg-gray-200"
                                        />
                                        <View className="flex-1 pr-2">
                                            <Text numberOfLines={1} className="font-medium text-gray-800 text-base">
                                                {member.name} {member.id === currentUser?.id && "(Bạn)"}
                                            </Text>
                                            {member.role === 'admin' && (
                                                <View className="flex-row items-center mt-0.5">
                                                    <Crown size={12} color="#f59e0b" />
                                                    <Text className="text-xs text-amber-500 ml-1">Trưởng nhóm</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {/* Actions cho Admin (Chỉ hiện nếu mình là Admin và ko thao tác lên chính mình) */}
                                    {isAdmin && member.id !== currentUser?.id && (
                                        <View className="flex-row items-center gap-2">
                                            <TouchableOpacity
                                                onPress={() => handlePromote(member.id, member.name)}
                                                className="p-2 bg-blue-50 rounded-full"
                                            >
                                                <Shield size={18} color="#3b82f6" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => handleRemoveMember(member.id, member.name)}
                                                className="p-2 bg-red-50 rounded-full"
                                            >
                                                <UserX size={18} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    )}

                    {/* --- FOOTER ACTIONS --- */}
                    <View className="bg-white px-4 py-2 mb-10">
                        <TouchableOpacity
                            onPress={handleDeleteHistory}
                            className="flex-row items-center py-4 border-b border-gray-100"
                        >
                            <Trash2 size={20} color="#4b5563" />
                            <Text className="ml-3 text-gray-700 font-medium">Xóa lịch sử trò chuyện</Text>
                        </TouchableOpacity>

                        {isGroup && (
                            <TouchableOpacity
                                onPress={handleLeaveGroup}
                                className="flex-row items-center py-4 border-b border-gray-100"
                            >
                                <LogOut size={20} color="#ef4444" />
                                <Text className="ml-3 text-red-500 font-medium">Rời nhóm</Text>
                            </TouchableOpacity>
                        )}

                        {isGroup && isAdmin && (
                            <TouchableOpacity
                                onPress={handleDissolveGroup}
                                className="flex-row items-center py-4"
                            >
                                <X size={20} color="#ef4444" />
                                <Text className="ml-3 text-red-500 font-bold">Giải tán nhóm</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>

                {/* --- NHÚNG CÁC MODAL CON --- */}

                {/* 1. Modal Thêm Thành Viên */}
                <ModalAddMember
                    visible={showAddMember}
                    onClose={() => setShowAddMember(false)}
                    conversationId={conversation.id}
                    currentMembers={conversation.members}
                />

                {/* 2. Modal Đổi Tên Nhóm */}
                <ModalRenameGroup
                    visible={showRenameModal}
                    onClose={() => setShowRenameModal(false)}
                    currentName={conversation.name}
                    conversationId={conversation.id}
                    // Khi đổi tên thành công -> Cập nhật UI local
                    onSuccess={(newName) => setConversation((prev: any) => ({ ...prev, name: newName }))}
                />

            </View>
        </Modal>
    );
};

export default ConversationInfoModal;