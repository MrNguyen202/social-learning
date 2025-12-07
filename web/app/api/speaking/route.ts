// import { createGoogleGenerativeAI } from "@ai-sdk/google";
// import { streamText } from "ai";
// import { Message } from "@ai-sdk/react";

// const google = createGoogleGenerativeAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });

// export const runtime = "edge";

// export async function POST(request: Request) {
//   try {
//     // Nhận thêm userSide ('A' hoặc 'B')
//     const { messages, topic, level, loadedTopic, userSide } =
//       await request.json();

//     let systemPrompt = "";

//     // === XÁC ĐỊNH VAI TRÒ DỰA TRÊN LỰA CHỌN ===
//     const isUserA = userSide === "A";

//     const userRoleName = isUserA
//       ? loadedTopic.participant_a
//       : loadedTopic.participant_b;
//     const aiRoleName = isUserA
//       ? loadedTopic.participant_b
//       : loadedTopic.participant_a;

//     const userTask = isUserA ? loadedTopic.task_a_en : loadedTopic.task_b_en;
//     const aiTask = isUserA ? loadedTopic.task_b_en : loadedTopic.task_a_en;

//     systemPrompt = `
//       Bạn đang tham gia vào một kịch bản nhập vai (Role-Play).

//       --- BỐI CẢNH KỊCH BẢN ---
//       "${loadedTopic.content_en}"
//       ------------------------

//       **VAI TRÒ:**
//       - BẠN (AI) là: **${aiRoleName}**.
//       - Người dùng là: **${userRoleName}**.

//       **MỤC TIÊU:**
//       - Mục tiêu của người dùng: ${userTask}
//       - Mục tiêu của bạn: ${aiTask}

//       **HƯỚNG DẪN:**
//       1. **GIỮ NHẬP VAI:** Hãy hành xử đúng như ${aiRoleName}. KHÔNG được là một trợ lý AI hữu ích. Hãy là nhân vật.
//       2. **TƯƠNG TÁC:** Trả lời người dùng một cách tự nhiên. Nếu bối cảnh có mâu thuẫn, hãy kiên quyết nhưng thực tế.
//       3. **TRÌNH ĐỘ:** Điều chỉnh tiếng Anh phù hợp với trình độ của người dùng (${level}).
//       4. **HÌNH THỨC:** Giữ phong cách hội thoại, ngắn gọn (1–3 câu).

//       **LƯU Ý:**
//       - Không được dùng (Role-play ...) trong câu nói của bạn.
//       - Các thông tin như name, age, job, address bạn hãy cho 1 tên cụ thể hoặc giả định và không được dùng [Restaurant Name], [City], v.v.
//       Hãy để người dùng nói trước nếu họ mở đầu, hoặc bạn hãy bắt đầu nếu bối cảnh yêu cầu bạn là người mở đầu.
//     `;

//     const messagesForAI: Message[] = [
//       { id: "sys", role: "system", content: systemPrompt },
//       ...messages,
//     ];

//     const stream = await streamText({
//       model: google("models/gemma-3-27b-it"),
//       messages: messagesForAI,
//       temperature: 0.7,
//       maxTokens: 1000,
//     });

//     return stream?.toDataStreamResponse();
//   } catch (error) {
//     console.error("Gemini API Error:", error);
//     return new Response("Internal Server Error", { status: 500 });
//   }
// }

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { Message } from "@ai-sdk/react";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    // Nhận thêm userSide ('A' hoặc 'B')
    const { messages, topic, level, loadedTopic, userSide } =
      await request.json();

    let systemPrompt = "";

    // === XÁC ĐỊNH VAI TRÒ DỰA TRÊN LỰA CHỌN ===
    const isUserA = userSide === "A";

    const userRoleName = isUserA
      ? loadedTopic.participant_a
      : loadedTopic.participant_b;
    const aiRoleName = isUserA
      ? loadedTopic.participant_b
      : loadedTopic.participant_a;

    const userTask = isUserA ? loadedTopic.task_a_en : loadedTopic.task_b_en;
    const aiTask = isUserA ? loadedTopic.task_b_en : loadedTopic.task_a_en;

    systemPrompt = `
      Bạn đang tham gia vào một kịch bản nhập vai (Role-Play).
      
      --- BỐI CẢNH KỊCH BẢN ---
      "${loadedTopic.content_en}"
      ------------------------

      **VAI TRÒ:**
      - BẠN (AI) là: **${aiRoleName}**.
      - Người dùng là: **${userRoleName}**.

      **MỤC TIÊU:**
      - Mục tiêu của người dùng: ${userTask}
      - Mục tiêu của bạn: ${aiTask}

      **HƯỚNG DẪN:**
      1. **GIỮ NHẬP VAI:** Hãy hành xử đúng như ${aiRoleName}. KHÔNG được là một trợ lý AI hữu ích. Hãy là nhân vật.
      2. **TƯƠNG TÁC:** Trả lời người dùng một cách tự nhiên. Nếu bối cảnh có mâu thuẫn, hãy kiên quyết nhưng thực tế.
      3. **TRÌNH ĐỘ:** Điều chỉnh tiếng Anh phù hợp với trình độ của người dùng (${level}).
      4. **HÌNH THỨC:** Giữ phong cách hội thoại, ngắn gọn (1–3 câu).
      
      **LƯU Ý:** 
      - Không được dùng (Role-play ...) trong câu nói của bạn.
      - Các thông tin như name, age, job, address bạn hãy cho 1 tên cụ thể hoặc giả định và không được dùng [Restaurant Name], [City], v.v.
      Hãy để người dùng nói trước nếu họ mở đầu, hoặc bạn hãy bắt đầu nếu bối cảnh yêu cầu bạn là người mở đầu.
    `;

    const messagesForAI: Message[] = [
      { id: "sys", role: "user", content: systemPrompt },
      ...messages,
    ];

    const stream = await streamText({
      model: google("gemma-3-27b-it"),
      messages: messagesForAI,
      temperature: 0.7,
      maxTokens: 1000,
    });

    return stream?.toDataStreamResponse();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
