export class CanvasView {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.margin = 200;
    this.halfMargin = this.margin / 2;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  renderMaze(mazeModel, angle) {
    this.canvas.width = mazeModel.size + this.margin;
    this.canvas.height = mazeModel.size + this.margin;
    this.canvas.style.background = "#2EC4B6";

    const offsetX = (this.canvas.width - mazeModel.size) / 2;
    const offsetY = (this.canvas.height - mazeModel.size) / 2;

    this.ctx.save();
    this.ctx.translate(offsetX + mazeModel.size / 2, offsetY + mazeModel.size / 2);
    this.ctx.rotate(angle);
    this.ctx.translate(-mazeModel.size / 2, -mazeModel.size / 2);

    // Render cells (background)
    mazeModel.grid.forEach((row) => {
      row.forEach((cell) => {
        this.ctx.fillStyle = cell.color;
        this.ctx.fillRect(
          cell.colNum * cell.size + 1,
          cell.rowNum * cell.size + 1,
          cell.size - 2,
          cell.size - 2
        );
      });
    });

    // Render walls
    this.ctx.lineWidth = 4;
    this.ctx.strokeStyle = "white";

    mazeModel.grid.forEach((row) => {
      row.forEach((cell) => {
        this.drawCellWalls(cell);
      });
    });

    this.ctx.restore();
  }

  drawCellWalls(cell) {
    if (cell.walls.topWall) {
      this.drawLine(
        cell.colNum * cell.size,
        cell.rowNum * cell.size,
        (cell.colNum + 1) * cell.size,
        cell.rowNum * cell.size
      );
    }

    if (cell.walls.bottomWall) {
      this.drawLine(
        cell.colNum * cell.size,
        (cell.rowNum + 1) * cell.size,
        (cell.colNum + 1) * cell.size,
        (cell.rowNum + 1) * cell.size
      );
    }

    if (cell.walls.leftWall) {
      this.drawLine(
        cell.colNum * cell.size,
        cell.rowNum * cell.size,
        cell.colNum * cell.size,
        (cell.rowNum + 1) * cell.size
      );
    }

    if (cell.walls.rightWall) {
      this.drawLine(
        (cell.colNum + 1) * cell.size,
        cell.rowNum * cell.size,
        (cell.colNum + 1) * cell.size,
        (cell.rowNum + 1) * cell.size
      );
    }
  }

  drawLine(fromX, fromY, toX, toY) {
    this.ctx.beginPath();
    this.ctx.moveTo(fromX, fromY);
    this.ctx.lineTo(toX, toY);
    this.ctx.stroke();
  }

  renderBall(ballModel, x, y, angle) {
    this.ctx.save();
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.rotate(angle);
    this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);

    this.ctx.fillStyle = ballModel.getColor();
    this.ctx.beginPath();
    this.ctx.arc(x, y, ballModel.getRadius(), 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }
}
