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
  createWritingExercise,
  loadLevels,
  loadTopics,
  loadTypeExercises,
  loadTypeParagraphs,
} from "@/app/apiClient/admin/content";

type Level = { id: number; name_en: string; [key: string]: any };
type Topic = { id: number; name_en: string; [key: string]: any };
type TypeExercise = { id: number; title_en: string; [key: string]: any };
type TypeParagraph = { id: number; name_en: string; [key: string]: any };

type FormData = {
  title: string;
  contentVi: string;
  contentEn: string;
  levelId: string;
  topicId: string;
  typeExerciseId: string;
  typeParagraphId: string;
  numberSentence: string;
};

const defaultValues: FormData = {
  title: "",
  contentVi: "",
  contentEn: "",
  levelId: "",
  topicId: "",
  typeExerciseId: "",
  typeParagraphId: "",
  numberSentence: "",
};

type WritingExerciseDialogProps = {
  t: (key: string) => string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function WritingExerciseDialog({
  t,
  open,
  onOpenChange,
  onSuccess,
}: WritingExerciseDialogProps) {
  const [levels, setLevels] = useState<Level[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [typeExercises, setTypeExercises] = useState<TypeExercise[]>([]);
  const [typeParagraphs, setTypeParagraphs] = useState<TypeParagraph[]>([]);

  const [formData, setFormData] = useState<FormData>(defaultValues);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
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

      setFormData(defaultValues);
    }
  }, [open]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Chuyển đổi các ID sang kiểu số
    const payload = {
      ...formData,
      levelId: parseInt(formData.levelId, 10),
      topicId: parseInt(formData.topicId, 10),
      typeExerciseId: parseInt(formData.typeExerciseId, 10),
      typeParagraphId: parseInt(formData.typeParagraphId, 10),
      numberSentence: parseInt(formData.numberSentence, 10),
    };

    if (
      isNaN(payload.levelId) ||
      isNaN(payload.topicId) ||
      isNaN(payload.typeExerciseId) ||
      isNaN(payload.typeParagraphId)
    ) {
      toast.error(t("dashboard.fillAllDropdowns"));
      setIsSaving(false);
      return;
    }

    try {
      const response = await createWritingExercise(payload);
      if (response.success) {
        toast.success(t("dashboard.createWritingExercise"));
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("dashboard.createWritingExercise")}</DialogTitle>
        </DialogHeader>

        {/* Đây là form đã bỏ react-hook-form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">{t("dashboard.titleContent")}</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contentVi">{t("dashboard.content")} (Vietnamese)</Label>
              <Textarea
                id="contentVi"
                name="contentVi"
                value={formData.contentVi}
                onChange={handleInputChange}
                rows={5}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contentEn">{t("dashboard.content")} (English)</Label>
              <Textarea
                id="contentEn"
                name="contentEn"
                value={formData.contentEn}
                onChange={handleInputChange}
                rows={5}
                required
              />
            </div>
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

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="typeExerciseId">{t("dashboard.type")}</Label>
              <Select
                value={formData.typeExerciseId}
                onValueChange={(value) =>
                  handleSelectChange("typeExerciseId", value)
                }
              >
                <SelectTrigger id="typeExerciseId">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {typeExercises.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.title_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="typeParagraphId">{t("dashboard.paragraphType")}</Label>
              <Select
                value={formData.typeParagraphId}
                onValueChange={(value) =>
                  handleSelectChange("typeParagraphId", value)
                }
              >
                <SelectTrigger id="typeParagraphId">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {typeParagraphs.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="numberSentence">{t("dashboard.numberOfSentences")}</Label>
              <Input
                id="numberSentence"
                name="numberSentence"
                type="number"
                value={formData.numberSentence}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("dashboard.cancel")}
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving
                ? `${t("dashboard.creating")}`
                : `${t("dashboard.create")}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
