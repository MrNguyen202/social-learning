"use client";

import { getUserImageSrc } from "@/app/apiClient/image/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatTime } from "@/utils/formatTime";
import MessageAttachments from "./MessageAttachments";
import { Heart, Key, MoreHorizontal, Reply } from "lucide-react";
import { useState } from "react";
import MessageOptionMenu from "./MessageOptionMenu";
import useAuth from "@/hooks/useAuth";
import LikeListModal from "../../components/LikeListModal";
import { useConversation } from "@/components/contexts/ConversationContext";
import AudioPlayer from "../../components/AudioPlayer";

interface MessageReceiverProps {
    message: any;
    showTimestamp?: boolean;
    showAvatar?: boolean;
    isLastInSequence?: boolean;
    onReply?: () => void;
    onDelete?: () => void;
    onLike?: () => void;
}

export default function MessageReceiver({
    message,
    showTimestamp = false,
    showAvatar = true,
    isLastInSequence = false,
    onReply,
    onDelete,
    onLike
}: MessageReceiverProps) {
    const { revoked } = message;

    const { user } = useAuth();
    const likes = message.likes || [];
    const { selectedConversation } = useConversation();
    const isLikedByMe = likes.some((l: any) => l.userId === user?.id);

    const [isLikeModalOpen, setIsLikeModalOpen] = useState(false);

    const marginBottom = (showTimestamp || isLastInSequence) ? "mb-4" : "mb-1";
    const senderName = message.sender?.name || "Người dùng";
    const isAdmin = message.sender?.role === "admin" || message.sender?.role === "ADMIN";

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleCopy = () => navigator.clipboard.writeText(message.content.text || "");
    const handleReply = () => {
        onReply?.();
    };
    const handleDelete = () => {
        onDelete?.();
    };

    return (
        <div className={`flex justify-start w-full ${marginBottom} group/message`}>
            <div className="flex items-start gap-2 max-w-[80%]">

                {/* Avatar */}
                <Avatar className={`w-8 h-8 mt-1 flex-shrink-0 ${showAvatar ? "" : "invisible"}`}>
                    <AvatarImage src={getUserImageSrc(message.sender?.avatar)} />
                    <AvatarFallback>{senderName.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex flex-col items-start">

                    {/* Logic hiển thị nội dung: Thu hồi vs Bình thường */}
                    {revoked ? (
                        <div className="bg-gray-50 border border-gray-200 text-gray-500 italic text-sm px-3 py-2 rounded-2xl rounded-tl-none shadow-sm select-none">
                            Tin nhắn đã bị thu hồi
                        </div>
                    ) : (
                        // --- UI Tin nhắn bình thường ---
                        <div className={`bg-gray-100 text-gray-800 p-3 shadow-sm border border-gray-200/50 min-w-[100px] relative group
                            ${showAvatar ? "rounded-2xl rounded-tl-none" : "rounded-2xl rounded-tl-md ml-0"} 
                            ${isAdmin ? "border-yellow-400/50 bg-yellow-50/50" : ""} 
                        `}>
                            {/* TÊN NGƯỜI GỬI + ICON ADMIN */}
                            {showAvatar && (
                                <div className="flex items-center gap-1 mb-1 select-none">
                                    <span className="text-[13px] text-orange-700 leading-none">
                                        {senderName}
                                    </span>

                                    {isAdmin && (
                                        <div className="bg-yellow-100 p-0.5 rounded-full border border-yellow-300 flex items-center justify-center" title="Quản trị viên">
                                            <Key size={10} className="text-yellow-600 fill-yellow-600" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {message.replyTo && (
                                <div className="mt-2 mb-2 p-2 bg-white/60 rounded-md border-l-4 border-gray-400 text-xs cursor-pointer hover:opacity-80 relative">
                                    <p className="font-bold text-gray-600 mb-0.5">
                                        {message.replyTo.sender?.name || "Người dùng"}
                                    </p>
                                    <p className="text-gray-500 truncate max-w-[180px]">
                                        {message.replyTo.content?.text || (message.replyTo.content?.images?.length ? "[Hình ảnh]" : "[File]")}
                                    </p>
                                </div>
                            )}


                            {message.content.type === "audio" && message.content.file ? (
                                <AudioPlayer src={message.content.file.url} isMe={false} />
                            ) : (
                                <>
                                    {message.content.text && (
                                        <p className="text-sm sm:text-base break-words whitespace-pre-wrap leading-relaxed">
                                            {message.content.text}
                                        </p>
                                    )}

                                    <MessageAttachments images={message.content?.images} file={message.content?.file} />
                                </>
                            )}

                            {/* Biểu tượng thích tin nhắn */}
                            {!revoked && likes.length > 0 && (
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsLikeModalOpen(true);
                                    }}
                                    className="absolute -bottom-2 -right-1 bg-white border border-gray-100 shadow-md rounded-full px-2 py-0.5 flex items-center gap-1 z-10 cursor-pointer hover:bg-gray-50 transition-colors select-none"
                                >
                                    <Heart size={12} className="fill-red-500 stroke-red-500 text-red-500" />
                                    <span className="text-[11px] font-bold text-gray-600">{likes.length}</span>
                                </div>
                            )}

                            {/* --- MODAL --- */}
                            {isLikeModalOpen && (
                                <LikeListModal
                                    isOpen={isLikeModalOpen}
                                    onClose={() => setIsLikeModalOpen(false)}
                                    likes={likes}
                                    members={selectedConversation?.members || []}
                                />
                            )}
                        </div>
                    )}

                    {/* Giờ: Chỉ hiện ở tin cuối cùng của chuỗi thời gian */}
                    {/* Có thể giữ lại để biết tin nhắn bị thu hồi lúc mấy giờ */}
                    {showTimestamp && (
                        <span className="text-[12px] text-gray-400 mt-1 self-start select-none h-3">
                            {formatTime(message.createdAt)}
                        </span>
                    )}
                </div>

                {/* BUTTONS: [SỬA] Ẩn đi nếu message đã revoked */}
                <div className={`
                                flex items-center gap-1 transition-opacity duration-200 h-full justify-center
                                ${isMenuOpen ? "opacity-100" : "opacity-0 group-hover/message:opacity-100"}
                            `}>
                    {!revoked && (
                        <button className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition" title="Trả lời" onClick={handleReply}>
                            <Reply size={16} />
                        </button>
                    )}

                    {/* Nút 3 chấm */}
                    <div className="relative">
                        <button
                            className={`p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition ${isMenuOpen ? "bg-gray-300 text-black" : ""}`}
                            title="Tùy chọn"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <MoreHorizontal size={16} />
                        </button>

                        {/* MENU */}
                        {isMenuOpen && (
                            <MessageOptionMenu
                                isMe={false}
                                align="left"
                                onClose={() => setIsMenuOpen(false)}
                                onCopy={handleCopy}
                                onReply={handleReply}
                                onDelete={handleDelete}
                                onLike={onLike}
                                isLiked={isLikedByMe}
                                isRevoked={revoked}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}