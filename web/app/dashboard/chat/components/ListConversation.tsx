"use client";

import { useState } from "react";
import { ChevronDown, SquarePen } from "lucide-react";
import CardUser from "./CardUser";
import CardGroup from "./CardGroup";
import { useRouter } from "next/navigation";
const conversations = [
    {
        id: "1",
        name: "John Doe asfasdfasdf sdfasdfasdf ádfasdf ádfasdfad",
        avatarUrl: "/default-avatar-profile-icon.jpg",
        members: [
            {
                id: "1",
                name: "John Doe",
                avatarUrl: "/default-avatar-profile-icon.jpg",
            },
        ],
        lastMessage: "Hey, how's it going?",
        type: "user",
    },
    {
        id: "2",
        name: "Jane Smith",
        avatarUrl: "/default-avatar-profile-icon.jpg",
        members: [
            {
                id: "2",
                name: "Jane Smith",
                avatarUrl: "/default-avatar-profile-icon.jpg",
            },
        ],
        lastMessage: "Are we still on for tomorrow?",
        type: "user",
    },
    {
        id: "3",
        name: "Alice Johnson",
        avatarUrl: "/default-avatar-profile-icon.jpg",
        members: [
            {
                id: "1",
                name: "John Doe",
                avatarUrl: "/default-avatar-profile-icon.jpg",
            },
            {
                id: "3",
                name: "Alice Johnson",
                avatarUrl: "/default-avatar-profile-icon.jpg",
            },
            {
                id: "2",
                name: "Jane Smith",
                avatarUrl: "/default-avatar-profile-icon.jpg",
            }
        ],
        lastMessage: "Let's catch up soon!",
        type: "group",
    },
    {
        id: "4",
        name: "Alice Johnson",
        avatarUrl: "/default-avatar-profile-icon.jpg",
        members: [
            {
                id: "1",
                name: "John Doe",
                avatarUrl: "/default-avatar-profile-icon.jpg",
            },
            {
                id: "3",
                name: "Alice Johnson",
                avatarUrl: "/default-avatar-profile-icon.jpg",
            },
            {
                id: "2",
                name: "Jane Smith",
                avatarUrl: "/default-avatar-profile-icon.jpg",
            },
            {
                id: "4",
                name: "Bob Brown",
                avatarUrl: "/default-avatar-profile-icon.jpg",
            },
        ],
        lastMessage: "Let's catch up soon!",
        type: "group",
    },
    {
        id: "5",
        name: "Alice Johnson",
        avatarUrl: "/default-avatar-profile-icon.jpg",
        members: [
            {
                id: "1",
                name: "John Doe",
                avatarUrl: "/default-avatar-profile-icon.jpg",
            },
            {
                id: "3",
                name: "Alice Johnson",
                avatarUrl: "/default-avatar-profile-icon.jpg",
            },
            {
                id: "2",
                name: "Jane Smith",
                avatarUrl: "/default-avatar-profile-icon.jpg",
            },
            {
                id: "4",
                name: "Bob Brown",
                avatarUrl: "/default-avatar-profile-icon.jpg",
            },
            {
                id: "5",
                name: "Charlie Davis",
                avatarUrl: "/default-avatar-profile-icon.jpg",
            },
        ],
        lastMessage: "Let's catch up soon!",
        type: "group",
    },
];

export default function ListConversation() {
    const router = useRouter();
    const [isSearchMode, setIsSearchMode] = useState(false);

    //Handle card click
    const handleCardClick = (conversationId: string) => {
        // Navigate to the chat detail page for the selected conversation
        router.push(`/dashboard/chat/${conversationId}`);
    };

    return (
        <div className="h-screen flex flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">nguyenvana123</h2>
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
                        {conversations.map((conversation) => (
                            conversation.type === "user" ? (
                                <CardUser key={conversation.id} conversation={conversation} onClick={() => handleCardClick(conversation.id)} />
                            ) : (
                                <CardGroup key={conversation.id} conversation={conversation} onClick={() => handleCardClick(conversation.id)} />
                            )
                        ))}
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
