"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useMemo, useState } from "react";
import {
  getSupabaseFileUrl,
  getUserImageSrc,
} from "@/app/apiClient/image/image";
import { convertToDate, formatTime } from "@/utils/formatTime";
import { PostModal } from "./PostModal";
import useAuth from "@/hooks/useAuth";
import { deletePost, likePost, unlikePost } from "@/app/apiClient/post/post";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { CreateOrUpdatePostModal } from "./CreateOrUpdatePost";

interface PostCardProps {
  post: any;
  onDelete?: (postId: number) => void;
}

export function PostCard({ post, onDelete }: PostCardProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [likes, setLikes] = useState<any[]>(() =>
    Array.isArray(post?.postLikes) ? post.postLikes : []
  );
  const [isSaved, setIsSaved] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);

  useEffect(() => {
    setLikes(Array.isArray(post?.postLikes) ? post.postLikes : []);
  }, [post?.postLikes]);

  const liked = useMemo(() => {
    return (likes ?? []).some(
      (like) => String(like?.userId) === String(user?.id)
    );
  }, [likes, user?.id]);

  const onLike = async () => {
    if (liked) {
      // unlike
      const updatedLikes = likes.filter((like) => like.userId != user?.id);
      setLikes([...updatedLikes]);
      const res = await unlikePost(post?.id, user?.id);
      if (!res.success) {
        toast.error("Something went wrong!");
      }
    } else {
      // like
      const data = {
        userId: user?.id,
        postId: post?.id,
      };
      setLikes([...likes, data]);
      const res = await likePost(data);
      if (!res.success) {
        toast.error("Something went wrong!");
      }
    }
  };

  const handleDeletePost = async (postId: number) => {
    // Xóa bài viết
    if (!postId) return;
    try {
      const res = await deletePost(postId);
      if (res.success) {
        toast.success(t("dashboard.deletePostSuccess"), { autoClose: 1000 });
        onDelete?.(postId);
      }
    } catch (error) {
      toast.error(t("dashboard.deletePostFailed"), { autoClose: 1000 });
    }
  };

  const onShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: t("dashboard.sharePost"),
          text: post?.content,
          url: window.location.href,
        })
        .catch((error) =>
          toast.error(t("dashboard.sharePostFailed"), { autoClose: 1000 })
        );
    } else {
      toast.info(t("dashboard.browserNotSupported"));
    }
  };

  return (
    <>
      <Card className="border-0 shadow-sm mb-6 bg-white sm:max-w-full max-w-sm hover:shadow-lg transition-all duration-300">
        {/* Post Header */}
        <motion.div
          className="flex items-center justify-between px-4"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={getUserImageSrc(post?.user?.avatar)} />
              </Avatar>
            </motion.div>
            <div>
              <p className="text-md font-semibold text-gray-900">
                {post?.user?.nick_name}
              </p>
              <p className="text-xs text-gray-500">
                {convertToDate(post?.created_at)} {formatTime(post?.created_at)}
              </p>
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOptionsModalOpen(true)}
              className="cursor-pointer hover:bg-gray-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Post Content */}
        <CardContent className="px-4 pb-4">
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* file */}
            {post?.file &&
              (() => {
                const fileUrl = getSupabaseFileUrl(post.file);
                const ext = post.file.split(".").pop()?.toLowerCase();

                if (!fileUrl) return null;

                if (["png", "jpg", "jpeg", "gif"].includes(ext!)) {
                  return (
                    <motion.img
                      src={fileUrl}
                      alt="Post Image"
                      className="w-full h-auto max-h-full object-cover rounded-md"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    />
                  );
                }

                if (["mp4", "webm", "ogg"].includes(ext!)) {
                  return (
                    <motion.video
                      controls
                      className="w-full rounded-md max-h-96"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <source src={fileUrl} type={`video/${ext}`} />
                      {t("dashboard.browserNotSupportVideo")}
                    </motion.video>
                  );
                }

                // Các loại file khác (pdf, docx, xlsx...)
                return (
                  <motion.div
                    className="flex items-center space-x-3 p-3 border rounded-md bg-gray-50"
                    whileHover={{ scale: 1.02, backgroundColor: "#f8fafc" }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-2xl">📄</span>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {post?.original_name.split("/").pop()}
                    </a>
                  </motion.div>
                );
              })()}

            {/* Caption */}
            {post?.content ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <p className="text-[16px] text-gray-900">
                  <span className="font-semibold">{post?.user?.nick_name}</span>{" "}
                  {post?.content}
                </p>
              </motion.div>
            ) : (
              <div className="mb-[-20px]"></div>
            )}
          </motion.div>
        </CardContent>

        {/* Post Actions */}
        <motion.div
          className="px-4 pb-4"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4">
              <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onLike}
                  className="hover:bg-gray-100 cursor-pointer"
                >
                  <Heart
                    className={`h-6 w-6 ${
                      liked ? "fill-red-500 text-red-500" : "text-gray-700"
                    }`}
                  />
                  <span className="mt-1">{likes?.length}</span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCommentModalOpen(true)}
                  className="hover:bg-gray-100 cursor-pointer"
                >
                  <MessageCircle className="h-6 w-6 text-gray-700" />
                  <span className="mt-1">
                    {post?.comments?.[0]?.count ?? 0}
                  </span>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.2, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100 cursor-pointer mt-1"
                  onClick={onShare}
                >
                  <Send className="h-6 w-6 text-gray-700" />
                </Button>
              </motion.div>
            </div>
            <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSaved(!isSaved)}
                className="hover:bg-gray-100"
              >
                <Bookmark
                  className={`h-6 w-6 ${
                    isSaved ? "fill-gray-900 text-gray-900" : "text-gray-700"
                  }`}
                />
              </Button>
            </motion.div>
          </div>

          {/* Likes and Comments */}
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-900">
              {t("dashboard.likes")}
            </p>
            <button
              onClick={() => setIsCommentModalOpen(true)}
              className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              {t("dashboard.viewAllComments")}
            </button>
          </div>
        </motion.div>
      </Card>

      {/* Options Modal */}
      <Dialog open={isOptionsModalOpen} onOpenChange={setIsOptionsModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-0">
          <DialogHeader className="pt-4">
            <DialogTitle className="text-center text-lg">
              {t("dashboard.options")}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col divide-y">
            {post.userId == user?.id ? (
              <>
                <motion.label
                  onClick={() => {
                    setEditingPost(post);
                    setIsEdit(true);
                    setIsOpenModal(true);
                  }}
                  className="py-3 border-t font-medium hover:bg-gray-50 text-center cursor-pointer text-blue-500"
                  whileHover={{ backgroundColor: "#f9fafb" }}
                >
                  {t("dashboard.edit")}
                </motion.label>
                <motion.label
                  onClick={() => setIsOpenDeleteModal(true)}
                  className="py-3 font-medium hover:bg-gray-50 text-center cursor-pointer text-red-500"
                  whileHover={{ backgroundColor: "#f9fafb" }}
                >
                  {t("dashboard.delete")}
                </motion.label>
                <motion.label
                  className="py-3 font-medium hover:bg-gray-50 text-center cursor-pointer"
                  whileHover={{ backgroundColor: "#f9fafb" }}
                >
                  {t("dashboard.goToPost")}
                </motion.label>
                <motion.label
                  className="py-3 font-medium hover:bg-gray-50 text-center cursor-pointer"
                  whileHover={{ backgroundColor: "#f9fafb" }}
                >
                  {t("dashboard.aboutAccount")}
                </motion.label>
                <button
                  className="py-3 font-medium cursor-pointer"
                  onClick={() => setIsOptionsModalOpen(false)}
                >
                  {t("dashboard.close")}
                </button>
              </>
            ) : (
              <>
                <motion.label
                  className="py-3 text-red-600 font-medium hover:bg-gray-50 text-center cursor-pointer"
                  whileHover={{ backgroundColor: "#f9fafb" }}
                >
                  {t("dashboard.report")}
                </motion.label>
                <motion.label
                  className="py-3 text-red-600 font-medium hover:bg-gray-50 text-center cursor-pointer"
                  whileHover={{ backgroundColor: "#f9fafb" }}
                >
                  {t("dashboard.unfollow")}
                </motion.label>
                <motion.label
                  className="py-3 font-medium hover:bg-gray-50 text-center cursor-pointer"
                  whileHover={{ backgroundColor: "#f9fafb" }}
                >
                  {t("dashboard.goToPost")}
                </motion.label>
                <motion.label
                  className="py-3 font-medium hover:bg-gray-50 text-center cursor-pointer"
                  whileHover={{ backgroundColor: "#f9fafb" }}
                >
                  {t("dashboard.aboutAccount")}
                </motion.label>
                <button
                  className="py-3 font-medium cursor-pointer"
                  onClick={() => setIsOptionsModalOpen(false)}
                >
                  {t("dashboard.close")}
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <PostModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        postId={post.id}
        post={post}
        userId={user?.id}
        highlightCommentId={null}
      />

      <CreateOrUpdatePostModal
        isOpen={isOpenModal}
        onClose={() => {
          setIsOpenModal(false);
          setIsEdit(false);
          setEditingPost(null);
        }}
        isEdit={isEdit}
        post={editingPost}
      />

      {/* Modal xác nhận xóa bài viết */}
      <Dialog
        open={isOpenDeleteModal}
        onOpenChange={() => setIsOpenDeleteModal(false)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl p-0">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="text-center text-lg">
              {t("dashboard.confirmDeletePost")}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col divide-y">
            <motion.button
              className="py-3 text-red-600 border-t font-medium hover:bg-gray-50 text-center cursor-pointer"
              onClick={() => {
                handleDeletePost(post.id);
                setIsOpenDeleteModal(false);
                setIsOptionsModalOpen(false);
              }}
              whileHover={{ backgroundColor: "#f9fafb" }}
            >
              {t("dashboard.delete")}
            </motion.button>
            <button
              className="py-3 font-medium cursor-pointer"
              onClick={() => setIsOpenDeleteModal(false)}
            >
              {t("dashboard.close")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
