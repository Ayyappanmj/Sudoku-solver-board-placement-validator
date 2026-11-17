const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
const { puzzlesAndSolutions } = require('../controllers/puzzle-strings.js');

let solver = new Solver();

suite('Unit Tests', () => {

  test('Logic handles a valid puzzle string of 81 characters', function() {
    assert.equal(solver.validate(puzzlesAndSolutions[0][0]), true);
  });

  test('Logic handles a puzzle string with invalid characters (not 1-9 or .)', function() {
    const invalidCharPuzzle = puzzlesAndSolutions[0][0].replace(/1/g, 'a');
    assert.deepEqual(solver.validate(invalidCharPuzzle), { error: 'Invalid characters in puzzle' });
    assert.equal(solver.validate(invalidCharPuzzle).error, 'Invalid characters in puzzle');
  });

  test('Logic handles a puzzle string that is not 81 characters in length', function() {
    const invalidLenPuzzle = puzzlesAndSolutions[0][0].slice(0, 80);
    assert.deepEqual(solver.validate(invalidLenPuzzle), { error: 'Expected puzzle to be 81 characters long' });
    assert.equal(solver.validate(invalidLenPuzzle).error, 'Expected puzzle to be 81 characters long');
  });

  test('Logic handles a valid row placement', function() {
    assert.isTrue(solver.checkRowPlacement(puzzlesAndSolutions[0][0], 'A', '2', '3'));
  });

  test('Logic handles an invalid row placement', function() {
    assert.isFalse(solver.checkRowPlacement(puzzlesAndSolutions[0][0], 'A', '2', '1'));
  });

  test('Logic handles a valid column placement', function() {
    assert.isTrue(solver.checkColPlacement(puzzlesAndSolutions[0][0], 'A', '2', '3'));
  });

  test('Logic handles an invalid column placement', function() {
    assert.isFalse(solver.checkColPlacement(puzzlesAndSolutions[0][0], 'A', '2', '2'));
  });

  test('Logic handles a valid region (3x3 grid) placement', function() {
    assert.isTrue(solver.checkRegionPlacement(puzzlesAndSolutions[0][0], 'A', '2', '3'));
  });

  test('Logic handles an invalid region (3x3 grid) placement', function() {
    assert.isFalse(solver.checkRegionPlacement(puzzlesAndSolutions[0][0], 'A', '2', '5'));
  });

  test('Valid puzzle strings pass the solver', function() {
    const result = solver.solve(puzzlesAndSolutions[0][0]);
    assert.isString(result);
    assert.equal(result.length, 81);
  });

  test('Invalid puzzle strings fail the solver', function() {
    const invalidPuzzle = '11' + puzzlesAndSolutions[0][0].slice(2);
    assert.isFalse(solver.solve(invalidPuzzle));
  });

  test('Solver returns the expected solution for an incomplete puzzle', function() {
    assert.equal(solver.solve(puzzlesAndSolutions[0][0]), puzzlesAndSolutions[0][1]);
  });

});
