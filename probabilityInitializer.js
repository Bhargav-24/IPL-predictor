import { probabilityState } from './probabilityState.js';

export function safeDivide(numerator, denominator) {
  if (!denominator) return 0;
  return Number(numerator) / Number(denominator);
}

export function initializeProbabilityValues() {
  if (!probabilityState.rows.length) {
    probabilityState.initialized = false;
    probabilityState.probabilityMap = {};
    throw new Error('Probability values not set. Please load a dataset and initialize variables first.');
  }

  const teams = [...new Set(probabilityState.rows.flatMap((row) => [row.team1, row.team2]).filter(Boolean))].sort();
  const nextProbabilityMap = {};

  teams.forEach((team) => {
    const allMatches = probabilityState.rows.filter((row) => [row.team1, row.team2].includes(team));
    const wins = probabilityState.rows.filter((row) => row.winner === team && [row.team1, row.team2].includes(team)).length;
    const battingFirstMatches = probabilityState.rows.filter((row) => row.batting_first === team);
    const battingFirstWins = battingFirstMatches.filter((row) => row.winner === team).length;
    const battingSecondMatches = allMatches.filter((row) => row.batting_first !== team);
    const battingSecondWins = battingSecondMatches.filter((row) => row.winner === team).length;

    nextProbabilityMap[team] = {
      pWin: safeDivide(wins, allMatches.length),
      pWinGivenBatFirst: battingFirstMatches.length
        ? safeDivide(battingFirstWins, battingFirstMatches.length)
        : safeDivide(wins, allMatches.length),
      pWinGivenBatSecond: battingSecondMatches.length
        ? safeDivide(battingSecondWins, battingSecondMatches.length)
        : safeDivide(wins, allMatches.length),
    };
  });

  probabilityState.teams = teams;
  probabilityState.probabilityMap = nextProbabilityMap;
  probabilityState.initialized = true;

  return nextProbabilityMap;
}