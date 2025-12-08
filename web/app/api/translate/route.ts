import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    const { text: translation } = await generateText({
      model: google("gemma-3-27b-it"),
      prompt: `Hãy dịch chính xác câu sau sang tiếng Việt: "${text}"`,
      temperature: 0.1,
    });

    return Response.json({ translation });
  } catch (error) {
    console.error("Translate API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
