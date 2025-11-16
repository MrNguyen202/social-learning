"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useAuth from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserImageSrc, uploadFile } from "@/app/apiClient/image/image";
import { updateUserData } from "@/app/apiClient/user/user";
import { toast } from "react-toastify";
import { getFollowers, getFollowing } from "@/app/apiClient/follow/follow";
import FollowModal from "./FollowModal";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/contexts/LanguageContext";

interface User {
  id: string;
  name: string;
  nick_name: string;
  avatar?: string;
  bio?: string;
}

interface Follower {
  id: string;
  name: string;
  nick_name: string;
  avatar?: string;
}

export default function ProfileHeader() {
  const router = useRouter();
  const { user, setUser } = useAuth<User>();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [openFollowing, setOpenFollowing] = useState(false);
  const [following, setFollowing] = useState<Follower[]>([]);
  const [openFollower, setOpenFollower] = useState(false);
  const [follower, setFollower] = useState<Follower[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    try {
      setIsLoading(true);

      const res = await uploadFile("profiles", file, "image");

      if (res?.success === false) {
        toast.error(res.msg || t("dashboard.photoUploadFailed"), {
          autoClose: 1500,
        });
        return;
      }

      const updateData = { avatar: res.data.path };
      await updateUserData(user.id, updateData);

      toast.success(t("dashboard.photoUploadSuccess"), { autoClose: 1500 });

      setUser({ ...user, avatar: res.data.path });
      setOpen(false);
    } catch (err: any) {
      toast.error(t("dashboard.photoUploadFailed"), { autoClose: 1500 });
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

      toast.success(t("dashboard.removeAvatarSuccess"), { autoClose: 1500 });

      setUser({ ...user, avatar: undefined });
      setOpen(false);
    } catch (err: any) {
      toast.error(t("dashboard.removeAvatarError"), { autoClose: 1500 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      getListFollowing();
      getListFollowers();
    }
  }, [user?.id]);

  const getListFollowing = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    const res = await getFollowing(user?.id);
    if (res.success) {
      setFollowing(res.data);
    }
    setIsLoading(false);
  };

  const getListFollowers = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    const res = await getFollowers(user?.id);
    if (res.success) {
      setFollower(res.data);
    }
    setIsLoading(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 border-b border-border md:ml-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:gap-8 mb-4">
          {/* Avatar */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Avatar className="w-20 h-20 cursor-pointer mx-auto sm:mx-0 sm:w-28 sm:h-28 ring-2 ring-offset-2 ring-primary/20">
                  <AvatarImage
                    src={
                      user?.avatar
                        ? getUserImageSrc(user.avatar)
                        : "/default-avatar-profile-icon.jpg"
                    }
                    alt="Profile"
                  />
                </Avatar>
              </motion.div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md rounded-2xl p-0">
              <DialogHeader className="p-4 pb-2">
                <DialogTitle className="text-center text-lg">
                  {t("dashboard.changePhoto")}
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-col divide-y">
                <label className="py-3 text-blue-600 border-t font-medium hover:bg-gray-50 text-center cursor-pointer transition-colors">
                  {isLoading
                    ? t("dashboard.uploadingPhoto")
                    : t("dashboard.selectPhoto")}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpload}
                    disabled={isLoading}
                  />
                </label>
                <button
                  className="py-3 text-red-600 font-medium hover:bg-gray-50 cursor-pointer disabled:opacity-50 transition-colors"
                  onClick={handleRemove}
                  disabled={isLoading}
                >
                  {isLoading
                    ? t("dashboard.processing")
                    : t("dashboard.removeCurrentPhoto")}
                </button>
                <DialogClose asChild>
                  <button
                    className="py-3 font-medium cursor-pointer"
                    disabled={isLoading}
                  >
                    {t("dashboard.cancel")}
                  </button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex-1 text-center sm:text-left mt-2 sm:mt-0"
          >
            <h1 className="text-lg font-semibold sm:text-xl">{user?.name}</h1>
            <p className="text-sm text-muted-foreground">{user?.nick_name}</p>

            <div className="grid grid-cols-3 text-xs sm:text-sm mt-2 gap-2">
              <motion.div whileHover={{ scale: 1.05 }}>
                <div className="font-semibold">0</div>
                <div className="text-muted-foreground">
                  {t("dashboard.posts")}
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer"
                onClick={() => setOpenFollower(true)}
              >
                <div className="font-semibold">{follower.length}</div>
                <div className="text-muted-foreground">
                  {t("dashboard.followers")}
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer"
                onClick={() => setOpenFollowing(true)}
              >
                <div className="font-semibold">{following.length}</div>
                <div className="text-muted-foreground">
                  {t("dashboard.following")}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-2 mb-4"
        >
          <Button
            variant="secondary"
            className="flex-1 text-sm cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={() => router.push("/dashboard/profile/edit")}
          >
            {t("dashboard.editProfile")}
          </Button>
          <Button
            variant="secondary"
            className="flex-1 text-sm cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={() => router.push("/dashboard/profile/storage")}
          >
            {t("dashboard.storage")}
          </Button>
          <motion.div
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center cursor-pointer sm:ml-2 max-sm:hidden"
          >
            <Settings className="w-5 h-5" />
          </motion.div>
        </motion.div>

        {/* Bio */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-center md:text-left"
        >
          <p>{user?.bio}</p>
        </motion.div>
      </motion.div>

      {/* Follow Modals */}
      <FollowModal
        isOpen={openFollowing}
        onClose={() => setOpenFollowing(false)}
        title={t("dashboard.following")}
        currentUserId={user?.id}
        data={following}
      />

      <FollowModal
        isOpen={openFollower}
        onClose={() => setOpenFollower(false)}
        title={t("dashboard.followers")}
        currentUserId={user?.id}
        data={follower}
      />
    </>
  );
}
