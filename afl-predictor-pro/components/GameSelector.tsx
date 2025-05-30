import React from 'react';
import { Team } from '../types';

interface GameSelectorProps {
  teams: Team[];
  selectedHomeTeamId: string;
  selectedAwayTeamId: string;
  onHomeTeamChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onAwayTeamChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onPredict: () => void;
  isLoading: boolean;
}

const GameSelector: React.FC<GameSelectorProps> = ({
  teams,
  selectedHomeTeamId,
  selectedAwayTeamId,
  onHomeTeamChange,
  onAwayTeamChange,
  onPredict,
  isLoading,
}) => {
  const availableAwayTeams = teams.filter(team => team.id !== selectedHomeTeamId);
  const availableHomeTeams = teams.filter(team => team.id !== selectedAwayTeamId);

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-2xl mb-8">
      <h2 className="text-2xl font-semibold text-sky-400 mb-6 text-center">Select Matchup</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 items-end">
        <div>
          <label htmlFor="homeTeam" className="block text-sm font-medium text-slate-300 mb-1">
            Home Team
          </label>
          <select
            id="homeTeam"
            value={selectedHomeTeamId}
            onChange={onHomeTeamChange}
            className="w-full bg-slate-700 border border-slate-600 text-slate-100 rounded-lg p-3 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-150"
            disabled={isLoading}
          >
            <option value="">Select Home Team</option>
            {availableHomeTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="awayTeam" className="block text-sm font-medium text-slate-300 mb-1">
            Away Team
          </label>
          <select
            id="awayTeam"
            value={selectedAwayTeamId}
            onChange={onAwayTeamChange}
            className="w-full bg-slate-700 border border-slate-600 text-slate-100 rounded-lg p-3 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-150"
            disabled={isLoading}
          >
            <option value="">Select Away Team</option>
            {availableAwayTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={onPredict}
        disabled={isLoading || !selectedHomeTeamId || !selectedAwayTeamId || selectedHomeTeamId === selectedAwayTeamId}
        className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Predicting...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
            </svg>
            Get Prediction
          </>
        )}
      </button>
      {selectedHomeTeamId && selectedAwayTeamId && selectedHomeTeamId === selectedAwayTeamId && (
        <p className="text-red-400 text-sm mt-2 text-center">Home and Away teams cannot be the same.</p>
      )}
    </div>
  );
};

export default GameSelector;
