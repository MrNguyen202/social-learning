import React from "react";
import {
    UserPlus,
    UserMinus,
    LogOut,
    ShieldCheck,
    Edit3,
    Info,
    UserX,
    Camera
} from "lucide-react";

// Định nghĩa Interface dựa trên cấu trúc Message của bạn
interface SystemContent {
    _id: string;
        conversationId: string;
        senderId: string;
        content: {
            type: string;
            text: string;
            images: { url: string; filename: string }[];
            file: any;
            system?: {
                action: "user_joined" | "user_left" | "conversation_renamed" | "member_added" | "member_removed" | "admin_transferred" | "conversation_avatar_updated";
                actor: {
                    id: string;
                    name: string;
                };
                target: [
                    {
                        id: string;
                        name: string;
                    },
                ];
                newName?: string;
            };
        };
        sender: {
            id: string;
            name: string;
            avatar: string;
        };
        createdAt: string;
        seens: any[];

}

interface MessageSystemProps {
    message: SystemContent;
}

export default function MessageSystem({ message }: MessageSystemProps) {
    const system = message.content.system;
    const action = system?.action;
    const actor = system?.actor;
    const target = system?.target;
    const newName = system?.newName;

    // Hàm helper để lấy nội dung text và icon tương ứng
    const getSystemDetails = () => {
        const actorName = actor?.name || "Người dùng";
        const targetName = target && target.length > 0 ? target.map(t => t.name).join(", ") : "";

        switch (action) {
            case "member_added":
                return {
                    icon: <UserPlus size={14} />,
                    text: (
                        <span>
                            <span className="font-semibold">{actorName}</span> đã thêm <span className="font-semibold">{targetName}</span> vào nhóm.
                        </span>
                    ),
                    bgColor: "bg-blue-100 text-blue-700"
                };

            case "member_removed":
                return {
                    icon: <UserX size={14} />,
                    text: (
                        <span>
                            <span className="font-semibold">{actorName}</span> đã mời <span className="font-semibold">{targetName}</span> ra khỏi nhóm.
                        </span>
                    ),
                    bgColor: "bg-red-100 text-red-700"
                };

            case "user_left":
                return {
                    icon: <LogOut size={14} />,
                    text: (
                        <span>
                            <span className="font-semibold">{actorName}</span> đã rời nhóm.
                        </span>
                    ),
                    bgColor: "bg-gray-200 text-gray-700"
                };

            case "admin_transferred":
                return {
                    icon: <ShieldCheck size={14} />,
                    text: (
                        <span>
                            <span className="font-semibold">{actorName}</span> đã chuyển quyền trưởng nhóm cho <span className="font-semibold">{targetName}</span>.
                        </span>
                    ),
                    bgColor: "bg-yellow-100 text-yellow-800"
                };

            case "conversation_renamed":
                return {
                    icon: <Edit3 size={14} />,
                    text: (
                        <span>
                            <span className="font-semibold">{actorName}</span> đã đổi tên nhóm thành <span className="font-semibold">"{newName}"</span>.
                        </span>
                    ),
                    bgColor: "bg-purple-100 text-purple-700"
                };

            case "user_joined":
                return {
                    icon: <UserPlus size={14} />,
                    text: (
                        <span>
                            <span className="font-semibold">{actorName}</span> đã tham gia nhóm qua link mời.
                        </span>
                    ),
                    bgColor: "bg-green-100 text-green-700"
                };

            case "conversation_avatar_updated":
                return {
                    icon: <Camera size={14} />,
                    text: (
                        <span>
                            <span className="font-semibold">{actorName}</span> đã cập nhật ảnh đại diện nhóm.
                        </span>
                    ),
                };

            default:
                return {
                    icon: <Info size={14} />,
                    text: <span>Thông báo hệ thống</span>,
                    bgColor: "bg-gray-100 text-gray-600"
                };
        }
    };

    const { icon, text, bgColor } = getSystemDetails();

    return (
        <div className="flex justify-center my-2 w-full select-none">
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs shadow-sm transition-all ${bgColor}`}>
                {icon}
                <div>{text}</div>
            </div>
        </div>
    );
}