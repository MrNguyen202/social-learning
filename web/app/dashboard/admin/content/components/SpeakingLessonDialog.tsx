"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import {
  createSpeakingLesson,
  loadLevels,
  loadTopics,
  updateSpeakingLesson,
} from "@/app/apiClient/admin/content";

type Level = { id: number; name_en: string; [key: string]: any };
type Topic = { id: number; name_en: string; [key: string]: any };

type FormData = {
  content: string;
  levelId: string;
  topicId: string;
};

const defaultValues: FormData = {
  content: "",
  levelId: "",
  topicId: "",
};

type SpeakingLessonDialogProps = {
  t: (key: string) => string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson: any;
  onSuccess: () => void;
};

export function SpeakingLessonDialog({
  t,
  open,
  onOpenChange,
  lesson,
  onSuccess,
}: SpeakingLessonDialogProps) {
  const [levels, setLevels] = useState<Level[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [formData, setFormData] = useState<FormData>(defaultValues);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
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
    }
  }, [open]);

  useEffect(() => {
    if (open && lesson) {
      setFormData({
        content: lesson.content,
        levelId: lesson.level_id?.toString(),
        topicId: lesson.topic_id?.toString(),
      });
    } else if (open) {
      setFormData(defaultValues);
    }
  }, [lesson, open]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Chặn form submit mặc định
    setIsSaving(true);

    // Chuyển đổi ID sang kiểu số
    const payload = {
      ...formData,
      levelId: parseInt(formData.levelId, 10),
      topicId: parseInt(formData.topicId, 10),
    };

    try {
      let response;
      if (lesson) {
        // edit
        const payloadWithId = { id: lesson?.id, ...payload };
        response = await updateSpeakingLesson({
          id: lesson.id,
          lessonData: payloadWithId,
        });
      } else {
        // create
        response = await createSpeakingLesson(payload);
      }

      if (response.success) {
        toast.success(
          lesson
            ? `${t("dashboard.speakingLessonUpdated")}`
            : `${t("dashboard.speakingLessonCreated")}`
        );
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(response.message, { autoClose: 2000 });
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {lesson ? `${t("dashboard.edit")}` : `${t("dashboard.create")}`}{" "}
            {t("dashboard.speakingLessons")}
          </DialogTitle>
        </DialogHeader>

        {/* Đây là form đã bỏ react-hook-form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="content">{t("dashboard.content")}</Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={8}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="levelId">{t("dashboard.level")}</Label>
              <Select
                value={formData.levelId}
                onValueChange={(value) => handleSelectChange("levelId", value)}
              >
                <SelectTrigger id="levelId">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level.id} value={level.id.toString()}>
                      {level.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topicId">{t("dashboard.topic")}</Label>
              <Select
                value={formData.topicId}
                onValueChange={(value) => handleSelectChange("topicId", value)}
              >
                <SelectTrigger id="topicId">
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id.toString()}>
                      {topic.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              {t("dashboard.cancel")}
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 cursor-pointer">
              {isSaving ? `${t("dashboard.saving")}` : `${t("dashboard.save")}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
