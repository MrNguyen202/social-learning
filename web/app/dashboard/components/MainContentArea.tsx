"use client"

import { MainFeed } from "./MainFeed"
import { StoriesHorizontal } from "./StoriesHorizontal"


export function MainContentArea() {
  return (
    <div className="max-w-2xl mx-auto">
      <StoriesHorizontal />
      <MainFeed />
    </div>
  )
}
