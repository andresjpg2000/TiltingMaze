export class GameStateModel {
  constructor() {
    this.wins = 0;
    this.hasWon = false;
    this.gameStartTime = Date.now();
    this.angle = 0;
    this.isRotatingLeft = false;
    this.isRotatingRight = false;
    this.numCols = 4;
    this.numRows = 4;
    this.rotationSpeed = 0.012;
    this.loadDifficulty();
  }

  loadDifficulty() {
    const difficulty = JSON.parse(localStorage.getItem("mazeDifficulty"));
    if (difficulty) {
      this.numCols = difficulty.numCols;
      this.numRows = difficulty.numRows;
      this.isCustomMode = difficulty.custom || false;
    } else {
      this.isCustomMode = false;
    }
  }

  incrementWins() {
    this.wins++;
  }

  markWon() {
    this.hasWon = true;
  }

  resetWinState() {
    this.hasWon = false;
    this.gameStartTime = Date.now();
  }

  getTimePlayed() {
    return (Date.now() - this.gameStartTime) / 1000;
  }

  updateRotation(left, right) {
    this.isRotatingLeft = left;
    this.isRotatingRight = right;
  }

  getTargetAngle() {
    let targetAngle = this.angle;
    if (this.isRotatingLeft) {
      targetAngle -= this.rotationSpeed;
    }
    if (this.isRotatingRight) {
      targetAngle += this.rotationSpeed;
    }
    return targetAngle;
  }

  setAngle(angle) {
    this.angle = angle;
  }
}
