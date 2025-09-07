"use client";

import useAuth from "@/hooks/useAuth";
import { PostCard } from "./PostCard";
import { useEffect, useState } from "react";
import { fetchPosts } from "@/app/api/post/route";

interface Post {
  id: number; // int8 trong DB
  content: string;
  created_at: string;
  file?: string | null;
  original_name?: string | null;
  user?: {
    id: string;
    name: string;
    nick_name: string;
    avatar: string;
  };
}

var limit = 0;

export function MainFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPosts();
  }, []);

  const getPosts = async () => {
    limit += 10;
    setLoading(true);
    let res = await fetchPosts(limit, user?.id);
    if (res.success) {
      setPosts(res.data);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-0">
      {posts.map((post) => (
        <PostCard key={post?.id} post={post} />
      ))}
      {loading && <p className="text-center text-gray-500">Đang tải...</p>}{" "}
      {posts.length === 0 && !loading && (
        <p className="text-center text-gray-500">Chưa có bài viết nào</p>
      )}
    </div>
  );
}
