"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { BookOpen, PenTool } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { verifyResetOtp } from "@/app/api/auth/route";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function VerifyPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [sentOtp, setSentOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSentOtp(true);
    setCountdown(60);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sentOtp && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sentOtp, countdown]);

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.warning("Vui lòng nhập mã OTP.", { autoClose: 1000 });
      return;
    }

    try {
      const email = JSON.parse(localStorage.getItem("email") || '""');
      setLoading(true);
      const res = await verifyResetOtp({ email, otp });
      if (!res.success) {
        toast.error(res.message || "Xác thực OTP thất bại.", {
          autoClose: 1000,
        });
        return;
      }
      localStorage.setItem("resetSession", JSON.stringify(res.data.session));
      toast.success("Xác nhận thành công", { autoClose: 1000 });
      router.push("/auth/forgotPassword/newPassword");
    } catch (err: any) {
      toast.error("Xác thực OTP thất bại.", { autoClose: 1000 });
    } finally {
      setLoading(false);
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
            <CardTitle className="text-2xl">Quên mật khẩu</CardTitle>
            <CardDescription>
              Nhập email của bạn để nhận liên kết đặt lại mật khẩu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nhập OTP */}
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-center block">
                Nhập mã OTP đã gửi đến email của bạn
              </Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-12 h-12 text-xl" />
                    <InputOTPSlot index={1} className="w-12 h-12 text-xl" />
                    <InputOTPSlot index={2} className="w-12 h-12 text-xl" />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} className="w-12 h-12 text-xl" />
                    <InputOTPSlot index={4} className="w-12 h-12 text-xl" />
                    <InputOTPSlot index={5} className="w-12 h-12 text-xl" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <Button
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 cursor-pointer rounded-full"
              onClick={handleVerifyOtp}
            >
              {loading ? "Đang xác thực..." : "Xác thực OTP"}
            </Button>

            {countdown > 0 ? (
              <p className="text-center text-sm text-gray-600">
                Vui lòng nhập OTP trong{" "}
                <span className="font-bold">{countdown}</span> giây
              </p>
            ) : (
              <div className="text-center">
                <Button
                  disabled={loading}
                  variant="outline"
                  className="mt-2 cursor-pointer"
                  onClick={() => router.push("/auth/login")}
                >
                  {loading ? "Đang gửi..." : "Quay lại đăng nhập"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
