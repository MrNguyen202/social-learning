// import { createGoogleGenerativeAI } from "@ai-sdk/google";
// import { generateText } from "ai";
// import { Message } from "ai";

// const google = createGoogleGenerativeAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });

// export const runtime = "edge";

// export async function POST(request: Request) {
//   try {
//     const { messages } = await request.json();

//     // Chỉ lấy các tin nhắn user và assistant
//     const chatHistory = messages
//       .filter((m: Message) => m.role === "user" || m.role === "assistant")
//       .map((m: Message) => `${m.role}: ${m.content}`)
//       .join("\n");

//     const { text: summary } = await generateText({
//       model: google("gemma-3-27b-it"),
//       system:
//         "Bạn là một giáo viên tiếng Anh, trả lời bằng tiếng Việt (sử dụng Markdown).",
//       prompt: `Dựa vào lịch sử hội thoại sau:
//       ---
//       ${chatHistory}
//       ---
//       Hãy cung cấp một bản tổng kết ngắn gọn cho người học:
//       1.  Nhận xét chung về khả năng nói (ngữ pháp, từ vựng).
//       2.  Liệt kê 3-5 từ vựng hoặc cụm từ (bằng tiếng Anh) hữu ích nhất mà AI đã dùng.`,
//       temperature: 0.5,
//     });

//     return Response.json({ summary });
//   } catch (error) {
//     console.error("Summary API Error:", error);
//     return new Response("Internal Server Error", { status: 500 });
//   }
// }

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { Message } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    // Chỉ lấy các tin nhắn user và assistant
    const chatHistory = messages
      .filter((m: Message) => m.role === "user" || m.role === "assistant")
      .map((m: Message) => `${m.role}: ${m.content}`)
      .join("\n");

    const { text: summary } = await generateText({
      model: google("gemma-3-27b-it"),
      prompt: `
      Bạn là một giáo viên tiếng Anh, trả lời bằng tiếng Việt (sử dụng Markdown).
      
      Dựa vào lịch sử hội thoại sau:
      ---
      ${chatHistory}
      ---
      Hãy cung cấp một bản tổng kết ngắn gọn cho người học:
      1.  Nhận xét chung về khả năng nói (ngữ pháp, từ vựng).
      2.  Liệt kê 3-5 từ vựng hoặc cụm từ (bằng tiếng Anh) hữu ích nhất mà AI đã dùng.`,
      temperature: 0.5,
    });

    return Response.json({ summary });
  } catch (error) {
    console.error("Summary API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
