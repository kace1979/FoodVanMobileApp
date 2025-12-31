
import { GoogleGenAI, Type } from "@google/genai";
import { SaleRecord } from "../types";

export const getDailyInsights = async (sales: SaleRecord[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const salesSummary = sales.map(s => ({
    time: new Date(s.timestamp).toLocaleTimeString(),
    total: s.total,
    items: s.items.map(i => `${i.name} (x${i.quantity})`).join(', ')
  }));

  const prompt = `Act as a retail business expert for a mobile food van. Analyze today's sales data and provide 3 quick bullet points on: 
  1. Most popular item trends
  2. Revenue performance
  3. One suggestion for tomorrow's inventory.
  
  Sales Data: ${JSON.stringify(salesSummary)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "No insights available today.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not connect to AI advisor. Check connection.";
  }
};
