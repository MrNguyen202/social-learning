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

// Kiểu dữ liệu cho Dropdowns
type Level = { id: number; name_en: string; [key: string]: any };
type Topic = { id: number; name_en: string; [key: string]: any };
type TypeExercise = { id: number; title_en: string; [key: string]: any };
type TypeParagraph = { id: number; name_en: string; [key: string]: any };

// Định nghĩa kiểu dữ liệu cho form
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

// Giá trị mặc định cho form
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function WritingExerciseDialog({
  open,
  onOpenChange,
  onSuccess,
}: WritingExerciseDialogProps) {
  // State cho dropdowns
  const [levels, setLevels] = useState<Level[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [typeExercises, setTypeExercises] = useState<TypeExercise[]>([]);
  const [typeParagraphs, setTypeParagraphs] = useState<TypeParagraph[]>([]);

  // State cho form
  const [formData, setFormData] = useState<FormData>(defaultValues);
  const [isSaving, setIsSaving] = useState(false);

  // Tải tất cả dropdowns khi modal mở
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

      // Reset form (vì đây là dialog "Create")
      setFormData(defaultValues);
    }
  }, [open]);

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

    // Kiểm tra NaN (Nếu select chưa chọn)
    if (
      isNaN(payload.levelId) ||
      isNaN(payload.topicId) ||
      isNaN(payload.typeExerciseId) ||
      isNaN(payload.typeParagraphId)
    ) {
      toast.error("Please fill in all dropdown fields.");
      setIsSaving(false);
      return;
    }

    try {
      const response = await createWritingExercise(payload);
      if (response.success) {
        toast.success("Exercise created!");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(response.message || "Failed to save.");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Writing Exercise</DialogTitle>
        </DialogHeader>

        {/* Đây là form đã bỏ react-hook-form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
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
              <Label htmlFor="contentVi">Content (Vietnamese)</Label>
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
              <Label htmlFor="contentEn">Content (English)</Label>
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
              <Label htmlFor="levelId">Level</Label>
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
              <Label htmlFor="topicId">Topic</Label>
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
              <Label htmlFor="typeExerciseId">Exercise Type</Label>
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
              <Label htmlFor="typeParagraphId">Paragraph Type</Label>
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
              <Label htmlFor="numberSentence">Number of Sentences</Label>
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
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
