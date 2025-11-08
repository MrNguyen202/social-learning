"use client"

import { useEffect, useState } from "react";
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
import { Plus, Pencil, Trash2 } from "lucide-react";
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
import {
  deleteListeningParagraph,
  loadLevels,
  loadListeningParagraphs,
  loadTopics,
} from "@/app/apiClient/admin/content";
import { ListeningParagraphDialog } from "./ListeningParagraphDialog";

type ListeningParagraph = {
  id: number;
  title_en: string;
  title_vi: string;
  text_content: string;
  audio_url: string;
  description: string;
  level_id: number;
  topic_id: number;
  level_name: string;
  topic_name: string;
  created_at: string;
  completion_rate: number;
  avg_score: number;
};

export function ListeningParagraphs({ t }: { t: (key: string) => string }) {
  const [levelId, setLevelId] = useState<string | null>(null);
  const [topicId, setTopicId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedParagraph, setSelectedParagraph] =
    useState<ListeningParagraph | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paragraphToDelete, setParagraphToDelete] = useState<number | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  const [paragraphs, setParagraphs] = useState<ListeningParagraph[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load dữ liệu
  const fetchParagraphs = async () => {
    setLoading(true);
    try {
      const res = await loadListeningParagraphs({ levelId, topicId });
      setParagraphs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [levelsRes, topicsRes] = await Promise.all([
        loadLevels(),
        loadTopics(),
      ]);
      setLevels(levelsRes.data || []);
      setTopics(topicsRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchParagraphs();
  }, [levelId, topicId]);

  const handleCreate = () => {
    setSelectedParagraph(null);
    setDialogOpen(true);
  };

  const handleEdit = (paragraph: ListeningParagraph) => {
    setSelectedParagraph(paragraph);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setParagraphToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!paragraphToDelete) return;
    setDeleting(true);
    try {
      await deleteListeningParagraph(paragraphToDelete);
      setDeleteDialogOpen(false);
      fetchParagraphs();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      setParagraphToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Listening Paragraphs</CardTitle>
          <Button onClick={handleCreate} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            {t("dashboard.createNew")}
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
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

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Completion Rate</TableHead>
                    <TableHead>Avg Score</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : paragraphs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-gray-500"
                      >
                        No listening paragraphs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paragraphs.map((paragraph) => (
                      <TableRow key={paragraph.id}>
                        <TableCell className="font-medium max-w-xs truncate">
                          {paragraph.title_en}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {paragraph.level_name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {paragraph.topic_name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {Math.round(paragraph.completion_rate)}%
                        </TableCell>
                        <TableCell>{Math.round(paragraph.avg_score)}</TableCell>
                        <TableCell>
                          {new Date(paragraph.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(paragraph)}
                              className="cursor-pointer hover:bg-gray-200"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(paragraph.id)}
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

      <ListeningParagraphDialog
        t={t}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        paragraph={selectedParagraph}
        onSuccess={fetchParagraphs}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this listening paragraph. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel> {t("dashboard.cancel")}</AlertDialogCancel>
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
