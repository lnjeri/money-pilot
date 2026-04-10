import { GoogleGenAI } from "@google/genai";
import { formatCurrency } from "../utils";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getFinancialAdvice(expenses: any[], savingsGoal: any, income?: number, currency: string = 'USD') {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is missing");
    return { advice: ["I'm currently offline. Please check back later for financial insights."] };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [{
        role: "user",
        parts: [{
          text: `You are a professional financial advisor. Analyze the following financial data and provide 3 actionable pieces of advice.
          
          Currency: ${currency}
          Monthly Income: ${income ? formatCurrency(income, currency) : 'Not provided'}
          Expenses: ${JSON.stringify(expenses)}
          Savings Goal: ${JSON.stringify(savingsGoal)}
          
          Format your response as a JSON object with an 'advice' array containing strings.
          Keep it professional, encouraging, and concise.`
        }]
      }],
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "";
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonString || '{"advice": []}');
  } catch (error) {
    console.error("Gemini API Error details:", error);
    return { advice: ["I'm having trouble connecting to my brain right now. Please try again in a moment."] };
  }
}
