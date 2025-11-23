import { useState, useRef, useCallback } from "react";
import { toast } from "react-toastify";

export const useAudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Helper: Format giây thành MM:SS
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    // Helper: Dọn dẹp state và stream
    const cleanupRecording = useCallback(() => {
        setIsRecording(false);
        setRecordingTime(0);
        audioChunksRef.current = [];

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        // Tắt đèn micro trên tab trình duyệt (stop tracks)
        if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        mediaRecorderRef.current = null;
    }, []);

    // 1. Bắt đầu ghi âm
    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            toast.error("Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.");
        }
    }, []);

    // 2. Dừng ghi âm và TRẢ VỀ FILE (Promise)
    const stopRecording = useCallback((): Promise<File | null> => {
        return new Promise((resolve) => {
            if (!mediaRecorderRef.current) {
                resolve(null);
                return;
            }

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                const audioFile = new File([audioBlob], "voice_message.webm", { type: "audio/webm" });
                cleanupRecording();
                resolve(audioFile);
            };

            mediaRecorderRef.current.stop();
        });
    }, [cleanupRecording]);

    // 3. Hủy ghi âm (Không làm gì cả)
    const cancelRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
        cleanupRecording();
    }, [cleanupRecording]);

    return {
        isRecording,
        recordingTime,
        formattedTime: formatDuration(recordingTime),
        startRecording,
        stopRecording,
        cancelRecording
    };
};