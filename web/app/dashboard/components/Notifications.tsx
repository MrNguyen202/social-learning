"use client";

import {
  fetchNotifications,
  fetchNotificationsLearning,
  markNotificationAsRead,
  markNotificationLearningAsRead,
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
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

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
  const route = useRouter();

  const [activeTab, setActiveTab] = useState<"social" | "learning">("social");

  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLearning, setNotificationsLearning] = useState<any[]>([]);
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
    getNotificationsLearning();
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

  const getNotificationsLearning = async () => {
    try {
      setLoading(true);
      const res = await fetchNotificationsLearning(user.id);
      if (res.success) {
        setNotificationsLearning(res.data);
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

  const markAsReadLearning = async (notifyId: string) => {
    try {
      await markNotificationLearningAsRead(notifyId);
      setNotificationsLearning((prev) =>
        prev.map((n) => (n.id === notifyId ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleOpenPostFromNotif = async (notif: any) => {
    try {
      const data = JSON.parse(notif.content);
      if (!data.postId) return;

      const res = await getPostById(data.postId);

      setSelectedPostId(data.postId);
      setSelectedCommentId(data.commentId);
      setSelectedPost(res.data);
      setIsPostModalOpen(true);

      markAsRead(notif.id);
    } catch (err) {
      console.error("Failed to open post from notification", err);
    }
  };

  const handleOpenVocabFromNotif = async (notif: any) => {
    try {
      if (!notif) return;
      if (!notif.personalVocabId) {
        markAsReadLearning(notif.id);
        toast.success(t("learning.congratulations"), { autoClose: 1000 });
        return;
      }

      route.push(
        `/dashboard/vocabulary?personalVocabId=${notif.personalVocabId}`
      );

      markAsReadLearning(notif.id);
    } catch (err) {
      console.error("Failed to open vocab from notificationLearning", err);
    }
  };

  // Render Social Notifications
  const renderSocialNotifications = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <p className="p-4 text-sm text-gray-500">
          {t("dashboard.noNotifications")}
        </p>
      );
    }

    return (
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
              <AvatarImage src={getUserImageSrc(notif.sender?.avatar)} />
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {notif.sender?.nick_name}
              </span>
              <span className="text-xs text-gray-500">{notif.title}</span>
              <span className="text-[11px] text-gray-400">
                {convertToDate(notif.created_at)} {formatTime(notif.created_at)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  // Render Learning Notifications
  const renderLearningNotifications = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      );
    }

    if (notificationsLearning.length === 0) {
      return (
        <p className="p-4 text-sm text-gray-500">
          {t("dashboard.noNotifications")}
        </p>
      );
    }

    return (
      <ul className="divide-y">
        {notificationsLearning.map((notif, index) => (
          <li
            key={notif.id || index}
            className={`flex flex-col gap-1 p-4 cursor-pointer hover:bg-gray-50 ${
              notif.is_read ? "opacity-60" : "bg-white"
            }`}
            onClick={() => handleOpenVocabFromNotif(notif)}
          >
            <span className="text-sm font-medium">{notif.title}</span>
            <span className="text-xs text-gray-500">{notif.content}</span>
            <span className="text-[11px] text-gray-400">
              {convertToDate(notif.created_at)} {formatTime(notif.created_at)}
            </span>
          </li>
        ))}
      </ul>
    );
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
                <h2 className="font-semibold text-lg bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  {t("dashboard.notifications")}
                </h2>
                <button onClick={onClose}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b">
                <button
                  className={`flex-1 py-2 text-sm font-medium cursor-pointer ${
                    activeTab === "social"
                      ? "border-b-2 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("social")}
                >
                  {t("dashboard.social")}
                </button>
                <button
                  className={`flex-1 py-2 text-sm font-medium cursor-pointer ${
                    activeTab === "learning"
                      ? "border-b-2 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("learning")}
                >
                  {t("dashboard.learning")}
                </button>
              </div>

              {/* Body */}
              <ScrollArea className="flex-1 overflow-y-auto">
                {activeTab === "social"
                  ? renderSocialNotifications()
                  : renderLearningNotifications()}
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal bài viết */}
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
