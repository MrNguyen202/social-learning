"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

const stories = [
  {
    id: "add",
    username: "Your Story",
    avatar: "/globe.svg?height=64&width=64",
    isAdd: true,
  },
  {
    id: 1,
    username: "sarah_writes",
    avatar: "/globe.svg?height=64&width=64",
    hasStory: true,
  },
  {
    id: 2,
    username: "mike_english",
    avatar: "/globe.svg?height=64&width=64",
    hasStory: true,
  },
  {
    id: 3,
    username: "emma_learns",
    avatar: "/globe.svg?height=64&width=64",
    hasStory: true,
  },
  {
    id: 4,
    username: "alex_writer",
    avatar: "/globe.svg?height=64&width=64",
    hasStory: true,
  },
  {
    id: 5,
    username: "lisa_grammar",
    avatar: "/globe.svg?height=64&width=64",
    hasStory: true,
  },
  {
    id: 6,
    username: "david_vocab",
    avatar: "/globe.svg?height=64&width=64",
    hasStory: true,
  },
]

export function StoriesHorizontal() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
        {stories.map((story) => (
          <div key={story.id} className="flex flex-col items-center space-y-2 flex-shrink-0">
            <div className="relative">
              {story.isAdd ? (
                <div className="relative">
                  <Avatar className="h-16 w-16 border-2 border-gray-200">
                    <AvatarImage src={story.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                      You
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                  >
                    <Plus className="h-3 w-3 text-white" />
                  </Button>
                </div>
              ) : (
                <div className="p-0.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full">
                  <Avatar className="h-16 w-16 border-2 border-white">
                    <AvatarImage src={story.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gray-200">{story.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
            <span className="text-xs text-gray-600 max-w-[70px] truncate text-center">
              {story.isAdd ? "Your Story" : story.username}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
