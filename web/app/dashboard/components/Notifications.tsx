"use client";

import {
  fetchNotifications,
  markNotificationAsRead,
} from "@/app/apiClient/notification/notification";
import useAuth from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { getUserImageSrc } from "@/app/apiClient/image/image";
import { convertToDate, formatTime } from "@/utils/formatTime";
import { supabase } from "@/lib/supabase";
import { getPostById } from "@/app/apiClient/post/post";
import { PostModal } from "./PostModal";
import { useLanguage } from "@/components/contexts/LanguageContext";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({
  isOpen,
  onClose,
}: NotificationsPanelProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(
    null
  );
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;
    getNotifications();
    cleanUp();
  }, [isOpen]);

  const getNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetchNotifications(user.id);
      if (res.success) {
        setNotifications(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const cleanUp = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    await supabase.functions.invoke("delete-old-notifications", {
      body: { name: "Functions" },
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
  };

  const markAsRead = async (notifyId: string) => {
    try {
      await markNotificationAsRead(notifyId);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notifyId ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleOpenPostFromNotif = async (notif: any) => {
    try {
      // parse content từ notification
      const data = JSON.parse(notif.content);
      if (!data.postId) return;

      // fetch post từ backend
      const res = await getPostById(data.postId);

      setSelectedPostId(data.postId);
      setSelectedCommentId(data.commentId);
      setSelectedPost(res.data);
      setIsPostModalOpen(true);

      // đánh dấu đã đọc
      markAsRead(notif.id);
    } catch (err) {
      console.error("Failed to open post from notification", err);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* Panel */}
            <motion.div
              className="fixed left-0 top-0 bottom-0 w-80 bg-white border-r border-gray-200 z-50 flex flex-col"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "tween", duration: 0.3 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-semibold text-lg">
                  {t("dashboard.notifications")}
                </h2>
                <button onClick={onClose}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <ScrollArea className="flex-1">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                  </div>
                ) : notifications.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500">
                    {t("dashboard.noNotifications")}
                  </p>
                ) : (
                  <ul className="divide-y">
                    {notifications.map((notif, index) => (
                      <li
                        key={notif.id || index}
                        className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 ${
                          notif.is_read ? "opacity-60" : "bg-white"
                        }`}
                        onClick={() => handleOpenPostFromNotif(notif)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={getUserImageSrc(notif.sender?.avatar)}
                          />
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {notif.sender?.nick_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {notif.title}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {convertToDate(notif.created_at)}{" "}
                            {formatTime(notif.created_at)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        postId={selectedPostId!}
        post={selectedPost}
        userId={user?.id}
        highlightCommentId={selectedCommentId}
      />
    </>
  );
}
