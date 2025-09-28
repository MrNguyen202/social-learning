import { Text, View } from "react-native";
import { useEffect, useState } from "react";
import useAuth from "../../../../hooks/useAuth";
import { fetchUnreadCount } from "../../../api/chat/conversation/route";
import Avatar from "../../../components/Avatar";
import { getUserImageSrc } from "../../../api/image/route";
import { convertToTime } from "../../../../helpers/formatTime";
import Badge from "../../../components/Badge";
import { TouchableOpacity } from "react-native";
import { hp } from "../../../../helpers/common";
import { theme } from "../../../../constants/theme";

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

type CardUserProps = {
    conversation: Conversation;
    onClick: () => void;
}

export default function UserCard({ conversation, onClick }: CardUserProps) {
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
                className="flex flex-row items-center w-full gap-3 my-2"
            >
                <Avatar
                    size={hp(5.6)}
                    uri={getUserImageSrc(conversation.members.filter(member => member.id !== user?.id)[0]?.avatarUrl)}
                    rounded={theme.radius.xxl}
                />
                <View className="flex-1 gap-2">
                    <View className="flex-row justify-between items-center">
                        <Text className={`text-xl flex-1 ${unreadCount > 0 ? 'font-bold text-black' : ''}`} numberOfLines={1}>
                            {conversation.members.filter(member => member.id !== user?.id)[0]?.name}
                        </Text>
                        {unreadCount > 0 && (
                            <Badge size="md" color="red" variant="count" text={unreadCount} />
                        )}
                    </View>
                    <View className="flex-row justify-between">
                        <Text className={`flex-1 ${unreadCount > 0 ? 'font-bold text-black' : ''}`} numberOfLines={1}>
                            {conversation.lastMessage?.senderId === user?.id ? "Bạn: " : ""}
                            {typeof conversation.lastMessage?.content === "string"
                                ? conversation.lastMessage?.content
                                : conversation.lastMessage?.content?.text || "[Nội dung không hỗ trợ]"}
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
