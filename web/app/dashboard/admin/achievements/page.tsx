"use client";

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
import { Plus, Pencil } from "lucide-react";
import { AchievementDialog } from "./components/AchievementDialog";
import { loadAchievement } from "@/app/apiClient/admin/achievement";

export default function page() {
  const [type, setType] = useState<string | null>(null);
  const [skill, setSkill] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);

  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  console.log("Achievements:", achievements);

  // ✅ Hàm gọi API mới
  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const res = await loadAchievement({ type, skill });
      setAchievements(res.data);
    } catch (err) {
      console.error("Failed to load achievements:", err);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [type, skill]);

  const handleCreate = () => {
    setSelectedAchievement(null);
    setDialogOpen(true);
  };

  const handleEdit = (achievement: any) => {
    setSelectedAchievement(achievement);
    setDialogOpen(true);
  };

  return (
    <div className="flex-1 pr-6 py-4 pl-12 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-3xl">Achievements & Gamification</CardTitle>
          <Button onClick={handleCreate} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <Select
                value={type ?? "all"}
                onValueChange={(val) => setType(val === "all" ? null : val)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="skill">Skill</SelectItem>
                  <SelectItem value="streak">Streak</SelectItem>
                  <SelectItem value="total_score">Total Score</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={skill ?? "all"}
                onValueChange={(val) => setSkill(val === "all" ? null : val)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by Skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="listening">Listening</SelectItem>
                  <SelectItem value="writing">Writing</SelectItem>
                  <SelectItem value="speaking">Speaking</SelectItem>
                  <SelectItem value="streak">Streak</SelectItem>
                  <SelectItem value="total_score">Total Score</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Achievement</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Skill</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Unlocks</TableHead>
                    <TableHead>Unlock Rate</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : achievements.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-gray-500"
                      >
                        No achievements found
                      </TableCell>
                    </TableRow>
                  ) : (
                    achievements.map((achievement: any) => (
                      <TableRow key={achievement.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{achievement.icon}</span>
                            <div>
                              <p className="font-medium">{achievement.title}</p>
                              <p className="text-xs text-gray-500">
                                {achievement.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{achievement.type}</Badge>
                        </TableCell>
                        <TableCell className="capitalize">
                          {achievement.skill}
                        </TableCell>
                        <TableCell>{achievement.target}</TableCell>
                        <TableCell>{achievement.unlock_count}</TableCell>
                        <TableCell>{achievement.unlock_percentage}%</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(achievement)}
                            className="cursor-pointer hover:bg-gray-200"
                          >
                            <Pencil className="w-4 h-4" />
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

      <AchievementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        achievement={selectedAchievement}
        onSuccess={fetchAchievements} // ✅ Gọi lại khi tạo/sửa thành công
      />
    </div>
  );
}
