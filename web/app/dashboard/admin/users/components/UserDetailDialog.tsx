import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, Flame, BookOpen } from "lucide-react";
import {
  loadUserAchievements,
  loadUserDetail,
  loadUserErrors,
  loadUserPosts,
  loadUserScores,
  loadUserVocabularies,
} from "@/app/apiClient/admin/user";
import { getUserImageSrc } from "@/app/apiClient/image/image";

type UserDetailDialogProps = {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UserDetailDialog({
  userId,
  open,
  onOpenChange,
}: UserDetailDialogProps) {
  if (!userId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="xl:max-w-6xl xl:h-[80vh] lg:max-w-5xl lg:h-[70vh] md:max-w-4xl md:h-[70vh] sm:max-w-2xl sm:h-[70vh] max-w-xl h-[70vh] p-0 overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b">
          <DialogTitle>Chi tiết người dùng</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4">
          <UserDetailContent userId={userId} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UserDetailContent({ userId }: { userId: string }) {
  // State cho dữ liệu
  const [user, setUser] = useState<any>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [vocab, setVocab] = useState<any[]>([]);
  const [errors, setErrors] = useState<any[]>([]);

  // State cho loading
  const [userLoading, setUserLoading] = useState(true);
  const [scoresLoading, setScoresLoading] = useState(true);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [vocabLoading, setVocabLoading] = useState(true);
  const [errorsLoading, setErrorsLoading] = useState(true);

  // Load thông tin người dùng
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const userRes = await loadUserDetail(userId);
        if (isMounted) setUser(userRes.data ?? userRes);
      } catch {
        setUser(null);
      } finally {
        if (isMounted) setUserLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Load dữ liệu phụ
  useEffect(() => {
    const fetchAll = async () => {
      setScoresLoading(true);
      setAchievementsLoading(true);
      setPostsLoading(true);
      setVocabLoading(true);
      setErrorsLoading(true);

      try {
        const [scoresRes, achievementsRes, postsRes, vocabRes, errorsRes] =
          await Promise.allSettled([
            loadUserScores(userId),
            loadUserAchievements(userId),
            loadUserPosts(userId),
            loadUserVocabularies(userId),
            loadUserErrors(userId),
          ]);

        if (scoresRes.status === "fulfilled")
          setScores(scoresRes.value.data ?? scoresRes.value);
        if (achievementsRes.status === "fulfilled")
          setAchievements(achievementsRes.value.data ?? achievementsRes.value);
        if (postsRes.status === "fulfilled")
          setPosts(postsRes.value.data ?? postsRes.value);
        if (vocabRes.status === "fulfilled")
          setVocab(vocabRes.value.data ?? vocabRes.value);
        if (errorsRes.status === "fulfilled")
          setErrors(errorsRes.value.data ?? errorsRes.value);
      } catch {
        console.error("Failed to fetch user details");
      } finally {
        setScoresLoading(false);
        setAchievementsLoading(false);
        setPostsLoading(false);
        setVocabLoading(false);
        setErrorsLoading(false);
      }
    };

    fetchAll();
  }, [userId]);

  if (userLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    return <div className="text-center py-8 text-gray-500">User not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* --- Header info --- */}
      <div className="flex items-start gap-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={getUserImageSrc(user.avatar)} alt={user.name} />
        </Avatar>
        <div className="flex-1">
          <h3 className="text-2xl font-bold">{user.name}</h3>
          <p className="text-gray-500">{user.email}</p>
          <div className="flex gap-2 mt-2">
            <Badge>{user.level ?? "No Level"}</Badge>
            <Badge variant="outline">@{user.nick_name ?? "no nickname"}</Badge>
          </div>
          {user.bio && <p className="mt-2 text-sm">{user.bio}</p>}
        </div>
      </div>

      {/* --- Stats cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<Flame className="w-5 h-5 text-orange-600" />}
          label="Current Streak"
          value={`${user.current_streak ?? 0} days`}
          color="bg-orange-50"
        />
        <StatCard
          icon={<Trophy className="w-5 h-5 text-purple-600" />}
          label="Longest Streak"
          value={`${user.longest_streak ?? 0} days`}
          color="bg-purple-50"
        />
        <StatCard
          icon={<BookOpen className="w-5 h-5 text-blue-600" />}
          label="Submit Credits"
          value={user.submit_credits ?? 0}
          color="bg-blue-50"
        />
      </div>

      {/* --- Tabs --- */}
      <Tabs defaultValue="scores" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="scores">Scores</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
        </TabsList>

        <TabsContent value="scores">
          <ScoresTab loading={scoresLoading} scores={scores} />
        </TabsContent>

        <TabsContent value="achievements">
          <AchievementsTab loading={achievementsLoading} data={achievements} />
        </TabsContent>

        <TabsContent value="posts">
          <PostsTab loading={postsLoading} data={posts} />
        </TabsContent>

        <TabsContent value="vocabulary">
          <VocabTab loading={vocabLoading} data={vocab} />
        </TabsContent>

        <TabsContent value="errors">
          <ErrorsTab loading={errorsLoading} data={errors} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ----------------- Subcomponents ------------------ */

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <div className={`${color} p-3 rounded-lg`}>{icon}</div>
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* --- Tabs --- */
function ScoresTab({ loading, scores }: any) {
  if (loading) return <Skeleton className="h-48 w-full" />;
  if (!scores.length)
    return (
      <p className="text-center py-8 text-gray-500">No score data available</p>
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Progress</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Skill</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scores.map((score: any, i: number) => (
              <TableRow key={i}>
                <TableCell className="capitalize">{score.skill}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{score.score}</Badge>
                </TableCell>
                <TableCell>
                  {new Date(score.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AchievementsTab({ loading, data }: any) {
  if (loading) return <Skeleton className="h-48 w-full" />;
  if (!data.length)
    return (
      <p className="text-center py-8 text-gray-500">No achievements yet</p>
    );
  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {data.map((a: any) => (
          <div
            key={a.id}
            className="flex items-start gap-3 p-4 border rounded-lg"
          >
            <div className="text-3xl">{a.learningAchievements.icon}</div>
            <div className="flex-1">
              <h4 className="font-semibold">{a.learningAchievements.title}</h4>
              <p className="text-sm text-gray-600">
                {a.learningAchievements.description}
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant={a.unlocked ? "default" : "secondary"}>
                  {a.unlocked ? "Unlocked" : "Locked"}
                </Badge>
                <Badge variant="outline">
                  {a.progress}/{a.learningAchievements.target}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function PostsTab({ loading, data }: any) {
  if (loading) return <Skeleton className="h-48 w-full" />;
  if (!data.length)
    return <p className="text-center py-8 text-gray-500">No posts yet</p>;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {data.map((post: any) => (
          <div key={post.id} className="p-4 border rounded-lg">
            <p className="text-sm">{post.content}</p>
            <div className="flex gap-4 mt-3 text-xs text-gray-500">
              <span>{post.likes_count[0].count} likes</span>
              <span>{post.comments_count[0].count} comments</span>
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function VocabTab({ loading, data }: any) {
  if (loading) return <Skeleton className="h-48 w-full" />;
  if (!data.length)
    return (
      <p className="text-center py-8 text-gray-500">No vocabulary entries</p>
    );
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Vocabulary</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Word</TableHead>
              <TableHead>Mastery Score</TableHead>
              <TableHead>Errors</TableHead>
              <TableHead>Next Review</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((vocab: any) => (
              <TableRow key={vocab.id}>
                <TableCell className="font-medium">{vocab.word}</TableCell>
                <TableCell>
                  <Badge>{vocab.mastery_score}</Badge>
                </TableCell>
                <TableCell>{vocab.error_count}</TableCell>
                <TableCell>
                  {vocab.next_review_at
                    ? new Date(vocab.next_review_at).toLocaleDateString()
                    : "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ErrorsTab({ loading, data }: any) {
  if (loading) return <Skeleton className="h-48 w-full" />;
  if (!data.length)
    return <p className="text-center py-8 text-gray-500">No error data</p>;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Patterns</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Word</TableHead>
              <TableHead>Error Type</TableHead>
              <TableHead>Skill</TableHead>
              <TableHead>Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((error: any, i: number) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{error.word}</TableCell>
                <TableCell>
                  <Badge variant="destructive">{error.error_type}</Badge>
                </TableCell>
                <TableCell className="capitalize">{error.skill}</TableCell>
                <TableCell>{error.error_count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
