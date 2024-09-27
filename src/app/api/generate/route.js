import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { conversationHistory, newQuestion } = await req.json();
    if (!conversationHistory || !newQuestion) {
      return NextResponse.json(
        { message: "Conversation history and new question are required" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const summaryPrompt = `You are an assistant. Summarize the following conversation before answering the new question:\n\n${conversationHistory}\n\nNew question: ${newQuestion}. The summary must not exceed 50 words and should help the user search the new question in the database. If the ${conversationHistory} is not relevant to ${newQuestion}, don't need to summary, only reply: ""!`;
    // console.log("Generating content with prompt:", summaryPrompt);
    const summaryResult = await model.generateContent([summaryPrompt]);
    // console.log("Generated content:", summaryResult.response.text());
    return NextResponse.json({ summary: summaryResult.response.text() });
  } catch (error) {
    console.error("Error summarizing content:", error);
    return NextResponse.json(
      { message: "Error summarizing content", error: error.message },
      { status: 500 }
    );
  }
}
