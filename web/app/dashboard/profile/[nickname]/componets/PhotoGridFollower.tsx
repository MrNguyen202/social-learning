"use client";

import { getSupabaseFileUrl } from "@/app/api/image/route";
import { fetchPostsByUserId } from "@/app/api/post/route";
import { PostModal } from "@/app/dashboard/components/PostModal";
import { Camera } from "lucide-react";
import { useEffect, useState } from "react";

interface Post {
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
}

interface User {
  id: string;
  name: string;
  nick_name: string;
  avatar?: string;
  bio?: string;
}

export default function PhotoGridFollower({
  userSearch,
}: {
  userSearch: User | any;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPost, setLoadingPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  useEffect(() => {
    if (userSearch?.id) {
      getPosts();
    }
  }, [userSearch?.id]);

  const getPosts = async () => {
    setLoadingPost(true);
    let res = await fetchPostsByUserId(userSearch?.id);
    if (res.success) {
      setPosts(res.data);
    }
    setLoadingPost(false);
  };

  if (loadingPost) {
    return <p className="text-center text-gray-500">Đang tải...</p>;
  }

  if (!loadingPost && posts.length === 0) {
    return (
      <div className="p-4 sm:p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-foreground flex items-center justify-center">
            <Camera className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              Chia sẻ ảnh
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              Khi bạn chia sẻ ảnh, ảnh sẽ xuất hiện trên trang cá nhân của bạn.
            </p>
            <button className="text-xs sm:text-sm text-accent font-medium">
              Chia sẻ ảnh đầu tiên
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-8 mt-2 max-lg:pl-2">
        {posts.map((post) => {
          const fileUrl = post.file ? getSupabaseFileUrl(post.file) : null;

          const ext = post.file?.split(".").pop()?.toLowerCase();
          return (
            <div
              key={post.id}
              className="relative aspect-square cursor-pointer group"
              onClick={() => (
                setSelectedPost(post), setIsCommentModalOpen(true)
              )}
            >
              {fileUrl && ["png", "jpg", "jpeg", "gif"].includes(ext!) && (
                <img
                  src={fileUrl}
                  alt="Post"
                  className="w-full h-full object-cover"
                />
              )}
              {fileUrl && ["mp4", "webm", "ogg"].includes(ext!) && (
                <video className="w-full h-full object-cover">
                  <source src={fileUrl} type={`video/${ext}`} />
                </video>
              )}
              {fileUrl && ["docx", "pdf", "xlsx"].includes(ext!) && (
                <div className="flex items-center justify-center w-full h-full bg-gray-100">
                  <p className="text-sm text-gray-500">{post.original_name}</p>
                </div>
              )}
              {!fileUrl && (
                <div className="flex items-center justify-center w-full h-full bg-gray-100">
                  <p className="text-sm text-gray-500">{post.content}</p>
                </div>
              )}

              {/* Overlay hiệu ứng hover */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition" />
            </div>
          );
        })}
      </div>

      {selectedPost && (
        <PostModal
          isOpen={isCommentModalOpen}
          onClose={() => setIsCommentModalOpen(false)}
          postId={selectedPost.id}
          post={selectedPost}
          userId={userSearch?.id}
          highlightCommentId={null}
        />
      )}
    </>
  );
}
