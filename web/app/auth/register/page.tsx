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
import { BookOpen, Eye, EyeOff, PenTool } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { register, resendOtp, verifyOtp } from "@/app/apiClient/auth/auth";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/components/contexts/LanguageContext";

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
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const { t } = useLanguage();

  const nameRegex = /^[a-zA-Z0-9\s]{1,30}$/; // chỉ chữ và số, khoảng trắng, tối đa 30 ký tự
  const emailRegex = /^[^\s@]+@[^\s@]+\.com$/; // kết thúc bằng đuôi .com
  const passwordRegex = /^.{8,}$/;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (sentOtp) {
      setTimeout(() => setShowOtpForm(true), 300);
    }
  }, [sentOtp]);

  // đếm ngược time
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sentOtp && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sentOtp, countdown]);

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      toast.warning(t("auth.fillAllFields"), { autoClose: 1000 });
      return;
    }

    if (!nameRegex.test(name)) {
      toast.warning(t("auth.invalidUsername"), { autoClose: 1000 });
      return;
    }

    if (!emailRegex.test(email)) {
      toast.warning(t("auth.invalidEmail"), { autoClose: 1000 });
      return;
    }

    if (!passwordRegex.test(password)) {
      toast.warning(t("auth.passwordMinLength"), { autoClose: 1000 });
      return;
    }

    if (password !== confirmPassword) {
      toast.warning(t("auth.passwordMismatch"), { autoClose: 1000 });
      return;
    }

    try {
      setLoading(true);
      const res = await register({ email, password, name });
      if (res.message == "Email đã tồn tại") {
        toast.warning(t("auth.emailExists"), { autoClose: 1000 });
      } else {
        toast.success(t("auth.otpSent"), {
          autoClose: 1000,
        });
        setSentOtp(true);
        setCountdown(60);
      }
    } catch (err: any) {
      toast.error(t("auth.errorOccurred"), { autoClose: 1000 });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.warning(t("auth.enterOtp"), { autoClose: 1000 });
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOtp({ email, otp });
      toast.success(t("auth.verificationSuccess"), { autoClose: 1000 });
      router.push("/auth/login");
    } catch (err: any) {
      toast.error(t("auth.otpVerificationFailed"), { autoClose: 1000 });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      await resendOtp({ email });
      toast.success(t("auth.newOtpSent"), { autoClose: 1000 });
      setOtp("");
      setCountdown(60);
    } catch (err: any) {
      toast.error(t("auth.cannotResendOtp"), { autoClose: 1000 });
    } finally {
      setLoading(false);
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
        <span className="text-3xl mt-1 ml-2 font-bold text-gray-900 hover:text-orange-600 transition-colors duration-300">
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
              {t("auth.joinSocialLearning")}
            </CardTitle>
            <CardDescription
              className={`transition-all duration-700 delay-300 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              {!sentOtp
                ? t("auth.createAccountDescription")
                : t("auth.verifyAccountDescription")}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {!sentOtp ? (
              <>
                <div
                  className={`space-y-2 transition-all duration-700 delay-400 ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                >
                  <Label htmlFor="name" className="text-gray-700 font-medium">
                    {t("auth.username")}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={t("auth.usernamePlaceholder")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="transition-all duration-300 focus:scale-[1.02] focus:shadow-lg hover:shadow-md border-gray-200 focus:border-orange-400"
                  />
                </div>

                <div
                  className={`space-y-2 transition-all duration-700 delay-500 ${
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
                    className="transition-all duration-300 focus:scale-[1.02] focus:shadow-lg hover:shadow-md border-gray-200 focus:border-orange-400"
                  />
                </div>

                <div
                  className={`space-y-2 transition-all duration-700 delay-600 ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                >
                  <Label
                    htmlFor="password"
                    className="text-gray-700 font-medium"
                  >
                    {t("auth.password")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("auth.createPasswordPlaceholder")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg hover:shadow-md border-gray-200 focus:border-orange-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-600 cursor-pointer transition-all duration-300 hover:scale-110"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 transition-transform duration-300" />
                      ) : (
                        <Eye className="w-5 h-5 transition-transform duration-300" />
                      )}
                    </button>
                  </div>
                </div>

                <div
                  className={`space-y-2 transition-all duration-700 delay-700 ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                >
                  <Label
                    htmlFor="confirmPassword"
                    className="text-gray-700 font-medium"
                  >
                    {t("auth.confirmPassword")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("auth.confirmPasswordPlaceholder")}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-10 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg hover:shadow-md border-gray-200 focus:border-orange-400"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-600 cursor-pointer transition-all duration-300 hover:scale-110"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5 transition-transform duration-300" />
                      ) : (
                        <Eye className="w-5 h-5 transition-transform duration-300" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  disabled={loading}
                  className={`w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 cursor-pointer rounded-full transition-all duration-700 delay-800 hover:scale-105 hover:shadow-xl active:scale-95 ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  } ${loading ? "animate-pulse" : ""}`}
                  onClick={handleSignUp}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t("auth.processing")}</span>
                    </div>
                  ) : (
                    t("auth.createAccount")
                  )}
                </Button>
              </>
            ) : (
              <>
                <div
                  className={`space-y-4 transition-all duration-500 ${
                    showOtpForm
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="otp"
                      className="text-center block text-gray-700 font-medium"
                    >
                      {t("auth.enterOtpInstruction")}
                    </Label>
                    <div className="flex justify-center transform transition-all duration-500 hover:scale-105">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={(value) => setOtp(value)}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot
                            index={0}
                            className="w-12 h-12 text-xl transition-all duration-300 hover:border-orange-400 focus:border-orange-500"
                          />
                          <InputOTPSlot
                            index={1}
                            className="w-12 h-12 text-xl transition-all duration-300 hover:border-orange-400 focus:border-orange-500"
                          />
                          <InputOTPSlot
                            index={2}
                            className="w-12 h-12 text-xl transition-all duration-300 hover:border-orange-400 focus:border-orange-500"
                          />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot
                            index={3}
                            className="w-12 h-12 text-xl transition-all duration-300 hover:border-orange-400 focus:border-orange-500"
                          />
                          <InputOTPSlot
                            index={4}
                            className="w-12 h-12 text-xl transition-all duration-300 hover:border-orange-400 focus:border-orange-500"
                          />
                          <InputOTPSlot
                            index={5}
                            className="w-12 h-12 text-xl transition-all duration-300 hover:border-orange-400 focus:border-orange-500"
                          />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>

                  <Button
                    disabled={loading}
                    className={`w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 cursor-pointer rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 ${
                      loading ? "animate-pulse" : ""
                    }`}
                    onClick={handleVerifyOtp}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{t("auth.verifying")}</span>
                      </div>
                    ) : (
                      t("auth.verifyOtp")
                    )}
                  </Button>

                  {countdown > 0 ? (
                    <p className="text-center text-sm text-gray-600 animate-pulse">
                      {t("auth.enterOtpWithin")}{" "}
                      <span className="font-bold text-orange-600 animate-bounce inline-block">
                        {countdown}
                      </span>{" "}
                      {t("auth.seconds")}
                    </p>
                  ) : (
                    <div className="text-center">
                      <Button
                        disabled={loading}
                        variant="outline"
                        className="mt-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:border-orange-400 hover:text-orange-600 bg-transparent"
                        onClick={handleResendOtp}
                      >
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>{t("auth.sending")}</span>
                          </div>
                        ) : (
                          t("auth.resendOtp")
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}

            <div
              className={`text-center text-sm transition-all duration-700 delay-900 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              {t("auth.haveAccount")}{" "}
              <Link
                href="/auth/login"
                className="text-orange-600 hover:text-orange-700 hover:underline transition-all duration-300 hover:scale-105 inline-block"
              >
                {t("auth.login")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
