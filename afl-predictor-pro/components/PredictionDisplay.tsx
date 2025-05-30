import React from 'react';
import { PredictionResult } from '../types';
import SourceListItem from './SourceListItem';

interface PredictionDisplayProps {
  result: PredictionResult;
}

const PredictionDisplay: React.FC<PredictionDisplayProps> = ({ result }) => {
  const { predictedWinner, justification, keyStats, sources, error } = result;

  if (error && !predictedWinner && !justification && (!keyStats || keyStats.length === 0)) {
     // This case is handled by App.tsx displaying a top-level ErrorMessage component.
     // This component should only render if there's some data or a partial error.
    return null;
  }
  
  // A minor error from parsing, but some data exists.
  if (error) {
    // You might want to display this minor error differently, e.g. a small note
    console.warn("PredictionDisplay received data with a minor error:", error);
  }


  if (!predictedWinner && !justification && (!keyStats || keyStats.length === 0)) {
    return (
        <div className="bg-slate-800 p-6 rounded-xl shadow-2xl mt-8 text-center">
            <p className="text-slate-400">Select teams and click "Get Prediction" to see the AI's analysis.</p>
        </div>
    );
  }
  
  return (
    <div className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl mt-8 animate-fadeIn">
      {predictedWinner && (
        <div className="mb-6 pb-6 border-b border-slate-700">
          <h3 className="text-sm font-semibold uppercase text-sky-400 mb-1">Predicted Winner</h3>
          <p className="text-2xl md:text-3xl font-bold text-white">{predictedWinner}</p>
        </div>
      )}

      {justification && (
        <div className="mb-6 pb-6 border-b border-slate-700">
          <h3 className="text-sm font-semibold uppercase text-sky-400 mb-2">Justification</h3>
          <p className="text-slate-300 whitespace-pre-line leading-relaxed">{justification}</p>
        </div>
      )}

      {keyStats && keyStats.length > 0 && (
        <div className="mb-6 pb-6 border-b border-slate-700">
          <h3 className="text-sm font-semibold uppercase text-sky-400 mb-2">Key Stats & Insights</h3>
          <ul className="list-disc list-inside text-slate-300 space-y-2 pl-2">
            {keyStats.map((stat, index) => (
              <li key={index} className="leading-relaxed">{stat}</li>
            ))}
          </ul>
        </div>
      )}

      {sources && sources.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase text-sky-400 mb-2">Information Sources</h3>
          <ul className="space-y-1">
            {sources.map((source, index) => (
              <SourceListItem key={index} source={source} />
            ))}
          </ul>
        </div>
      )}
       {result.error && ( // Display minor parsing errors here if any
        <p className="mt-4 text-sm text-yellow-400 bg-yellow-900/30 p-2 rounded">{result.error}</p>
      )}
    </div>
  );
};

export default PredictionDisplay;
