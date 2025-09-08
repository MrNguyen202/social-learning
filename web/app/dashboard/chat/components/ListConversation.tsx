"use client";

import { use, useEffect, useState } from "react";
import { ChevronDown, SquarePen } from "lucide-react";
import CardUser from "./CardUser";
import CardGroup from "./CardGroup";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { fetchConversations } from "@/app/api/chat/conversation/route";
import { ConversationSkeleton } from "./ConversationSkeleton";
import { getSocket } from "@/socket/socketClient";
import { useConversation } from "@/components/contexts/ConversationContext";

export default function ListConversation() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [conversations, setConversations] = useState<any[]>([]);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const { setSelectedConversation } = useConversation();

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
        // Navigate to the chat detail page for the selected conversation
        setSelectedConversation(conversation);
        localStorage.setItem("selectedConversation", JSON.stringify(conversation));
        router.push(`/dashboard/chat/${conversationId}`);
    };

    return (
        <div className="h-screen flex flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 h-[73px]">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">{user?.nick_name}</h2>
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                </div>
                <SquarePen className="w-6 h-6 text-gray-500" />
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200">
                <input
                    type="text"
                    placeholder="Search..."
                    onFocus={() => setIsSearchMode(true)}
                    onBlur={() => setIsSearchMode(false)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
            </div>

            {!isSearchMode && (
                <>
                    <h3 className="px-4 py-2 font-semibold">Tin nhắn</h3>
                    <div className="flex-1 overflow-y-auto pb-18">
                        {conversations.map((conversation) =>
                            conversation.type === "private" ? (
                                <CardUser
                                    key={conversation.id}
                                    conversation={conversation}
                                    onClick={() => handleCardClick(conversation.id, conversation)}
                                />
                            ) : (
                                <CardGroup
                                    key={conversation.id}
                                    conversation={conversation}
                                    onClick={() => handleCardClick(conversation.id, conversation)}
                                />
                            )
                        )}
                    </div>
                </>
            )}

            {isSearchMode && (
                <div className="flex-1 overflow-y-auto">
                    {/* User search results */}
                    <p className="px-4 py-2 text-gray-500">Hiển thị kết quả tìm kiếm...</p>
                </div>
            )}
        </div>
    );
}
