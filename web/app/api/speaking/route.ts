import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { Message } from "@ai-sdk/react";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const { messages, topic, level } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages format", { status: 400 });
    }

    const systemPrompt = `You are a friendly and encouraging AI English tutor.
    The student wants to practice speaking.
    The chosen topic is: "${topic}".
    The student's self-assessed level is: "${level}".
    
    Your role:
    1.  Engage in a natural, spoken-style conversation about the topic.
    2.  Keep your responses concise (1-2 sentences) to feel like a real chat.
    3.  Ask follow-up questions to keep the conversation going.
    4.  Adapt your vocabulary and complexity to the student's "${level}" level.
    5.  DO NOT correct the student's grammar unless they explicitly ask. Just be a conversation partner.
    6.  Speak ONLY in English.`;

    // Xây dựng mảng tin nhắn để gửi cho AI
    const messagesForAI: Message[] = [
      {
        id: "system-prompt",
        role: "system",
        content: systemPrompt,
      },
      ...messages, // Thêm lịch sử chat của user
    ];

    console.log("System Prompt Sent to AI:", messagesForAI);

    const stream = await streamText({
      model: google("models/gemini-2.0-flash"),
      messages: messagesForAI, // Gửi prompt đã tối ưu
      temperature: 0.7,
      maxTokens: 1000,
    });
    console.log("System Prompt Sent to AI:", stream);

    return stream?.toDataStreamResponse();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
