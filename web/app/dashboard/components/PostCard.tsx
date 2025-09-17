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
import { getSupabaseFileUrl, getUserImageSrc } from "@/app/api/image/route";
import { convertToDate, formatTime } from "@/utils/formatTime";
import { PostModal } from "./PostModal";
import useAuth from "@/hooks/useAuth";
import { deletePost, likePost, unlikePost } from "@/app/api/post/route";
import { toast } from "react-toastify";
import { CreateOrUpdatePostModal } from "./CreateOrUpdatePost";

interface PostCardProps {
  post: any;
  onDelete?: (postId: number) => void;
}

export function PostCard({ post, onDelete }: PostCardProps) {
  const { user } = useAuth();
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
      let updatedLikes = likes.filter((like) => like.userId != user?.id);
      setLikes([...updatedLikes]);
      let res = await unlikePost(post?.id, user?.id);
      if (!res.success) {
        toast.error("Something went wrong!");
      }
    } else {
      // like
      let data = {
        userId: user?.id,
        postId: post?.id,
      };
      setLikes([...likes, data]);
      let res = await likePost(data);
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
        toast.success("Xóa bài viết thành công!", { autoClose: 1000 });
        onDelete?.(postId);
      }
    } catch (error) {
      toast.error("Xóa bài viết thất bại", { autoClose: 1000 });
    }
  };

  const onShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Chia sẻ bài viết",
          text: post?.content,
          url: window.location.href,
        })
        .catch((error) =>
          toast.error("Chia sẻ bài viết thất bại", { autoClose: 1000 })
        );
    } else {
      toast.info("Trình duyệt không hỗ trợ chia sẻ bài viết.");
    }
  };

  return (
    <>
      <Card className="border-0 shadow-sm mb-6 bg-white sm:max-w-full max-w-sm">
        {/* Post Header */}
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={getUserImageSrc(post?.user?.avatar)} />
            </Avatar>
            <div>
              <p className="text-md font-semibold text-gray-900">
                {post?.user?.nick_name}
              </p>
              <p className="text-xs text-gray-500">
                {convertToDate(post?.created_at)} {formatTime(post?.created_at)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOptionsModalOpen(true)}
            className="cursor-pointer"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Post Content */}
        <CardContent className="px-4 pb-4">
          <div className="space-y-4">
            {/* file */}
            {post?.file &&
              (() => {
                const fileUrl = getSupabaseFileUrl(post.file);
                const ext = post.file.split(".").pop()?.toLowerCase();

                if (!fileUrl) return null;

                if (["png", "jpg", "jpeg", "gif"].includes(ext!)) {
                  return (
                    <img
                      src={fileUrl}
                      alt="Post Image"
                      className="w-full h-auto max-h-full object-cover rounded-md"
                    />
                  );
                }

                if (["mp4", "webm", "ogg"].includes(ext!)) {
                  return (
                    <video controls className="w-full rounded-md max-h-96">
                      <source src={fileUrl} type={`video/${ext}`} />
                      Trình duyệt không hỗ trợ video.
                    </video>
                  );
                }

                // Các loại file khác (pdf, docx, xlsx...)
                return (
                  <div className="flex items-center space-x-3 p-3 border rounded-md bg-gray-50">
                    <span className="text-2xl">📄</span>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {post?.original_name.split("/").pop()}
                    </a>
                  </div>
                );
              })()}

            {/* Caption */}
            {post?.content ? (
              <div>
                <p className="text-[16px] text-gray-900">
                  <span className="font-semibold">{post?.user?.nick_name}</span>{" "}
                  {post?.content}
                </p>
              </div>
            ) : (
              <div className="mb-[-20px]"></div>
            )}
          </div>
        </CardContent>

        {/* Post Actions */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onLike}
                className="hover:bg-gray-100 cursor-pointer "
              >
                <Heart
                  className={`h-6 w-6 ${
                    liked ? "fill-red-500 text-red-500" : "text-gray-700"
                  }`}
                />
                <span className="mt-1">{likes?.length}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCommentModalOpen(true)}
                className="hover:bg-gray-100 cursor-pointer"
              >
                <MessageCircle className="h-6 w-6 text-gray-700" />
                <span className="mt-1">{post?.comments?.[0]?.count ?? 0}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100 cursor-pointer mt-1"
                onClick={onShare}
              >
                <Send className="h-6 w-6 text-gray-700" />
              </Button>
            </div>
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
          </div>

          {/* Likes and Comments */}
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-900">Lượt thích</p>
            <button
              onClick={() => setIsCommentModalOpen(true)}
              className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              Xem tất cả bình luận
            </button>
          </div>
        </div>
      </Card>

      <Dialog open={isOptionsModalOpen} onOpenChange={setIsOptionsModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-0">
          <DialogHeader className="pt-4">
            <DialogTitle className="text-center text-lg">Tùy chọn</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col divide-y">
            {post.userId == user?.id ? (
              <>
                <label
                  onClick={() => {
                    setEditingPost(post); // state cha giữ post đang sửa
                    setIsEdit(true);
                    setIsOpenModal(true); // mở modal
                  }}
                  className="py-3 border-t font-medium hover:bg-gray-50 text-center cursor-pointer text-blue-500"
                >
                  Chỉnh sửa
                </label>
                <label
                  onClick={() => setIsOpenDeleteModal(true)}
                  className="py-3 font-medium hover:bg-gray-50 text-center cursor-pointer text-red-500"
                >
                  Xóa
                </label>
                <label className="py-3 font-medium hover:bg-gray-50 text-center cursor-pointer">
                  Đi đến bài viết
                </label>
                <label className="py-3 font-medium hover:bg-gray-50 text-center cursor-pointer">
                  Giới thiệu về tài khoản này
                </label>
                <button
                  className="py-3 font-medium cursor-pointer"
                  onClick={() => setIsOptionsModalOpen(false)}
                >
                  Đóng
                </button>
              </>
            ) : (
              <>
                <label className="py-3 text-red-600 font-medium hover:bg-gray-50 text-center cursor-pointer">
                  Báo cáo
                </label>
                <label className="py-3 text-red-600 font-medium hover:bg-gray-50 text-center cursor-pointer">
                  Bỏ theo dõi
                </label>
                <label className="py-3  font-medium hover:bg-gray-50 text-center cursor-pointer">
                  Đi đến bài viết
                </label>
                <label className="py-3 font-medium hover:bg-gray-50 text-center cursor-pointer">
                  Giới thiệu về tài khoản này
                </label>
                <button
                  className="py-3 font-medium cursor-pointer"
                  onClick={() => setIsOptionsModalOpen(false)}
                >
                  Đóng
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
              Xác nhận xóa bài viết
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col divide-y">
            <button
              className="py-3 text-red-600 border-t font-medium hover:bg-gray-50 text-center cursor-pointer"
              onClick={() => {
                handleDeletePost(post.id);
                setIsOpenDeleteModal(false);
                setIsOptionsModalOpen(false);
              }}
            >
              Xóa
            </button>
            <button
              className="py-3 font-medium cursor-pointer"
              onClick={() => setIsOpenDeleteModal(false)}
            >
              Đóng
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
