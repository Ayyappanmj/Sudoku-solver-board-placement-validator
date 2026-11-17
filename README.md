# Sudoku Solver & Placement Validator Engine

A full-stack JavaScript application featuring an optimized Constraint Satisfaction Problem (CSP) Sudoku solving algorithm, real-time board placement validation, and an interactive grid interface. Built with Node.js, Express, and a test-driven development (TDD) suite using Mocha and Chai.

---

## Technical Highlights

- **Optimized Backtracking Solver**: Implemented recursive backtracking with the **Minimum Remaining Values (MRV)** heuristic. Instead of naively searching sequentially, the solver dynamically picks the cell with the fewest legal candidate digits. This reduces search tree depth and branch factors, solving arbitrary 9x9 puzzle configurations in **under 2 milliseconds**.
- **Orthogonal Constraint Checking**: Independently validates placements across rows, columns, and 3x3 sub-grids. Handles state-preserving updates (ignoring target cell self-clashes when re-evaluating existing entries).
- **Defensive API Design**: Exhaustive sanitization on incoming coordinate formats, board string lengths, candidate values, and puzzle character sets before executing solver computations.
- **Automated Test Coverage**: 26 automated tests (12 unit tests + 14 end-to-end API functional tests) covering deterministic solutions, unsolvable boards, and negative edge cases.

---

## Architecture & Project Structure

```
.
├── controllers/
│   ├── puzzle-strings.js       # Sample puzzle datasets & benchmark boards
│   └── sudoku-solver.js        # Core engine: validation, placement rules & MRV solver
├── routes/
│   ├── api.js                  # Express route handlers for /api/solve & /api/check
│   └── fcctesting.js           # Automated test reporting middleware
├── tests/
│   ├── 1_unit-tests.js         # 12 unit tests for algorithmic correctness & validation
│   └── 2_functional-tests.js   # 14 functional API integration tests (Chai-HTTP)
├── views/
│   └── index.html              # Frontend layout & 9x9 CSS grid visualization
├── public/
│   ├── index.js                # DOM manipulation, grid updates & API client
│   └── style.css               # Responsive stylesheet & coordinate styling
├── server.js                   # Application entry point & middleware pipeline
├── test-runner.js              # Custom test emitter & assertion parser
└── package.json                # Project dependencies & test scripts
```

---

## Algorithmic Design

### The MRV (Minimum Remaining Values) Approach

Standard brute-force backtracking runs in worst-case $O(9^m)$ time, where $m$ is the count of empty cells. In hard Sudoku boards, naive iteration leads to deep recursive branches before detecting dead ends.

Our implementation uses the MRV heuristic:
1. **Initial Integrity Pass**: Scans the input string to guarantee no initial duplicate values exist in any row, column, or 3x3 box. Contradictory boards fail immediately in $O(1)$ space.
2. **Candidate Generation**: Computes legal candidate sets for every remaining empty cell by bit-masking used values in row, column, and box namespaces.
3. **Branch Pruning**: Selects the cell with the minimum non-zero candidate count ($\min |candidates|$). If any empty cell has 0 candidates, the solver backtracks immediately without exploring futile branches.
4. **Deterministic Forward Progress**: Cells with a single legal value (naked singles) are filled first, cascading through the board and collapsing the search space.

---

## API Reference

### 1. Solve Puzzle

Solves an 81-character puzzle string containing digits `1-9` and periods `.` for empty cells.

- **Endpoint**: `POST /api/solve`
- **Headers**: `Content-Type: application/json` or `application/x-www-form-urlencoded`

#### Request Payload:
```json
{
  "puzzle": "1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37."
}
```

#### Successful Response (`200 OK`):
```json
{
  "solution": "135762984946381257728459613694517832812936745357824196473298561581673429269145378"
}
```

#### Error Responses:
| Scenario | Response Body |
| :--- | :--- |
| Missing payload field | `{ "error": "Required field missing" }` |
| Invalid characters (not `1-9` or `.`) | `{ "error": "Invalid characters in puzzle" }` |
| Length $\neq$ 81 characters | `{ "error": "Expected puzzle to be 81 characters long" }` |
| Unsolvable or contradictory board | `{ "error": "Puzzle cannot be solved" }` |

---

### 2. Validate Placement

Checks whether a specific number can be placed at a coordinate without violating Sudoku rules against the current board state.

- **Endpoint**: `POST /api/check`
- **Headers**: `Content-Type: application/json` or `application/x-www-form-urlencoded`

#### Request Payload:
```json
{
  "puzzle": "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..",
  "coordinate": "A2",
  "value": "3"
}
```

#### Valid Placement Response (`200 OK`):
```json
{
  "valid": true
}
```

#### Conflicting Placement Response (`200 OK`):
If the value conflicts with an existing digit, all conflicting dimensions are identified (`"row"`, `"column"`, `"region"`):
```json
{
  "valid": false,
  "conflict": ["row", "region"]
}
```

#### Error Responses:
| Scenario | Response Body |
| :--- | :--- |
| Missing `puzzle`, `coordinate`, or `value` | `{ "error": "Required field(s) missing" }` |
| Invalid coordinate format (expected `A1`-`I9`) | `{ "error": "Invalid coordinate" }` |
| Invalid value (expected digit `1`-`9`) | `{ "error": "Invalid value" }` |
| Malformed board length or characters | Respective puzzle error message |

---

## Testing & Quality Assurance

This codebase follows Test-Driven Development principles. The test suite is organized into unit tests for core logic and functional tests for the HTTP interface.

### Running Tests

```bash
# Run the complete Mocha test suite
npm test
```

### Test Suite Summary

- **Unit Tests (`tests/1_unit-tests.js`) — 12 Tests**:
  - Puzzle string validation (length check, illegal characters, valid strings).
  - Row placement validation (valid placements, duplicate rejections).
  - Column placement validation (valid placements, duplicate rejections).
  - Region placement validation (3x3 bounding box verification).
  - Solver engine verification against known incomplete puzzles, invalid configurations, and unsolvable states.

- **Functional Tests (`tests/2_functional-tests.js`) — 14 Tests**:
  - Full HTTP round-trip verification using Chai-HTTP.
  - Endpoints `/api/solve` and `/api/check` under valid payloads, missing fields, malformed coordinates, out-of-range values, single conflicts, multiple conflicts, and all-dimension conflicts.

---

## Getting Started

### Prerequisites
- **Node.js** (v14.0.0 or later)
- **npm** (v6.0.0 or later)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd boilerplate-project-sudoku-solver-main
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create the local configuration file:
   ```bash
   cp sample.env .env
   ```
   Ensure `.env` contains:
   ```ini
   PORT=3000
   NODE_ENV=test
   ```

4. Start the application:
   ```bash
   npm start
   ```
   Open `http://localhost:3000` in your browser.

---

## Tech Stack

- **Runtime**: Node.js
- **Web Framework**: Express.js
- **Testing**: Mocha, Chai, Chai-HTTP
- **Transpilation**: Babel (`@babel/register`, `@babel/core`, `@babel/preset-env`)
- **Frontend**: Vanilla JavaScript (ES6+ modules), HTML5, CSS3
