"use client";
import React, { useRef, useEffect, useState, useMemo } from "react";
import { Play, Pause } from "lucide-react";

interface AudioPlayerProps {
    src: string;
    isMe?: boolean;
}

export default function AudioPlayer({ src, isMe = false }: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [waveform, setWaveform] = useState<number[]>([]); // Mảng chứa chiều cao các thanh sóng
    const [isLoaded, setIsLoaded] = useState(false);

    // Màu sắc (Config màu tại đây)
    const colors = useMemo(() => ({
        played: isMe ? "#1e40af" : "#374151",    // Đã chạy: Xanh đậm / Xám đậm
        remaining: isMe ? "#93c5fd" : "#d1d5db", // Chưa chạy: Xanh nhạt / Xám nhạt
    }), [isMe]);

    // 1. Hàm xử lý dữ liệu âm thanh để tạo sóng
    const processAudioData = async (audioUrl: string) => {
        try {
            const response = await fetch(audioUrl);
            const arrayBuffer = await response.arrayBuffer();
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            const rawData = audioBuffer.getChannelData(0); // Lấy dữ liệu kênh trái
            const samples = 40; // Số lượng thanh sóng muốn hiển thị
            const blockSize = Math.floor(rawData.length / samples);
            const filteredData = [];

            // Thuật toán nén: Lấy giá trị tuyệt đối lớn nhất trong mỗi block
            for (let i = 0; i < samples; i++) {
                let blockStart = blockSize * i;
                let sum = 0;
                for (let j = 0; j < blockSize; j++) {
                    sum = sum + Math.abs(rawData[blockStart + j]);
                }
                filteredData.push(sum / blockSize);
            }

            // Chuẩn hóa dữ liệu về khoảng 0 -> 1 để vẽ cho đẹp
            const multiplier = Math.pow(Math.max(...filteredData), -1);
            const normalizedData = filteredData.map(n => n * multiplier);

            setWaveform(normalizedData);
            setIsLoaded(true);
        } catch (error) {
            console.error("Error processing audio:", error);
        }
    };

    // 2. Effect: Load data khi có src
    useEffect(() => {
        if (src) {
            processAudioData(src);
        }
    }, [src]);

    // 3. Effect: Vẽ Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || waveform.length === 0) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const barWidth = 4; // Độ rộng thanh sóng
        const gap = 2;      // Khoảng cách giữa các thanh
        const totalBars = waveform.length;

        // Xóa canvas cũ
        ctx.clearRect(0, 0, width, height);

        // Tính % tiến trình
        const progress = duration > 0 ? currentTime / duration : 0;

        // Vẽ từng thanh
        waveform.forEach((value, index) => {
            const x = index * (barWidth + gap);
            const barHeight = value * height; // Chiều cao dựa trên dữ liệu

            // Căn giữa theo chiều dọc
            const y = (height - barHeight) / 2;

            // Logic đổi màu: Nếu thanh này nằm trước vị trí hiện tại -> màu đậm
            const isPlayed = (index / totalBars) < progress;

            ctx.fillStyle = isPlayed ? colors.played : colors.remaining;

            // Vẽ bo góc tròn cho thanh (tùy chọn)
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, 4);
            ctx.fill();
        });

    }, [waveform, currentTime, duration, colors]);

    // 4. Xử lý sự kiện Audio
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

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (audioRef.current) audioRef.current.currentTime = 0;
    };

    // 5. Xử lý click vào Canvas để tua (Seek)
    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!audioRef.current || duration === 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left; // Vị trí click x
        const clickPercent = x / rect.width;

        const newTime = clickPercent * duration;
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "00:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    return (
        <div className={`flex items-center gap-3 p-2 rounded-xl min-w-[240px] max-w-[300px] select-none transition-colors ${isMe ? "bg-blue-200/50" : "bg-gray-200/50"}`}>
            {/* Audio Element ẩn */}
            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                className="hidden"
            />

            {/* Button Play/Pause */}
            <button
                onClick={togglePlay}
                disabled={!isLoaded}
                className={`flex items-center justify-center w-10 h-10 rounded-full shadow-sm transition-all flex-shrink-0 
                    ${!isLoaded ? "opacity-50 cursor-wait" : ""}
                    ${isMe ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-white text-gray-800 hover:bg-gray-50"}
                `}
            >
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
            </button>

            {/* Visualizer Area */}
            <div className="flex flex-col flex-1 justify-center gap-1 overflow-hidden">
                {/* Canvas Waveform */}
                <canvas
                    ref={canvasRef}
                    width={240} // Chiều rộng cố định của canvas (bằng 40 thanh * (4px rộng + 2px gap))
                    height={36}
                    onClick={handleCanvasClick}
                    className="w-full h-[36px] cursor-pointer"
                />

                {/* Time */}
                <div className={`flex justify-between text-[10px] font-medium px-0.5 ${isMe ? "text-blue-800" : "text-gray-500"}`}>
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
}