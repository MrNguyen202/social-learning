"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import useAuth from "@/hooks/useAuth";
import { updateUserData } from "@/app/apiClient/user/user";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { convertToDateTime } from "@/utils/formatTime";
import { getUserImageSrc, uploadFile } from "@/app/apiClient/image/image";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { ArrowLeft } from "lucide-react";

const getGenderDisplay = (gender: boolean | null | undefined): string => {
  if (gender === true) return "Nam";
  if (gender === false) return "Nữ";
  return "null";
};

const getGenderValue = (value: string): boolean | null => {
  if (value === "Nam") return true;
  if (value === "Nữ") return false;
  return null;
};

export default function ProfileEditPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [formData, setFormData] = useState(() => ({
    nickName: user?.nick_name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    bio: user?.bio || "",
    dob: user?.dob ? convertToDateTime(user.dob) : "",
    gender: user?.gender ?? null,
    avatar: user?.avatar || null,
  }));

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && Object.keys(user).length > 0) {
      setFormData((prev) => {
        const newData = {
          nickName: user.nick_name || "",
          phone: user.phone || "",
          address: user.address || "",
          bio: user.bio || "",
          dob: user.dob ? convertToDateTime(user.dob) : "",
          gender: user.gender ?? null,
          avatar: user.avatar || null,
        };

        if (JSON.stringify(prev) !== JSON.stringify(newData)) {
          return newData;
        }
        return prev;
      });
    }
  }, [user]);

  const genderDisplayValue = useMemo(
    () => getGenderDisplay(formData.gender),
    [formData.gender]
  );

  const maxDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  const handleInputChange = useCallback(
    (field: string) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({
          ...prev,
          [field]: e.target.value,
        }));
      },
    []
  );

  const handleGenderChange = useCallback((value: string) => {
    const newGender = getGenderValue(value);
    setFormData((prev) => ({
      ...prev,
      gender: newGender,
    }));
  }, []);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        setIsLoading(true);

        const res = await uploadFile("profiles", file, "image");

        if (res?.success === false) {
          toast.error(res.msg || "Upload Failed", { autoClose: 1500 });
          return;
        }

        setFormData((prev) => ({
          ...prev,
          avatar: res.data.path,
        }));

        setOpen(false);
      } catch (err) {
        toast.error("Upload Failed", { autoClose: 1500 });
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleRemove = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      avatar: null,
    }));
    setOpen(false);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (isLoading) return;

      // Validate độ dài trước
      if (formData.phone.length > 10) {
        toast.error(t("dashboard.phoneTooLong"), { autoClose: 1500 });
        return;
      }

      // Validate số điện thoại Việt Nam
      // Chỉ nhận 10 chữ số và bắt đầu bằng 03, 05, 07, 08, 09
      const vnPhoneRegex = /^(03|05|07|08|09)[0-9]{8}$/;

      if (formData.phone && !vnPhoneRegex.test(formData.phone)) {
        toast.error(t("dashboard.invalidPhoneNumber"), { autoClose: 1500 });
        return;
      }

      // Validate địa chỉ
      // Regex:
      //  - Ít nhất 1 chữ cái (A-Z hoặc có dấu tiếng Việt)
      //  - Ít nhất 1 khoảng trắng (đảm bảo có nhiều từ)
      //  - Chỉ chứa ký tự hợp lệ (chữ, số, khoảng trắng, ,.-/)
      //  - Tổng thể phải "giống" một địa chỉ
      const addressRegex =
        /^(?=.*[A-Za-zÀ-ỹ])(?=.*\s)[A-Za-zÀ-ỹ0-9\s,.\-\/]+$/u;

      if (!addressRegex.test(formData.address)) {
        toast.error(t("dashboard.invalidAddress"), { autoClose: 1500 });
        return;
      }

      // Validate bio
      if (formData.bio && formData.bio.length > 300) {
        toast.error(t("dashboard.invalidBio"), { autoClose: 1500 });
        return;
      }

      // Validate dob
      if (formData.dob) {
        const dobDate = new Date(formData.dob);

        // Kiểm tra định dạng hợp lệ
        if (isNaN(dobDate.getTime())) {
          toast.error(t("dashboard.invalidDateOfBirth"), { autoClose: 1500 });
          return;
        }

        // Tính tuổi
        const today = new Date();
        let age = today.getFullYear() - dobDate.getFullYear();
        const monthDiff = today.getMonth() - dobDate.getMonth();
        const dayDiff = today.getDate() - dobDate.getDate();

        // Nếu chưa đến sinh nhật trong năm nay → trừ 1 tuổi
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
          age--;
        }

        // Validate tuổi tối thiểu
        if (age < 6) {
          toast.error(t("dashboard.mustBeAtLeast6YearsOld"), {
            autoClose: 1500,
          });
          return;
        }
      }

      // Chỉ gửi field nào thay đổi
      const updatedUser: any = {};
      const originalDob = user?.dob ? convertToDateTime(user.dob) : "";

      if (formData.nickName !== (user?.nick_name || ""))
        updatedUser.nick_name = formData.nickName;
      if (formData.phone !== (user?.phone || ""))
        updatedUser.phone = formData.phone;
      if (formData.address !== (user?.address || ""))
        updatedUser.address = formData.address;
      if (formData.bio !== (user?.bio || "")) updatedUser.bio = formData.bio;
      if (formData.dob !== originalDob) updatedUser.dob = formData.dob;
      if (formData.gender !== user?.gender)
        updatedUser.gender = formData.gender;
      if (formData.avatar !== (user?.avatar || null))
        updatedUser.avatar = formData.avatar;

      if (Object.keys(updatedUser).length === 0) {
        toast.info(t("dashboard.noChanges"), { autoClose: 1500 });
        router.push("/dashboard/profile");
        return;
      }

      setIsLoading(true);

      try {
        const res = await updateUserData(user?.id, updatedUser);
        toast.success(t("dashboard.updateSuccess"), { autoClose: 1500 });
        setUser({ ...user, ...updatedUser });
        router.push("/dashboard/profile");
      } catch (err: any) {
        if (err.message === "Đã tồn tại nickname") {
          toast.warn(t("dashboard.nicknameExists"), {
            autoClose: 1500,
          });
        } else {
          toast.error(t("dashboard.updateFailed"), { autoClose: 1500 });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [formData, user, isLoading, setUser, router]
  );

  // Show loading state nếu user chưa load
  if (!user) {
    return (
      <div className="mx-auto w-full max-w-md pt-6 sm:max-w-2xl lg:max-w-3xl max-xl:ml-10 max-lg:mx-auto max-md:ml-5 max-sm:ml-5 px-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-48 mb-6"></div>
          <div className="bg-gray-200 rounded-3xl p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-20"></div>
              </div>
            </div>
          </div>

          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2 mb-5">
              <div className="h-4 bg-gray-300 rounded w-20"></div>
              <div className="h-10 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md pt-4 sm:max-w-2xl lg:max-w-3xl pr-5 sm:pl-10">

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-orange-300/30 to-pink-300/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>
      <div className="flex align-items-center justify-between max-sm:mt-15">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-gray-700 hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl font-semibold border border-gray-200 mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 max-sm:hidden" />
          {t("dashboard.back")}
        </motion.button>
        <h1 className="text-xl font-bold mt-3">
          {t("dashboard.editProfileTitle")}
        </h1>
      </div>

      {/* Avatar */}
      <div className="bg-gray-200 rounded-3xl">
        <div className="flex items-center gap-4 mb-6 py-3 px-6">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Avatar className="w-15 h-15 cursor-pointer mx-auto sm:mx-0 sm:w-20 sm:h-20">
                <AvatarImage
                  src={
                    formData.avatar
                      ? getUserImageSrc(formData.avatar)
                      : "/default-avatar-profile-icon.jpg"
                  }
                  alt="Profile"
                />
              </Avatar>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md rounded-2xl p-0">
              <DialogHeader className="p-4 pb-2">
                <DialogTitle className="text-center text-lg">
                  {t("dashboard.changePhoto")}
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-col divide-y">
                <label className="py-3 text-blue-600 border-t font-medium hover:bg-gray-50 text-center cursor-pointer">
                  {t("dashboard.selectPhoto")}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpload}
                  />
                </label>
                <button
                  className="py-3 text-red-600 font-medium hover:bg-gray-50 cursor-pointer"
                  onClick={handleRemove}
                >
                  {t("dashboard.removeCurrentPhoto")}
                </button>
                <DialogClose asChild>
                  <button className="py-3 font-medium cursor-pointer">
                    {t("dashboard.cancel")}
                  </button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
          <div className="flex items-center justify-between w-full">
            <p className="font-medium mt-3">{user.name}</p>

            <Button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-2 cursor-pointer bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
            >
              {t("dashboard.changePhoto")}
            </Button>
          </div>
        </div>
      </div>

      {/* Form */}
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Nickname */}
        <div>
          <Label htmlFor="nick_name" className="mb-2">
            {t("dashboard.nickname")}
          </Label>
          <Input
            id="nick_name"
            value={formData.nickName}
            onChange={handleInputChange("nickName")}
            placeholder={t("dashboard.nicknamePlaceholder")}
          />
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone" className="mb-2">
            {t("dashboard.phoneNumber")}
          </Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={handleInputChange("phone")}
            placeholder={t("dashboard.phonePlaceholder")}
            type="tel"
          />
        </div>

        {/* Address */}
        <div>
          <Label htmlFor="address" className="mb-2">
            {t("dashboard.address")}
          </Label>
          <Input
            id="address"
            value={formData.address}
            onChange={handleInputChange("address")}
            placeholder={t("dashboard.addressPlaceholder")}
          />
        </div>

        {/* Bio */}
        <div>
          <Label htmlFor="bio" className="mb-2">
            {t("dashboard.bio")}
          </Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={handleInputChange("bio")}
            placeholder={t("dashboard.bioPlaceholder")}
            className="resize-none"
          />
        </div>

        {/* Gender */}
        <div>
          <Label htmlFor="gender" className="mb-2">
            {t("dashboard.gender")}
          </Label>
          <Select value={genderDisplayValue} onValueChange={handleGenderChange}>
            <SelectTrigger>
              <SelectValue placeholder={t("dashboard.genderPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Nam">{t("dashboard.male")}</SelectItem>
              <SelectItem value="Nữ">{t("dashboard.female")}</SelectItem>
              <SelectItem value="null">{t("dashboard.other")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date of birth */}
        <div>
          <Label htmlFor="dob" className="mb-2">
            {t("dashboard.dateOfBirth")}
          </Label>
          <Input
            id="dob"
            type="date"
            value={formData.dob}
            onChange={handleInputChange("dob")}
            max={maxDate}
          />
        </div>

        <div className="flex justify-end mb-5">
          <Button
            type="submit"
            disabled={isLoading}
            className="cursor-pointer bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:opacity-50"
          >
            {isLoading ? t("dashboard.saving") : t("dashboard.saveChanges")}
          </Button>
        </div>
      </form>
    </div>
  );
}
