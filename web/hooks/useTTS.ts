// hooks/useTTS.ts
import { useEffect, useState, useCallback } from "react";

// Hook nói chuyện (TTS)
export const useAISpeech = (
  lastMessage: any,
  isLoading: boolean,
  voice: SpeechSynthesisVoice | null,
  rate: number
) => {
  useEffect(() => {
    if (!isLoading && lastMessage && lastMessage.role === "assistant") {
      // 1. Hủy mọi âm thanh cũ ngay lập tức
      window.speechSynthesis.cancel();

      const utter = new SpeechSynthesisUtterance(lastMessage.content);

      // 2. Cấu hình giọng (Ưu tiên giọng đã chọn, nếu không thì lấy giọng mặc định)
      if (voice) {
        utter.voice = voice;
        utter.lang = voice.lang;
      }
      utter.rate = rate;

      // 3. Nói
      window.speechSynthesis.speak(utter);
    }
  }, [isLoading, lastMessage, voice, rate]);
};

// Hook lặp lại (Repeat)
export const useRepeatSpeech = () => {
  const handleRepeat = useCallback(
    (content: string, voice: SpeechSynthesisVoice | null, rate: number) => {
      window.speechSynthesis.cancel(); // Luôn cancel trước
      const utter = new SpeechSynthesisUtterance(content);
      if (voice) {
        utter.voice = voice;
        utter.lang = voice.lang;
      }
      utter.rate = rate;
      window.speechSynthesis.speak(utter);
    },
    []
  );
  return { handleRepeat };
};

// === UPDATE: Hook lấy giọng nói (Chuẩn như code mẫu) ===
export const useGoogleVoices = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const synth = window.speechSynthesis;

    const updateVoices = () => {
      const allVoices = synth.getVoices();
      // Lọc lấy các giọng tiếng Anh (Ưu tiên Google)
      const filteredVoices = allVoices.filter(
        (v) => v.lang.startsWith("en-") 
        // && v.name.includes("Google US English")
      );

      // Fallback: Nếu không có Google voice thì lấy tất cả tiếng Anh
      const finalVoices =
        filteredVoices.length > 0
          ? filteredVoices
          : allVoices.filter((v) => v.lang.startsWith("en-"));

      setVoices(finalVoices);
    };

    // Chạy lần đầu
    updateVoices();

    // Đăng ký sự kiện
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = updateVoices;
    }

    // Cleanup function (Rất quan trọng để tránh leak)
    return () => {
      synth.onvoiceschanged = null;
    };
  }, []);

  return voices;
};
