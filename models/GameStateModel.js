export class GameStateModel {
  constructor() {
    this.wins = 0;
    this.hasWon = false;
    this.gameStartTime = Date.now();
    this.angle = 0;
    this.rotationInput = 0; // Scalar in [-1, 1] for rotation control
    this.numCols = 4;
    this.numRows = 4;
    this.rotationSpeed = 0.012;
    this.loadDifficulty();
  }

  loadDifficulty() {
    const difficulty = JSON.parse(localStorage.getItem('mazeDifficulty'));
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

  updateRotation(rotationInput) {
    // rotationInput is a scalar in [-1, 1]
    // -1 = full left rotation, 0 = no rotation, 1 = full right rotation
    this.rotationInput = rotationInput;
  }

  getTargetAngle() {
    // Apply rotation based on the scalar input
    // rotationInput scales the rotation speed for analog control
    return this.angle + (this.rotationInput || 0) * this.rotationSpeed;
  }

  setAngle(angle) {
    this.angle = angle;
  }
}
