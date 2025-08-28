"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react"
import { useState } from "react"

interface PostCardProps {
  post: {
    id: number
    username: string
    avatar: string
    timeAgo: string
    originalSentence: string
    rewrittenSentence: string
    score: number
    likes: number
    comments: number
    caption: string
    level: string
  }
}

export function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  return (
    <Card className="border-0 shadow-sm mb-6 bg-white sm:max-w-full max-w-sm">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.avatar || "/globe.svg"} />
            <AvatarFallback className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
              {post.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-gray-900">{post.username}</p>
            <p className="text-xs text-gray-500">{post.timeAgo}</p>
          </div>
          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
            {post.level}
          </Badge>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Post Content */}
      <CardContent className="px-4 pb-4">
        <div className="space-y-4">
          {/* Original vs Rewritten */}
          <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Original:</p>
              <p className="text-sm text-gray-800 line-through opacity-75">{post.originalSentence}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Rewritten:</p>
              <p className="text-sm text-gray-900 font-medium">{post.rewrittenSentence}</p>
            </div>
            <div className="flex items-center justify-between">
              <Badge
                className={`text-xs ${
                  post.score >= 90
                    ? "bg-green-100 text-green-800"
                    : post.score >= 80
                      ? "bg-orange-100 text-orange-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                Score: {post.score}/100
              </Badge>
            </div>
          </div>

          {/* Caption */}
          <div>
            <p className="text-sm text-gray-900">
              <span className="font-semibold">{post.username}</span> {post.caption}
            </p>
          </div>
        </div>
      </CardContent>

      {/* Post Actions */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => setIsLiked(!isLiked)} className="hover:bg-gray-100">
              <Heart className={`h-6 w-6 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
              <MessageCircle className="h-6 w-6 text-gray-700" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
              <Send className="h-6 w-6 text-gray-700" />
            </Button>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsSaved(!isSaved)} className="hover:bg-gray-100">
            <Bookmark className={`h-6 w-6 ${isSaved ? "fill-gray-900 text-gray-900" : "text-gray-700"}`} />
          </Button>
        </div>

        {/* Likes and Comments */}
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-900">{post.likes.toLocaleString()} likes</p>
          <p className="text-sm text-gray-500">View all {post.comments} comments</p>
        </div>
      </div>
    </Card>
  )
}
