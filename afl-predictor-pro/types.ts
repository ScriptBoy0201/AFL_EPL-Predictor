export interface Team {
  id: string;
  name: string;
  // logoUrl?: string; // Optional: if we were to add logos
}

export interface GameMatch {
  homeTeam: Team;
  awayTeam: Team;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface ParsedPrediction {
  predictedWinner?: string;
  justification?: string;
  keyStats?: string[]; // Array of strings, each representing a stat and its relevance
  error?: string; // For parsing errors or if Gemini can't provide full info
}

export interface PredictionResult extends ParsedPrediction {
  sources: GroundingSource[];
}

// For Gemini API response structure (simplified)
export interface GeminiGroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  // Other types of chunks could exist, but we're interested in 'web'
}
