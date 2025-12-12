"use client";

import { getUserData } from "@/app/apiClient/user/user";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, use, useEffect, useState } from "react";
import { getSocket } from "@/socket/socketClient";
import { toast } from "react-toastify";
import { useLanguage } from "./LanguageContext";

interface User {
  id: string;
  email: string;
  name?: string;
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
  const { t } = useLanguage();
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
      const registerUser = () => {
        // Đảm bảo gửi đúng format mà socket.js bên server đang đợi
        // Nếu server đợi: socket.on("user-online", ({ userId }) => ...)
        console.log("Registering user to socket:", user.id);
        socket.emit("user-online", { userId: user.id });
      };

      // 2. Gọi ngay lần đầu
      registerUser();

      // 3. --- QUAN TRỌNG: Lắng nghe sự kiện connect để báo danh lại khi rớt mạng/server reset ---
      socket.on("connect", registerUser);

      // chấp nhận cuộc gọi
      const handleAcceptCall = (conversationId: string) => {
        toast.dismiss(); // Đóng thông báo
        router.push(`/room/${conversationId}`);
      };

      // từ chối cuộc gọi
      const handleDeclineCall = (conversationId: string) => {
        toast.dismiss(); // Đóng thông báo
        socket.emit("declineCall", {
          conversationId,
          declinerId: user.id, // Dùng user.id từ context
        });
      };

      // hàm lắng nghe
      const onIncomingCall = ({
        callerName,
        conversationId,
      }: {
        callerName: string;
        conversationId: string;
      }) => {
        // Hiển thị thông báo (toast) cho người dùng
        toast.info(
          ({ closeToast }) => (
            <div className="flex flex-col gap-2">
              <p className="font-semibold">
                {callerName} {t("chat.calling_you")}
              </p>
              <div className="flex justify-around">
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer hover:bg-green-600"
                  onClick={() => {
                    handleAcceptCall(conversationId);
                    closeToast?.();
                  }}
                >
                  {t("chat.accept_call")}
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded cursor-pointer hover:bg-red-600"
                  onClick={() => {
                    handleDeclineCall(conversationId);
                    closeToast?.();
                  }}
                >
                  {t("chat.decline_call")}
                </button>
              </div>
            </div>
          ),
          {
            autoClose: false,
            closeOnClick: false,
            draggable: false,
          }
        );
      };

      // Lắng nghe sự kiện
      socket.on("incomingCall", onIncomingCall);

      // dọn dẹp
      return () => {
        socket.off("incomingCall", onIncomingCall);
        socket.off("connect", registerUser);
      };
    }
  }, [user, router]);

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
