import { GameController } from './controllers/GameController.js';

const canvas = document.querySelector("#myCanvas");
const gameController = new GameController(canvas);
gameController.start();
