"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Settings2,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AudioPlayerProps {
  src: string;
  t: (key: string) => string;
}

export default function AudioPlayer({ src, t }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Cập nhật thời gian hiện tại
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Cập nhật tổng thời gian khi tải xong metadata
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Xử lý Play/Pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Xử lý tua thanh trượt
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Tua nhanh/chậm
  const skipTime = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  // Xử lý Volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Xử lý tốc độ phát
  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  // Format thời gian
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Kết thúc bài
  const handleEnded = () => {
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl shadow-indigo-100 border border-slate-100 w-full">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Volume2 size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">
              {t("learning.audioTrack")}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t("learning.listeningTitle")}
            </p>
          </div>
        </div>

        {/* fake animate âm thanh */}
        <div className="flex items-end gap-1 h-8">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 bg-indigo-500 rounded-full"
              animate={{
                height: isPlaying ? ["20%", "80%", "40%"] : "30%",
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="relative w-full h-2 bg-slate-100 rounded-full group cursor-pointer">
          <div
            className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full pointer-events-none"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <div className="flex justify-between mt-2 text-xs font-bold text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Speed Control */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-full text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-colors text-xs font-bold flex items-center gap-1">
              <Settings2 size={16} /> {playbackRate}x
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {[0.75, 1, 1.25, 1.5].map((rate) => (
              <DropdownMenuItem key={rate} onClick={() => changeSpeed(rate)}>
                {rate}x {rate === 1 && `(${t("learning.normal")})`}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Main Playback Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => skipTime(-5)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 transition-colors rounded-full cursor-pointer"
            title="-5s"
          >
            <RotateCcw size={20} />
          </button>

          <button
            onClick={togglePlay}
            className="w-14 h-14 flex items-center justify-center cursor-pointer rounded-full bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? (
              <Pause size={24} fill="currentColor" />
            ) : (
              <Play size={24} fill="currentColor" className="ml-1" />
            )}
          </button>

          <button
            onClick={() => skipTime(5)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 transition-colors rounded-full cursor-pointer"
            title="+5s"
          >
            <RotateCw size={20} />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 group relative w-24 justify-around">
          <button
            onClick={toggleMute}
            className="text-slate-400 hover:text-indigo-600"
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={20} />
            ) : (
              <Volume2 size={20} />
            )}
          </button>
          {/* Hover */}
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hidden group-hover:block absolute bottom-10 right-0 -rotate-90 origin-bottom-right shadow-lg p-1"
          />
        </div>
      </div>
    </div>
  );
}
