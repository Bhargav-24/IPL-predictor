import { probabilityState, setRows } from './probabilityState.js';
import { initializeProbabilityValues } from './probabilityInitializer.js';
import { runPrediction, formatProbability } from './prediction.js';
import { renderProbabilityList, renderTable } from './dataView.js';

const ui = {
  navButtons: Array.from(document.querySelectorAll('.nav-btn')),
  screens: {
    predict: document.getElementById('screen-predict'),
    data: document.getElementById('screen-data'),
  },
  initStatus: document.getElementById('initStatus'),
  team1Select: document.getElementById('team1Select'),
  team2Select: document.getElementById('team2Select'),
  battingFirstSelect: document.getElementById('battingFirstSelect'),
  predictionResult: document.getElementById('predictionResult'),
  dataProbabilityList: document.getElementById('dataProbabilityList'),
  dataTableHead: document.getElementById('dataTableHead'),
  dataTableBody: document.getElementById('dataTableBody'),
};

function parseCSV(text) {
  const rows = [];
  let currentValue = '';
  let currentRow = [];
  let insideQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === '"') {
      if (insideQuotes && text[i + 1] === '"') {
        currentValue += '"';
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === ',' && !insideQuotes) {
      currentRow.push(currentValue);
      currentValue = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && text[i + 1] === '\n') {
        i += 1;
      }
      currentRow.push(currentValue);
      const isEmptyRow = currentRow.every((cell) => String(cell ?? '').trim() === '');
      if (!isEmptyRow) rows.push(currentRow);
      currentRow = [];
      currentValue = '';
      continue;
    }

    currentValue += char;
  }

  if (currentValue.length > 0 || currentRow.length > 0) {
    currentRow.push(currentValue);
    const isEmptyRow = currentRow.every((cell) => String(cell ?? '').trim() === '');
    if (!isEmptyRow) rows.push(currentRow);
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map((header) => String(header).trim().toLowerCase().replace(/[^a-z0-9]+/g, '_'));
  return rows.slice(1).filter((row) => row.some((cell) => String(cell ?? '').trim() !== '')).map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] ?? '';
    });
    return obj;
  });
}

function normalizeText(value) {
  return String(value ?? '').trim();
}

function getTeamValue(value) {
  return normalizeText(value).replace(/\s+/g, ' ');
}

function normalizeRows(rows) {
  return rows.map((row) => ({
    id: normalizeText(row.id),
    team1: getTeamValue(row.team1),
    team2: getTeamValue(row.team2),
    batting_first: getTeamValue(row.batting_first),
    winner: getTeamValue(row.winner),
  }));
}

function setStatus(message, type = 'info') {
  ui.initStatus.className = `status-box ${type}`;
  ui.initStatus.textContent = message;
}

function populateTeamDropdowns() {
  const teams = [...new Set(probabilityState.rows.flatMap((row) => [row.team1, row.team2]).filter(Boolean))]
    .filter((team) => team !== 'Kochi Tuskers Kerala')
    .sort();
  const options = ['<option value="">Choose...</option>']
    .concat(teams.map((team) => `<option value="${team}">${team}</option>`))
    .join('');

  ui.team1Select.innerHTML = options;
  ui.team2Select.innerHTML = options;
  ui.battingFirstSelect.innerHTML = '<option value="">Choose teams first</option>';
  ui.battingFirstSelect.disabled = true;
}

function updateBattingFirstDropdown() {
  const team1 = ui.team1Select.value;
  const team2 = ui.team2Select.value;

  if (!team1 || !team2 || team1 === team2) {
    ui.battingFirstSelect.innerHTML = '<option value="">Choose teams first</option>';
    ui.battingFirstSelect.disabled = true;
    return;
  }

  ui.battingFirstSelect.innerHTML = [team1, team2]
    .map((team) => `<option value="${team}">${team}</option>`)
    .join('');
  ui.battingFirstSelect.disabled = false;
}

function processDataset(csvText) {
  const parsedRows = parseCSV(csvText);
  const normalizedRows = normalizeRows(parsedRows);

  if (!normalizedRows.length) {
    setStatus('The CSV file could not be parsed. Please check the data columns.', 'error');
    return;
  }

  setRows(normalizedRows);
  probabilityState.initialized = false;
  probabilityState.probabilityMap = {};
  populateTeamDropdowns();
  renderProbabilityList(ui.dataProbabilityList, probabilityState.probabilityMap);
  renderTable(ui.dataTableHead, ui.dataTableBody, normalizedRows, 8);
  setStatus('Dataset loaded. Press the initialize button to set probability values.', 'info');
}

async function loadDefaultDataset() {
  try {
    const response = await fetch('./matches.csv');
    if (!response.ok) throw new Error('Could not load dataset');
    const text = await response.text();
    processDataset(text);
  } catch (error) {
    setStatus('Could not load matches.csv. The bundled dataset is missing or unreadable.', 'error');
    console.error(error);
  }
}

function attachNavigation() {
  ui.navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const screenName = button.dataset.screen;

      ui.navButtons.forEach((item) => item.classList.toggle('active', item === button));
      Object.entries(ui.screens).forEach(([key, screen]) => {
        screen.classList.toggle('hidden', key !== screenName);
      });
    });
  });
}

function handleInitialize() {
  try {
    initializeProbabilityValues();
    renderProbabilityList(ui.dataProbabilityList, probabilityState.probabilityMap);
    setStatus('Probability values are set!', 'success');
    alert('Probability values are set!');
  } catch (error) {
    setStatus(error.message, 'error');
    alert(error.message);
  }
}

function handlePrediction() {
  const team1 = ui.team1Select.value;
  const team2 = ui.team2Select.value;
  const battingFirst = ui.battingFirstSelect.value;

  const result = runPrediction(team1, team2, battingFirst);

  if (!result) return;

  if (result.error) {
    ui.predictionResult.className = 'prediction-result';
    ui.predictionResult.textContent = result.error;
    return;
  }

  ui.predictionResult.className = 'prediction-result success';
  ui.predictionResult.innerHTML = `
    <strong>Winner:</strong> ${result.winner}<br>
    <strong>Probability:</strong> ${formatProbability(result.probability)}<br>
    <strong>Team 1 prior:</strong> ${formatProbability(result.priorTeam1)}<br>
    <strong>Team 2 prior:</strong> ${formatProbability(result.priorTeam2)}<br>
    <strong>Batting first condition:</strong> ${result.battingFirst}<br>
    <strong>Team 1 conditional probability:</strong> ${formatProbability(result.likelihoodTeam1)}<br>
    <strong>Team 2 conditional probability:</strong> ${formatProbability(result.likelihoodTeam2)}
  `;
}

function attachEvents() {
  document.getElementById('initializeBtn').addEventListener('click', handleInitialize);
  document.getElementById('predictBtn').addEventListener('click', handlePrediction);

  const downloadButton = document.getElementById('downloadCsvBtn');
  if (downloadButton) {
    downloadButton.addEventListener('click', () => {
      const csvContent = 'id,team1,team2,batting_first,winner\n' + probabilityState.rows.map((row) => `${row.id},${row.team1},${row.team2},${row.batting_first},${row.winner}`).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'matches.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }

  ui.team1Select.addEventListener('change', updateBattingFirstDropdown);
  ui.team2Select.addEventListener('change', updateBattingFirstDropdown);
}

document.addEventListener('DOMContentLoaded', async () => {
  attachNavigation();
  attachEvents();
  await loadDefaultDataset();
});
