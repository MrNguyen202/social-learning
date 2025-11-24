"use client";

import { Badge } from "@/components/ui/badge";
import AvatarGroup from "./AvatarGroup";
import useAuth from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { fetchUnreadCount } from "@/app/apiClient/chat/conversation/conversation";
import { convertToTime } from "@/utils/formatTime";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  members: User[];
  lastMessage: LastMessage | null;
}

interface SystemContent {
  action: "user_joined" | "user_left" | "conversation_renamed" | "member_added" | "member_removed" | "admin_transferred" | "conversation_avatar_updated";
  actor: {
    id: string;
    name: string;
  };
  target?: {
    id: string;
    name: string;
  }[];
  newName?: string;
}

type MessageContent = {
  type: "text" | "image" | "file" | "system";
  text?: string;
  images?: string[];
  file?: {
    name: string;
    url: string;
  } | null;
  system?: SystemContent;
};

type LastMessage = {
  id: string;
  senderId: string;
  content: MessageContent;
  createdAt: string;
  updatedAt: string;
};

type CardGroupProps = {
  conversation: Conversation;
  onClick: () => void;
};

export default function CardGroup({ conversation, onClick }: CardGroupProps) {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchUnreadCount(conversation.id);
        setUnreadCount(response);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchData();
  }, [conversation.id, user?.id, conversation.lastMessage]);

  const renderLastMessageContent = () => {
    const lastMsg = conversation.lastMessage;
    if (!lastMsg) return "";

    const { type, content, senderId } = {
      type: lastMsg.content.type,
      content: lastMsg.content,
      senderId: lastMsg.senderId
    };

    // --- TRƯỜNG HỢP 1: TIN NHẮN HỆ THỐNG ---
    if (type === "system" && content.system) {
      const sys = content.system;
      // Logic hiển thị "Bạn" nếu actor là user hiện tại
      const actorName = sys.actor.id === user?.id ? t("dashboard.you") : sys.actor.name;

      // Logic hiển thị target (người bị tác động)
      const targetName = sys.target && sys.target.length > 0
        ? (sys.target[0].id === user?.id ? t("dashboard.you") : sys.target[0].name)
        : "";

      // Tùy chỉnh text hiển thị dựa trên action
      switch (sys.action) {
        case "user_left":
          return `${actorName} đã rời nhóm`;
        case "member_added":
          return `${actorName} đã thêm ${targetName} vào nhóm`;
        case "member_removed":
          return `${actorName} đã mời ${targetName} ra khỏi nhóm`;
        case "admin_transferred":
          return `${actorName} đã chuyển quyền admin cho ${targetName}`;
        case "conversation_renamed":
          return `${actorName} đã đổi tên nhóm thành "${sys.newName}"`;
        case "conversation_avatar_updated":
          return `${actorName} đã đổi ảnh nhóm`;
        case "user_joined":
          return `${actorName} đã tham gia nhóm`;
        default:
          return "Thông báo hệ thống";
      }
    }

    // --- TRƯỜNG HỢP 2: TIN NHẮN THƯỜNG (Cần hiện tên người gửi) ---
    let senderName = "";
    if (senderId === user?.id) {
      senderName = `${t("dashboard.you")}: `;
    } else {
      const member = conversation.members.find((m) => m.id === senderId);
      // Nếu tìm thấy member thì hiện tên, không thì hiện "Người dùng cũ" hoặc rỗng
      senderName = member ? `${member.name}: ` : "";
    }

    // Nội dung tin nhắn
    let messageText = "";
    if (type === "image") messageText = `[${t("chat.image")}]`;
    else if (type === "file") messageText = `[${t("chat.file")}]`;
    else messageText = content.text || "";

    return (
      <>
        <span className={senderId === user?.id ? "font-normal" : "font-medium text-gray-700"}>
          {senderName}
        </span>
        {messageText}
      </>
    );
  };

  return (
    <>
      <button
        onClick={onClick}
        className="w-full flex justify-start items-center px-4 gap-3 py-2 border-b border-gray-200 hover:cursor-pointer hover:bg-gray-200"
      >
        <div className="min-w-[60px] flex justify-center items-center">
          {conversation.avatar ? (
            <Avatar className="w-12 h-12">
              <AvatarImage src={conversation?.avatar} />
              <AvatarFallback>{conversation?.name?.[0]}</AvatarFallback>
            </Avatar>
          ) : (
            <AvatarGroup members={conversation.members} />
          )}
        </div>
        <div className="flex flex-col items-start gap-2 w-full">
          <div className="flex items-center justify-between w-full">
            {conversation.name ? (
              <h3 className="font-medium text-gray-900">{conversation.name}</h3>
            ) : (
              <h3 className="font-medium text-gray-900">
                {t("dashboard.you")},{" "}
                {conversation.members
                  .filter((m) => m.id !== user?.id)
                  .map((m) => m.name)
                  .join(", ")}
              </h3>
            )}
            {unreadCount > 0 && (
              <Badge className="h-7 w-7 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-xs flex items-center justify-center p-0">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between w-full text-sm text-gray-500">
            <div className="flex items-center">
              <p className="truncate max-w-46">
                {renderLastMessageContent()}
              </p>
            </div>
            <span className="text-gray-400 text-xs">
              {convertToTime(conversation.lastMessage?.createdAt)}
            </span>
          </div>
        </div>
      </button>
    </>
  );
}
