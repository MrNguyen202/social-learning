"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";
import { addComment, deleteComment, fetchComments } from "@/app/api/post/route";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, Send } from "lucide-react";
import { getSupabaseFileUrl, getUserImageSrc } from "@/app/api/image/route";
import { convertToDate, formatTime } from "@/utils/formatTime";
import { CreateOrUpdatePostModal } from "./CreateOrUpdatePost";
import { createNotification } from "@/app/api/notification/route";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number;
  post: any;
  userId: string;
  highlightCommentId: number | null;
}

export function PostModal({
  isOpen,
  onClose,
  postId,
  post,
  userId,
  highlightCommentId,
}: PostModalProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);

  // fetch comments khi mở modal
  useEffect(() => {
    if (isOpen && postId) {
      const loadComments = async () => {
        setLoading(true);
        const res = await fetchComments(postId);
        if (res.success) {
          setComments(res.data);
        }
        setLoading(false);
      };
      loadComments();
    }
  }, [isOpen, postId]);

  // realtime comments (INSERT + DELETE)
  useEffect(() => {
    if (!postId) return;

    const commentChannel = supabase
      .channel(`comments:${postId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `postId=eq.${postId}`,
        },
        (payload) => {
          setComments((prev) => [payload.new, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "comments",
          filter: `postId=eq.${postId}`,
        },
        (payload) => {
          setComments((prev) => prev.filter((c) => c.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentChannel);
    };
  }, [postId]);

  // thêm comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    let data = {
      userId: userId,
      postId: postId,
      content: newComment,
    };
    try {
      const res = await addComment(data);
      if (res.success) {
        if (userId !== post.user.id) {
          // Gửi thông báo cho chủ bài viết nếu người bình luận không phải là họ
          let notify = {
            senderId: userId,
            receiverId: post.user.id,
            title: "Đã bình luận bài viết của bạn",
            content: JSON.stringify({
              postId: post.id,
              commentId: res.data.id,
            }),
          };
          createNotification(notify);
        }
        setNewComment("");
        toast.success("Bình luận thành công", { autoClose: 1000 });
        // Không cần setComments vì realtime sẽ tự thêm
      } else {
        toast.error("Bình luận thất bại", { autoClose: 1000 });
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra khi bình luận", { autoClose: 1000 });
    }
  };

  // xóa comment
  const handleDeleteComment = async (commentId: number) => {
    try {
      const res = await deleteComment(commentId);
      if (res.success) {
        toast.success("Xóa bình luận thành công", { autoClose: 1000 });
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.id !== commentId)
        );
      } else {
        toast.error("Xóa bình luận thất bại", { autoClose: 1000 });
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra khi xóa bình luận", { autoClose: 1000 });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddComment();
    }
  };

  const handleLikeComment = (commentId: number) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              isLiked: !comment.isLiked,
            }
          : comment
      )
    );
  };

  useEffect(() => {
    if (highlightCommentId && comments.length > 0) {
      const el = document.getElementById(`comment-${highlightCommentId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [highlightCommentId, comments]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="xl:max-w-6xl xl:h-[80vh] lg:max-w-5xl lg:h-[70vh] md:max-w-4xl md:h-[60vh] sm:max-w-2xl sm:h-[60vh] max-w-xl h-[60vh] p-0 overflow-hidden">
          <DialogHeader className="hidden">
            <DialogTitle className="hidden">Chi tiết</DialogTitle>
          </DialogHeader>
          <div className="flex h-full">
            {/* Post content */}
            <div className="flex-1 flex justify-center items-center bg-gray-50">
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
                        className="w-full h-auto max-h-full object-cover"
                      />
                    );
                  }

                  if (["mp4", "webm", "ogg"].includes(ext!)) {
                    return (
                      <video controls className="w-full max-h-160">
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
                        {post?.original_name}
                      </a>
                    </div>
                  );
                })()}
              {!post?.file && (
                <div className="p-4">
                  <p className="text-sm text-gray-500">{post?.content}</p>
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="w-[450px] border-l flex flex-col">
              {/* Header */}
              <DialogHeader className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getUserImageSrc(post?.user?.avatar)} />
                    </Avatar>
                    <span className="font-semibold text-sm">
                      {post?.user?.nick_name}
                    </span>
                  </div>
                  <div className="px-10">
                    <Button
                      onClick={() => {
                        setEditingPost(post); // state cha giữ post đang sửa
                        setIsEdit(true);
                        setIsOpenModal(true); // mở modal
                      }}
                      className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white hover:text-white rounded-full p-4 text-[14px] cursor-pointer"
                    >
                      Chỉnh sửa
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              {/* Caption */}
              <div className="p-4 border-b">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getUserImageSrc(post?.user?.avatar)} />
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">
                        {post?.user?.nick_name}
                      </span>{" "}
                      {post?.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {convertToDate(post?.created_at)}{" "}
                      {formatTime(post?.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`flex items-start space-x-3 p-2 rounded-md transition
      ${
        comment.id === highlightCommentId
          ? "bg-gradient-to-r from-pink-100 to-orange-100"
          : ""
      }
    `}
                    id={`comment-${comment.id}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={getUserImageSrc(comment?.user?.avatar)}
                      />
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">
                          {comment?.user?.nick_name}
                        </span>{" "}
                        <span className="text-xs text-gray-500 ml-2">
                          {convertToDate(comment?.created_at)}{" "}
                          {formatTime(comment?.created_at)}
                        </span>
                      </p>
                      <div className="mt-1 break-all whitespace-pre-wrap text-sm">
                        {comment?.content}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 mt-2 cursor-pointer"
                      onClick={() => handleLikeComment(comment?.id)}
                    >
                      <Heart
                        className={`h-3 w-3 ${
                          comment?.isLiked
                            ? "fill-red-500 text-red-500"
                            : "text-gray-400"
                        }`}
                      />
                    </Button>
                    {/* Nút xóa bình luận */}
                    {(post?.user?.id === userId ||
                      comment?.user?.id === userId) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500 mt-2 cursor-pointer"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <span className="text-sm">Xóa</span>
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add comment */}
              <div className="p-4 border-t">
                <div className="flex items-center space-x-3">
                  <Input
                    placeholder="Thêm bình luận..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 border-1 focus-visible:ring-0 text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="text-gray-700 hover:text-black disabled:text-gray-300 cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
    </>
  );
}
