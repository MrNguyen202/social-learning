"use client";

import useAuth from "@/hooks/useAuth";
import { PostCard } from "./PostCard";
import { useEffect, useState } from "react";
import { fetchPosts } from "@/app/api/post/route";

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

var limit = 0;

export function MainFeed() {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPost, setLoadingPost] = useState(false);

  useEffect(() => {
    if (loading || !user?.id) return;
    getPosts();
  }, [loading, user]);

  const getPosts = async () => {
    limit += 10;
    setLoadingPost(true);
    let res = await fetchPosts(user?.id, limit);
    if (res.success) {
      setPosts(res.data);
    }
    setLoadingPost(false);
  };

  return (
    <div className="space-y-0">
      {posts.map((post) => (
        <PostCard key={post?.id} post={post} />
      ))}
      {loadingPost && <p className="text-center text-gray-500">Đang tải...</p>}{" "}
      {posts.length === 0 && !loadingPost && (
        <p className="text-center text-gray-500">Chưa có bài viết nào</p>
      )}
    </div>
  );
}
