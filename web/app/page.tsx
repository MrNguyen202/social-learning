"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  PenTool,
  Users,
  Trophy,
  Target,
  BookOpen,
  Star,
  Bot,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getUserImageSrc } from "./api/image/route";
import { useEffect, useRef } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { toast } from "react-toastify";
import { useConversation } from "@/components/contexts/ConversationContext";

export default function Page() {
  const { t } = useLanguage();

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Computer Science Student",
      content:
        "This platform transformed how I learn. The study groups and peer discussions made complex topics so much easier to understand!",
      avatar: "/globe.svg?height=40&width=40",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Professional Developer",
      content:
        "The collaborative approach to learning is incredible. I've made lasting connections while advancing my skills.",
      avatar: "/globe.svg?height=40&width=40",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Specialist",
      content:
        "Finally, a learning platform that feels social and engaging. The community support is amazing!",
      avatar: "/globe.svg?height=40&width=40",
      rating: 5,
    },
  ];

  const { user, setUser } = useAuth();
  const { setSelectedConversation } = useConversation();

  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    }, observerOptions);

    const elements = [
      heroRef,
      featuresRef,
      howItWorksRef,
      ctaRef,
      testimonialsRef,
    ];
    elements.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem("selectedConversation");
      setSelectedConversation(null);
      toast.success(t("logoutSuccess"), { autoClose: 1000 });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 animate-fade-in-down">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
              <PenTool className="w-5 h-5 text-white" />
            </div>
            <span className="mt-1 text-3xl font-bold text-gray-900 transition-all duration-300 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-pink-500 group-hover:bg-clip-text">
              <Link href="/">SocialLearning</Link>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <LanguageSwitcher />

            {user ? (
              // Hiển thị khi đã đăng nhập
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all duration-300 hover:scale-110">
                    <AvatarImage
                      src={
                        user.avatar
                          ? getUserImageSrc(user.avatar)
                          : "/default-avatar-profile-icon.jpg"
                      }
                      alt={user.name || "User Avatar"}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-56 animate-in slide-in-from-top-2 duration-200"
                >
                  <div className="flex items-center space-x-2 p-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={
                          user.avatar
                            ? getUserImageSrc(user.avatar)
                            : "/default-avatar-profile-icon.jpg"
                        }
                        alt={user.name || "User Avatar"}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.nick_name || user.email}
                      </p>
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>{t("layout.dashboard")}</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>{t("layout.profile")}</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t("layout.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                {/* Desktop View */}
                <div className="hidden md:flex items-center space-x-3">
                  <Button
                    variant="outline"
                    className="bg-white text-gray-800 border-gray-300 hover:bg-gray-100 rounded-full p-6 text-[16px] transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    asChild
                  >
                    <Link href="/auth/login">{t("layout.login")}</Link>
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white hover:text-white rounded-full p-6 text-[16px] transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/25"
                    asChild
                  >
                    <Link href="/auth/register">{t("layout.register")}</Link>
                  </Button>
                </div>

                {/* Mobile View */}
                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="p-2 rounded-full transition-all duration-300 hover:scale-110 hover:rotate-180 bg-transparent"
                      >
                        <svg
                          className="w-6 h-6 text-gray-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                          />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 animate-in slide-in-from-top-2 duration-200"
                    >
                      <DropdownMenuItem asChild>
                        <Link href="/auth/login">{t("layout.login")}</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/auth/register">{t("layout.register")}</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-12">
        <div
          ref={heroRef}
          className="text-center max-w-3xl mx-auto opacity-0 translate-y-8 transition-all duration-1000 ease-out"
        >
          <Badge className="mb-6 text-sm bg-orange-100 text-orange-800 hover:bg-orange-100 animate-bounce">
            {t("layout.socialLearningPlatform")}
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {t("layout.socialNetworkCommunity")}
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
              {" "}
              {t("layout.englishLearning")}
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            {t("layout.heroDescription")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-12 py-6 text-lg cursor-pointer rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/30 transform hover:-translate-y-1"
            >
              <Link href="auth/login">{t("layout.joinNow")}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 px-12 py-6 text-lg cursor-pointer rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl transform hover:-translate-y-1"
            >
              {t("layout.tryLearning")}
            </Button>
          </div>
        </div>

        {/* Features */}
        <div
          ref={featuresRef}
          className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16 opacity-0 translate-y-8 transition-all duration-1000 ease-out"
        >
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 group cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 transition-colors duration-300 group-hover:text-orange-600">
                {t("layout.smartSentenceRewriting")}
              </h3>
              <p className="text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                {t("layout.smartSentenceDescription")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 group cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 transition-colors duration-300 group-hover:text-orange-600">
                {t("layout.socialInteractiveLearning")}
              </h3>
              <p className="text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                {t("layout.socialInteractiveDescription")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 group cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 transition-colors duration-300 group-hover:text-orange-600">
                {t("layout.scoringRanking")}
              </h3>
              <p className="text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                {t("layout.scoringRankingDescription")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 group cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 transition-colors duration-300 group-hover:text-orange-600">
                {t("layout.aiSupport")}
              </h3>
              <p className="text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                {t("layout.aiSupportDescription")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <div
          ref={howItWorksRef}
          className="max-w-4xl mx-auto text-center mb-16 opacity-0 translate-y-8 transition-all duration-1000 ease-out"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 animate-fade-in">
            {t("layout.howItWorks")}
          </h2>
          <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-2 gap-6">
            <div className="flex flex-col items-center group transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-orange-200 group-hover:scale-110 group-hover:rotate-12">
                <BookOpen className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 transition-colors duration-300 group-hover:text-orange-600">
                {t("layout.step1")}
              </h3>
              <p className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                {t("layout.step1Description")}
              </p>
            </div>
            <div className="flex flex-col items-center group transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-pink-200 group-hover:scale-110 group-hover:rotate-12">
                <PenTool className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 transition-colors duration-300 group-hover:text-pink-600">
                {t("layout.step2")}
              </h3>
              <p className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                {t("layout.step2Description")}
              </p>
            </div>
            <div className="flex flex-col items-center group transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-orange-200 group-hover:scale-110 group-hover:rotate-12">
                <Target className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 transition-colors duration-300 group-hover:text-orange-600">
                {t("layout.step3")}
              </h3>
              <p className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                {t("layout.step3Description")}
              </p>
            </div>
            <div className="flex flex-col items-center group transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-pink-200 group-hover:scale-110 group-hover:rotate-12">
                <Star className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 transition-colors duration-300 group-hover:text-pink-600">
                {t("layout.step4")}
              </h3>
              <p className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                {t("layout.step4Description")}
              </p>
            </div>
          </div>
        </div>

        {/* Bắt đầu */}
        <div
          ref={ctaRef}
          className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-8 text-center text-white max-w-4xl mx-auto opacity-0 translate-y-8 transition-all duration-1000 ease-out hover:shadow-2xl hover:shadow-orange-500/30 hover:scale-105 transform hover:-translate-y-2 cursor-pointer"
        >
          <h2 className="text-3xl font-bold mb-4">{t("layout.startYourJourney")}</h2>
          <p className="text-xl mb-6 opacity-90">{t("layout.ctaDescription")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl transform hover:-translate-y-1"
            >
              <Link href="auth/register">{t("layout.createFreeAccount")}</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Rank */}
      <section id="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={testimonialsRef}
            className="text-center space-y-4 mb-16 opacity-0 translate-y-8 transition-all duration-1000 ease-out"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              {t("layout.leaderboard")}
            </h2>
            <p className="text-xl text-gray-600">{t("layout.topMembers")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 group cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400 transition-all duration-300 group-hover:scale-125"
                        style={{ animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 transition-colors duration-300 group-hover:text-gray-700">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center space-x-3">
                    <Avatar className="transition-all duration-300 group-hover:scale-110">
                      <AvatarImage
                        src={testimonial.avatar || "/placeholder.svg"}
                      />
                      <AvatarFallback>
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900 transition-colors duration-300 group-hover:text-orange-600">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-gray-200 animate-fade-in">
        <div className="text-center text-gray-600">
          <p>&copy; 2025 SocialLearning. {t("layout.allRightsReserved")}</p>
        </div>
      </footer>
    </div>
  );
}
