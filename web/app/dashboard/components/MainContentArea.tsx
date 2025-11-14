"use client"

import { MainFeed } from "./MainFeed"
import { StoriesHorizontal } from "./StoriesHorizontal"


export function MainContentArea() {
  return (
    <div className="w-full max-w-[300px] sm:max-w-xl md:max-w-2xl mx-auto">
      {/* <StoriesHorizontal /> */}
      <MainFeed />
    </div>
  )
}
