class SudokuSolver {

  validate(puzzleString) {
    if (!puzzleString) {
      return { error: 'Required field missing' };
    }
    if (puzzleString.length !== 81) {
      return { error: 'Expected puzzle to be 81 characters long' };
    }
    if (/[^1-9.]/.test(puzzleString)) {
      return { error: 'Invalid characters in puzzle' };
    }
    return true;
  }

  parseCoordinate(row, column) {
    let rowIndex = -1;
    if (typeof row === 'string' && /^[a-i]$/i.test(row)) {
      rowIndex = row.toUpperCase().charCodeAt(0) - 65;
    } else {
      let r = parseInt(row, 10);
      if (r >= 1 && r <= 9) rowIndex = r - 1;
      else if (r === 0) rowIndex = 0;
    }

    let colIndex = -1;
    let c = parseInt(column, 10);
    if (c >= 1 && c <= 9) colIndex = c - 1;
    else if (c === 0) colIndex = 0;

    return { rowIndex, colIndex };
  }

  checkRowPlacement(puzzleString, row, column, value) {
    const { rowIndex, colIndex } = this.parseCoordinate(row, column);
    if (rowIndex < 0 || rowIndex > 8 || colIndex < 0 || colIndex > 8) return false;
    const valStr = String(value);

    for (let c = 0; c < 9; c++) {
      if (c === colIndex) continue;
      if (puzzleString[rowIndex * 9 + c] === valStr) {
        return false;
      }
    }
    return true;
  }

  checkColPlacement(puzzleString, row, column, value) {
    const { rowIndex, colIndex } = this.parseCoordinate(row, column);
    if (rowIndex < 0 || rowIndex > 8 || colIndex < 0 || colIndex > 8) return false;
    const valStr = String(value);

    for (let r = 0; r < 9; r++) {
      if (r === rowIndex) continue;
      if (puzzleString[r * 9 + colIndex] === valStr) {
        return false;
      }
    }
    return true;
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    const { rowIndex, colIndex } = this.parseCoordinate(row, column);
    if (rowIndex < 0 || rowIndex > 8 || colIndex < 0 || colIndex > 8) return false;
    const valStr = String(value);

    const startRow = Math.floor(rowIndex / 3) * 3;
    const startCol = Math.floor(colIndex / 3) * 3;

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const curR = startRow + r;
        const curC = startCol + c;
        if (curR === rowIndex && curC === colIndex) continue;
        if (puzzleString[curR * 9 + curC] === valStr) {
          return false;
        }
      }
    }
    return true;
  }

  solve(puzzleString) {
    if (this.validate(puzzleString) !== true) {
      return false;
    }

    const grid = puzzleString.split('').map(c => c === '.' ? 0 : parseInt(c, 10));

    // Check initial board validity (no duplicates in any row, column, or 3x3 region)
    for (let r = 0; r < 9; r++) {
      const rowSeen = new Set();
      for (let c = 0; c < 9; c++) {
        const v = grid[r * 9 + c];
        if (v !== 0) {
          if (rowSeen.has(v)) return false;
          rowSeen.add(v);
        }
      }
    }
    for (let c = 0; c < 9; c++) {
      const colSeen = new Set();
      for (let r = 0; r < 9; r++) {
        const v = grid[r * 9 + c];
        if (v !== 0) {
          if (colSeen.has(v)) return false;
          colSeen.add(v);
        }
      }
    }
    for (let box = 0; box < 9; box++) {
      const boxSeen = new Set();
      const startR = Math.floor(box / 3) * 3;
      const startC = (box % 3) * 3;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const v = grid[(startR + r) * 9 + (startC + c)];
          if (v !== 0) {
            if (boxSeen.has(v)) return false;
            boxSeen.add(v);
          }
        }
      }
    }

    function getCandidates(r, c) {
      const used = new Uint8Array(10);
      for (let k = 0; k < 9; k++) {
        used[grid[r * 9 + k]] = 1;
        used[grid[k * 9 + c]] = 1;
      }
      const startR = Math.floor(r / 3) * 3;
      const startC = Math.floor(c / 3) * 3;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          used[grid[(startR + i) * 9 + (startC + j)]] = 1;
        }
      }
      const candidates = [];
      for (let d = 1; d <= 9; d++) {
        if (!used[d]) candidates.push(d);
      }
      return candidates;
    }

    function backtrack() {
      let minCandidates = null;
      let bestR = -1, bestC = -1;

      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (grid[r * 9 + c] === 0) {
            const candidates = getCandidates(r, c);
            if (candidates.length === 0) return false;
            if (!minCandidates || candidates.length < minCandidates.length) {
              minCandidates = candidates;
              bestR = r;
              bestC = c;
              if (candidates.length === 1) break;
            }
          }
        }
        if (minCandidates && minCandidates.length === 1) break;
      }

      if (!minCandidates) return true; // Solved

      for (const val of minCandidates) {
        grid[bestR * 9 + bestC] = val;
        if (backtrack()) return true;
        grid[bestR * 9 + bestC] = 0;
      }
      return false;
    }

    if (backtrack()) {
      return grid.join('');
    }
    return false;
  }
}

module.exports = SudokuSolver;
