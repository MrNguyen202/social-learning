"use client";

import type React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Heart, Send } from "lucide-react";
import { useState } from "react";
import { DialogTitle } from "@radix-ui/react-dialog";

interface Comment {
  id: number;
  username: string;
  avatar: string;
  text: string;
  timeAgo: string;
  likes: number;
  isLiked: boolean;
}

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: number;
    username: string;
    avatar: string;
    originalSentence: string;
    rewrittenSentence: string;
    caption: string;
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

export function CommentModal({ isOpen, onClose, post }: CommentModalProps) {
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
          <DialogTitle className="hidden">Comments</DialogTitle>
        </DialogHeader>
        <div className="flex h-full">
          {/* Left side - Post content */}
          <div className="flex-1 bg-black flex items-center justify-center">
            <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-8 m-8 max-w-md">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Original:
                  </p>
                  <p className="text-gray-800 line-through opacity-75">
                    {post.originalSentence}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Rewritten:
                  </p>
                  <p className="text-gray-900 font-medium">
                    {post.rewrittenSentence}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Comments */}
          <div className="w-[450px] border-l flex flex-col">
            {/* Header */}
            <DialogHeader className="p-4 border-b">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                    {post.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-sm">{post.username}</span>
              </div>
            </DialogHeader>

            {/* Caption */}
            <div className="p-4 border-b">
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                    {post.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{post.username}</span>{" "}
                    {post.caption}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                      {comment.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
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
