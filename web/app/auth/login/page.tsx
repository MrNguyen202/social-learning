"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, PenTool, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { login } from "@/app/apiClient/auth/auth";
import { supabase } from "@/lib/supabase";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/components/contexts/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const res = await login({ email, password }); // API login của bạn

      // 1. Kiểm tra lỗi
      if (!res.success || !res?.data?.session) {
        toast.error(t("auth.loginFailed"), { autoClose: 1000 });
        console.error("Login failed:", res.message || "No session data");
        return;
      }

      // 2. Lấy dữ liệu trả về
      const { session, role } = res.data; // <-- Lấy session và role từ response

      // 3. Đặt phiên (session) cho Supabase client
      const { error: setError } = await supabase.auth.setSession(session);

      if (setError) {
        toast.error(t("auth.sessionError"), { autoClose: 1000 });
        console.error("Lỗi khi đặt phiên:", setError.message);
        return;
      }

      // 4. (Tùy chọn) Gọi hàm update last_seen
      // Tốt hơn là truyền access_token từ session bạn vừa nhận được
      supabase.functions
        .invoke("update-last-seen", {
          body: { name: "Functions" },
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        .then(console.log)
        .catch(console.error);

      // 5. ĐIỀU HƯỚNG DỰA TRÊN ROLE
      toast.success(t("auth.loginSuccess"), { autoClose: 1000 });

      router.replace("/dashboard"); // Chuyển đến trang dashboard
    } catch (error: any) {
      toast.error(t("auth.loginFailedRetry"), { autoClose: 1000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <>
      <div
        className={`absolute flex items-center px-4 py-6 transition-all duration-700 z-10 ${
          isVisible
            ? "translate-x-0 opacity-100"
            : "-translate-x-full opacity-0"
        }`}
      >
        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-300">
          <PenTool className="w-5 h-5 text-white" />
        </div>
        <span className="text-3xl ml-2 mt-1 font-bold text-gray-900 hover:text-orange-600 transition-colors duration-300">
          <Link href="/">SocialLearning</Link>
        </span>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <Card
          className={`w-full max-w-md backdrop-blur-sm bg-white/80 border-0 shadow-2xl transition-all duration-700 ${
            isVisible
              ? "scale-100 opacity-100 translate-y-0"
              : "scale-95 opacity-0 translate-y-8"
          } hover:shadow-3xl hover:scale-[1.02]`}
        >
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div
                className={`w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center transition-all duration-500 hover:rotate-12 hover:scale-110 ${
                  isVisible ? "animate-bounce" : ""
                }`}
              >
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle
              className={`text-2xl transition-all duration-700 delay-200 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              {t("auth.welcomeBack")}
            </CardTitle>
            <CardDescription
              className={`transition-all duration-700 delay-300 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              {t("auth.loginDescription")}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div
              className={`space-y-2 transition-all duration-700 delay-400 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <Label htmlFor="email" className="text-gray-700 font-medium">
                {t("auth.email")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t("auth.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                className="transition-all duration-300 focus:scale-[1.02] focus:shadow-lg hover:shadow-md border-gray-200 focus:border-orange-400"
              />
            </div>

            <div
              className={`space-y-2 relative transition-all duration-700 delay-500 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <Label htmlFor="password" className="text-gray-700 font-medium">
                {t("auth.password")}
              </Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pr-10 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg hover:shadow-md border-gray-200 focus:border-orange-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-3 h-full px-3 py-2 text-gray-500 hover:text-orange-600 cursor-pointer transition-all duration-300 hover:scale-110"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 transition-transform duration-300" />
                ) : (
                  <Eye className="w-5 h-5 transition-transform duration-300" />
                )}
              </button>
            </div>

            <div
              className={`flex items-center justify-between transition-all duration-700 delay-600 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <Link
                href="/auth/forgotPassword"
                className="text-sm text-orange-600 hover:text-orange-700 hover:underline transition-all duration-300 hover:scale-105"
              >
                {t("auth.forgotPassword")}
              </Link>
            </div>

            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 cursor-pointer rounded-full transition-all duration-700 delay-700 hover:scale-105 hover:shadow-xl active:scale-95 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              } ${isLoading ? "animate-pulse" : ""}`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t("auth.loggingIn")}</span>
                </div>
              ) : (
                t("auth.login")
              )}
            </Button>

            <div
              className={`text-center text-sm transition-all duration-700 delay-800 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              {t("auth.noAccount")}{" "}
              <Link
                href="/auth/register"
                className="text-orange-600 hover:text-orange-700 hover:underline transition-all duration-300 hover:scale-105 inline-block"
              >
                {t("auth.signUp")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
