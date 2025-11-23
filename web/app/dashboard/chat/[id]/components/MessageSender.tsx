"use client";

import React, { useState } from "react";
import { RefreshCcw, AlertCircle, Key, Reply, MoreHorizontal } from "lucide-react";
import MessageAttachments from "./MessageAttachments";
import { formatTime } from "@/utils/formatTime";
import { useConversation } from "@/components/contexts/ConversationContext"; // 1. Import Context
import { getUserImageSrc } from "@/app/apiClient/image/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import useAuth from "@/hooks/useAuth"; // Import Auth để lấy ID của mình
import MessageOptionMenu from "./MessageOptionMenu";

interface MessageSenderProps {
    message: any;
    onRetry?: () => void;
    showTimestamp?: boolean;
    isLastInSequence?: boolean;
    onReply?: () => void;
    onRevoke?: () => void;
    onDelete?: () => void;
}

export default function MessageSender({
    message,
    onRetry,
    showTimestamp = false,
    isLastInSequence = false,
    onReply,
    onRevoke,
    onDelete
}: MessageSenderProps) {
    const { status, createdAt, seens, revoked } = message; // Lấy thêm mảng seens
    const { selectedConversation } = useConversation(); // Lấy thông tin cuộc trò chuyện
    const { user } = useAuth();

    // Fix status
    const isSent = !status || status === "sent";

    // LOGIC XỬ LÝ ĐÃ XEM (SEEN)
    // 1. Lọc ra danh sách những người đã xem (trừ bản thân mình)
    const seenUsers = (seens || []).filter((seen: any) => seen.userId !== user?.id);

    // 2. Map ID sang thông tin User (Avatar, Name) từ danh sách thành viên
    const seenMembers = seenUsers.map((seen: any) => {
        const member = selectedConversation?.members.find((m: any) => m.id === seen.userId);
        return member;
    }).filter(Boolean); // Lọc bỏ undefined nếu không tìm thấy

    // Điều kiện hiển thị dòng status bên dưới
    // Hiện khi: Đang gửi, Lỗi, Hiện giờ, HOẶC (Đã gửi và có người xem)
    const shouldShowStatus =
        status === "sending" ||
        status === "error" ||
        (isSent && showTimestamp) ||
        (isSent && seenMembers.length > 0 && isLastInSequence);
    // ^ Chỉ hiện 'Đã xem' ở tin cuối cùng của chuỗi cho đỡ rối mắt (giống Zalo)

    const marginBottom = (shouldShowStatus || isLastInSequence) ? "mb-4" : "mb-1";
    const isAdmin = message.sender?.role === "admin" || message.sender?.role === "ADMIN";

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleCopy = () => navigator.clipboard.writeText(message.content.text || "");
    const handleReply = () => {
        onReply?.();
    };
    const handleDelete = () => {
        onDelete?.();
    };
    const handleRevoke = () => {
        onRevoke?.();
    };

    return (
        <div className={`flex flex-row justify-end items-center ${marginBottom} w-full group/message`}>
            {/* --- ACTION BUTTONS (Bên Trái Bong Bóng) --- */}
            {!revoked && isSent && status !== "error" && (
                <div className={`
                            flex items-center gap-1 transition-opacity duration-200 
                            ${isMenuOpen ? "opacity-100" : "opacity-0 group-hover/message:opacity-100"}
                        `}>
                    {/* Nút 3 chấm */}
                    <div className="relative">
                        <button
                            className={`p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition ${isMenuOpen ? "bg-gray-200 text-black" : ""}`}
                            title="Tùy chọn"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <MoreHorizontal size={16} />
                        </button>

                        {/* MENU: Mặc định align="right" -> Neo phải, mở sang trái (vào vùng trống) */}
                        {isMenuOpen && (
                            <MessageOptionMenu
                                isMe={true}
                                align="right" // Mở sang trái
                                onClose={() => setIsMenuOpen(false)}
                                onCopy={handleCopy}
                                onReply={handleReply}
                                onDelete={handleDelete}
                                onRevoke={handleRevoke}
                                createdAt={message.createdAt}
                            />
                        )}
                    </div>

                    <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition" title="Trả lời" onClick={handleReply}>
                        <Reply size={16} />
                    </button>
                </div>
            )}
            <div className="flex-col items-end gap-2 max-w-[70%]">
                {status === "error" && (
                    <button onClick={onRetry} className="text-red-500 hover:bg-red-100 p-1 rounded-full">
                        <RefreshCcw size={16} />
                    </button>
                )}

                {revoked ? (
                    <div className="bg-blue-100 text-blue-800 p-3 rounded-2xl shadow-sm flex flex-col transition-all min-w-[100px] italic text-sm sm:text-base">
                        Tin nhắn đã bị thu hồi
                    </div>
                ) : (
                    <div className={`bg-blue-100 text-blue-800 p-3 rounded-2xl shadow-sm flex flex-col transition-all min-w-[100px]
                        ${status === "sending" ? "opacity-60" : "opacity-100"} 
                        ${status === "error" ? "border border-red-400 bg-red-50" : ""}
                        ${!shouldShowStatus ? "rounded-br-md" : "rounded-br-2xl"}
                        ${isAdmin ? "border-2 border-yellow-400/30 bg-blue-50" : ""}
                    `}
                    >
                        {isAdmin && (
                            <div className="flex items-center justify-end gap-1 mb-1 pb-1 border-b border-blue-200/50 select-none w-full">
                                <div className="bg-yellow-100 p-0.5 rounded-full border border-yellow-300 flex items-center justify-center">
                                    <Key size={10} className="text-yellow-600 fill-yellow-600" />
                                </div>
                                <span className="text-[12px] font-bold text-blue-600 leading-none">Bạn</span>
                            </div>
                        )}

                        {message.replyTo && (
                            <div className="mb-2 p-2 bg-blue-50/60 rounded-md border-l-4 border-blue-400 text-xs text-left relative">
                                <p className="font-bold text-blue-700 mb-0.5">
                                    {message.replyTo.sender?.name || "Người dùng"}
                                </p>
                                <p className="text-blue-900/70 truncate max-w-[180px]">
                                    {message.replyTo.content?.text || (message.replyTo.content?.images?.length ? "[Hình ảnh]" : "[File]")}
                                </p>
                            </div>
                        )}

                        {message.content.text && (
                            <p className="text-sm sm:text-base break-words whitespace-pre-wrap w-full text-letf">
                                {message.content.text}
                            </p>
                        )}

                        <div className="w-full flex justify-end">
                            <MessageAttachments images={message.content.images} file={message.content.file} />
                        </div>
                    </div>
                )}

                {/* DÒNG TRẠNG THÁI & ĐÃ XEM */}
                {shouldShowStatus && (
                    <div className="px-1 mt-1 flex flex-row items-center justify-between gap-0.5 h-auto min-h-[12px] w-full">

                        {/* 1. Trạng thái gửi / Giờ */}
                        <div className="text-[12px] text-gray-400 flex items-center gap-1 select-none">
                            {status === "sending" && <span>Đang gửi...</span>}
                            {status === "error" && <span className="text-red-500 flex items-center gap-1"><AlertCircle size={10} /> Lỗi</span>}
                            {isSent && showTimestamp && <span>{formatTime(createdAt)}</span>}
                        </div>

                        {/* 2. HIỂN THỊ ĐÃ XEM (ZALO STYLE) */}
                        {isSent && seenMembers.length > 0 && (
                            <div className="flex items-center gap-1 justify-end animate-in fade-in slide-in-from-top-1">
                                {selectedConversation?.type === "private" ? (
                                    // TRƯỜNG HỢP CHAT 1-1: Hiện chữ "Đã xem"
                                    <span className="text-[12px] text-gray-500 font-medium">Đã xem</span>
                                ) : (
                                    // TRƯỜNG HỢP CHAT GROUP: Hiện danh sách Avatar nhỏ
                                    <div className="flex items-center -space-x-1.5 flex-row-reverse gap-0.5">
                                        {/* flex-row-reverse để avatar người xem mới nhất nằm ngoài cùng nếu muốn, hoặc bỏ đi */}
                                        {seenMembers.map((member: any) => (
                                            <div key={member.id} className="relative group/seen" title={`Đã xem bởi ${member.name}`}>
                                                <Avatar className="w-4 h-4 border border-white ring-1 ring-gray-100">
                                                    <AvatarImage src={getUserImageSrc(member.avatarUrl)} />
                                                    <AvatarFallback className="text-[8px] bg-gray-200">
                                                        {member.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {/* 3. Hiển thị Đã gửi nếu gửi thành công và không có seen nào */}
                        {isSent && seenMembers.length === 0 && (
                            <div className="text-[12px] text-gray-500 font-medium">Đã nhận</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}