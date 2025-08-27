import { Camera } from "lucide-react"

export default function PhotoGrid() {
  return (
    <div className="p-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full border-2 border-foreground flex items-center justify-center">
          <Camera className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Chia sẻ ảnh</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Khi bạn chia sẻ ảnh, ảnh sẽ xuất hiện trên trang cá nhân của bạn.
          </p>
          <button className="text-sm text-accent font-medium">Chia sẻ ảnh đầu tiên của bạn</button>
        </div>
      </div>
    </div>
  )
}
