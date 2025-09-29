"use client";

import useAuth from "@/hooks/useAuth";
import { PostCard } from "./PostCard";
import { useEffect, useState, useRef } from "react";
import { fetchPosts } from "@/app/api/post/route";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/components/contexts/LanguageContext";

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

export function MainFeed() {
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPost, setLoadingPost] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const limit = 10;
  const isInitialLoad = useRef(true);

  // Load dữ liệu ban đầu
  useEffect(() => {
    if (loading || !user?.id) return;

    if (isInitialLoad.current) {
      loadInitialPosts();
      isInitialLoad.current = false;
    }
  }, [loading, user?.id]);

  // Lắng nghe realtime posts
  useEffect(() => {
    const postChannel = supabase
      .channel("posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => {
          const newPost = payload.new as Post;
          setPosts((prev) => [newPost, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "posts" },
        (payload) => {
          const updatedPost = payload.new as Post;
          setPosts((prev) =>
            prev.map((p) =>
              p.id === updatedPost.id ? { ...p, ...updatedPost } : p
            )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "posts" },
        (payload) => {
          const deletedId = payload.old.id;
          setPosts((prev) => prev.filter((p) => p.id !== deletedId));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postChannel);
    };
  }, []);

  const loadInitialPosts = async () => {
    setLoadingPost(true);
    const res = await fetchPosts(user?.id, limit, 0);
    if (res.success) {
      setPosts(res.data);
      setOffset(limit);
      setHasMorePosts(res.data.length === limit);
    }
    setLoadingPost(false);
  };

  const loadMorePosts = async () => {
    setLoadingPost(true);
    const res = await fetchPosts(user?.id, limit, offset);
    if (res.success) {
      setPosts((prevPosts) => [...prevPosts, ...res.data]);
      setOffset((prevOffset) => prevOffset + limit);
      setHasMorePosts(res.data.length === limit);
    }
    setLoadingPost(false);
  };

  const handleRemovePostFromList = (postId: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div className="space-y-0">
      {posts.map((post) => (
        <PostCard
          key={post?.id}
          post={post}
          onDelete={handleRemovePostFromList}
        />
      ))}
      {loadingPost && <p className="text-center text-gray-500">{t("dashboard.loading")}</p>}
      {posts.length === 0 && !loadingPost && (
        <p className="text-center text-gray-500">{t("dashboard.noPosts")}</p>
      )}
      {posts.length > 0 && !loadingPost && hasMorePosts && (
        <div className="text-center mt-4">
          <button
            onClick={loadMorePosts}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white hover:text-white rounded-full p-6 text-[16px] cursor-pointer"
            disabled={loadingPost}
          >
            {t("dashboard.loadMore")}
          </button>
        </div>
      )}
      {posts.length > 0 && !loadingPost && !hasMorePosts && (
        <div className="text-center mt-4 text-gray-500">{t("dashboard.noMorePosts")}</div>
      )}
    </div>
  );
}
