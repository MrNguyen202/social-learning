"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import {
  PenTool,
  Users,
  Trophy,
  Target,
  Bot,
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Globe,
  ArrowRight,
  Zap,
  Star,
  Rocket,
  MessageCircle,
  Mic,
  Sparkles,
  User,
  Languages,
  Bell,
  Award,
  Flame,
  NotebookPen,
  Headphones,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import useAuth from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { getUserImageSrc } from "./apiClient/image/image";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// phần about us với hiệu ứng 3D
const IsometricHero = ({ t }: { t: any }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 50 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 50 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXFromCenter = e.clientX - rect.left - width / 2;
    const mouseYFromCenter = e.clientY - rect.top - height / 2;
    x.set(mouseXFromCenter / width);
    y.set(mouseYFromCenter / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center perspective-1000 cursor-pointer"
    >
      {/* Base Layer  */}
      <motion.div
        style={{ transform: "translateZ(20px)" }}
        className="w-[90%] h-[80%] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative"
      >
        {/* Fake UI Header */}
        <div className="h-12 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        {/* Fake UI Content */}
        <div className="p-6 grid grid-cols-3 gap-4">
          <div className="col-span-2 h-32 bg-indigo-50 rounded-xl animate-pulse">
            <div className="md:col-span-3 lg:col-span-4 lg:row-span-2 p-8 relative overflow-hidden group">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 mr-3 text-indigo-500">
                  <Users size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {t("layout.socialCommunity")}
                </h3>
              </div>
              <p className="text-slate-500 mb-6">
                {t("layout.postDescription")}
              </p>
            </div>
          </div>
          <div className="col-span-1 h-32 bg-orange-50 rounded-xl animate-pulse">
            <div className="md:col-span-3 lg:col-span-4 lg:row-span-2 p-8 relative overflow-hidden group">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 mr-3 text-yellow-500">
                  <MessageCircle size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Chat</h3>
              </div>
              <p className="text-slate-500 mb-6">
                {t("layout.chatDescription")}
              </p>
            </div>
          </div>
          <div className="col-span-1 h-40 bg-pink-50 rounded-xl animate-pulse">
            <div className="md:col-span-3 lg:col-span-4 lg:row-span-2 p-8 relative overflow-hidden group">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 mr-3 text-pink-500">
                  <Languages size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {t("layout.multilingual")}
                </h3>
              </div>
              <p className="text-slate-500 mb-6">
                {t("layout.multilingualDescription")}
              </p>
            </div>
          </div>
          <div className="col-span-2 h-40 bg-green-50 rounded-xl animate-pulse">
            <div className="md:col-span-3 lg:col-span-4 lg:row-span-2 p-8 relative overflow-hidden group">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 mr-3 text-green-500">
                  <Bell size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {t("layout.notification")}
                </h3>
              </div>
              <p className="text-slate-500 mb-6">
                {t("layout.activityNotificationDescription")}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Layer 1 - Stats */}
      <motion.div
        style={{ transform: "translateZ(60px) translate(-40%, -40%)" }}
        className="absolute bottom-3/7 left-1/2 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3"
      >
        <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
          <Award size={24} />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase">
            Achievement
          </p>
          <p className="font-bold text-slate-800 text-lg">#1 Global</p>
        </div>
      </motion.div>

      {/* Floating Layer 2 - Activity */}
      <motion.div
        style={{ transform: "translateZ(90px) translate(20%, 30%)" }}
        className="absolute bottom-3/7 left-1/2 bg-white/15 p-4 rounded-2xl shadow-xl flex items-center gap-3"
      >
        <div className="p-2 bg-red-100 rounded-lg text-red-600">
          <Flame size={24} />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase">Streak</p>
          <p className="font-bold text-slate-800text-lg">30 Days </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Floating 3D ở hero
const Floating3DElement = ({
  children,
  delay = 0,
  xOffset = 0,
  yOffset = 0,
  depth = 1,
}: any) => {
  return (
    <motion.div
      animate={{
        y: [0, -20, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      }}
      className="absolute"
      style={{
        left: `calc(50% + ${xOffset}px)`,
        top: `calc(50% + ${yOffset}px)`,
        zIndex: depth,
      }}
    >
      {children}
    </motion.div>
  );
};

const AudioWave = ({ color, height }: any) => (
  <div className={`flex items-center justify-center gap-1 ${height}`}>
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        animate={{ height: [10, 25, 10] }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          delay: i * 0.1,
          ease: "easeInOut",
        }}
        className={`w-1.5 ${color} rounded-full`}
      />
    ))}
  </div>
);

const RoadmapVisual = () => (
  <div className="relative w-full h-full flex items-center px-4">
    <div className="absolute left-0 right-0 h-1 top-1/2 bg-slate-200 -translate-y-1/2 rounded-full" />
    <div className="flex justify-between w-full relative z-10">
      {[1, 2, 3].map((step) => (
        <div
          key={step}
          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            step === 2
              ? "bg-orange-500 border-orange-500 text-white scale-125 shadow-lg shadow-orange-500/30"
              : "bg-white border-slate-300 text-slate-400"
          }`}
        >
          {step === 2 ? (
            <Star size={12} fill="currentColor" />
          ) : (
            <span className="text-xs">{step}</span>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default function Page() {
  const { t } = useLanguage();
  const { user, setUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 30 });
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseX.set((e.clientX / innerWidth - 0.5) * 40); // Nghiêng tối đa 40px
      mouseY.set((e.clientY / innerHeight - 0.5) * 40);
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Background Ambient Light
  const AuroraBackground = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#F8FAFC]">
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0], x: [-20, 20, -20] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[10%] -left-[10%] w-[70vw] h-[70vw] bg-orange-200/30 rounded-full blur-[120px] mix-blend-multiply"
      />
      <motion.div
        animate={{
          scale: [1.1, 1, 1.1],
          rotate: [0, -10, 0],
          x: [20, -20, 20],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[10%] -right-[10%] w-[60vw] h-[60vw] bg-pink-200/30 rounded-full blur-[120px] mix-blend-multiply"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], y: [0, 50, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] bg-purple-200/30 rounded-full blur-[120px] mix-blend-multiply"
      />
    </div>
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success(t("dashboard.logoutSuccess"), { autoClose: 1000 });
    setMobileMenuOpen(false);
  };

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Student",
      content: "The study groups made complex topics so much easier!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Developer",
      content: "Found amazing practice partners here.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing",
      content: "Such a fun and supportive community.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen font-sans text-slate-900 selection:bg-orange-200 selection:text-orange-900 overflow-x-hidden">
      <AuroraBackground />

      {/* --- Floating Navbar --- */}
      <div className="fixed top-0 w-full z-50 px-4 pt-4 lg:pt-6">
        <motion.nav
          className="mx-auto max-w-6xl bg-white/80 backdrop-blur-md border border-white/40 shadow-lg shadow-slate-200/50 rounded-full px-6 h-16 flex items-center justify-between relative"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-1.5 rounded-lg transform group-hover:rotate-12 transition-transform shadow-md shadow-orange-500/20">
              <PenTool size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight">
              SocialLearning
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <div className="h-4 w-px bg-slate-300/50" />
            <LanguageSwitcher />

            {user ? (
              <UserDropdown user={user} handleLogout={handleLogout} t={t} />
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  variant="ghost"
                  className="rounded-full text-slate-600 hover:text-orange-600 hover:bg-orange-50 px-5 font-bold"
                >
                  <Link href="/auth/login">{t("layout.login")}</Link>
                </Button>
                <Button
                  asChild
                  className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 px-6 shadow-md font-bold"
                >
                  <Link href="/auth/register">{t("layout.register")}</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-600"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu />
          </button>
        </motion.nav>
      </div>

      {/* Mobile Fullscreen Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[60] bg-white flex flex-col p-6 md:hidden"
          >
            <div className="flex justify-between items-center mb-8">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 bg-slate-100 rounded-full"
              >
                <X />
              </button>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              {user && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl mb-4">
                  <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                    <AvatarImage src={getUserImageSrc(user.avatar)} />
                    <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-slate-900 text-lg">
                      {user.name}
                    </p>
                    <p className="text-sm text-slate-500">{user.nick_name}</p>
                  </div>
                </div>
              )}

              <div className="mt-auto flex flex-col gap-4">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-2 font-semibold text-slate-700">
                    <Globe size={20} className="text-orange-500" />{" "}
                    {t("layout.languages")}
                  </div>
                  <LanguageSwitcher />
                </div>

                {user ? (
                  <>
                    <Button
                      asChild
                      className="w-full h-14 text-lg rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 font-bold"
                    >
                      <Link href="/dashboard">{t("layout.dashboard")}</Link>
                    </Button>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full h-14 text-lg rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                    >
                      {t("layout.logout")}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      asChild
                      className="w-full h-14 text-lg rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 font-bold"
                    >
                      <Link href="/auth/register">{t("layout.register")}</Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full h-14 text-lg rounded-2xl font-bold"
                    >
                      <Link href="/auth/login">{t("layout.login")}</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="pt-40 pb-20 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content (from #1) */}
          <div className="text-center lg:text-left z-10 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 px-4 py-1.5 text-sm bg-white/80 backdrop-blur border border-orange-200 text-orange-700 shadow-sm hover:bg-white animate-bounce">
                {t("layout.socialLearningPlatform")}
              </Badge>

              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight">
                {t("layout.socialNetworkCommunity")}{" "}
                <br className="hidden lg:block" />
                <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  {t("layout.englishLearning")}
                </span>
              </h1>

              <p className="text-xl text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {t("layout.heroDescription")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {user ? (
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 rounded-full bg-slate-900 text-white text-lg font-bold shadow-xl shadow-slate-900/20 hover:scale-105 transition-transform"
                  >
                    <Link href="/dashboard">{t("layout.goToDashboard")}</Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white text-lg font-bold shadow-xl shadow-orange-500/30 hover:scale-105 transition-transform"
                  >
                    <Link href="/auth/register">{t("layout.joinNow")}</Link>
                  </Button>
                )}
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 rounded-full bg-white border-slate-200 text-slate-700 hover:bg-slate-50 text-lg font-bold hover:scale-105 transition-transform"
                >
                  <Link href="/auth/login">{t("layout.tryLearning")}</Link>
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Right: Visual Combo */}
          <div className="relative w-full h-[500px] hidden lg:flex items-center justify-center perspective-1000">
            <motion.div
              style={{ x: springX, y: springY }}
              className="relative h-[400px] lg:h-[600px] w-full hidden sm:flex items-center justify-center perspective-1000"
            >
              {/* Main 3D Card */}
              <motion.div
                initial={{ rotateX: 10, rotateY: -10, scale: 0.8, opacity: 0 }}
                animate={{ rotateX: 0, rotateY: 0, scale: 1, opacity: 1 }}
                transition={{ duration: 1, type: "spring" }}
                className="relative z-10 w-72 h-96 lg:w-96 lg:h-[30rem] bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/50 shadow-2xl shadow-purple-500/20 flex flex-col items-center justify-center overflow-hidden"
              >
                {/* Nội dung trong thẻ 3D */}
                <div className="absolute inset-0 pointer-events-none" />
                {/* fake mess */}
                <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white">
                    <Bot size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">AI</p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />{" "}
                      Online
                    </p>
                  </div>
                </div>
                <div className="flex-1 px-4 flex flex-col gap-3 overflow-hidden">
                  <div className="self-start bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm border border-slate-100 max-w-[85%]">
                    {t("layout.helloMessage")}
                  </div>
                  <div className="self-end bg-gradient-to-r from-orange-500 to-pink-500 text-white p-3 rounded-2xl rounded-tr-none shadow-md text-sm max-w-[85%]">
                    {t("layout.responseMessage")}
                  </div>
                  <div className="self-start bg-green-50 text-green-800 p-2 rounded-xl text-xs flex items-center gap-2 border border-green-100">
                    <Sparkles size={12} /> AI: {t("layout.praiseMessage")}
                  </div>
                  <div className="flex self-end bg-gradient-to-r from-orange-500 to-pink-500 text-white p-3 rounded-2xl rounded-tr-none shadow-md text-sm max-w-[85%]">
                    <AudioWave color="bg-white" height="h-4" />
                  </div>
                </div>
                <div className="text-center p-4">
                  <h3 className="text-2xl font-black text-slate-800 mb-2">
                    {t("layout.levelUp")}
                  </h3>
                  <p className="text-slate-600 font-medium">
                    {t("layout.masterEnglishWithAI")}
                  </p>
                  <div className="mt-6 flex gap-2 justify-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      🇺🇸
                    </div>
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      🇻🇳
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Elements */}
              <Floating3DElement
                xOffset={-380}
                yOffset={-120}
                delay={0}
                depth={0}
              >
                <div className="p-4 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-float">
                  <div className="bg-green-100 p-2 rounded-lg text-green-600">
                    <Target size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">
                      Daily Goal
                    </p>
                    <p className="font-bold text-slate-800">Completed</p>
                  </div>
                </div>
              </Floating3DElement>

              <Floating3DElement xOffset={200} yOffset={100} delay={1}>
                <div className="p-4 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-float-delayed">
                  <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">
                      Rank
                    </p>
                    <p className="font-bold text-slate-800">Top 1%</p>
                  </div>
                </div>
              </Floating3DElement>

              <Floating3DElement xOffset={180} yOffset={-150} delay={2}>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center text-white text-2xl font-bold">
                  A+
                </div>
              </Floating3DElement>

              <Floating3DElement
                xOffset={-300}
                yOffset={50}
                delay={1}
                depth={10}
              >
                <div className="p-4 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-float">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <Bot size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">
                      AI Chat
                    </p>
                    <p className="font-bold text-slate-800">Active</p>
                  </div>
                </div>
              </Floating3DElement>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-20 relative z-10" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-orange-600 font-bold tracking-wider uppercase text-sm">
              {t("layout.powerfulFeatures")}
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mt-2">
              {t("layout.powerfulFeaturesDescription")}
            </h2>
          </div>

          <div className="hidden lg:block">
            <IsometricHero t={t} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Large Card - AI */}
            <div className="md:col-span-2 bg-slate-50 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border border-slate-100">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-200">
                  <Bot size={28} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                  {t("layout.aiSupport")}
                </h3>
                <p className="text-slate-500 text-lg max-w-lg leading-relaxed">
                  {t("layout.aiSupportDescription")}
                </p>
              </div>
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-blue-200/30 rounded-full blur-[80px] group-hover:bg-blue-300/30 transition-colors" />
            </div>

            {/* Medium Card - Social */}
            <div className="bg-indigo-50 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group border border-indigo-100 hover:border-indigo-200 transition-all hover:shadow-xl">
              <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-200">
                <Users size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                {t("layout.socialInteractiveLearning")}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {t("layout.socialInteractiveDescription")}
              </p>
            </div>

            {/* Medium Card - Smart Rewrite */}
            <div className="bg-pink-50 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group border border-pink-100 hover:border-pink-200 transition-all hover:shadow-xl">
              <div className="w-14 h-14 bg-pink-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-pink-200">
                <NotebookPen size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                {t("layout.smartSentenceRewriting")}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {t("layout.smartSentenceDescription")}
              </p>
            </div>
            {/* Medium Card - Smart Listening */}
            <div className="bg-orange-50 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group border border-orange-100 hover:border-orange-200 transition-all hover:shadow-xl">
              <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-orange-200">
                <Headphones size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                {t("layout.smartSentenceRewListening")}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {t("layout.smartSentenceRewListeningDescription")}
              </p>
            </div>

            {/* Medium Card - Smart speaking */}
            <div className="bg-green-50 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group border border-green-100 hover:border-green-200 transition-all hover:shadow-xl">
              <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-green-200">
                <Volume2 size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                {t("layout.smartSpeaking")}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {t("layout.smartSpeakingDescription")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="py-20 relative z-10" id="leaderboard">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
              {t("layout.leaderboard")}
            </h2>
            <p className="text-slate-500 mt-2 text-lg">
              {t("layout.topLearnersFeedback")}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-0 shadow-lg h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <CardContent className="p-8 flex flex-col h-full">
                    <div className="flex gap-1 text-yellow-400 mb-6">
                      {[...Array(item.rating)].map((_, k) => (
                        <Star key={k} size={18} fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-slate-600 mb-8 leading-relaxed flex-grow italic">
                      "{item.content}"
                    </p>
                    <div className="flex items-center gap-4 mt-auto">
                      <Avatar className="h-12 w-12 ring-2 ring-orange-100">
                        <AvatarFallback className="bg-gradient-to-br from-orange-400 to-pink-400 text-white font-bold">
                          {item.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-bold text-slate-900">
                          {item.name}
                        </h4>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">
                          {item.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 relative z-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 group">
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-1.5 rounded-lg shadow-md">
              <PenTool size={16} />
            </div>
            <span className="font-bold text-lg text-slate-900">
              SocialLearning
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            © 2025 SocialLearning Inc. {t("layout.allRightsReserved")}
          </p>
        </div>
      </footer>
    </div>
  );
}

// Helper Component
const UserDropdown = ({ user, handleLogout, t }: any) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Avatar className="cursor-pointer ring-2 ring-offset-2 ring-transparent hover:ring-orange-500 transition-all ml-2">
        <AvatarImage src={getUserImageSrc(user.avatar)} />
        <AvatarFallback className="bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold">
          {user.name?.[0]}
        </AvatarFallback>
      </Avatar>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      className="w-56 p-2 rounded-2xl shadow-xl border-slate-100 bg-white/90 backdrop-blur-md"
    >
      <div className="px-3 py-2 mb-2 bg-orange-50/50 rounded-xl">
        <p className="font-bold text-slate-900">{user.name}</p>
        <p className="text-xs text-slate-500 truncate">{user.email}</p>
      </div>
      <DropdownMenuItem
        asChild
        className="rounded-xl cursor-pointer p-3 font-bold focus:bg-orange-50"
      >
        <Link href="/dashboard">
          <LayoutDashboard className="mr-2 h-4 w-4 text-orange-500" />{" "}
          {t("layout.dashboard")}
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem
        asChild
        className="rounded-xl cursor-pointer p-3 font-bold focus:bg-orange-50"
      >
        <Link href="/dashboard/profile">
          <UserIcon className="mr-2 h-4 w-4 text-orange-500" />{" "}
          {t("layout.profile")}
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator className="bg-slate-200" />
      <DropdownMenuItem
        onClick={handleLogout}
        className="text-red-600 rounded-xl cursor-pointer p-3 font-bold hover:bg-red-50 focus:bg-red-50"
      >
        <LogOut className="mr-2 h-4 w-4" /> {t("layout.logout")}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
