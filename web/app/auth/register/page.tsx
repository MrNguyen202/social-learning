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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, Eye, EyeOff, PenTool } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { register, verifyOtp } from "@/app/api/auth/route";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [sentOtp, setSentOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      toast.warning("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (password !== confirmPassword) {
      toast.warning("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      const res = await register({ email, password, name });
      console.log("res", res.message);
      if (res.message == "Email đã tồn tại") {
        toast.warning("Email đã tồn tại");
      } else {
        toast.success("OTP đã được gửi đến email của bạn.");
        setSentOtp(true);
      }
    } catch (err: any) {
      console.log("error", err.response?.data?.error);
      toast.error("Đã xảy ra lỗi.");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.warning("Vui lòng nhập mã OTP.");
      return;
    }

    try {
      const res = await verifyOtp({ email, otp });
      console.log("res", res.data.message);
      toast.success("Xác nhận thành công");
      // Sau khi xác thực OTP thành công, có thể chuyển hướng hoặc reset form
      router.push("/auth/login");
    } catch (err: any) {
      console.log("error", err.response?.data?.error);
      toast.error("Xác thực OTP thất bại.");
    }
  };

  return (
    <>
      {/* Logo */}
      <div className="absolute flex items-center px-4 py-6 ">
        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
          <PenTool className="w-5 h-5 text-white" />
        </div>
        <span className="text-3xl mt-1 ml-2 font-bold text-gray-900">
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
            <CardTitle className="text-2xl">Tham gia SocialLearning</CardTitle>
            <CardDescription>
              Tạo tài khoản của bạn và bắt đầu học cùng nhau
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!sentOtp ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Tên tài khoản</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nhập tên tài khoản của bạn"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Tạo mật khẩu mạnh"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Xác nhận mật khẩu của bạn"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms" className="text-sm">
                    Tôi đồng ý với{" "}
                    <Link href="#" className="text-orange-600 hover:underline">
                      Điều khoản dịch vụ
                    </Link>{" "}
                    và{" "}
                    <Link href="#" className="text-orange-600 hover:underline">
                      Chính sách bảo mật
                    </Link>
                  </Label>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 cursor-pointer rounded-full"
                  onClick={handleSignUp}
                >
                  Tạo tài khoản
                </Button>
              </>
            ) : (
              <>
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
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 cursor-pointer rounded-full"
                  onClick={handleVerifyOtp}
                >
                  Xác thực OTP
                </Button>
              </>
            )}
            <div className="text-center text-sm">
              Bạn đã có tài khoản?{" "}
              <Link
                href="/auth/login"
                className="text-orange-600 hover:underline"
              >
                Đăng nhập
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
