import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus } from "lucide-react"

export default function StoryHighlights() {
  return (
    <div className="p-4 border-b border-border">
      <div className="flex gap-4 overflow-x-auto">
        {/* Existing highlight */}
        <div className="flex flex-col items-center gap-1 min-w-0">
          <Avatar className="w-16 h-16 ring-2 ring-muted">
            <AvatarImage src="/serene-mountain-lake.png" alt="Highlight" />
            <AvatarFallback>H1</AvatarFallback>
          </Avatar>
          <span className="text-xs text-center">🌿</span>
        </div>

        {/* Add new highlight */}
        <div className="flex flex-col items-center gap-1 min-w-0">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
            <Plus className="w-6 h-6 text-muted-foreground" />
          </div>
          <span className="text-xs text-center text-muted-foreground">Mới</span>
        </div>
      </div>
    </div>
  )
}
