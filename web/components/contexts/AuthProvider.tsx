"use client";

import { getUserData } from "@/app/api/user/route";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, use, useEffect, useState } from "react";
import { getSocket } from "@/socket/socketClient";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Lỗi khi lấy phiên:", error);
      }
      const sessionUser = data?.session?.user;
      if (sessionUser) {
        updateUserData(sessionUser, sessionUser.email);
        
      } else {
        setUser(null);
        router.replace("/");
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          updateUserData(session.user, session.user.email);
        } else {
          setUser(null);
          if (event === "SIGNED_OUT") {
            router.replace("/");
          }
        }
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [router]);

  const updateUserData = async (authUser: any, email?: string) => {
    try {
      const res = await getUserData(authUser?.id);
      if (res.success) {
        setUser({
          ...res.data,
          email: email || authUser.email,
          id: authUser.id,
        });
      } else {
        // Fallback nếu không lấy được data từ API
        setUser({
          id: authUser.id,
          email: email || authUser.email,
          ...authUser,
        });
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      setUser({
        id: authUser.id,
        email: email || authUser.email,
        ...authUser,
      });
    }
  };

  useEffect(() => {
    const socket = getSocket();
    if (user?.id) {
      socket.emit("user-online", { userId: user.id });
    }
  }, [user]);

  const contextValue: AuthContextType = {
    user,
    setUser,
    loading,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
