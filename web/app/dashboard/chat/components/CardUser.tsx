"use client";

import { fetchUnreadCount } from "@/app/apiClient/chat/conversation/conversation";
import { getUserImageSrc } from "@/app/apiClient/image/image";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import useAuth from "@/hooks/useAuth";
import { convertToTime } from "@/utils/formatTime";
import { useEffect, useState } from "react";

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

type CardUserProps = {
  conversation: Conversation;
  onClick: () => void;
};

export default function CardUser({ conversation, onClick }: CardUserProps) {
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

  return (
    <>
      <button
        onClick={onClick}
        className="w-full flex justify-start items-center px-4 gap-3 py-2 border-b border-gray-200 hover:cursor-pointer hover:bg-gray-200"
      >
        <div className="min-w-[60px] flex justify-center items-center">
          <Avatar className="w-12 h-12">
            <AvatarImage
              src={getUserImageSrc(
                conversation.members.filter(
                  (member) => member.id !== user?.id
                )[0]?.avatarUrl
              )}
              alt={
                conversation.members.filter(
                  (member) => member.id !== user?.id
                )[0]?.name
              }
            />
            <AvatarFallback className="bg-gray-300">
              {conversation.members
                .filter((member) => member.id !== user?.id)[0]
                ?.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col items-start gap-2 w-full">
          <div className="flex items-center justify-between w-full">
            <span className="font-semibold truncate max-w-64">
              {
                conversation.members.filter(
                  (member) => member.id !== user?.id
                )[0]?.name
              }
            </span>
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
                  : ""}
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
