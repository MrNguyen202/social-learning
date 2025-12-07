// app/api/feedback/route.ts
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const { transcript, level, context } = await request.json();

    const { text } = await generateText({
      model: google("models/gemini-2.5-flash-lite"), // Dùng model nhanh nhất
      system: "Bạn là giáo viên tiếng Anh. Trả lời bằng JSON.",
      prompt: `
        Học viên (${level}) vừa nói: "${transcript}".
        Bối cảnh: ${context || "General conversation"}.

        Hãy đánh giá ngắn gọn và trả về JSON:
        {
            "review": "Nhận xét 1 câu tiếng Việt về ngữ pháp/từ vựng (tích cực hoặc sửa lỗi).",
            "correction": "Câu sửa lại bằng tiếng Anh tự nhiên hơn (nếu cần, nếu đúng rồi thì để trống hoặc gợi ý cách nói khác hay hơn)."
        }
      `,
      temperature: 0.3,
    });

    const cleanJson = text.replace(/```json|```/g, "").trim();

    return Response.json(JSON.parse(cleanJson));
  } catch (error) {
    console.error("Feedback API Error:", error);
    return Response.json(
      { review: "Lỗi hệ thống", correction: "" },
      { status: 500 }
    );
  }
}
