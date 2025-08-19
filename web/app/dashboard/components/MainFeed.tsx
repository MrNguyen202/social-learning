"use client";

import { PostCard } from "./PostCard";

const posts = [
  {
    id: 1,
    username: "sarah_writes",
    avatar: "/globe.svg?height=32&width=32",
    timeAgo: "2 hours ago",
    originalSentence: "The weather is very good today and I am happy.",
    rewrittenSentence:
      "Today's beautiful weather fills me with joy and contentment.",
    score: 95,
    likes: 24,
    comments: 8,
    caption:
      "Working on making my sentences more expressive! 🌟 #EnglishLearning #WritingPractice",
    level: "Advanced",
  },
  {
    id: 2,
    username: "mike_english",
    avatar: "/globe.svg?height=32&width=32",
    timeAgo: "4 hours ago",
    originalSentence: "I go to school every day by bus.",
    rewrittenSentence: "I commute to school daily via public transportation.",
    score: 87,
    likes: 18,
    comments: 5,
    caption: "Practicing formal writing style today! Any feedback? 📚",
    level: "Intermediate",
  },
  {
    id: 3,
    username: "emma_learns",
    avatar: "/globe.svg?height=32&width=32",
    timeAgo: "6 hours ago",
    originalSentence: "The book was good and I liked it.",
    rewrittenSentence: "The captivating novel left a lasting impression on me.",
    score: 92,
    likes: 31,
    comments: 12,
    caption:
      "Finally getting the hang of descriptive writing! 📖✨ Thanks for all the support!",
    level: "Intermediate",
  },
  {
    id: 4,
    username: "alex_writer",
    avatar: "/globe.svg?height=32&width=32",
    timeAgo: "8 hours ago",
    originalSentence: "I am tired because I worked a lot.",
    rewrittenSentence:
      "Exhaustion overwhelms me after an intensive day of labor.",
    score: 89,
    likes: 22,
    comments: 7,
    caption:
      "Experimenting with more sophisticated vocabulary! 💪 #GrowthMindset",
    level: "Advanced",
  },
];

export function MainFeed() {
  return (
    <div className="space-y-0">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
