"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Archive } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useAuth from "@/hooks/useAuth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getUserImageSrc, uploadFile } from "@/app/api/image/route";
import { updateUserData } from "@/app/api/user/route";
import { toast } from "react-toastify";

interface User {
  id: string;
  name: string;
  nick_name: string;
  avatar?: string;
  bio?: string;
}

export default function ProfileHeader() {
  const router = useRouter();
  const { user, setUser } = useAuth<User>();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    try {
      setIsLoading(true);

      const res = await uploadFile("profiles", file, "image");

      if (res?.success === false) {
        toast.error(res.msg || "Upload thất bại", {autoClose: 1500});
        return;
      }

      const updateData = { avatar: res.data.path };
      await updateUserData(user.id, updateData);

      toast.success("Tải ảnh thành công!", {autoClose: 1500});

      setUser({ ...user, avatar: res.data.path });
      setOpen(false);
    } catch (err: any) {
      toast.error("Đã xảy ra lỗi khi upload ảnh.", {autoClose: 1500});
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      const updateData = { avatar: null };
      await updateUserData(user.id, updateData);

      toast.success("Đã gỡ ảnh đại diện!", {autoClose: 1500});

      setUser({ ...user, avatar: undefined });
      setOpen(false);
    } catch (err: any) {
      toast.error("Đã xảy ra lỗi khi gỡ ảnh.", {autoClose: 1500});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border-b border-border md:ml-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:gap-8 mb-4">
        {/* Avatar */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Avatar className="w-20 h-20 cursor-pointer mx-auto sm:mx-0 sm:w-28 sm:h-28">
              <AvatarImage
                src={
                  user?.avatar
                    ? getUserImageSrc(user.avatar)
                    : "/default-avatar-profile-icon.jpg"
                }
                alt="Profile"
              />
            </Avatar>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md rounded-2xl p-0">
            <DialogHeader className="p-4 pb-2">
              <DialogTitle className="text-center text-lg">
                Thay đổi ảnh đại diện
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col divide-y">
              <label className="py-3 text-blue-600 border-t font-medium hover:bg-gray-50 text-center cursor-pointer">
                {isLoading ? "Đang tải..." : "Tải ảnh lên"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={isLoading}
                />
              </label>
              <button
                className="py-3 text-red-600 font-medium hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                onClick={handleRemove}
                disabled={isLoading}
              >
                {isLoading ? "Đang xử lý..." : "Gỡ ảnh hiện tại"}
              </button>
              <DialogClose asChild>
                <button
                  className="py-3 font-medium cursor-pointer"
                  disabled={isLoading}
                >
                  Hủy
                </button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0">
          <h1 className="text-lg font-semibold sm:text-xl">{user?.name}</h1>
          {/* nick name */}
          <p className="text-sm text-muted-foreground">{user?.nick_name}</p>

          <div className="grid grid-cols-3 text-xs sm:text-sm mt-2">
            <div>
              <div className="font-semibold">0</div>
              <div className="text-muted-foreground">bài viết</div>
            </div>
            <div>
              <div className="font-semibold">0</div>
              <div className="text-muted-foreground">người theo dõi</div>
            </div>
            <div>
              <div className="font-semibold">7</div>
              <div className="text-muted-foreground">đang theo dõi</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Button
          variant="secondary"
          className="flex-1 text-sm cursor-pointer hover:bg-gray-200"
          onClick={() => {
            router.push("/dashboard/profile/edit");
          }}
        >
          Chỉnh sửa trang cá nhân
        </Button>
        <Button
          variant="secondary"
          className="flex-1 text-sm cursor-pointer hover:bg-gray-200"
          onClick={() => {
            router.push("/dashboard/profile/storage");
          }}
        >
          Kho lưu trữ
        </Button>
        <div className="flex items-center justify-center cursor-pointer sm:ml-2 max-sm:hidden">
          <Settings className="w-5 h-5" />
        </div>
      </div>

      {/* Bio */}
      <div className="text-sm text-center md:text-left">
        <p>{user?.bio}</p>
      </div>
    </div>
  );
}
