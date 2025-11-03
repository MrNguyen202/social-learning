"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Search } from "lucide-react";
import { loadUsers } from "@/app/apiClient/admin/user";
import { UserDetailDialog } from "./components/UserDetailDialog";

type User = {
  id: string;
  name: string;
  email: string;
  nick_name: string;
  level: number;
  last_seen: string;
  created_at: string;
  avatar: string;
};

export default function Users() {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Gọi API danh sách người dùng
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await loadUsers({
        search,
        level,
        fromDate,
        toDate,
      });
      setUsers(res.data || []);
    } catch (err) {
      console.error("Failed to load users:", err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, level, fromDate, toDate]);

  const handleSearch = () => {
    if (search.trim() === "") return;
    fetchUsers();
  };

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setDialogOpen(true);
  };

  // Mảng level tĩnh (1 đến 10)
  const LEVELS = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="flex-1 px-6 py-3">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Bộ lọc */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Search by name, email, or nickname..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} size="icon">
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                {/* Dropdown chọn Level */}
                <Select
                  value={level?.toString() ?? "all"}
                  onValueChange={(val) =>
                    setLevel(val === "all" ? null : parseInt(val))
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {LEVELS.map((lvl) => (
                      <SelectItem key={lvl} value={lvl.toString()}>
                        Level {lvl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Lọc theo ngày */}
                <Input
                  type="date"
                  value={fromDate ?? ""}
                  onChange={(e) => setFromDate(e.target.value || null)}
                  className="w-40"
                />
                <Input
                  type="date"
                  value={toDate ?? ""}
                  onChange={(e) => setToDate(e.target.value || null)}
                  className="w-40"
                />
              </div>
            </div>

            {/* Bảng người dùng */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Nickname</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingUsers ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-gray-500"
                      >
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.nick_name ?? "-"}</TableCell>
                        <TableCell>{user.level ?? "N/A"}</TableCell>
                        <TableCell>
                          {user.last_seen
                            ? new Date(user.last_seen).toLocaleDateString()
                            : "Never"}
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewUser(user.id)}
                            className="cursor-pointer hover:bg-black hover:text-white"
                          >
                            View
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

      {/* Chi tiết người dùng */}
      <UserDetailDialog
        userId={selectedUserId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
