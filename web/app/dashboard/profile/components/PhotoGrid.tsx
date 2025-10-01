"use client";

import { getSupabaseFileUrl } from "@/app/api/image/route";
import { fetchPostsByUserId } from "@/app/api/post/route";
import useAuth from "@/hooks/useAuth";
import { Camera } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { PostModal } from "../../components/PostModal";

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

export default function PhotoGrid() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPost, setLoadingPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && user?.id) {
      getPosts();
    }
  }, [user?.id, loading]);

  const getPosts = async () => {
    setLoadingPost(true);
    const res = await fetchPostsByUserId(user?.id);
    if (res.success) {
      setPosts(res.data);
    }
    setLoadingPost(false);
  };

  if (loadingPost) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-gray-500"
      >
        {t("dashboard.loading")}
      </motion.p>
    );
  }

  if (!loadingPost && posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 sm:p-8 text-center"
      >
        <div className="flex flex-col items-center gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-foreground flex items-center justify-center"
          >
            <Camera className="w-6 h-6 sm:w-8 sm:h-8" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              {t("dashboard.sharePhotos")}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              {t("dashboard.sharePhotosDesc")}
            </p>
            <button className="text-xs sm:text-sm text-accent font-medium hover:underline transition-all">
              {t("dashboard.shareFirstPhoto")}
            </button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-8 mt-2">
        {posts.map((post, index) => {
          const fileUrl = post.file ? getSupabaseFileUrl(post.file) : null;
          const ext = post.file?.split(".").pop()?.toLowerCase();

          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              className="relative aspect-square cursor-pointer group"
              onClick={() => (
                setSelectedPost(post), setIsCommentModalOpen(true)
              )}
            >
              {fileUrl && ["png", "jpg", "jpeg", "gif"].includes(ext!) && (
                <img
                  src={fileUrl || "/placeholder.svg"}
                  alt="Post"
                  className="w-full h-full object-cover rounded-sm"
                />
              )}
              {fileUrl && ["mp4", "webm", "ogg"].includes(ext!) && (
                <video className="w-full h-full object-cover rounded-sm">
                  <source src={fileUrl} type={`video/${ext}`} />
                </video>
              )}
              {fileUrl && ["docx", "pdf", "xlsx"].includes(ext!) && (
                <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-sm">
                  <p className="text-sm text-gray-500 p-2 text-center break-words">
                    {post.original_name}
                  </p>
                </div>
              )}
              {!fileUrl && (
                <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-sm">
                  <p className="text-sm text-gray-500 p-2 text-center break-words line-clamp-3">
                    {post.content}
                  </p>
                </div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/30 rounded-sm"
              />
            </motion.div>
          );
        })}
      </div>

      {selectedPost && (
        <PostModal
          isOpen={isCommentModalOpen}
          onClose={() => setIsCommentModalOpen(false)}
          postId={selectedPost.id}
          post={selectedPost}
          userId={user?.id}
          highlightCommentId={null}
        />
      )}
    </>
  );
}
