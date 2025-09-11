"use client";

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
import { useState } from "react";
import { toast } from "react-toastify";
import { login } from "@/app/api/auth/route";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const res = await login({ email, password });

      if (!res.success || !res?.data?.session) {
        toast.error("Đăng nhập thất bại", { autoClose: 1500 });
        console.error("Login failed:", res.message || "No session data");
        return;
      }

      const { error: setError } = await supabase.auth.setSession(
        res.data.session
      );

      const { data, error } = await supabase.functions.invoke(
        "update-last-seen",
        {
          body: { name: "Functions" },
          method: "POST",
          headers: { Authorization: `Bearer ${res.data.session.access_token}` },
        }
      );

      if (error) console.error("Error updating last_seen:", error);
      else console.log("Updated last_seen:", data);

      if (setError) {
        toast.error("Lỗi khi đặt phiên.", { autoClose: 1500 });
        console.error("Lỗi khi đặt phiên:", setError.message);
        return;
      }
      toast.success("Đăng nhập thành công.", { autoClose: 1500 });
      router.replace("/dashboard");
    } catch (error: any) {
      toast.error("Đăng nhập thất bại. Vui lòng thử lại.", { autoClose: 1500 });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <>
      {/* Logo */}
      <div className="absolute flex items-center px-4 py-6 ">
        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
          <PenTool className="w-5 h-5 text-white" />
        </div>
        <span className="text-3xl ml-2 mt-1 font-bold text-gray-900">
          <Link href="/">SocialLearning</Link>
        </span>
      </div>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Chào mừng trở lại</CardTitle>
            <CardDescription>
              Đăng nhập để tiếp tục hành trình nào
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu của bạn"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-3 h-full px-3 py-2 text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="#"
                className="text-sm text-orange-600 hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 cursor-pointer rounded-full"
            >
              Đăng Nhập
            </Button>
            <div className="text-center text-sm">
              Bạn chưa có tài khoản?{" "}
              <Link
                href="/auth/register"
                className="text-orange-600 hover:underline"
              >
                Đăng ký
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
