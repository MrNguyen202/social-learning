import { useEffect, useState } from "react";
import useAuth from "../../../../hooks/useAuth";
import { getSocket } from "../../../../socket/socketClient";
import { fetchMessages, markMessagesAsRead, sendMessage } from "../../../api/chat/message/route";
import MessageSender from "./components/MessageSender";
import MessageReceiver from "./components/MessageReceiver";
import { hp } from "../../../../helpers/common";
import { ArrowLeft, Info, Paperclip, Phone, Smile, Video } from "lucide-react-native";
import { Text, TextInput, View, TouchableOpacity, ScrollView, FlatList } from "react-native";
import { useRoute, useNavigation } from '@react-navigation/native';

const ChatDetail = () => {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { conversation } = route.params;
    const [text, setText] = useState<string>("");
    const { user } = useAuth();
    const [files, setFiles] = useState<File[]>([]);
    const [messages, setMessages] = useState<any[]>([]);

    // Lắng nghe sự kiện tin nhắn mới từ socket
    useEffect(() => {
        const socket = getSocket();
        const conversationId = conversation?.id;
        if (conversationId) {
            console.log("User joined conversation:", conversationId);
            socket.emit("joinRoom", conversationId);
        }

        socket.on("newMessage", (newMessage: any) => {
            console.log("New message received:", newMessage);
            setMessages(prev => [newMessage, ...prev]);
            if (newMessage.senderId !== user?.id && conversation && user) {
                markMessagesAsRead(conversation.id, user.id);
            }
        });

        socket.on("markMessagesAsRead", ({ userId, seenAt, messageIds }: { userId: string, seenAt: string, messageIds: string[] }) => {
            setMessages(prevMessages => prevMessages.map(msg => {
                if (messageIds.includes(msg._id)) {
                    if (!msg.seens.some((seen: { userId: string }) => seen.userId === userId)) {
                        msg.seens.push({ userId, seenAt });
                    }
                }
                return msg;
            }));
        });

        return () => {
            socket.off("newMessage");
            socket.off("markMessagesAsRead");
            if (conversationId) {
                socket.emit("leaveRoom", conversationId);
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
        if (text.trim() === "" && files.length === 0) return;
        if (!user) return;
        const formData = new FormData();
        formData.append("conversationId", conversation?.id || "");
        formData.append("senderId", user.id);
        if (text) formData.append("text", text);
        if (files.length > 0) {
            files.forEach(f => formData.append("files", f));
        }

        const res = await sendMessage({
            conversationId: conversation?.id || "",
            senderId: user.id,
            text,
            files
        });
        setText("");
    };

    return (
        <View className="flex-1 bg-white">
            {/* Chat header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <View className="flex flex-row items-center justify-between w-full">
                    <View className="flex-row items-center gap-3">
                        <ArrowLeft size={28} className="text-gray-600" onPress={() => navigation.goBack()} />
                        <Text className="text-lg font-semibold text-gray-800">
                            {conversation?.type === "private"
                                ? conversation?.members.filter((member: { id: string }) => member.id !== user?.id)[0]?.name
                                : conversation?.name || `Bạn, ${conversation?.members.filter((m: { id: string }) => m.id !== user?.id).map((m: { name: string }) => m.name).join(", ")}`}
                        </Text>
                    </View>
                    <View className="flex flex-row items-center gap-6">
                        {conversation?.type === "private" && <Phone size={24} className="text-gray-500" />}
                        <Video size={28} className="text-gray-500" />
                        <Info size={28} className="text-gray-500" />
                    </View>
                </View>
            </View>

            {/* Chat messages */}
            <FlatList
                data={messages}
                keyExtractor={(item) => item?._id}
                renderItem={({ item }) => (
                    <View key={item?._id} className="mb-2">
                        {item?.senderId === user?.id ? (
                            <MessageSender message={item} />
                        ) : (
                            <MessageReceiver message={item} />
                        )}
                    </View>
                )}
                inverted
                contentContainerStyle={{ padding: 12 }}
            />

            {/* Input area */}
            <View style={{ height: hp(10) }} className="flex-row items-start gap-3 p-3 border-t border-gray-200 bg-white">
                <View className="flex flex-row items-center gap-3">
                    <TouchableOpacity onPress={() => console.log("Smile clicked")}>
                        <Smile className="text-gray-500 w-6 h-6" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => console.log("Paperclip clicked")}>
                        <Paperclip className="text-gray-500 w-6 h-6" />
                    </TouchableOpacity>
                    <TextInput
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 p-3 bg-gray-100 rounded-lg text-gray-800"
                        value={text}
                        onChangeText={setText}
                        onKeyPress={(e) => {
                            if (e.nativeEvent.key === "Enter") {
                                e.preventDefault?.();
                                handleSendMessage();
                            }
                        }}
                    />
                    <TouchableOpacity
                        onPress={handleSendMessage}
                        className="px-4 py-2 bg-blue-500 rounded-lg"
                    >
                        <Text className="text-white font-medium">Gửi</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default ChatDetail;