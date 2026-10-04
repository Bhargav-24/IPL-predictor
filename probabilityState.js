export const probabilityState = {
  rows: [],
  teams: [],
  probabilityMap: {},
  initialized: false,
};

export function setRows(rows) {
  probabilityState.rows = rows;
  probabilityState.teams = [...new Set(rows.flatMap((row) => [row.team1, row.team2]).filter(Boolean))].sort();
}
