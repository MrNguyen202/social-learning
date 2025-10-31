"use client";

import { getSupabaseFileUrl } from "@/app/apiClient/image/image";
import { fetchPostsByUserId } from "@/app/apiClient/post/post";
import { Camera } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { PostModal } from "@/app/dashboard/components/PostModal";

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
  user,
}: {
  userSearch: User | any;
  user: User | any;
}) {
  const { t } = useLanguage();
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
    const res = await fetchPostsByUserId(userSearch?.id);
    if (res.success) {
      setPosts(res.data);
    }
    setLoadingPost(false);
  };

  if (loadingPost) {
    return (
      <div className="flex justify-center items-center p-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!loadingPost && posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="p-4 sm:p-8 text-center"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-foreground flex items-center justify-center">
            <Camera className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              {t("dashboard.sharePost")}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              {t("dashboard.noPosts")}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-8 mt-2 max-lg:pl-2">
        <AnimatePresence>
          {posts.map((post, index) => {
            const fileUrl = post.file ? getSupabaseFileUrl(post.file) : null;
            const ext = post.file?.split(".").pop()?.toLowerCase();

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="relative aspect-square cursor-pointer group"
                onClick={() => {
                  setSelectedPost(post);
                  setIsCommentModalOpen(true);
                }}
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
                    <p className="text-sm text-gray-500 p-2 text-center">
                      {post.original_name}
                    </p>
                  </div>
                )}
                {!fileUrl && (
                  <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-sm">
                    <p className="text-sm text-gray-500 p-2 text-center line-clamp-3">
                      {post.content}
                    </p>
                  </div>
                )}

                {/* Overlay hover effect */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/30 rounded-sm"
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
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
