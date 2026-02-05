// Code adapted from https://zenith20.hashnode.dev/build-your-own-maze-generator-in-javascript
export class Cell {
  constructor(parentSize, parentGrid, rows, cols, rowNum, colNum) {
    this.parentSize = parentSize;
    this.parentGrid = parentGrid;
    this.rows = rows;
    this.cols = cols;
    this.rowNum = rowNum;
    this.colNum = colNum;
    this.size = parentSize / rows;

    this.walls = {
      topWall: true,
      bottomWall: true,
      leftWall: true,
      rightWall: true,
    };

    this.visited = false;
    this.neighbours = [];
    this.color = "#2EC4B6";
    this.x = colNum * this.size;
    this.y = rowNum * this.size;
  }

  setNeighbours() {
    this.neighbours = [];
    const x = this.colNum;
    const y = this.rowNum;

    const left = this.colNum !== 0 ? this.parentGrid[y][x - 1] : undefined;
    const right = this.colNum !== this.cols - 1 ? this.parentGrid[y][x + 1] : undefined;
    const top = this.rowNum !== 0 ? this.parentGrid[y - 1][x] : undefined;
    const bottom = this.rowNum !== this.rows - 1 ? this.parentGrid[y + 1][x] : undefined;

    if (left && !left.visited) this.neighbours.push(left);
    if (right && !right.visited) this.neighbours.push(right);
    if (top && !top.visited) this.neighbours.push(top);
    if (bottom && !bottom.visited) this.neighbours.push(bottom);
  }

  getRandNeighbour(random) {
    this.setNeighbours();
    if (this.neighbours.length === 0) return undefined;
    const rand = Math.floor(random() * this.neighbours.length);
    return this.neighbours[rand];
  }

  removeWalls(cell1, cell2) {
    const XDiff = cell2.colNum - cell1.colNum;
    if (XDiff === 1) {
      cell1.walls.rightWall = false;
      cell2.walls.leftWall = false;
    } else if (XDiff === -1) {
      cell2.walls.rightWall = false;
      cell1.walls.leftWall = false;
    }

    const YDiff = cell2.rowNum - cell1.rowNum;
    if (YDiff === 1) {
      cell1.walls.bottomWall = false;
      cell2.walls.topWall = false;
    } else if (YDiff === -1) {
      cell2.walls.bottomWall = false;
      cell1.walls.topWall = false;
    }
  }

  getWallSegments() {
    const segments = [];

    if (this.walls.topWall) {
      segments.push({
        type: 'top',
        x1: this.colNum * this.size,
        y1: this.rowNum * this.size,
        x2: (this.colNum + 1) * this.size,
        y2: this.rowNum * this.size
      });
    }

    if (this.walls.bottomWall) {
      segments.push({
        type: 'bottom',
        x1: this.colNum * this.size,
        y1: (this.rowNum + 1) * this.size,
        x2: (this.colNum + 1) * this.size,
        y2: (this.rowNum + 1) * this.size
      });
    }

    if (this.walls.leftWall) {
      segments.push({
        type: 'left',
        x1: this.colNum * this.size,
        y1: this.rowNum * this.size,
        x2: this.colNum * this.size,
        y2: (this.rowNum + 1) * this.size
      });
    }

    if (this.walls.rightWall) {
      segments.push({
        type: 'right',
        x1: (this.colNum + 1) * this.size,
        y1: this.rowNum * this.size,
        x2: (this.colNum + 1) * this.size,
        y2: (this.rowNum + 1) * this.size
      });
    }

    return segments;
  }
}
