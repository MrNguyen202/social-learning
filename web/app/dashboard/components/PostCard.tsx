"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { getSupabaseFileUrl, getUserImageSrc } from "@/app/api/image/route";
import { convertToDate, formatTime } from "@/utils/formatTime";
import { PostModal } from "./PostModal";

interface PostCardProps {
  post: any;
}

export function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

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
                onClick={() => setIsLiked(!isLiked)}
                className="hover:bg-gray-100 cursor-pointer"
              >
                <Heart
                  className={`h-6 w-6 ${
                    isLiked ? "fill-red-500 text-red-500" : "text-gray-700"
                  }`}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCommentModalOpen(true)}
                className="hover:bg-gray-100 cursor-pointer"
              >
                <MessageCircle className="h-6 w-6 text-gray-700" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100 cursor-pointer"
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
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="text-center text-lg">Tùy chọn</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col divide-y">
            <label className="py-3 text-red-600 border-t font-medium hover:bg-gray-50 text-center cursor-pointer">
              Báo cáo
            </label>
            <label className="py-3 text-red-600 border-t font-medium hover:bg-gray-50 text-center cursor-pointer">
              Bỏ theo dõi
            </label>
            <label className="py-3 border-t font-medium hover:bg-gray-50 text-center cursor-pointer">
              Đi đến bài viết
            </label>
            <label className="py-3 border-t font-medium hover:bg-gray-50 text-center cursor-pointer">
              Giới thiệu về tài khoản này
            </label>
            <DialogClose asChild>
              <button
                className="py-3 font-medium cursor-pointer"
                onClick={() => setIsOptionsModalOpen(false)}
              >
                Hủy
              </button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      <PostModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        post={post}
      />
    </>
  );
}
