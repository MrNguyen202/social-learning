import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";

export default function StoryHighlights() {
  return (
    <div className="p-3 sm:p-4 border-b border-border md:ml-5">
      <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide">
        <div className="flex flex-col items-center gap-1 min-w-12">
          <Avatar className="w-14 h-14 sm:w-16 sm:h-16 ring-2 ring-muted">
            <AvatarImage src="/default-avatar-profile-icon.jpg" alt="Highlight" />
            <AvatarFallback>H1</AvatarFallback>
          </Avatar>
          <span className="text-[10px] sm:text-xs text-center">🌿</span>
        </div>

        <div className="flex flex-col items-center gap-1 min-w-12">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
            <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
          </div>
          <span className="text-[10px] sm:text-xs text-center text-muted-foreground">
            Mới
          </span>
        </div>
      </div>
    </div>
  );
}
