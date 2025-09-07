"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useAuth from "@/hooks/useAuth";
import { updateUserData } from "@/app/api/user/route";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { convertToDateTime } from "@/utils/formatTime";
import { getUserImageSrc, uploadFile } from "@/app/api/image/route";

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
          toast.error(res.msg || "Upload thất bại", { autoClose: 1500 });
          return;
        }

        setFormData((prev) => ({
          ...prev,
          avatar: res.data.path,
        }));

        setOpen(false);
      } catch (err) {
        toast.error("Đã xảy ra lỗi khi upload ảnh.", { autoClose: 1500 });
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

      // Validate phone
      if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
        toast.error("Số điện thoại không hợp lệ.", { autoClose: 1500 });
        return;
      }

      // Validate bio
      if (formData.bio && formData.bio.length > 300) {
        toast.error("Tiểu sử không được vượt quá 300 ký tự.", {
          autoClose: 1500,
        });
        return;
      }

      // Validate dob
      if (formData.dob) {
        const dobDate = new Date(formData.dob);
        if (isNaN(dobDate.getTime())) {
          toast.error("Ngày sinh không hợp lệ.", { autoClose: 1500 });
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
        toast.info("Không có thay đổi nào để cập nhật.", { autoClose: 1500 });
        router.push("/dashboard/profile");
        return;
      }

      setIsLoading(true);

      try {
        const res = await updateUserData(user?.id, updatedUser);
        toast.success("Cập nhật thành công!", { autoClose: 1500 });
        setUser({ ...user, ...updatedUser });
        router.push("/dashboard/profile");
      } catch (err: any) {
        if (err.message === "Đã tồn tại nickname") {
          toast.warn("Biệt danh đã tồn tại", {
            autoClose: 1500,
          });
        } else {
          toast.error("Đã xảy ra lỗi.", { autoClose: 1500 });
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
    <div className="mx-auto w-full max-w-md pt-6 sm:max-w-2xl lg:max-w-3xl max-xl:ml-10 max-lg:mx-auto max-md:ml-5 max-sm:ml-5 px-4">
      <h1 className="text-xl font-bold mb-6">Chỉnh sửa trang cá nhân</h1>

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
                  Thay đổi ảnh đại diện
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-col divide-y">
                <label className="py-3 text-blue-600 border-t font-medium hover:bg-gray-50 text-center cursor-pointer">
                  Tải ảnh lên
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
                  Gỡ ảnh hiện tại
                </button>
                <DialogClose asChild>
                  <button className="py-3 font-medium cursor-pointer">
                    Hủy
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
              Đổi ảnh
            </Button>
          </div>
        </div>
      </div>

      {/* Form */}
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Nickname */}
        <div>
          <Label htmlFor="nick_name" className="mb-2">
            Biệt danh
          </Label>
          <Input
            id="nick_name"
            value={formData.nickName}
            onChange={handleInputChange("nickName")}
            placeholder="Nhập biệt danh"
          />
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone" className="mb-2">
            Số điện thoại
          </Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={handleInputChange("phone")}
            placeholder="Nhập số điện thoại"
            type="tel"
          />
        </div>

        {/* Address */}
        <div>
          <Label htmlFor="address" className="mb-2">
            Địa chỉ
          </Label>
          <Input
            id="address"
            value={formData.address}
            onChange={handleInputChange("address")}
            placeholder="Nhập địa chỉ"
          />
        </div>

        {/* Bio */}
        <div>
          <Label htmlFor="bio" className="mb-2">
            Tiểu sử
          </Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={handleInputChange("bio")}
            placeholder="Giới thiệu về bạn..."
            className="resize-none"
          />
        </div>

        {/* Gender */}
        <div>
          <Label htmlFor="gender" className="mb-2">
            Giới tính
          </Label>
          <Select value={genderDisplayValue} onValueChange={handleGenderChange}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn giới tính" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Nam">Nam</SelectItem>
              <SelectItem value="Nữ">Nữ</SelectItem>
              <SelectItem value="null">Không muốn tiết lộ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date of birth */}
        <div>
          <Label htmlFor="dob" className="mb-2">
            Ngày sinh
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
            {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </div>
  );
}
