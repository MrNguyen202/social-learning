import { GOOGLE_API_KEY } from '@env';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${GOOGLE_API_KEY}`;

const formatMessagesForGemini = (messages: Message[]) => {
  // System prompt với hướng dẫn sử dụng markdown
  const systemPrompt = `Bạn là một trợ lý AI thông minh và hữu ích. Hãy:
- Trả lời bằng tiếng Việt một cách tự nhiên và dễ hiểu
- Cung cấp thông tin chính xác và hữu ích
- Sử dụng Markdown để định dạng câu trả lời đẹp mắt và dễ đọc:
  * Sử dụng **in đậm** cho những điểm quan trọng
  * Sử dụng *in nghiêng* cho nhấn mạnh
  * Sử dụng \`code\` cho các thuật ngữ kỹ thuật
  * Sử dụng ### Tiêu đề cho các phần
  * Sử dụng danh sách có dấu đầu dòng hoặc số thứ tự khi cần thiết
  * Sử dụng > blockquote cho trích dẫn quan trọng
- Giữ câu trả lời súc tích nhưng đầy đủ
- Thân thiện và lịch sự trong giao tiếp
- Nếu không chắc chắn về thông tin, hãy thành thật nói rằng bạn không biết`;

  const conversationHistory = messages
    .map(msg => `${msg.role === 'user' ? 'Người dùng' : 'AI'}: ${msg.content}`)
    .join('\n');

  const fullPrompt =
    systemPrompt + '\n\nCuộc trò chuyện:\n' + conversationHistory;

  return {
    contents: [
      {
        parts: [
          {
            text: fullPrompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2000,
      topP: 0.9,
      topK: 40,
    },
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  };
};

export const sendMessageToGemini = async (
  messages: Message[],
): Promise<string> => {
  // Kiểm tra API key
  if (!GOOGLE_API_KEY) {
    throw new Error(
      'Thiếu API Key. Vui lòng thêm Gemini API key vào file route.ts',
    );
  }

  try {
    const requestBody = formatMessagesForGemini(messages);

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error:', errorData);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: GeminiResponse = await response.json();

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const assistantContent = data.candidates[0].content.parts?.[0]?.text;

      if (assistantContent) {
        return assistantContent.trim();
      } else {
        throw new Error('Không nhận được phản hồi từ AI');
      }
    } else {
      console.error('Invalid response format:', data);
      throw new Error('Định dạng phản hồi từ Gemini API không hợp lệ');
    }
  } catch (error) {
    console.error('Error in sendMessageToGemini:', error);

    if (error instanceof Error) {
      // Ném lại lỗi để component có thể xử lý
      throw error;
    } else {
      throw new Error('Lỗi không xác định khi gọi API');
    }
  }
};

// Export thêm các hàm utility nếu cần
export const validateApiKey = (): boolean => {
  return !!GOOGLE_API_KEY;
};

export const getApiKeyStatus = (): string => {
  if (!GOOGLE_API_KEY) {
    return 'API key chưa được thiết lập';
  }
  return 'API key đã được thiết lập';
};
