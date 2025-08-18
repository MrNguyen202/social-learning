"use client"

import { Bell, BookOpen, PenTool, Settings, Trophy, Users, Volume, Volume1, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function TopHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 hidden lg:block">
      <div className="flex h-16 items-center justify-between px-6">

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
            <PenTool className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">
            SocialLearning
          </span>
        </div>

        {/* Menu practice */}
        <nav className="hidden md:flex items-center gap-10">
          <button className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 hover:text-white hover:cursor-pointer py-2 px-3 rounded-lg">
            <PenTool className="w-5 h-5" />
            <span className="text-base">Writing</span>
          </button>
          <button className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 hover:text-white hover:cursor-pointer py-2 px-3 rounded-lg">
            <Volume2 className="w-5 h-5" />
            <span className="text-base">Listening</span>
          </button>
          <button className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 hover:text-white hover:cursor-pointer py-2 px-3 rounded-lg">
            <BookOpen className="w-5 h-5" />
            <span className="text-base">Vocabulary</span>
          </button>
          <button className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 hover:text-white hover:cursor-pointer py-2 px-3 rounded-lg">
            <Trophy className="w-5 h-5" />
            <span className="text-base">Rank</span>
          </button>
        </nav>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative hover:bg-gray-100">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-xs flex items-center justify-center p-0">
              3
            </Badge>
          </Button>

          <Button variant="ghost" size="icon" className="hover:bg-gray-100">
            <Settings className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                    JD
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Hồ sơ</DropdownMenuItem>
              <DropdownMenuItem>Cài đặt</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Đăng xuất</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
