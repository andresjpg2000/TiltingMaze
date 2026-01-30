import { Cell } from './CellModel.js';

export class MazeModel {
  constructor(size, rows, cols) {
    this.size = size;
    this.rows = rows;
    this.cols = cols;
    this.grid = [];
    this.stack = [];
    this.current = null;
  }

  setup() {
    for (let r = 0; r < this.rows; r++) {
      const row = [];
      for (let c = 0; c < this.cols; c++) {
        const cell = new Cell(this.size, this.grid, this.rows, this.cols, r, c);
        row.push(cell);
      }
      this.grid.push(row);
    }
    this.current = this.grid[0][0];
  }

  // DFS Maze Generation Algorithm
  // Code adapted from https://zenith20.hashnode.dev/build-your-own-maze-generator-in-javascript
  generate() {
    this.current.visited = true;
    const next = this.current.getRandNeighbour();

    if (next) {
      next.visited = true;
      this.stack.push(this.current);
      this.current.color = "#FF3366";
      this.current.removeWalls(this.current, next);
      this.current = next;
    } else if (this.stack.length > 0) {
      this.current.color = "#2EC4B6";
      const cell = this.stack.pop();
      this.current = cell;
    }

    return this.stack.length > 0;
  }

  isGenerationComplete() {
    return this.stack.length === 0;
  }

  getAllWallSegments() {
    const allSegments = [];
    this.grid.forEach((row) => {
      row.forEach((cell) => {
        allSegments.push(...cell.getWallSegments());
      });
    });
    return allSegments;
  }

  getTargetCell() {
    return this.grid[0][0];
  }

  getStartCell() {
    return this.grid[this.rows - 1][this.cols - 1];
  }
}
