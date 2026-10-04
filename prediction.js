import { probabilityState } from './probabilityState.js';

export function formatProbability(value) {
  return `${(Number(value) * 100).toFixed(2)}%`;
}

export function runPrediction(team1, team2, battingFirst) {
  if (!probabilityState.initialized || !Object.keys(probabilityState.probabilityMap).length) {
    alert('Probability values not set. Please initialize variables first.');
    return null;
  }

  if (!team1 || !team2 || team1 === team2) {
    return {
      error: 'Please select two different teams before running the prediction.',
    };
  }

  if (![team1, team2].includes(battingFirst)) {
    return {
      error: 'Please select which team bats first.',
    };
  }

  const team1Probabilities = probabilityState.probabilityMap[team1];
  const team2Probabilities = probabilityState.probabilityMap[team2];
  const priorTeam1 = team1Probabilities.pWin;
  const priorTeam2 = team2Probabilities.pWin;
  const likelihoodTeam1 = battingFirst === team1
    ? team1Probabilities.pWinGivenBatFirst
    : team1Probabilities.pWinGivenBatSecond;
  const likelihoodTeam2 = battingFirst === team2
    ? team2Probabilities.pWinGivenBatFirst
    : team2Probabilities.pWinGivenBatSecond;

  const numerator = priorTeam1 * likelihoodTeam1;
  const denominator = numerator + (priorTeam2 * likelihoodTeam2);
  const posterior = denominator === 0 ? 0.5 : numerator / denominator;

  const winner = posterior >= 0.5 ? team1 : team2;
  const winningProbability = winner === team1 ? posterior : 1 - posterior;

  return {
    winner,
    probability: winningProbability,
    team1,
    team2,
    battingFirst,
    priorTeam1,
    priorTeam2,
    likelihoodTeam1,
    likelihoodTeam2,
  };
}