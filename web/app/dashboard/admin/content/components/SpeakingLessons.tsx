"use client";

import { useState, useEffect, useCallback } from "react"; // Thêm hook
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
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
import { toast } from "react-toastify";
import {
  deleteSpeakingLesson,
  loadLevels,
  loadSpeakingLessons,
  loadTopics,
} from "@/app/apiClient/admin/content";
import { SpeakingLessonDialog } from "./SpeakingLessonDialog";

// Định nghĩa kiểu dữ liệu
type SpeakingLesson = {
  id: number;
  content: string;
  level_id: number;
  topic_id: number;
  level_name: string;
  topic_name: string;
  created_at: string;
};

type Level = { id: number; name_en: string; [key: string]: any };
type Topic = { id: number; name_en: string; [key: string]: any };

export function SpeakingLessons() {
  // State cho bộ lọc
  const [levelId, setLevelId] = useState<string | null>(null);
  const [topicId, setTopicId] = useState<string | null>(null);

  // State cho dữ liệu
  const [lessons, setLessons] = useState<SpeakingLesson[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  // State cho trạng thái
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // State cho Modals
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<number | null>(null);

  // Hàm tải dữ liệu lessons
  const fetchLessons = useCallback(async () => {
    setLessonsLoading(true);
    try {
      const response = await loadSpeakingLessons({
        levelId: levelId || undefined,
        topicId: topicId || undefined,
      });
      if (response.success) {
        setLessons(response.data);
      } else {
        toast.error(response.message || "Failed to load lessons");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLessonsLoading(false);
    }
  }, [levelId, topicId]);

  // Tải levels và topics khi component mount
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [levelsRes, topicsRes] = await Promise.all([
          loadLevels(),
          loadTopics(),
        ]);
        if (levelsRes.success) setLevels(levelsRes.data);
        if (topicsRes.success) setTopics(topicsRes.data);
      } catch (error: any) {
        toast.error("Failed to load filters: " + error.message);
      }
    };
    fetchDropdowns();
  }, []);

  // Tải lessons khi component mount hoặc khi filter thay đổi
  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  // Hàm refresh
  const refreshLessons = () => {
    fetchLessons();
  };

  // Xử lý các hành động
  const handleCreate = () => {
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setLessonToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (lessonToDelete) {
      setDeleting(true);
      try {
        const response = await deleteSpeakingLesson(lessonToDelete);
        if (response.success) {
          toast.success("Lesson deleted successfully!");
          refreshLessons(); // Tải lại danh sách
        } else {
          toast.error(response.message || "Failed to delete");
        }
      } catch (error: any) {
        toast.error(error.message || "An error occurred");
      } finally {
        setDeleting(false);
        setDeleteDialogOpen(false);
        setLessonToDelete(null);
      }
    }
  };
  console.log("Rendering SpeakingLessons component", lessons);
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Speaking Lessons</CardTitle>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4">
              <Select
                value={levelId ?? "all"}
                onValueChange={(val) => setLevelId(val === "all" ? null : val)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels.map((level) => (
                    <SelectItem key={level.id} value={level.id.toString()}>
                      {level.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={topicId ?? "all"}
                onValueChange={(val) => setTopicId(val === "all" ? null : val)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by Topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id.toString()}>
                      {topic.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bảng dữ liệu */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lessonsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : lessons.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-gray-500"
                      >
                        No speaking lessons found
                      </TableCell>
                    </TableRow>
                  ) : (
                    lessons.map((lesson: any) => {
                      // 1. TÌM TÊN DỰA TRÊN ID
                      // Tìm trong mảng 'levels' (đã có trong state)
                      const level = levels.find(
                        (l) => l.id === lesson.level_id
                      );
                      // Tìm trong mảng 'topics' (đã có trong state)
                      const topic = topics.find(
                        (t) => t.id === lesson.topic_id
                      );

                      // 2. Lấy tên (hoặc 'N/A' nếu không tìm thấy)
                      const levelName = level?.name_en || "N/A";
                      const topicName = topic?.name_en || "N/A";

                      return (
                        <TableRow key={lesson.id}>
                          <TableCell className="max-w-md">
                            <p className="line-clamp-2">{lesson.content}</p>
                          </TableCell>
                          <TableCell>
                            {/* 3. SỬ DỤNG TÊN ĐÃ TÌM ĐƯỢC */}
                            <Badge variant="secondary">{levelName}</Badge>
                          </TableCell>
                          <TableCell>
                            {/* 3. SỬ DỤNG TÊN ĐÃ TÌM ĐƯỢC */}
                            <Badge variant="outline">{topicName}</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(lesson.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(lesson.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <SpeakingLessonDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={refreshLessons}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this speaking lesson. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
