"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, SquarePen } from "lucide-react";
import CardUser from "./CardUser";
import CardGroup from "./CardGroup";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { fetchConversations } from "@/app/apiClient/chat/conversation/conversation";
import { getSocket } from "@/socket/socketClient";
import { useConversation } from "@/components/contexts/ConversationContext";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ModalCreateGroup from "./ModalCreateGroup";
import ModalSearchNewChat from "./ModalSearchNewChat";

export default function ListConversation() {
    const { t } = useLanguage();
    const router = useRouter();
    const { user, loading } = useAuth();
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [conversations, setConversations] = useState<any[]>([]);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const { setSelectedConversation } = useConversation();
    const [searchTerm, setSearchTerm] = useState("");
    const [openNewChat, setOpenNewChat] = useState(false);
    const [openCreateGroup, setOpenCreateGroup] = useState(false);

    // Lấy danh sách cuộc trò chuyện của người dùng từ API hoặc context
    useEffect(() => {
        const socket = getSocket();
        const fetchData = async () => {
            if (!user?.id || loading) return;
            setLoadingConversations(true);
            try {
                const res = await fetchConversations();
                setConversations(res);
            } catch (error) {
                console.error("Error fetching conversations:", error);
            } finally {
                setLoadingConversations(false);
            }
        };

        // Hàm handle khi có tin nhắn mới từ socket
        const handleNotificationNewMessage = () => {
            fetchData();
        };

        // Hàm handle khi có người đọc tin nhắn từ socket
        const handleNotificationMessagesRead = () => {
            fetchData();
        };

        // Hàm handle khi có tin nhắn bị thu hồi từ socket
        const handleMessageRevoked = () => {
            fetchData();
        };

        // Lắng nghe sự kiện từ socket
        socket.on("notificationNewMessage", handleNotificationNewMessage);
        socket.on("notificationMessagesRead", handleNotificationMessagesRead);
        socket.on("messageRevoked", handleMessageRevoked);

        fetchData();

        // Đóng socket khi unmount
        return () => {
            socket.off("notificationNewMessage", handleNotificationNewMessage);
            socket.off("notificationMessagesRead", handleNotificationMessagesRead);
            socket.off("messageRevoked", handleMessageRevoked);
        };
    }, [user?.id, loading]);

    //Handle card click
    const handleCardClick = async (conversationId: string, conversation: any) => {
        // Navigate to the chat detail page for the selected conversation
        setSelectedConversation(conversation);
        localStorage.setItem("selectedConversation", JSON.stringify(conversation));
        router.push(`/dashboard/chat/${conversationId}`);
    };

    const filteredConversations = useMemo(() => {
        if (!searchTerm.trim()) return conversations;

        return conversations.filter((conv) => {
            let displayName = "";

            if (conv.type === "private") {
                // tìm người còn lại (không phải user hiện tại)
                const otherMember = conv.members.find((m: any) => m.id !== user?.id);
                displayName = otherMember?.name || "";
            } else {
                // nếu là group thì lấy tên group
                displayName = conv.name || "";
            }

            return displayName.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [searchTerm, conversations, user?.id]);

    return (
        <div className="h-screen flex flex-col w-full">
            {/* Top bar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 h-[73px]">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">{user?.nick_name}</h2>
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                </div>

                {/* Dropdown menu cho icon SquarePen */}
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <button className="p-2 rounded-full hover:bg-gray-100 transition">
                            <SquarePen className="w-6 h-6 text-gray-500" />
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => setOpenNewChat(true)}>
                            💬 Tin nhắn mới
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setOpenCreateGroup(true)}>
                            👥 Tạo nhóm
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200">
                <input
                    type="text"
                    placeholder={t("dashboard.search")}
                    onFocus={() => setIsSearchMode(true)}
                    onBlur={() => setIsSearchMode(false)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {!isSearchMode && (
                <>
                    <h3 className="px-4 py-2 font-semibold">{t("dashboard.messages")}</h3>
                    <div className="flex-1 overflow-y-auto pb-18 w-full">
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
                    {loadingConversations ? (
                        <p className="px-4 py-2 text-gray-500">{t("chat.loading")}</p>
                    ) : filteredConversations.length > 0 ? (
                        filteredConversations.map((conversation) =>
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
                        )
                    ) : (
                        <p className="px-4 py-2 text-gray-500">
                            {t("chat.noResults") || "Không tìm thấy cuộc trò chuyện nào."}
                        </p>
                    )}
                </div>
            )}

            {/* Các Modal */}
            <ModalSearchNewChat open={openNewChat} setOpen={setOpenNewChat} />
            <ModalCreateGroup open={openCreateGroup} setOpen={setOpenCreateGroup} />
        </div>
    );
}
