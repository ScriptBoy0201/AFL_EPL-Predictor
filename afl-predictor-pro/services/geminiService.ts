import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GameMatch, PredictionResult, GroundingSource, GeminiGroundingChunk, ParsedPrediction } from '../types';
import { GEMINI_MODEL_NAME } from '../constants';

// Ensure API_KEY is accessed from process.env
// The build system or environment must define process.env.API_KEY
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY is not defined. Please set the process.env.API_KEY environment variable.");
  // Potentially throw an error or handle this state in the UI
}

const ai = new GoogleGenAI({ apiKey: API_KEY! }); // Use non-null assertion if confident it's set, or handle missing key

function parseGeminiResponse(responseText: string): ParsedPrediction {
  const prediction: ParsedPrediction = {
    keyStats: []
  };

  const winnerMatch = responseText.match(/Predicted Winner:\s*(.*)/i);
  if (winnerMatch && winnerMatch[1]) {
    prediction.predictedWinner = winnerMatch[1].trim();
  }

  const justificationMatch = responseText.match(/Justification:\s*([\s\S]*?)(Key Stats:|Sources:|$)/i);
  if (justificationMatch && justificationMatch[1]) {
    prediction.justification = justificationMatch[1].trim();
  }

  const statsSectionMatch = responseText.match(/Key Stats:\s*([\s\S]*?)(Justification:|Sources:|$)/i);
  if (statsSectionMatch && statsSectionMatch[1]) {
    const statsText = statsSectionMatch[1].trim();
    // Assuming stats are list items like "1. Stat: Details" or "- Stat: Details"
    prediction.keyStats = statsText.split(/\n\s*(?:\d+\.\s*|-\s*)/).map(s => s.trim()).filter(s => s.length > 0);
  }
  
  if (!prediction.predictedWinner && !prediction.justification && (!prediction.keyStats || prediction.keyStats.length === 0)) {
    // If nothing specific was parsed, it might be a generic message or an error from Gemini
    // Or the format was unexpected. We can return the raw text as justification in this case.
    if (!prediction.justification) prediction.justification = responseText; 
    prediction.error = "Could not fully parse the prediction details. Displaying available information.";
  }


  return prediction;
}


export const getAFLPrediction = async (match: GameMatch): Promise<PredictionResult> => {
  if (!API_KEY) {
    return {
      error: "API Key not configured. Please contact support.",
      sources: [],
    };
  }

  const prompt = `
You are an expert AFL (Australian Football League) analyst. For the upcoming AFL match between ${match.homeTeam.name} and ${match.awayTeam.name}:

1.  **Predicted Winner:** State the team you predict to win.
2.  **Justification:** Provide a detailed justification for your prediction (around 150-200 words). Consider factors like recent form (last 3-5 games), head-to-head record (last 2-3 encounters), key player matchups, significant injuries or player returns, and general team strengths or weaknesses.
3.  **Key Stats:** List 3-4 key statistics that specifically support your prediction. For each statistic, briefly explain its relevance to this matchup. Examples: Contested Possessions, Inside 50s, Clearance differential, Scoring accuracy, etc.

Format your response clearly with headings for "Predicted Winner:", "Justification:", and "Key Stats:".
Use Google Search for the most up-to-date information regarding team form, player injuries, and recent news. Ensure grounding sources are available.
Do not include any preamble or conversational filler before "Predicted Winner:".
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        // Do not add responseMimeType: "application/json" when using googleSearch
      },
    });

    const responseText = response.text;
    const parsedPrediction = parseGeminiResponse(responseText);
    
    const sources: GroundingSource[] = [];
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (groundingChunks) {
      groundingChunks.forEach((chunk: GeminiGroundingChunk) => {
        if (chunk.web && chunk.web.uri && chunk.web.title) {
          sources.push({ uri: chunk.web.uri, title: chunk.web.title });
        }
      });
    }
    
    return {
      ...parsedPrediction,
      sources,
    };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    let errorMessage = "Failed to get prediction from AI model.";
    if (error instanceof Error) {
        errorMessage += ` Details: ${error.message}`;
    }
    return {
      error: errorMessage,
      sources: [],
      keyStats: [],
    };
  }
};
