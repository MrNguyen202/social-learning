"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  createListeningParagraph,
  loadLevels,
  loadTopics,
  updateListeningParagraph,
} from "@/app/apiClient/admin/content";

type Level = { id: number; name_en: string; [key: string]: any };
type Topic = { id: number; name_en: string; [key: string]: any };

type FormData = {
  titleEn: string;
  titleVi: string;
  textContent: string;
  audioUrl: string;
  description: string;
  levelId: string;
  topicId: string;
};

const defaultValues: FormData = {
  titleEn: "",
  titleVi: "",
  textContent: "",
  audioUrl: "",
  description: "",
  levelId: "",
  topicId: "",
};

type ListeningParagraphDialogProps = {
  t: (key: string) => string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paragraph: any;
  onSuccess: () => void;
};

export function ListeningParagraphDialog({
  t,
  open,
  onOpenChange,
  paragraph,
  onSuccess,
}: ListeningParagraphDialogProps) {
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
    if (open && paragraph) {
      // Edit
      setFormData({
        titleEn: paragraph.title_en,
        titleVi: paragraph.title_vi,
        textContent: paragraph.text_content,
        audioUrl: paragraph.audio_url,
        description: paragraph.description,
        levelId: paragraph.level_id?.toString(),
        topicId: paragraph.topic_id?.toString(),
      });
    } else if (open) {
      // Create
      setFormData(defaultValues);
    }
  }, [paragraph, open]);

  // Hàm cập nhật state chung cho form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Hàm cập nhật state cho Select
  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Chặn form submit mặc định
    setIsSaving(true);

    // Chuyển đổi ID sang kiểu số
    const payload: any = {
      ...formData,
      levelId: parseInt(formData.levelId, 10),
      topicId: parseInt(formData.topicId, 10),
    };

    try {
      let response;
      if (paragraph) {
        // Chế độ Edit
        const payloadWithId = { id: paragraph.id, ...payload };
        response = await updateListeningParagraph({
          id: paragraph.id,
          paragraphData: payloadWithId,
        });
      } else {
        // Chế độ Create
        response = await createListeningParagraph(payload);
      }

      if (response.success) {
        toast.success(
          paragraph
            ? `${t("dashboard.paragraphUpdated")}`
            : `${t("dashboard.paragraphCreated")}`,
          { autoClose: 2000 }
        );
        onOpenChange(false); // Đóng modal
        onSuccess(); // Refresh lại bảng
      } else {
        toast.error(response.message, { autoClose: 2000 });
      }
    } catch (error: any) {
      toast.error(error.message, { autoClose: 2000 });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {paragraph ? `${t("dashboard.edit")}` : `${t("dashboard.create")}`}{" "}
            {t("dashboard.listeningParagraphs")}
          </DialogTitle>
        </DialogHeader>

        {/* Đây là form đã bỏ react-hook-form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titleEn">
                {t("dashboard.titleContent")} (English)
              </Label>
              <Input
                id="titleEn"
                name="titleEn"
                value={formData.titleEn}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="titleVi">
                {t("dashboard.titleContent")} (Vietnamese)
              </Label>
              <Input
                id="titleVi"
                name="titleVi"
                value={formData.titleVi}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="textContent">{t("dashboard.textContent")}</Label>
            <Textarea
              id="textContent"
              name="textContent"
              value={formData.textContent}
              onChange={handleInputChange}
              rows={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audioUrl">Audio URL</Label>
            <Input
              id="audioUrl"
              name="audioUrl"
              type="url"
              value={formData.audioUrl}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("dashboard.description")}</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
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
