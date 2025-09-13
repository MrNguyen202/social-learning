import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getUserImageSrc } from "@/app/api/image/route";
import { Button } from "@/components/ui/button";
import {
  checkIsFollowing,
  followUser,
  unfollowUser,
} from "@/app/api/follow/route";
import { Loader2 } from "lucide-react";

interface User {
  id: string;
  name: string;
  nick_name: string;
  avatar?: string;
}

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  currentUserId?: string;
  data: User[];
}

export default function FollowModal({
  isOpen,
  onClose,
  title,
  currentUserId,
  data,
}: UserListModalProps) {
  const [keyword, setKeyword] = useState("");
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({});
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [open, setOpen] = useState(false);

  // Khi mở modal -> check trạng thái follow
  useEffect(() => {
    if (isOpen && data.length > 0 && currentUserId) {
      const fetchStatus = async () => {
        setIsLoadingAll(true);
        try {
          const results = await Promise.all(
            data.map(async (u) => {
              try {
                const res = await checkIsFollowing(currentUserId, u.id);
                return { id: u.id, isFollowing: res.isFollowing };
              } catch {
                return { id: u.id, isFollowing: false };
              }
            })
          );

          const statusMap: Record<string, boolean> = {};
          results.forEach((r) => {
            statusMap[r.id] = r.isFollowing;
          });
          setFollowStatus(statusMap);
        } finally {
          setIsLoadingAll(false);
        }
      };

      fetchStatus();
    }
  }, [isOpen, data, currentUserId]);

  const filteredData = data.filter(
    (user) =>
      user.name?.toLowerCase().includes(keyword.toLowerCase()) ||
      user.nick_name?.toLowerCase().includes(keyword.toLowerCase())
  );

  const handleFollowBack = async (userId: string) => {
    setFollowStatus((prev) => ({ ...prev, [userId]: true }));
    if (currentUserId) {
      await followUser(currentUserId, userId);
    }
  };

  const handleUnfollow = async (userId: string) => {
    setFollowStatus((prev) => ({ ...prev, [userId]: false }));
    if (currentUserId) {
      await unfollowUser(currentUserId, userId);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="lg:max-w-xl sm:max-w-[450px] max-w-xs w-full p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="pt-4">
            <DialogTitle className="text-center text-lg font-semibold">
              {title}
            </DialogTitle>
            <div className="border-t pt-3 px-4">
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm"
              />
            </div>
          </DialogHeader>

          <ScrollArea className="h-[50vh]">
            {isLoadingAll ? (
              <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="divide-y">
                {filteredData.length > 0 ? (
                  filteredData.map((u) => {
                    const isFollowing = followStatus[u.id] ?? false;

                    return (
                      <div
                        key={u.id}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage
                              src={getUserImageSrc(u.avatar)}
                              alt={u.name}
                            />
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">
                              {u.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {u.nick_name}
                            </span>
                          </div>
                        </div>

                        {isFollowing ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setOpen(true)}
                            className="bg-gray-200 hover:bg-gray-300 text-black cursor-pointer"
                          >
                            Xóa
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleFollowBack(u.id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                          >
                            Theo dõi lại
                          </Button>
                        )}

                        <Dialog open={open} onOpenChange={setOpen}>
                          <DialogContent className="sm:max-w-md rounded-2xl p-0">
                            <DialogHeader className="p-4 pb-2">
                              <DialogTitle className="text-center text-lg">
                                Xác nhận hủy theo dõi
                              </DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col divide-y">
                              <button
                                className="py-3 text-red-600 border-t font-medium hover:bg-gray-50 text-center cursor-pointer"
                                onClick={() => {
                                  handleUnfollow(u.id);
                                  setOpen(false);
                                }}
                              >
                                Hủy theo dõi
                              </button>
                              <button
                                className="py-3 font-medium cursor-pointer"
                                onClick={() => setOpen(false)}
                              >
                                Đóng
                              </button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-muted-foreground py-6">
                    Không tìm thấy người dùng
                  </p>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
