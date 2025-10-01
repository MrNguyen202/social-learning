"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Ellipsis, LoaderIcon } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { getUserImageSrc } from "@/app/api/image/route";
import {
  checkIsFollowing,
  followUser,
  getFollowers,
  getFollowing,
  unfollowUser,
} from "@/app/api/follow/route";
import UserFollowModal from "./UserFollowModal";
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

export default function ProfileFollowerHeader({
  userSearch,
}: {
  userSearch: User | undefined;
}) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [openFollowing, setOpenFollowing] = useState(false);
  const [following, setFollowing] = useState<Follower[]>([]);
  const [openFollower, setOpenFollower] = useState(false);
  const [follower, setFollower] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const fetchUser = async () => {
      try {
        if (userSearch) {
          const followRes = await checkIsFollowing(user.id, userSearch.id);
          setIsFollowing(followRes.isFollowing);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [user?.id, userSearch]);

  useEffect(() => {
    if (userSearch?.id) {
      getListFollowing();
      getListFollowers();
    }
  }, [userSearch?.id]);

  const getListFollowing = async () => {
    if (!user?.id || !userSearch?.id) {
      return;
    }
    setLoading(true);
    const res = await getFollowing(userSearch?.id);
    if (res.success) {
      setFollowing(res.data);
    }
    setLoading(false);
  };

  const getListFollowers = async () => {
    if (!user?.id || !userSearch?.id) {
      return;
    }
    setLoading(true);
    const res = await getFollowers(userSearch?.id);
    if (res.success) {
      setFollower(res.data);
    }
    setLoading(false);
  };

  const handleFollowToggle = async () => {
    if (!userSearch) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(user?.id, userSearch.id);
        setIsFollowing(false);
      } else {
        await followUser(user?.id, userSearch.id);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Follow toggle failed:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return <p className="p-6">{t("dashboard.loading")}</p>;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="py-4 mt-4 border-b border-border md:mx-5 max-lg:pl-2"
      >
        <div className="flex flex-col md:flex-row md:items-start md:gap-8 mb-4">
          {/* Avatar */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Avatar className="w-20 h-20 cursor-pointer mx-auto md:mx-0 sm:w-28 sm:h-28">
              <AvatarImage
                src={
                  userSearch?.avatar
                    ? getUserImageSrc(userSearch.avatar)
                    : "/default-avatar-profile-icon.jpg"
                }
                alt="Profile"
              />
            </Avatar>
          </motion.div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left mt-2 md:mt-0">
            <div className="flex flex-col md:flex-row gap-2 mb-4">
              <div className="mr-4">
                <h1 className="text-lg font-semibold sm:text-xl">
                  {userSearch?.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {userSearch?.nick_name}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`md:w-45 w-full h-8 px-4 py-1.5 rounded-lg font-medium cursor-pointer ${
                  isFollowing
                    ? "bg-gray-200 text-black hover:bg-gray-300"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {followLoading ? (
                  <LoaderIcon className="h-4 w-4 m-auto animate-spin" />
                ) : isFollowing ? (
                  t("dashboard.unfollow")
                ) : (
                  t("dashboard.follow")
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="md:w-45 w-full h-8 px-4 py-1.5 rounded-lg font-medium cursor-pointer bg-gray-200 text-black hover:bg-gray-300"
              >
                {t("dashboard.message")}
              </motion.button>
              <div className="mt-2 cursor-pointer sm:ml-2 max-lg:hidden">
                <Ellipsis className="w-5 h-5" />
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0">
              <div className="grid grid-cols-3 text-xs sm:text-sm mt-2">
                <div>
                  <div className="font-semibold">0</div>
                  <div className="text-muted-foreground">
                    {t("dashboard.posts")}
                  </div>
                </div>
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
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="text-sm text-center md:text-left">
          <p>{userSearch?.bio}</p>
        </div>
      </motion.div>

      {/* Follow Modals */}
      <UserFollowModal
        isOpen={openFollowing}
        onClose={() => setOpenFollowing(false)}
        title={t("dashboard.following")}
        data={following}
      />

      <UserFollowModal
        isOpen={openFollower}
        onClose={() => setOpenFollower(false)}
        title={t("dashboard.followers")}
        data={follower}
      />
    </>
  );
}
