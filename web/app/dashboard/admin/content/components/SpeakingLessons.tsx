"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Pencil, Plus, Trash2 } from "lucide-react";
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

export function SpeakingLessons({ t }: { t: (key: string) => string }) {
  const [levelId, setLevelId] = useState<string | null>(null);
  const [topicId, setTopicId] = useState<string | null>(null);

  const [selectedLesson, setSelectedLesson] =
    useState<SpeakingLesson | null>(null);

  const [lessons, setLessons] = useState<SpeakingLesson[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<number | null>(null);

  const fetchLessons = useCallback(async () => {
    setLessonsLoading(true);
    try {
      const response = await loadSpeakingLessons({
        levelId: levelId,
        topicId: topicId,
      });
      if (response.success) {
        setLessons(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLessonsLoading(false);
    }
  }, [levelId, topicId]);

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

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  // Hàm refresh
  const refreshLessons = () => {
    fetchLessons();
  };

  // Xử lý các hành động
  const handleCreate = () => {
    setSelectedLesson(null);
    setDialogOpen(true);
  };

  const handleEdit = (lesson: SpeakingLesson) => {
    setSelectedLesson(lesson);
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
          toast.success(`${t("dashboard.lessonDeleted")}`);
          refreshLessons();
        } else {
          toast.error(response.message);
        }
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setDeleting(false);
        setDeleteDialogOpen(false);
        setLessonToDelete(null);
      }
    }
  };
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("dashboard.speakingLessons")}</CardTitle>
          <Button onClick={handleCreate} className="cursor-pointer bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600">
            <Plus className="w-4 h-4 mr-2" />
            {t("dashboard.createNew")}
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
                    <TableHead>{t("dashboard.content")}</TableHead>
                    <TableHead>{t("dashboard.level")}</TableHead>
                    <TableHead>{t("dashboard.topic")}</TableHead>
                    <TableHead>{t("dashboard.lastModified")}</TableHead>
                    <TableHead>{t("dashboard.actions")}</TableHead>
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
                        {t("dashboard.noSpeakingLessonsFound")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    lessons.map((lesson: any) => {
                      const level = levels.find(
                        (l) => l.id === lesson.level_id
                      );
                      const topic = topics.find(
                        (t) => t.id === lesson.topic_id
                      );

                      const levelName = level?.name_en || "N/A";
                      const topicName = topic?.name_en || "N/A";

                      return (
                        <TableRow key={lesson.id}>
                          <TableCell className="max-w-md">
                            <p className="line-clamp-2">{lesson.content}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{levelName}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{topicName}</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(lesson.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(lesson)}
                              className="cursor-pointer hover:bg-gray-200"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(lesson.id)}
                              className="cursor-pointer hover:bg-gray-200"
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
        t={t}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lesson={selectedLesson}
        onSuccess={refreshLessons}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dashboard.areYouSure")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.deleteSpeakingLessonConfirmation")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("dashboard.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting
                ? `${t("dashboard.deleting")}`
                : `${t("dashboard.delete")}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
