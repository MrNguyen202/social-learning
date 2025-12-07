import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { Message } from "@ai-sdk/react";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const runtime = "edge";

const generateId = () => Math.random().toString(36).slice(2, 10);

// System prompt để định hướng AI
const SYSTEM_PROMPT = `Bạn là một trợ lý AI thông minh và hữu ích. Hãy:
- Trả lời bằng tiếng Việt một cách tự nhiên và dễ hiểu
- Cung cấp thông tin chính xác và hữu ích
- Giữ câu trả lời súc tích nhưng đầy đủ
- Thân thiện và lịch sự trong giao tiếp
- Nếu không chắc chắn về thông tin, hãy thành thật nói rằng bạn không biết`;

const buildOptimizedPrompt = (messages: Message[]): Message[] => {
  // Tạo system message
  const systemMessage: Message = {
    id: generateId(),
    role: "system",
    content: SYSTEM_PROMPT,
  };

  // Xử lý messages từ user và assistant
  const processedMessages = messages.map((msg) => ({
    id: msg.id || generateId(),
    role: msg.role,
    content: msg.content,
  }));

  return [systemMessage, ...processedMessages];
};

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    // Validation
    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages format", { status: 400 });
    }

    const stream = await streamText({
      model: google("gemini-2.5-flash-lite"),
      messages: buildOptimizedPrompt(messages),
      temperature: 0.7,
      maxTokens: 1000, // Giới hạn độ dài response
      topP: 0.9, // Tăng tính đa dạng
      frequencyPenalty: 0.1, // Tránh lặp lại
      presencePenalty: 0.1, // Khuyến khích topic mới
    });

    return stream?.toDataStreamResponse();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
