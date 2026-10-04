import { probabilityState } from './probabilityState.js';

export function renderProbabilityList(targetEl, probabilityMap) {
  if (!targetEl) return;

  if (!probabilityMap || Object.keys(probabilityMap).length === 0) {
    targetEl.innerHTML = '<div class="probability-item">No initialized probabilities yet.</div>';
    return;
  }

  targetEl.innerHTML = Object.entries(probabilityMap)
    .map(
      ([team, values]) => `
        <div class="probability-item">
          <strong>${team}</strong> — P(win) = ${(Number(values.pWin) * 100).toFixed(2)}% | P(win | batting first) = ${(Number(values.pWinGivenBatFirst) * 100).toFixed(2)}%
        </div>
      `,
    )
    .join('');
}

export function renderTable(tableHeadEl, tableBodyEl, rows, maxRows = 8) {
  if (!tableHeadEl || !tableBodyEl) return;

  if (!rows.length) {
    tableHeadEl.innerHTML = '<tr><th>No data</th></tr>';
    tableBodyEl.innerHTML = '<tr><td>Load a CSV before showing rows.</td></tr>';
    return;
  }

  const headers = Object.keys(rows[0]);
  tableHeadEl.innerHTML = `<tr>${headers.map((header) => `<th>${header}</th>`).join('')}</tr>`;
  tableBodyEl.innerHTML = rows
    .slice(0, maxRows)
    .map(
      (row) => `
        <tr>
          ${headers.map((header) => `<td>${String(row[header] ?? '').slice(0, 80)}</td>`).join('')}
        </tr>
      `,
    )
    .join('');
}

