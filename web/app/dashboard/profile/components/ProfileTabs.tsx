"use client"

import { useState } from "react"
import { Grid3X3, Bookmark, UserCog as UserTag } from "lucide-react"

export default function ProfileTabs() {
  const [activeTab, setActiveTab] = useState("posts")

  const tabs = [
    { id: "posts", icon: Grid3X3, label: "Bài viết" },
    { id: "saved", icon: Bookmark, label: "Đã lưu" },
    { id: "tagged", icon: UserTag, label: "Được gắn thẻ" },
  ]

  return (
    <div className="border-b border-border">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-3 text-sm ${
              activeTab === tab.id ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="sr-only">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
