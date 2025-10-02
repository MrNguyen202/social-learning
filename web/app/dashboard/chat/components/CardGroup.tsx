"use client";

import { Badge } from "@/components/ui/badge";
import AvatarGroup from "./AvatarGroup";
import useAuth from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { getSocket } from "@/socket/socketClient";
import { fetchUnreadCount } from "@/app/api/chat/conversation/route";
import { convertToTime } from "@/utils/formatTime";
import { useLanguage } from "@/components/contexts/LanguageContext";

interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

interface Conversation {
  id: string;
  name: string;
  avatarUrl: string;
  members: User[];
  lastMessage: LastMessage | null;
}

type MessageContent = {
  system?: boolean;
  type: "text" | "image" | "file";
  text?: string;
  images?: string[];
  file?: {
    name: string;
    url: string;
  } | null;
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
        const response = await fetchUnreadCount(conversation.id, user?.id);
        setUnreadCount(response);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchData();
  }, [conversation.id, user?.id, conversation.lastMessage]);

  return (
    <>
      <button
        onClick={onClick}
        className="w-full flex justify-start items-center px-4 gap-3 py-2 border-b border-gray-200 hover:cursor-pointer hover:bg-gray-200"
      >
        <div className="min-w-[60px] flex justify-center items-center">
          <AvatarGroup members={conversation.members} />
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
              <p className="truncate max-w-52">
                {conversation.lastMessage?.senderId === user?.id
                  ? `${t("dashboard.you")}: `
                  : conversation.members.find(
                      (m) => m.id === conversation.lastMessage?.senderId
                    )?.name + ": "}
                {typeof conversation.lastMessage?.content === "string"
                  ? conversation.lastMessage?.content
                  : conversation.lastMessage?.content?.text ||
                    t("dashboard.unsupportedContent")}
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
