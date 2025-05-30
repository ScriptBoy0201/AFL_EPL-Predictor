import React, { useState, useCallback } from 'react';
import { AFL_TEAMS } from './constants';
import { Team, PredictionResult, GameMatch } from './types';
import { getAFLPrediction } from './services/geminiService';
import GameSelector from './components/GameSelector';
import PredictionDisplay from './components/PredictionDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';

// Define helper components outside the main component function
const AppHeader: React.FC = () => (
  <header className="py-8 text-center">
    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
      AFL Predictor Pro
    </h1>
    <p className="text-slate-400 mt-2 text-lg">AI-Powered AFL Game Predictions & Insights</p>
  </header>
);

const AppFooter: React.FC = () => (
    <footer className="text-center py-6 mt-12 border-t border-slate-700">
        <p className="text-sm text-slate-500">
            Powered by Gemini AI. Predictions are for entertainment purposes only.
        </p>
    </footer>
);


const App: React.FC = () => {
  const [selectedHomeTeamId, setSelectedHomeTeamId] = useState<string>('');
  const [selectedAwayTeamId, setSelectedAwayTeamId] = useState<string>('');
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleHomeTeamChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedHomeTeamId(event.target.value);
    setPredictionResult(null); // Clear previous prediction
    setError(null); // Clear previous error
  }, []);

  const handleAwayTeamChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAwayTeamId(event.target.value);
    setPredictionResult(null); // Clear previous prediction
    setError(null); // Clear previous error
  }, []);

  const handlePredict = useCallback(async () => {
    if (!selectedHomeTeamId || !selectedAwayTeamId || selectedHomeTeamId === selectedAwayTeamId) {
      setError("Please select two different teams.");
      return;
    }

    const homeTeam = AFL_TEAMS.find(t => t.id === selectedHomeTeamId);
    const awayTeam = AFL_TEAMS.find(t => t.id === selectedAwayTeamId);

    if (!homeTeam || !awayTeam) {
      setError("Selected team(s) not found.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPredictionResult(null);

    const match: GameMatch = { homeTeam, awayTeam };
    try {
      const result = await getAFLPrediction(match);
      if (result.error && (!result.predictedWinner && !result.justification && (!result.keyStats || result.keyStats.length === 0))) {
        // This is a major error, like API key issue or total failure
        setError(result.error);
        setPredictionResult(null);
      } else {
        // Partial errors (e.g. parsing issues) are handled within PredictionResult and displayed there
        setPredictionResult(result);
        if(result.error) setError(null); // Clear major error if we got some data + minor error
      }
    } catch (e) {
      console.error("Prediction failed:", e);
      setError(e instanceof Error ? e.message : "An unexpected error occurred.");
      setPredictionResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedHomeTeamId, selectedAwayTeamId]);

  return (
    <div className="min-h-screen flex flex-col container mx-auto px-4 py-2 antialiased">
      <AppHeader />
      <main className="flex-grow">
        <GameSelector
          teams={AFL_TEAMS}
          selectedHomeTeamId={selectedHomeTeamId}
          selectedAwayTeamId={selectedAwayTeamId}
          onHomeTeamChange={handleHomeTeamChange}
          onAwayTeamChange={handleAwayTeamChange}
          onPredict={handlePredict}
          isLoading={isLoading}
        />
        {error && <ErrorMessage message={error} />}
        {isLoading && <LoadingSpinner />}
        {!isLoading && !error && predictionResult && <PredictionDisplay result={predictionResult} />}
        {!isLoading && !error && !predictionResult && (
             <div className="bg-slate-800 p-6 rounded-xl shadow-2xl mt-8 text-center">
                <p className="text-slate-400">Select teams and click "Get Prediction" to see the AI's analysis.</p>
             </div>
        )}

      </main>
      <AppFooter />
      <style>{`
        /* Basic fade-in animation */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
