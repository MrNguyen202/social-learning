import { useEffect, useState } from "react";
import { useNavigation } from '@react-navigation/native';
import useAuth from "../../../../hooks/useAuth";
import { getSocket } from "../../../../socket/socketClient";
import { fetchConversations } from "../../../api/chat/conversation/route";
import UserCard from "./UserCard";
import GroupCard from "./GroupCard";
import { FlatList, Text } from "react-native";

export default function ListConversation() {
    const navigation = useNavigation<any>();
    const { user, loading } = useAuth();
    const [conversations, setConversations] = useState<any[]>([]);
    const [loadingConversations, setLoadingConversations] = useState(true);

    // Lấy danh sách cuộc trò chuyện của người dùng từ API hoặc context
    useEffect(() => {
        const socket = getSocket();
        const fetchData = async () => {
            if (!user?.id || loading) return;
            setLoadingConversations(true);
            try {
                const res = await fetchConversations(user.id);
                setConversations(res);
            } catch (error) {
                console.error("Error fetching conversations:", error);
            } finally {
                setLoadingConversations(false);
            }
        };

        // Lắng nghe sự kiện 'newMessage' từ server để cập nhật danh sách cuộc trò chuyện
        socket.on("notificationNewMessage", () => {
            fetchData();
        });

        socket.on("notificationMessagesRead", () => {
            fetchData();
        });

        fetchData();

        // Đóng socket khi unmount
        return () => {
            socket.off("notificationNewMessage");
            socket.off("notificationMessagesRead");
        };
    }, [user?.id, loading]);

    //Handle card click
    const handleCardClick = async (conversationId: string, conversation: any) => {
        navigation.navigate('ChatDetail', { conversationId, conversation });
    };

    return (
        <>
            <Text className="font-semibold text-lg">Tin nhắn</Text>
            <FlatList
                data={conversations}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    item.type === "private" ? (
                        <UserCard
                            key={item.id}
                            conversation={item}
                            onClick={() => handleCardClick(item.id, item)}
                        />
                    ) : (
                        <GroupCard
                            key={item.id}
                            conversation={item}
                            onClick={() => handleCardClick(item.id, item)}
                        />
                    )
                )}
            />
        </>
    );
}
