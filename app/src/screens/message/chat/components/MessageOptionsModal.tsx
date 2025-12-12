import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Pressable, Clipboard } from 'react-native';
import { Copy, Reply, Trash2, RotateCcw, Heart, X } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

interface MessageOptionsModalProps {
    isVisible: boolean;
    onClose: () => void;
    message: any;
    user: any;
    onReply: (msg: any) => void;
    onDelete: (msgId: string) => void;
    onRevoke: (msgId: string) => void;
    onLike: (msgId: string) => void;
}

export default function MessageOptionsModal({
    isVisible,
    onClose,
    message,
    user,
    onReply,
    onDelete,
    onRevoke,
    onLike,
}: MessageOptionsModalProps) {
    if (!message) return null;

    const isMe = message.senderId === user?.id;
    const isRevoked = message.revoked;
    const isLiked = message.likes?.some((l: any) => l.userId === user?.id);

    // Logic kiểm tra thời gian thu hồi (1 giờ)
    const canRevoke = React.useMemo(() => {
        if (!message.createdAt) return false;
        const now = new Date().getTime();
        const msgTime = new Date(message.createdAt).getTime();
        const ONE_HOUR = 60 * 60 * 1000;
        return (now - msgTime) <= ONE_HOUR;
    }, [message]);

    const handleCopy = () => {
        if (message.content?.text) {
            Clipboard.setString(message.content.text);
            Toast.show({
                type: 'success',
                text1: 'Đã sao chép vào clipboard',
            });
        }
        onClose();
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-4 border-b border-gray-100 pb-2">
                        <Text className="font-bold text-gray-700 text-base">Tùy chọn tin nhắn</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    {!isRevoked && (
                        <>
                            {/* Nút Thích */}
                            <TouchableOpacity
                                onPress={() => { onLike(message._id); onClose(); }}
                                className="flex-row items-center gap-3 py-3 active:bg-gray-50 rounded-lg px-2"
                            >
                                <Heart size={20} color={isLiked ? "#ef4444" : "#374151"} fill={isLiked ? "#ef4444" : "none"} />
                                <Text className={`${isLiked ? "text-red-500 font-medium" : "text-gray-700"}`}>
                                    {isLiked ? "Bỏ thích" : "Yêu thích"}
                                </Text>
                            </TouchableOpacity>

                            {/* Nút Trả lời */}
                            <TouchableOpacity
                                onPress={() => { onReply(message); onClose(); }}
                                className="flex-row items-center gap-3 py-3 active:bg-gray-50 rounded-lg px-2"
                            >
                                <Reply size={20} color="#374151" />
                                <Text className="text-gray-700">Trả lời</Text>
                            </TouchableOpacity>

                            {/* Nút Sao chép (Chỉ hiện nếu có text) */}
                            {message.content?.text && (
                                <TouchableOpacity
                                    onPress={handleCopy}
                                    className="flex-row items-center gap-3 py-3 active:bg-gray-50 rounded-lg px-2"
                                >
                                    <Copy size={20} color="#374151" />
                                    <Text className="text-gray-700">Sao chép</Text>
                                </TouchableOpacity>
                            )}

                            <View className="h-[1px] bg-gray-100 my-1" />
                        </>
                    )}

                    {/* Nút Thu hồi (Chỉ hiện khi là tin nhắn của mình + chưa quá giờ + chưa thu hồi) */}
                    {isMe && canRevoke && !isRevoked && (
                        <TouchableOpacity
                            onPress={() => { onRevoke(message._id); onClose(); }}
                            className="flex-row items-center gap-3 py-3 active:bg-gray-50 rounded-lg px-2"
                        >
                            <RotateCcw size={20} color="#dc2626" />
                            <Text className="text-red-600">Thu hồi</Text>
                        </TouchableOpacity>
                    )}

                    {/* Nút Xóa (Luôn hiện) */}
                    <TouchableOpacity
                        onPress={() => { onDelete(message._id); onClose(); }}
                        className="flex-row items-center gap-3 py-3 active:bg-gray-50 rounded-lg px-2"
                    >
                        <Trash2 size={20} color="#dc2626" />
                        <Text className="text-red-600">Xóa phía tôi</Text>
                    </TouchableOpacity>

                </View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    }
});