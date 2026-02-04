import { MazeModel } from '../models/MazeModel.js';
import { BallModel } from '../models/BallModel.js';
import { GameStateModel } from '../models/GameStateModel.js';
import { CanvasView } from '../views/CanvasView.js';
import { UIView } from '../views/UIView.js';
import { PhysicsController } from './PhysicsController.js';
import { InputController } from './InputController.js';

export class GameController {
  constructor(canvas) {
    this.canvas = canvas;
    this.canvasView = new CanvasView(canvas);
    this.uiView = new UIView();
    this.gameState = new GameStateModel();
    this.inputController = new InputController();
    this.physicsController = null;
    this.animationId = null;
    this.isPlaying = false;

    this.setupUI();

  }

  get timePlayed() {
    return this.gameState.getTimePlayed();
  }

  setupUI() {
    this.uiView.adjustLayoutForDifficulty(this.gameState.isCustomMode);

    this.uiView.attachPlayAgainListener(() => {
      this.uiView.hideModal();
      this.start();
    });

    this.uiView.attachLeaveListener(() => {
      window.location.href = "./Menu.html";
    });

  }

  init(numCols, numRows) {
    this.gameState.resetWinState();
    this.inputController.attachListeners();

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    this.mazeModel = new MazeModel(400, numCols, numRows);
    this.mazeModel.setup();

    while (this.mazeModel.generate()) {}

    this.ballModel = new BallModel(this.mazeModel.size, numCols);
    
    this.physicsController = new PhysicsController(
      this.canvas.width,
      this.canvas.height,
      200
    );

    this.physicsController.initPhysics(this.mazeModel, this.ballModel);
    this.physicsController.setupCollisionDetection(() => {
      this.checkWinCondition();
    });

    this.gameLoop();
  }

  gameLoop() {
    if (!this.isPlaying) return;

    this.uiView.updateTimer(this.timePlayed);

    const input = this.inputController.getCurrentRotationInput();
    
    // Compute rotation input: keyboard has priority, gyro tilt used when no keys pressed
    const keyboardInput = input.left ? -1 : input.right ? 1 : 0;
    // const rotationInput = keyboardInput !== 0 ? keyboardInput : input.tilt;
    const rotationInput = keyboardInput !== 0 ? keyboardInput : 0;
    
    this.gameState.updateRotation(rotationInput);
    const targetAngle = this.gameState.getTargetAngle();
    this.gameState.setAngle(targetAngle);

    this.canvasView.clear();
    
    this.canvasView.renderMaze(this.mazeModel, this.gameState.angle);

    this.physicsController.updateGravity(this.gameState.angle, this.ballModel.gravity);
    this.physicsController.step();

    const ballPos = this.physicsController.getBallPosition();
    this.canvasView.renderBall(this.ballModel, ballPos.x, ballPos.y, this.gameState.angle);

    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  checkWinCondition() {
    if (this.gameState.hasWon) return;
    
    if (this.physicsController.isInTargetZone && this.timePlayed >= 2) {
      this.endGame();
    }
  }

  endGameLoop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  endGame() {
    this.gameState.markWon();
    this.gameState.incrementWins();
    this.uiView.updateWinCounter(this.gameState.wins);
    this.isPlaying = false;
    this.uiView.showModal();
    this.endGameLoop();
  }

  start() {
    this.isPlaying = true;
    this.init(this.gameState.numCols, this.gameState.numRows);
  }
}
