import api from "@/lib/api";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export const getUserImageSrc = (imagePath: any) => {
  if (imagePath) {
    if (typeof imagePath === "string") {
      return `${supabaseUrl}/storage/v1/object/public/uploads/${imagePath}`; // Trả về string URL trực tiếp
    }
    return imagePath;
  }
  return "/default-avatar-profile-icon.jpg"; // Trả về ảnh mặc định
};

export const getSupabaseFileUrl = (filePath: any) => {
  if (filePath) {
    return `${supabaseUrl}/storage/v1/object/public/uploads/${filePath}`;
  }
  return null;
};

export const uploadFile = async (
  folderName: any,
  file: any,
  isImage = "image"
) => {
  try {
    // Đọc file thành base64
    const fileBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          // Bỏ phần "data:image/..."
          const base64 = result.split(",")[1];
          resolve(base64);
        } else {
          reject(new Error("FileReader result is not a string"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const response = await api.post("/api/images/uploads", {
      folderName,
      fileBase64,
      isImage,
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      return {
        success: false,
        msg: error.response.data.message || "Could not upload media",
      };
    }
    return {
      success: false,
      msg: error.message,
    };
  }
};
