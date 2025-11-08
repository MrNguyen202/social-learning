"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Eye, Trash2, Heart, MessageCircle } from "lucide-react";
import { toast } from "react-toastify";
import {
  deleteComment,
  deletePostByAdmin,
  loadPost,
  loadPostComments,
} from "@/app/apiClient/admin/post";
import { getSupabaseFileUrl } from "@/app/apiClient/image/image";
import { useLanguage } from "@/components/contexts/LanguageContext";

type Post = {
  id: number;
  content: string;
  file?: string;
  original_name?: string;
  created_at: string;
  user: {
    name: string;
    id: string;
  };
  likes_count: any;
  comments_count: any;
};

type Comment = {
  id: number;
  content: string;
  created_at: string;
  user: {
    name: string;
    id: string;
  };
};

export default function Social() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteCommentDialogOpen, setDeleteCommentDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const [postsLoading, setPostsLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const [deletingComment, setDeletingComment] = useState(false);

  const fetchPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const response = await loadPost({ search, fromDate, toDate });
      if (response.success) {
        setPosts(response.data);
      } else {
        toast.error(response.message || "Failed to load posts");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred fetching posts");
    } finally {
      setPostsLoading(false);
    }
  }, [search, fromDate, toDate]);

  const fetchComments = useCallback(async () => {
    if (!selectedPost) return;

    setCommentsLoading(true);
    try {
      const response = await loadPostComments(selectedPost.id.toString());
      if (response.success) {
        setComments(response.data);
      } else {
        toast.error(response.message || "Failed to load comments");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred fetching comments");
    } finally {
      setCommentsLoading(false);
    }
  }, [selectedPost]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchPosts]);

  useEffect(() => {
    if (detailDialogOpen && selectedPost) {
      fetchComments();
    } else {
      setComments([]);
    }
  }, [detailDialogOpen, selectedPost, fetchComments]);

  const handleSearch = () => {
    fetchPosts();
  };

  const handleViewPost = (post: Post) => {
    setSelectedPost(post);
    setDetailDialogOpen(true);
  };

  const handleDeletePostClick = (id: number) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeletePostConfirm = async () => {
    if (itemToDelete) {
      setDeletingPost(true);
      try {
        const response = await deletePostByAdmin(itemToDelete.toString());
        if (response.success) {
          toast.success("Post deleted successfully!");
          setDeleteDialogOpen(false);
          setItemToDelete(null);
          setDetailDialogOpen(false);
          fetchPosts();
        } else {
          toast.error(response.message || "Failed to delete post");
        }
      } catch (error: any) {
        toast.error(error.message || "An error occurred");
      } finally {
        setDeletingPost(false);
      }
    }
  };

  const handleDeleteCommentClick = (id: number) => {
    setItemToDelete(id);
    setDeleteCommentDialogOpen(true);
  };

  const handleDeleteCommentConfirm = async () => {
    if (itemToDelete) {
      setDeletingComment(true);
      try {
        const response = await deleteComment(itemToDelete.toString());
        if (response.success) {
          toast.success("Comment deleted successfully!");
          setDeleteCommentDialogOpen(false);
          setItemToDelete(null);
          fetchComments();
        } else {
          toast.error(response.message || "Failed to delete comment");
        }
      } catch (error: any) {
        toast.error(error.message || "An error occurred");
      } finally {
        setDeletingComment(false);
      }
    }
  };

  return (
    <div className="flex-1 pr-6 py-4 pl-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Social Content Moderation</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Search posts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} size="icon">
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              <Input
                type="date"
                value={fromDate ?? ""}
                onChange={(e) => setFromDate(e.target.value || null)}
                className="w-40"
              />
              <Input
                type="date"
                value={toDate ?? ""}
                onChange={(e) => setToDate(e.target.value || null)}
                className="w-40"
              />
            </div>

            {/* Bảng dữ liệu */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>{t("dashboard.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {postsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : posts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-gray-500"
                      >
                        No posts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="max-w-md">
                          <p className="line-clamp-2">{post.content}</p>
                        </TableCell>
                        <TableCell>{post.user?.name}</TableCell>
                        <TableCell>
                          <div className="flex gap-3 text-sm">
                            <span className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              {post.likes_count[0]?.count}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              {post.comments_count[0]?.count}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(post.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewPost(post)}
                              className="cursor-pointer hover:bg-gray-200"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePostClick(post.id)}
                              className="cursor-pointer hover:bg-gray-200"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Post Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">
                  Posted by {selectedPost.user?.name || "N/A"}
                </p>
                <p className="text-base">{selectedPost.content}</p>

                {selectedPost?.file &&
                  (() => {
                    const fileUrl = getSupabaseFileUrl(selectedPost.file);
                    const ext = selectedPost.file
                      .split(".")
                      .pop()
                      ?.toLowerCase();

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
                          {t("dashboard.videoNotSupported")}
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
                          {selectedPost?.original_name}
                        </a>
                      </div>
                    );
                  })()}
              </div>

              <div>
                <h4 className="font-semibold mb-4">
                  {t("dashboard.comments")} ({comments.length})
                </h4>
                {commentsLoading ? (
                  <Skeleton className="h-32 w-full" />
                ) : comments.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">{t("dashboard.noComment")}</p>
                ) : (
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-3 border rounded-lg flex justify-between items-start"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {comment.user?.name || "N/A"}
                          </p>
                          <p className="text-sm mt-1">{comment.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(comment.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCommentClick(comment.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Post Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this post and all its comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("dashboard.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePostConfirm}
              disabled={deletingPost}
            >
              {deletingPost
                ? `${t("dashboard.deleting")}`
                : `${t("dashboard.delete")}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Comment Dialog */}
      <AlertDialog
        open={deleteCommentDialogOpen}
        onOpenChange={setDeleteCommentDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this comment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("dashboard.deleting")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCommentConfirm}
              disabled={deletingComment}
            >
              {deletingComment
                ? `${t("dashboard.deleting")}`
                : `${t("dashboard.delete")}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
