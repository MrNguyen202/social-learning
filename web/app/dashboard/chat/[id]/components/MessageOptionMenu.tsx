"use client";

import React from "react";
import { Copy, Reply, Trash2, RotateCcw, Forward } from "lucide-react";
import useClickOutside from "@/hooks/useClickOutside";

interface MessageOptionMenuProps {
    isMe: boolean;
    onClose: () => void;
    onReply: () => void;
    onCopy: () => void;
    onDelete?: () => void;
    onRevoke?: () => void;
    align?: "left" | "right";
    createdAt?: string;
}

export default function MessageOptionMenu({
    isMe,
    onClose,
    onReply,
    onCopy,
    onDelete,
    onRevoke,
    align = "right", // Mặc định là right (cho tin nhắn Sender)
    createdAt,
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
            {/* ... (Giữ nguyên nội dung các nút bên trong) ... */}

            <button onClick={() => { onReply(); onClose(); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors">
                <Reply size={16} /> <span>Trả lời</span>
            </button>

            <button onClick={() => { onCopy(); onClose(); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors">
                <Copy size={16} /> <span>Sao chép</span>
            </button>

            <div className="h-px bg-gray-100 my-1"></div>

            {isMe && onRevoke && canRevoke && (
                <button onClick={() => { onRevoke(); onClose(); }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
                    <RotateCcw size={16} /> <span>Thu hồi</span>
                </button>
            )}

            <button onClick={() => { onDelete?.(); onClose(); }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
                <Trash2 size={16} /> <span>Xóa phía tôi</span>
            </button>
        </div>
    );
}