"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Loader2, LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  checkIsFollowing,
  followUser,
  unfollowUser,
} from "@/app/api/follow/route";
import useAuth from "@/hooks/useAuth";
import { getUserImageSrc } from "@/app/api/image/route";
import { ScrollArea } from "@/components/ui/scroll-area";

interface User {
  id: string;
  name: string;
  nick_name: string;
  avatar?: string;
}

interface UserFollowModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: User[];
}

export default function UserFollowModal({
  isOpen,
  onClose,
  title,
  data,
}: UserFollowModalProps) {
  const { user } = useAuth();
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [isLoadingAll, setIsLoadingAll] = useState<boolean>(false);

  useEffect(() => {
    if (!user?.id || !isOpen) return;

    const fetchFollowStates = async () => {
      setIsLoadingAll(true);
      const states: Record<string, boolean> = {};
      for (const item of data) {
        if (item.id === user.id) continue;
        const res = await checkIsFollowing(user.id, item.id);
        states[item.id] = res.isFollowing;
      }
      setFollowStates(states);
      setIsLoadingAll(false);
    };

    fetchFollowStates();
  }, [data, isOpen, user?.id]);

  const handleToggleFollow = async (targetId: string) => {
    if (!user?.id) return;

    setLoadingStates((prev) => ({ ...prev, [targetId]: true }));

    try {
      if (followStates[targetId]) {
        await unfollowUser(user.id, targetId);
        setFollowStates((prev) => ({ ...prev, [targetId]: false }));
      } else {
        await followUser(user.id, targetId);
        setFollowStates((prev) => ({ ...prev, [targetId]: true }));
      }
    } catch (err) {
      console.error("Follow toggle failed:", err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [targetId]: false }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="lg:max-w-xl sm:max-w-[450px] max-w-xs w-full p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="pt-4">
          <DialogTitle className="text-center text-lg font-semibold">
            {title}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[50vh]">
          {isLoadingAll ? (
            <div className="flex justify-center items-center h-[50vh]">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : data.length > 0 ? (
            <div className="divide-y">
              {data.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={getUserImageSrc(item.avatar)}
                        alt={item.name}
                      />
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.nick_name}
                      </p>
                    </div>
                  </div>

                  {item.id !== user?.id && (
                    <button
                      onClick={() => handleToggleFollow(item.id)}
                      disabled={loadingStates[item.id]}
                      className={`px-3 py-1 text-sm rounded-md font-medium ${
                        followStates[item.id]
                          ? "bg-gray-200 text-black hover:bg-gray-300"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      {loadingStates[item.id] ? (
                        <LoaderIcon className="w-4 h-4 animate-spin" />
                      ) : followStates[item.id] ? (
                        "Bỏ theo dõi"
                      ) : (
                        "Theo dõi"
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6">
              Không có người dùng nào
            </p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
