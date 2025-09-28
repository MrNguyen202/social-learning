import { useEffect, useState } from "react";
import useAuth from "../../../../hooks/useAuth";
import { fetchUnreadCount } from "../../../api/chat/conversation/route";
import AvatarGroup from "../../../components/AvatarGroup";
import Badge from "../../../components/Badge";
import { convertToTime } from "../../../../helpers/formatTime";
import { Text, TouchableOpacity, View } from "react-native";
import { hp } from "../../../../helpers/common";

interface User {
    id: string;
    name: string;
    avatarUrl: string;
}

interface Conversation {
    id: string;
    name: string;
    avatarUrl: string;
    members: User[];
    lastMessage: LastMessage | null;
}

type MessageContent = {
    system?: boolean;
    type: "text" | "image" | "file";
    text?: string;
    images?: string[];
    file?: {
        name: string;
        url: string;
    } | null;
};

type LastMessage = {
    id: string;
    senderId: string;
    content: MessageContent;
    createdAt: string;
    updatedAt: string;
};

type CardGroupProps = {
    conversation: Conversation;
    onClick: () => void;
}

export default function GroupCard({ conversation, onClick }: CardGroupProps) {
    const { user } = useAuth();

    const [unreadCount, setUnreadCount] = useState<number>(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetchUnreadCount(conversation.id, user?.id);
                setUnreadCount(response);
            } catch (error) {
                console.error("Error fetching unread count:", error);
            }
        };

        fetchData();
    }, [conversation.id, user?.id, conversation.lastMessage]);

    return (
        <>
            <TouchableOpacity
                onPress={onClick}
                className="flex flex-row items-center w-full my-2 gap-3"
            >
                {/* Avatar */}
                <AvatarGroup size={hp(5.6)} members={conversation.members} />

                {/* Nội dung */}
                <View className="flex-1 gap-2">
                    {/* Tên + Badge */}
                    <View className="flex-row justify-between items-center">
                        <Text className={`text-xl text-gray-900 flex-1 ${unreadCount > 0 ? 'font-bold text-black' : ''}`} numberOfLines={1}>
                            {conversation.name
                                ? conversation.name
                                : `Bạn, ${conversation.members
                                    .filter((m) => m.id !== user?.id)
                                    .map((m) => m.name)
                                    .join(", ")}`}
                        </Text>
                        <View className="relative">
                            {unreadCount > 0 && (
                                <Badge size="md" variant="count" text={unreadCount} />
                            )}
                        </View>
                    </View>

                    {/* Tin nhắn cuối + thời gian */}
                    <View className="flex-row justify-between items-center">
                        <Text className={`text-gray-600 flex-1 ${unreadCount > 0 ? 'font-bold text-black' : ''}`} numberOfLines={1}>
                            {conversation.lastMessage?.senderId === user?.id
                                ? "Bạn: "
                                : conversation.members.find(
                                    (m) => m.id === conversation.lastMessage?.senderId
                                )?.name + ": "}
                            {typeof conversation.lastMessage?.content === "string"
                                ? conversation.lastMessage?.content
                                : conversation.lastMessage?.content?.text ||
                                "[Nội dung không hỗ trợ]"}
                        </Text>
                        <Text className={`text-gray-400 text-xs ml-2 ${unreadCount > 0 ? 'font-bold text-black' : ''}`}>
                            {convertToTime(conversation.lastMessage?.createdAt)}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </>
    );
}
