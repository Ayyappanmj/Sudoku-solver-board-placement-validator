'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {
      const { puzzle, coordinate, value } = req.body || {};

      if (!puzzle || !coordinate || !value) {
        return res.json({ error: 'Required field(s) missing' });
      }

      const valResult = solver.validate(puzzle);
      if (valResult !== true) {
        return res.json(valResult);
      }

      if (!/^[a-i][1-9]$/i.test(coordinate)) {
        return res.json({ error: 'Invalid coordinate' });
      }

      if (!/^[1-9]$/.test(value)) {
        return res.json({ error: 'Invalid value' });
      }

      const row = coordinate[0].toUpperCase();
      const column = coordinate[1];

      const validRow = solver.checkRowPlacement(puzzle, row, column, value);
      const validCol = solver.checkColPlacement(puzzle, row, column, value);
      const validRegion = solver.checkRegionPlacement(puzzle, row, column, value);

      const conflict = [];
      if (!validRow) conflict.push('row');
      if (!validCol) conflict.push('column');
      if (!validRegion) conflict.push('region');

      if (conflict.length > 0) {
        return res.json({ valid: false, conflict });
      }

      return res.json({ valid: true });
    });
    
  app.route('/api/solve')
    .post((req, res) => {
      const { puzzle } = req.body || {};

      if (!puzzle) {
        return res.json({ error: 'Required field missing' });
      }

      const valResult = solver.validate(puzzle);
      if (valResult !== true) {
        return res.json(valResult);
      }

      const solution = solver.solve(puzzle);
      if (!solution) {
        return res.json({ error: 'Puzzle cannot be solved' });
      }

      return res.json({ solution });
    });
};
