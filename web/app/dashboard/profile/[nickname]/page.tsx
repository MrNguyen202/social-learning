// "use client";

// import { useParams } from "next/navigation";
// import PhotoGridFollower from "./componets/PhotoGridFollower";
// import ProfileFollowerHeader from "./componets/ProfileFollowerHeader";
// import StoryFollowersHighlights from "./componets/StoryFollower";
// import { useEffect, useState } from "react";
// import useAuth from "@/hooks/useAuth";
// import { getUserByNickName } from "@/app/api/user/route";
// import { Grid3X3 } from "lucide-react";

// interface User {
//   id: string;
//   name: string;
//   nick_name: string;
//   avatar?: string;
//   bio?: string;
// }

// export default function ProfilePage() {
//   const { user } = useAuth();
//   const { nickname } = useParams();
//   const [userSearch, setUserSearch] = useState<User>();
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!nickname || !user?.id) return;

//     const fetchUser = async () => {
//       try {
//         const res = await getUserByNickName(nickname as string);
//         if (res.success && res.data) {
//           setUserSearch(res.data);
//         }
//       } catch (err) {
//         console.error("Failed to fetch user:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUser();
//   }, [nickname, user?.id]);

//   return (
//     <div className="mx-auto w-full max-w-md pt-4 px-5 sm:max-w-2xl max-lg:max-w-3xl max-lg:mx-5 lg:max-w-4xl lg:mx-5">
//       <ProfileFollowerHeader userSearch={userSearch} />
//       <StoryFollowersHighlights userSearch={userSearch} />
//       <div className="border-b border-border md:ml-5">
//         <div className="flex">
//           <button
//             className={
//               "flex-1 flex items-center justify-center gap-1 py-3 text-xs sm:text-sm "
//             }
//           >
//             <Grid3X3 className="w-4 h-4" />
//             <span className="hidden sm:inline">Bài viết</span>
//           </button>
//         </div>
//       </div>
//       <PhotoGridFollower userSearch={userSearch} />
//     </div>
//   );
// }

"use client";

import { useParams } from "next/navigation";
import PhotoGridFollower from "./componets/PhotoGridFollower";
import ProfileFollowerHeader from "./componets/ProfileFollowerHeader";
import StoryFollowersHighlights from "./componets/StoryFollower";
import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { getUserByNickName } from "@/app/api/user/route";
import { Grid3X3 } from "lucide-react";

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

  return (
    <div className="mx-auto w-full px-4 sm:px-5 md:px-8 lg:px-10 max-w-full sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl">
      <ProfileFollowerHeader userSearch={userSearch} />
      <StoryFollowersHighlights userSearch={userSearch} />

      <div className="border-b border-border md:ml-5">
        <div className="flex flex-wrap justify-start">
          <button
            className={
              "flex-1 flex items-center justify-center gap-1 py-3 text-xs sm:text-sm "
            }
          >
            <Grid3X3 className="w-4 h-4" />
            <span className="hidden sm:inline">Bài viết</span>
          </button>
        </div>
      </div>

      <PhotoGridFollower userSearch={userSearch} />
    </div>
  );
}
