"use client";

import React from "react";
import { Copy, Reply, Trash2, RotateCcw, Forward, Heart } from "lucide-react";
import useClickOutside from "@/hooks/useClickOutside";

interface MessageOptionMenuProps {
    isMe: boolean;
    onClose: () => void;
    onReply: () => void;
    onCopy: () => void;
    onDelete?: () => void;
    onRevoke?: () => void;
    isRevoked?: boolean;
    align?: "left" | "right"; // Vị trí menu so với tin nhắn
    createdAt?: string;
    onLike?: () => void;
    isLiked?: boolean;
}

export default function MessageOptionMenu({
    isMe,
    onClose,
    onReply,
    onCopy,
    onDelete,
    onRevoke,
    isRevoked = false,
    align = "right", // Mặc định là right (cho tin nhắn Sender)
    createdAt,
    onLike,
    isLiked,
}: MessageOptionMenuProps) {

    const menuRef = useClickOutside(onClose);

    // Tính toán class vị trí dựa trên prop align
    const positionClass = align === "left"
        ? "left-0 origin-top-left"   // Nếu left: Neo trái, mở sang phải
        : "right-0 origin-top-right"; // Nếu right: Neo phải, mở sang trái

    const canRevoke = React.useMemo(() => {
        if (!createdAt) return false; // Không có thời gian -> không cho thu hồi
        const now = new Date().getTime();
        const msgTime = new Date(createdAt).getTime();
        const diff = now - msgTime;
        const ONE_HOUR = 60 * 60 * 1000; // 1 giờ

        return diff <= ONE_HOUR;
    }, [createdAt]);

    return (
        <div
            ref={menuRef}
            className={`absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-48 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100 bottom-8 ${positionClass}`}
        >
            {/* CHỈ HIỆN NÚT LIKE/REPLY/COPY NẾU CHƯA THU HỒI */}
            {!isRevoked && (
                <>
                    <button onClick={() => { onLike?.(); onClose(); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 flex items-center gap-3 transition-colors ${isLiked ? "text-red-500 font-medium" : "text-gray-700"}`}>
                        <Heart size={16} className={isLiked ? "fill-red-500 stroke-red-500" : ""} />
                        <span>{isLiked ? "Bỏ thích" : "Yêu thích"}</span>
                    </button>

                    <button onClick={() => { onReply(); onClose(); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors">
                        <Reply size={16} /> <span>Trả lời</span>
                    </button>

                    <button onClick={() => { onCopy(); onClose(); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors">
                        <Copy size={16} /> <span>Sao chép</span>
                    </button>

                    <div className="h-px bg-gray-100 my-1"></div>
                </>
            )}

            {/* Nút Thu hồi chỉ hiện khi: Của mình + Có quyền + Chưa quá giờ + Chưa thu hồi */}
            {isMe && onRevoke && canRevoke && !isRevoked && (
                <button onClick={() => { onRevoke(); onClose(); }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
                    <RotateCcw size={16} /> <span>Thu hồi</span>
                </button>
            )}

            {/* Nút Xóa luôn hiện (kể cả khi đã thu hồi) */}
            <button onClick={() => { onDelete?.(); onClose(); }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
                <Trash2 size={16} /> <span>Xóa phía tôi</span>
            </button>
        </div>
    );
}