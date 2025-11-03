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
import { deleteComment, deletePostByAdmin, loadPost, loadPostComments } from "@/app/apiClient/admin/post";

// 2. Định nghĩa Type cho dữ liệu (để code sạch hơn)
type Post = {
  id: number;
  content: string;
  file?: string;
  original_name?: string;
  created_at: string;
  user: {
    // Thay vì user_name
    name: string;
    id: string;
  };
  likes_count: number;
  comments_count: number;
};

type Comment = {
  id: number;
  content: string;
  created_at: string;
  user: {
    // Thay vì user_name
    name: string;
    id: string;
  };
};

export default function Social() {
  // State cho Filters
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);

  // State cho Data
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  // State cho Modals
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteCommentDialogOpen, setDeleteCommentDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // State cho trạng thái Loading
  const [postsLoading, setPostsLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const [deletingComment, setDeletingComment] = useState(false);

  // 3. Hàm Fetch Posts (thay thế useLoadAction)
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
  }, [search, fromDate, toDate]); // Chỉ chạy lại khi filter thay đổi

  // 4. Hàm Fetch Comments (thay thế useLoadAction)
  const fetchComments = useCallback(async () => {
    if (!selectedPost) return; // Không fetch nếu không có post nào được chọn

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
  }, [selectedPost]); // Chỉ chạy lại khi selectedPost thay đổi

  // 5. useEffect để tải Posts (khi filter thay đổi)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 500); // Thêm debounce 500ms để tránh gọi API liên tục khi gõ
    return () => clearTimeout(timer);
  }, [fetchPosts]); // fetchPosts đã bao gồm các dependencies

  // 6. useEffect để tải Comments (khi modal mở)
  useEffect(() => {
    if (detailDialogOpen && selectedPost) {
      fetchComments();
    } else {
      setComments([]); // Xóa comments cũ khi đóng modal
    }
  }, [detailDialogOpen, selectedPost, fetchComments]);

  // 7. Cập nhật các hàm xử lý
  const handleSearch = () => {
    fetchPosts(); // Gọi fetchPosts khi bấm nút search
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
          setDetailDialogOpen(false); // Đóng modal chi tiết nếu đang mở
          fetchPosts(); // Tải lại danh sách posts
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
          fetchComments(); // Tải lại danh sách comments
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
    <div className="flex-1 px-6 py-3">
      <Card>
        <CardHeader>
          <CardTitle>Social Content Moderation</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Filters (Giữ nguyên JSX) */}
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

            {/* Bảng dữ liệu (Cập nhật logic mapping) */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>{/* ... (Giữ nguyên JSX) ... */}</TableHeader>
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
                        {/* 8. Sửa lại cách truy cập tên user */}
                        <TableCell>{post.user?.name || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex gap-3 text-sm">
                            <span className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              {/* {post.likes_count} */}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              {/* {post.comments_count} */}
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
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePostClick(post.id)}
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

      {/* Post Detail Dialog (Cập nhật logic mapping) */}
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
                {selectedPost.file && (
                  <div className="mt-4">
                    <img
                      src={selectedPost.file} // <-- Cần đảm bảo đây là URL hợp lệ
                      alt={selectedPost.original_name}
                      className="rounded-lg max-h-96 object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-4">
                  Comments ({comments.length})
                </h4>
                {commentsLoading ? (
                  <Skeleton className="h-32 w-full" />
                ) : comments.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No comments</p>
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

      {/* Delete Post Dialog (Cập nhật state) */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this post and all its comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePostConfirm}
              disabled={deletingPost}
            >
              {deletingPost ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Comment Dialog (Cập nhật state) */}
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCommentConfirm}
              disabled={deletingComment}
            >
              {deletingComment ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
