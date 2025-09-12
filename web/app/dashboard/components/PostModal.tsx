"use client";

import type React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Heart, Send } from "lucide-react";
import { useState } from "react";
import { getSupabaseFileUrl, getUserImageSrc } from "@/app/api/image/route";
import { convertToDate, formatTime } from "@/utils/formatTime";

interface Comment {
  id: number;
  username: string;
  avatar: string;
  text: string;
  timeAgo: string;
  likes: number;
  isLiked: boolean;
}

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: number;
    content: string;
    created_at: string;
    file?: string | null;
    original_name?: string | null;
    user?: {
      id: string;
      name: string;
      nick_name: string;
      avatar?: string | null;
    };
  };
}

const mockComments: Comment[] = [
  {
    id: 1,
    username: "grammar_guru",
    avatar: "/globe.svg?height=32&width=32",
    text: "Tuyệt vời! Câu viết lại rất tự nhiên và hay 👏",
    timeAgo: "2h",
    likes: 5,
    isLiked: false,
  },
  {
    id: 2,
    username: "english_ace",
    avatar: "/globe.svg?height=32&width=32",
    text: "Mình cũng đang học cách viết như thế này. Cảm ơn bạn đã chia sẻ!",
    timeAgo: "1h",
    likes: 3,
    isLiked: true,
  },
  {
    id: 3,
    username: "vocab_master",
    avatar: "/globe.svg?height=32&width=32",
    text: "Từ 'contentment' rất hay! Mình sẽ nhớ để dùng 📝",
    timeAgo: "45m",
    likes: 8,
    isLiked: false,
  },
];

export function PostModal({ isOpen, onClose, post }: PostModalProps) {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState("");

  const handleLikeComment = (commentId: number) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment
      )
    );
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now(),
        username: "you",
        avatar: "/default-avatar-profile-icon.jpg",
        text: newComment,
        timeAgo: "now",
        likes: 0,
        isLiked: false,
      };
      setComments([...comments, comment]);
      setNewComment("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddComment();
    }
  };

  return (
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
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getUserImageSrc(post.user?.avatar)} />
                </Avatar>
                <span className="font-semibold text-sm">
                  {post.user?.nick_name}
                </span>
              </div>
            </DialogHeader>

            {/* Caption */}
            <div className="p-4 border-b">
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getUserImageSrc(post.user?.avatar)} />
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">
                      {post.user?.nick_name}
                    </span>{" "}
                    {post.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {convertToDate(post.created_at)}{" "}
                    {formatTime(post.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.avatar || "/placeholder.svg"} />
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">{comment.username}</span>{" "}
                      {comment.text}
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-xs text-gray-500">{comment.timeAgo}</p>
                      <p className="text-xs text-gray-500">
                        {comment.likes} likes
                      </p>
                      <button className="text-xs text-gray-500 font-semibold">
                        Reply
                      </button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleLikeComment(comment.id)}
                  >
                    <Heart
                      className={`h-3 w-3 ${
                        comment.isLiked
                          ? "fill-red-500 text-red-500"
                          : "text-gray-400"
                      }`}
                    />
                  </Button>
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
                  className="flex-1 border-0 focus-visible:ring-0 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="text-blue-500 hover:text-blue-600 disabled:text-gray-300"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
