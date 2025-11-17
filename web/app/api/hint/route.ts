import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const { lastMessage, topic, level } = await request.json();

    const { text: hint } = await generateText({
      model: google("gemini-2.0-flash"),
      system: `Bạn là trợ lý học tiếng Anh. Người học trình độ ${level} đang nói về ${topic}.`,
      prompt: `Câu cuối cùng của AI là: "${lastMessage}". 
      Người học đang bị bí ý. Hãy gợi ý MỘT câu trả lời (bằng tiếng Anh) thật ngắn gọn và đơn giản để người học có thể nói tiếp. 
      Chỉ trả về câu gợi ý, không thêm bất cứ lời giải thích nào.`,
      temperature: 0.7,
      maxTokens: 50,
    });

    return Response.json({ hint: hint.replace(/"/g, "") }); // Xóa dấu ngoặc kép nếu có
  } catch (error) {
    console.error("Hint API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
