import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import Toast from 'react-native-toast-message';
// Điều chỉnh đường dẫn import API
import { renameGroup } from '../../../../src/api/chat/conversation/route';

interface ModalRenameGroupProps {
    visible: boolean;
    onClose: () => void;
    currentName: string;
    conversationId: string;
    onSuccess: (newName: string) => void;
}

export default function ModalRenameGroup({
    visible,
    onClose,
    currentName,
    conversationId,
    onSuccess
}: ModalRenameGroupProps) {
    const [name, setName] = useState(currentName);
    const [loading, setLoading] = useState(false);

    // Reset tên khi mở lại modal
    useEffect(() => {
        if (visible) {
            setName(currentName);
        }
    }, [visible, currentName]);

    const handleSave = async () => {
        if (!name.trim()) {
            Toast.show({ type: 'error', text1: 'Tên nhóm không được để trống' });
            return;
        }

        // Nếu tên không đổi thì đóng luôn
        if (name.trim() === currentName) {
            onClose();
            return;
        }

        setLoading(true);
        try {
            // Gọi API cập nhật
            await renameGroup(conversationId, name.trim());

            // Callback cập nhật UI cha
            onSuccess(name.trim());

            Toast.show({ type: 'success', text1: 'Đổi tên nhóm thành công' });
            onClose();
        } catch (error) {
            console.error(error);
            Toast.show({ type: 'error', text1: 'Lỗi khi đổi tên nhóm' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true} // Nền trong suốt
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View className="flex-1 bg-black/50 justify-center items-center px-6">
                    {/* Bấm vào nội dung Modal không bị đóng */}
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : undefined}
                            className="bg-white w-full rounded-2xl p-5 shadow-lg"
                        >
                            <Text className="text-lg font-bold text-center text-gray-900 mb-2">
                                Đổi tên nhóm
                            </Text>
                            <Text className="text-sm text-gray-500 text-center mb-4">
                                Tên nhóm sẽ được hiển thị với tất cả thành viên.
                            </Text>

                            <TextInput
                                value={name}
                                onChangeText={setName}
                                placeholder="Nhập tên nhóm mới..."
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 mb-6"
                                autoCapitalize="words"
                                autoCorrect={false}
                            />

                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={onClose}
                                    className="flex-1 py-3 bg-gray-100 rounded-xl items-center"
                                >
                                    <Text className="font-semibold text-gray-600">Hủy</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleSave}
                                    disabled={loading}
                                    className="flex-1 py-3 bg-blue-600 rounded-xl items-center flex-row justify-center"
                                >
                                    {loading && <ActivityIndicator size="small" color="white" className="mr-2" />}
                                    <Text className="font-semibold text-white">Lưu</Text>
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}