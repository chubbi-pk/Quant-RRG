
import { GoogleGenAI, Type } from "@google/genai";
import { TickerData, MarketInsight } from "../types";

export const getMarketInsights = async (data: TickerData[]): Promise<MarketInsight | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });
  
  const sectorContext = data.map(s => 
    `${s.symbol} (${s.name}): Quadrant=${s.currentQuadrant}, RS-Ratio=${s.history[s.history.length-1].rsRatio.toFixed(2)}, RS-Momentum=${s.history[s.history.length-1].rsMomentum.toFixed(2)}`
  ).join('\n');

  const prompt = `
    Act as a senior quantitative macro strategist. Analyze the following Sector Relative Rotation Graph (RRG) data:
    
    ${sectorContext}
    
    Provide a professional market commentary including:
    1. A concise summary of the current market regime.
    2. Identification of the strongest leading sectors.
    3. A brief risk assessment of sectors in the weakening or lagging quadrants.
    4. A rotation strategy for the next period.

    Return the result strictly as a JSON object matching this structure:
    {
      "summary": "string",
      "topSectors": ["string"],
      "riskAssessment": "string",
      "rotationStrategy": "string"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            topSectors: { type: Type.ARRAY, items: { type: Type.STRING } },
            riskAssessment: { type: Type.STRING },
            rotationStrategy: { type: Type.STRING }
          },
          required: ["summary", "topSectors", "riskAssessment", "rotationStrategy"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
  } catch (error) {
    console.error("Gemini Insight Error:", error);
  }
  return null;
};
