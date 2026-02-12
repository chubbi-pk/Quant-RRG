import { GoogleGenAI } from "@google/genai";
import { TickerData, MarketInsight } from "../types";

export const getMarketInsights = async (data: TickerData[]): Promise<MarketInsight | null> => {
  // Check if API key is available
  const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : null;
  
  if (!apiKey) {
    console.warn("Gemini API key not configured. Skipping AI insights.");
    return null;
  }

  try {
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

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
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
