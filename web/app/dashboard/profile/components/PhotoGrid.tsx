import { Camera } from "lucide-react";

export default function PhotoGrid() {
  return (
    <div className="p-4 sm:p-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-foreground flex items-center justify-center">
          <Camera className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Chia sẻ ảnh</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">
            Khi bạn chia sẻ ảnh, ảnh sẽ xuất hiện trên trang cá nhân của bạn.
          </p>
          <button className="text-xs sm:text-sm text-accent font-medium">
            Chia sẻ ảnh đầu tiên
          </button>
        </div>
      </div>
    </div>
  );
}
