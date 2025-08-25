"use client";

import { getUserData } from "@/app/api/user/route";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, useEffect, useState } from "react";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Lỗi khi lấy phiên:", error);
      }
      setUser(data?.session?.user || null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // useEffect(() => {
  //   supabase.auth.onAuthStateChange((_event, session) => {
  //     // console.log("session user", session?.user?.id);

  //     if (session) {
  //       setUser(session?.user);
  //       updateUserData(session?.user, session?.user?.email);
  //       router.replace("/dashboard");
  //     } else {
  //       setUser(null);
  //       router.replace("/");
  //     }
  //   });
  // }, []);

  const updateUserData = async (user, email) => {
    let res = await getUserData(user?.id);
    if (res.success) setUser({ ...res.data, email });
  };


  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
