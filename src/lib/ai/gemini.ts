import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const geminiFlash = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-001",
});

export const geminiFlashLite = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite-001",
});
