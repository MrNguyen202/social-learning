"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { getUserByNickName } from "@/app/apiClient/user/user";
import { Grid3X3 } from "lucide-react";
import { motion } from "framer-motion";
import ProfileFollowerHeader from "./components/ProfileFollowerHeader";
import StoryFollowersHighlights from "./components/StoryFollower";
import PhotoGridFollower from "./components/PhotoGridFollower";
import { useLanguage } from "@/components/contexts/LanguageContext";

interface User {
  id: string;
  name: string;
  nick_name: string;
  avatar?: string;
  bio?: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { nickname } = useParams();
  const { t } = useLanguage();
  const [userSearch, setUserSearch] = useState<User>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!nickname || !user?.id) return;

    const fetchUser = async () => {
      try {
        const res = await getUserByNickName(nickname as string);
        if (res.success && res.data) {
          setUserSearch(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [nickname, user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-orange-300/30 to-pink-300/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto w-full px-4 sm:px-5 md:px-8 lg:px-10 max-w-full sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl"
      >
        <ProfileFollowerHeader userSearch={userSearch} />
        <StoryFollowersHighlights userSearch={userSearch} />

        <div className="border-b border-border md:ml-5">
          <div className="flex flex-wrap justify-start">
            <button className="flex-1 flex items-center justify-center gap-1 py-3 text-xs sm:text-sm border-b-2 border-foreground">
              <Grid3X3 className="w-4 h-4" />
              <span className="hidden sm:inline">{t("dashboard.posts")}</span>
            </button>
          </div>
        </div>

        <PhotoGridFollower userSearch={userSearch} />
      </motion.div>
    </>
  );
}
