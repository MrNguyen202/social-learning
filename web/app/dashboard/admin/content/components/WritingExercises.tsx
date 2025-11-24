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
  deleteWritingExercise,
  loadLevels,
  loadTopics,
  loadTypeExercises,
  loadTypeParagraphs,
  loadWritingExercises,
} from "@/app/apiClient/admin/content";
import { WritingExerciseDialog } from "./WritingExerciseDialog";

type WritingExercise = {
  id: number;
  title: string;
  exercise_type: string;
  level_name: string;
  topic_name: string;
  number_sentence: number;
  submission_count: number;
  [key: string]: any;
};

type Level = { id: number; name_en: string; [key: string]: any };
type Topic = { id: number; name_en: string; [key: string]: any };
type TypeExercise = { id: number; title_en: string; [key: string]: any };
type TypeParagraph = { id: number; name_en: string; [key: string]: any };

export function WritingExercises({ t }: { t: (key: string) => string }) {
  const [levelId, setLevelId] = useState<string | null>(null);
  const [topicId, setTopicId] = useState<string | null>(null);
  const [typeExerciseId, setTypeExerciseId] = useState<string | null>(null);
  const [typeParagraphId, setTypeParagraphId] = useState<string | null>(null);

  const [exercises, setExercises] = useState<WritingExercise[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [typeExercises, setTypeExercises] = useState<TypeExercise[]>([]);
  const [typeParagraphs, setTypeParagraphs] = useState<TypeParagraph[]>([]);

  const [exercisesLoading, setExercisesLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<number | null>(null);

  const fetchExercises = useCallback(async () => {
    setExercisesLoading(true);
    try {
      const response = await loadWritingExercises({
        levelId: levelId || undefined,
        topicId: topicId || undefined,
        typeExerciseId: typeExerciseId || undefined,
        typeParagraphId: typeParagraphId || undefined,
      });
      if (response.success) {
        setExercises(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setExercisesLoading(false);
    }
  }, [levelId, topicId, typeExerciseId, typeParagraphId]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [levelsRes, topicsRes, typeExercisesRes, typeParagraphsRes] =
          await Promise.all([
            loadLevels(),
            loadTopics(),
            loadTypeExercises(),
            loadTypeParagraphs(),
          ]);
        if (levelsRes.success) setLevels(levelsRes.data);
        if (topicsRes.success) setTopics(topicsRes.data);
        if (typeExercisesRes.success) setTypeExercises(typeExercisesRes.data);
        if (typeParagraphsRes.success)
          setTypeParagraphs(typeParagraphsRes.data);
      } catch (error: any) {
        toast.error("Failed to load filters: " + error.message);
      }
    };
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  // Hàm refresh
  const refreshExercises = () => {
    fetchExercises();
  };

  // Xử lý các hành động
  const handleCreate = () => {
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setExerciseToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (exerciseToDelete) {
      setDeleting(true);
      try {
        const response = await deleteWritingExercise(exerciseToDelete);
        if (response.success) {
          toast.success(`${t("dashboard.exerciseDeleted")}`);
          refreshExercises();
        } else {
          toast.error(response.message);
        }
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setDeleting(false);
        setDeleteDialogOpen(false);
        setExerciseToDelete(null);
      }
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("dashboard.writingExercises")}</CardTitle>
          <Button onClick={handleCreate} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            {t("dashboard.createNew")}
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Select
                value={levelId ?? "all"}
                onValueChange={(val) => setLevelId(val === "all" ? null : val)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Level" />
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
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Topic" />
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

              <Select
                value={typeExerciseId ?? "all"}
                onValueChange={(val) =>
                  setTypeExerciseId(val === "all" ? null : val)
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Exercise Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {typeExercises.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.title_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={typeParagraphId ?? "all"}
                onValueChange={(val) =>
                  setTypeParagraphId(val === "all" ? null : val)
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Paragraph Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {typeParagraphs.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name_en}
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
                    <TableHead>{t("dashboard.titleContent")}</TableHead>
                    <TableHead>{t("dashboard.type")}</TableHead>
                    <TableHead>{t("dashboard.level")}</TableHead>
                    <TableHead>{t("dashboard.topic")}</TableHead>
                    <TableHead>{t("dashboard.sentences")}</TableHead>
                    <TableHead>{t("dashboard.submissions")}</TableHead>
                    <TableHead>{t("dashboard.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exercisesLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : exercises.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-gray-500"
                      >
                        {t("dashboard.noWritingExercisesFound")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    exercises.map((exercise) => (
                      <TableRow key={exercise.id}>
                        <TableCell className="font-medium max-w-xs truncate">
                          {exercise.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {exercise.exercise_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{exercise.level_name}</Badge>
                        </TableCell>
                        <TableCell>{exercise.topic_name}</TableCell>
                        <TableCell>{exercise.number_sentence}</TableCell>
                        <TableCell>{exercise.submission_count}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(exercise.id)}
                            className="cursor-pointer hover:bg-gray-200"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
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

      <WritingExerciseDialog
        t={t}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={refreshExercises}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.deleteWritingExerciseConfirmation")}
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
