import { GoogleGenerativeAI } from "@google/generative-ai";

// Access the API key from your .env file
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const getGeminiResponse = async (history, pdfText) => {
  try {
    if (!API_KEY) throw new Error("Missing Gemini API Key");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // We feed the PDF content as "System Context"
    const prompt = `
      You are a helpful AI Teaching Assistant for "Student Hub".
      
      CONTEXT FROM THE DOCUMENT:
      "${pdfText ? pdfText.substring(0, 30000) : "No document loaded."}..."
      
      INSTRUCTIONS:
      1. Answer the student's question based strictly on the context above.
      2. If the answer isn't in the document, say "I couldn't find that in this specific note."
      3. Keep answers concise and encouraging.
      
      STUDENT QUESTION:
      ${history[history.length - 1].parts[0].text}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "⚠️ I'm having trouble connecting to the AI right now. Please check your API Key.";
  }
};