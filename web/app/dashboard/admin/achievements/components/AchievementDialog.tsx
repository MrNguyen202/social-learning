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
import {
  createAchievement,
  updateAchievement,
} from "@/app/apiClient/admin/achievement";

type AchievementDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  achievement: any;
  onSuccess: () => void;
};

export function AchievementDialog({
  open,
  onOpenChange,
  achievement,
  onSuccess,
}: AchievementDialogProps) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    icon: "🏆",
    type: "",
    skill: "",
    target: "",
  });
  const [saving, setSaving] = useState(false);

  // ✅ Khi mở form hoặc có dữ liệu edit
  useEffect(() => {
    if (achievement) {
      setForm({
        title: achievement.title || "",
        description: achievement.description || "",
        icon: achievement.icon || "🏆",
        type: achievement.type || "",
        skill: achievement.skill || "",
        target: achievement.target?.toString() || "",
      });
    } else {
      setForm({
        title: "",
        description: "",
        icon: "🏆",
        type: "",
        skill: "",
        target: "",
      });
    }
  }, [achievement, open]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validation đơn giản
    if (
      !form.title ||
      !form.description ||
      !form.type ||
      !form.skill ||
      !form.target
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);
      if (achievement) {
        await updateAchievement(achievement.id, form);
      } else {
        await createAchievement(form);
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      console.error("Failed to save achievement", err);
      alert("Failed to save achievement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {achievement ? "Edit" : "Create"} Achievement
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Icon (Emoji)
              </label>
              <Input
                value={form.icon}
                onChange={(e) => handleChange("icon", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Target</label>
              <Input
                type="number"
                value={form.target}
                onChange={(e) => handleChange("target", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <Select
                value={form.type}
                onValueChange={(val) => handleChange("type", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="skill">Skill</SelectItem>
                  <SelectItem value="streak">Streak</SelectItem>
                  <SelectItem value="total_score">Total Score</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Skill</label>
              <Select
                value={form.skill}
                onValueChange={(val) => handleChange("skill", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="listening">Listening</SelectItem>
                  <SelectItem value="writing">Writing</SelectItem>
                  <SelectItem value="speaking">Speaking</SelectItem>
                  <SelectItem value="streak">Streak</SelectItem>
                  <SelectItem value="total_score">Total Score</SelectItem>
                </SelectContent>
              </Select>
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
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
