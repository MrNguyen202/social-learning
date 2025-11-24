import React from "react";
import { X, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserImageSrc } from "@/app/apiClient/image/image";
import useAuth from "@/hooks/useAuth"; // 1. Import hook useAuth

interface LikeListModalProps {
    isOpen: boolean;
    onClose: () => void;
    likes: { userId: string; likedAt?: string }[];
    members: any[];
}

export default function LikeListModal({ isOpen, onClose, likes, members }: LikeListModalProps) {
    const { user: currentUser } = useAuth();
    if (!isOpen) return null;

    // Map userId sang thông tin user đầy đủ
    const likedUsers = likes.map((like) => {
        const member = members.find((m) => m.id === like.userId || m.userId === like.userId);
        return {
            ...like, // bao gồm userId, likedAt
            name: member?.name || "Người dùng không xác định",
            avatar: member?.avatar || member?.avatarUrl || "",
        };
    });

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-xs sm:max-w-sm overflow-hidden relative animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="bg-red-100 p-1 rounded-full">
                            <Heart size={16} className="fill-red-500 text-red-500" />
                        </div>
                        <span className="font-semibold text-gray-800">Đã bày tỏ cảm xúc</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* List Users */}
                <div className="max-h-[300px] overflow-y-auto p-2">
                    {likedUsers.length === 0 ? (
                        <p className="text-center text-gray-500 py-4 text-sm">Chưa có lượt thích nào</p>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {likedUsers.map((user, index) => {
                                // 3. Kiểm tra xem đây có phải là mình không
                                const isMe = user.userId === currentUser?.id;

                                return (
                                    <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md transition cursor-default">
                                        <Avatar className="w-9 h-9 border border-gray-200">
                                            <AvatarImage src={getUserImageSrc(user.avatar)} />
                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-700">
                                                {user.name}
                                                {/* 4. Hiển thị (Bạn) nếu là chính mình */}
                                                {isMe && <span className="text-gray-500 font-normal ml-1">(Bạn)</span>}
                                            </span>
                                        </div>
                                        <div className="ml-auto">
                                            <Heart size={14} className="fill-red-500 text-red-500" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Backdrop click to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose}></div>
        </div>
    );
}