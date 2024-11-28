const canvas = document.querySelector("#myCanvas");
let c = canvas.getContext("2d");

let current; // Variavel usada na criação do labirinto
let angle = 0;
let margin = 200;
const halfMargin = margin / 2;
let wins = 0;
let hasWon = false;
let isRotatingLeft = false;
let isRotatingRight = false;
let numCols = 4;
let numRows = 4;
const rotationSpeed = 0.003; // Controla a velocidade de rotação do labirinto
let gameStartTime = Date.now();
let maze;
let ball;
let animation;

const options = document.querySelector(".options");
const header = document.querySelector("header");

const difficulty = JSON.parse(localStorage.getItem("mazeDifficulty"));

if (difficulty) {
  if (difficulty.custom) {
    header.style.marginBottom = "224px";
    numCols = difficulty.numCols;
    numRows = difficulty.numRows;

  } else {
    numCols = difficulty.numCols;
    numRows = difficulty.numRows;
    options.style.display = "none";
    header.style.marginBottom = "500px";

  }
} else {
    numCols = 4;
    numRows = 4;
    options.style.display = "none";
}

class Maze{
    // Codigo retirado de https://zenith20.hashnode.dev/build-your-own-maze-generator-in-javascript
    constructor(size,rows,columns) {
        this.size = size
        this.rows = rows
        this.cols = columns
        this.grid = []
        this.stack = []
    }

    setup() {
        
        for (let r = 0; r < this.rows; r++){
          let row = []
          for (let c = 0; c < this.cols; c++) {
            let cell = new Cell(this.size, this.grid, this.rows, this.cols, r, c)
            row.push(cell)
          }
          this.grid.push(row)
        }
        
        current = this.grid[0][0]
    }

    draw() {
        canvas.width = this.size + margin
        canvas.height = this.size + margin
        canvas.style.background = "#2EC4B6"

        let offsetX = (canvas.width - this.size) / 2;
        let offsetY = (canvas.height - this.size) / 2;
    
        // Save the current canvas state
        c.save();
        
        // Translate to the center of the canvas, rotate, then translate back
        c.translate(offsetX + this.size / 2, offsetY + this.size / 2);
        c.rotate(angle);  // Apply rotation based on the current angle
        c.translate(-this.size / 2, -this.size / 2);
        
        this.grid.forEach((row) => {
          row.forEach((cell) => {
            cell.show() // This method will draw the walls of the cell
          })
        })
    
        c.restore()
        
        this.DFSMaze() 
    
    }

    DFSMaze() {
        current.visited = true
        let next = current.getRandNeighbour()
        
        if (next) {
            next.visited = true
            this.stack.push(current)
            current.color = "#FF3366"
            current.highlight()
            current.removeWalls(current, next)
            current = next
        } else if (this.stack.length > 0) {
            current.color = "#2EC4B6"
            let cell = this.stack.pop()
            current.highlight()
            current = cell
        }

        if (this.stack.length == 0) {


          return
        }
    }

}

class Cell{
    // Codigo retirado de https://zenith20.hashnode.dev/build-your-own-maze-generator-in-javascript
    constructor(parentSize, parentGrid, rows, cols,rowNum,colNum) {
      this.parentSize = parentSize
      this.parentGrid = parentGrid
      this.rows = rows
      this.cols = cols
      this.rowNum = rowNum
      this.colNum = colNum
      this.size = parentSize / rows
      this.walls = {
        topWall: true,
        bottomWall: true,
        leftWall: true,
        rightWall: true,
      }
      this.visited = false
      this.neighbours = []
      this.color = "#2EC4B6"
      this.x = colNum * this.size
      this.y = rowNum * this.size
    }
  
    setNeighbours() {
        
        this.neighbours = []
        let x = this.colNum
        let y = this.rowNum
        let left = this.colNum !== 0 ? this.parentGrid[y][x - 1] : undefined
        let right = this.colNum !== this.cols - 1 ? this.parentGrid[y][x+1] : undefined
        let top = this.rowNum !== 0 ? this.parentGrid[y - 1][x] : undefined
        let bottom = this.rowNum !== this.rows - 1 ? this.parentGrid[y + 1][x] : undefined
    
        if (left && !left.visited) this.neighbours.push(left)
        if (right && !right.visited) this.neighbours.push(right)
        if (top && !top.visited) this.neighbours.push(top)
        if (bottom && !bottom.visited) this.neighbours.push(bottom)
    }
    
    getRandNeighbour() {
        
        this.setNeighbours()
        if(this.neighbours.length == 0) return undefined
        let rand = Math.floor(Math.random() * this.neighbours.length)
        return this.neighbours[rand]
    }

    drawLine(fromX, fromY, toX, toY) {
        c.lineWidth = 4
        c.strokeStyle = "white"
        c.beginPath()
        c.moveTo(fromX, fromY)
        c.lineTo(toX, toY)
        c.stroke()
    }
    
    removeWalls(cell1,cell2) {
        let XDiff = cell2.colNum - cell1.colNum
        if (XDiff == 1) {
          cell1.walls.rightWall = false
          cell2.walls.leftWall = false
        } else if (XDiff == -1) {
          cell2.walls.rightWall = false
          cell1.walls.leftWall = false
        }
        let YDiff = cell2.rowNum - cell1.rowNum
        if (YDiff == 1) {
          cell1.walls.bottomWall = false
          cell2.walls.topWall = false
        } else if (YDiff == -1) {
          cell2.walls.bottomWall = false
          cell1.walls.topWall = false
        }
    }
    
    drawWalls() {
        let fromX = 0
        let fromY = 0
        let toX = 0
        let toY = 0

        if (this.walls.topWall) {
          fromX = this.colNum * this.size
          fromY = this.rowNum * this.size
          toX = fromX + this.size
          toY = fromY
          this.drawLine(fromX,fromY,toX,toY)
        }

        if (this.walls.bottomWall) {
          fromX = this.colNum * this.size
          fromY = (this.rowNum * this.size) + this.size
          toX = fromX + this.size
          toY = fromY 
          this.drawLine(fromX, fromY, toX, toY)
        }

        if (this.walls.leftWall) {
          fromX = this.colNum * this.size
          fromY = (this.rowNum * this.size)
          toX = fromX 
          toY = fromY + this.size
          this.drawLine(fromX, fromY, toX, toY)
        }

        if (this.walls.rightWall) {
          fromX = (this.colNum * this.size) + this.size
          fromY = (this.rowNum * this.size)
          toX = fromX 
          toY = fromY + this.size
          this.drawLine(fromX, fromY, toX, toY)
        }

    }

    highlight() {
        c.fillStyle = "red"
        c.fillRect((this.colNum * this.size) + 1 + halfMargin, (this.rowNum * this.size) + 1 + halfMargin, this.size - 2, this.size - 2)
    }

    show() {
        this.drawWalls()
        c.fillStyle = this.color
        c.fillRect((this.colNum * this.size) + 1,(this.rowNum*this.size) + 1,this.size - 2,this.size - 2)
    }

}

function rotatePoint(px, py, ox, oy, angle) {
  // Centro do labirinto tem as coordenadas (ox, oy)
  // Coordenadas da bola (px, py)
  
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = px - ox;
  const dy = py - oy;
  
  return {
    x: ox + dx * cos - dy * sin,
    y: oy + dx * sin + dy * cos
  };
}

class Ball {
  constructor(maze, margin) {
    this.radius = maze.cols >= 8 ? 12 : 15;
    this.color = "#011627";
    const firstCell = maze.grid[numRows-1][numCols-1]
    this.x = firstCell.x + firstCell.size / 2 + halfMargin; // posição inicial
    this.y = firstCell.y + firstCell.size / 2 + halfMargin;
    this.dx = 0; // velocidade no eixo x
    this.dy = 0; // velocidade no eixo y
    this.gravity = difficulty.custom ? parseFloat(gravitySlider.value) : 0.65;
    this.friction = difficulty.custom ? parseFloat(gravitySlider.value) : 0.65;
    this.maze = maze;
    this.margin = margin;
    this.lastRotatedAngle = 0; // guardar angulo anterior para conseguir incrementar rotação
  }

  currentCell(rotationAngle = 0) {
    const rotatedPos = rotatePoint(this.x, this.y, canvas.width / 2, canvas.height / 2, -rotationAngle)
    const cellSize = this.maze.size / this.maze.rows;
    const adjustedX = rotatedPos.x - this.margin / 2;
    const adjustedY = rotatedPos.y - this.margin / 2;
    
    const col = Math.floor(adjustedX / cellSize);
    const row = Math.floor(adjustedY / cellSize);
    
    if (col >= 0 && col < this.maze.cols && row >= 0 && row < this.maze.rows) {
      return this.maze.grid[row][col];
    }

    return null;
  }

  checkWallCollision(newX, newY, angle) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const rotatedPos = rotatePoint(newX, newY, centerX, centerY, -angle);
    
    const cell = this.currentCell(angle);
    if (!cell) {
      console.log("out of bounds");
      return true;
    }

    const cellSize = this.maze.size / this.maze.rows;
    const halfMargin = this.margin / 2;
    
    const cellLeft = (cell.colNum * cellSize) + halfMargin;
    const cellRight = cellLeft + cellSize;
    const cellTop = (cell.rowNum * cellSize) + halfMargin;
    const cellBottom = cellTop + cellSize;
    
    const buffer = 2; // Separar a bola das paredes para evitar que a bola passe por elas

    if ((cell.walls.leftWall && rotatedPos.x - this.radius < cellLeft + buffer) ||
        (cell.walls.rightWall && rotatedPos.x + this.radius > cellRight - buffer) ||
        (cell.walls.topWall && rotatedPos.y - this.radius < cellTop + buffer) ||
        (cell.walls.bottomWall && rotatedPos.y + this.radius > cellBottom - buffer)) {
      return true;
    } else {
      return false;
    }

  }

  update(targetAngle) {
    const angleChange = targetAngle - this.lastRotatedAngle;
    
    // Dividir rotação em vários passos para evitar erros
    if (angleChange) {
      const increment = angleChange;
      const newAngle = this.lastRotatedAngle + increment;
      const rotatedPos = rotatePoint(this.x, this.y, canvas.width / 2, canvas.height / 2, increment)
      
      if (!this.checkWallCollision(rotatedPos.x, rotatedPos.y, newAngle)) {
        this.x = rotatedPos.x;
        this.y = rotatedPos.y;
        this.lastRotatedAngle = newAngle;
      }
    }

    const gravityX = this.gravity * Math.sin(this.lastRotatedAngle);
    const gravityY = this.gravity * Math.cos(this.lastRotatedAngle);

    this.dx += gravityX;
    this.dy += gravityY;
    
    this.dx *= this.friction;
    this.dy *= this.friction;
    
    const maxVelocity = 5;
    this.dx = Math.max(Math.min(this.dx, maxVelocity), -maxVelocity); // impedir que a velocidade seja menor que -5 ou maior que 5
    this.dy = Math.max(Math.min(this.dy, maxVelocity), -maxVelocity);

    const newX = this.x + this.dx; // Atualizar a posição da bola somando o valor da velocidade
    const newY = this.y + this.dy;

    if (!this.checkWallCollision(newX, newY, this.lastRotatedAngle)) { // Verificar se a nova posição coincide com alguma parede antes de atualizar a posição da bola
      this.x = newX;
      this.y = newY;
    } else {
      this.dx *= -0.4; // 0.4 é o nivel de bounce.
      this.dy *= -0.4;
    }

  }

  draw(c) {
    c.save();
    c.fillStyle = this.color;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }
}

function colorCollision(r, g, b) {
  const x = Math.floor(ball.x);
  const y = Math.floor(ball.y); 
  let colorHIT = 0;

  
  let imageData = c.getImageData(x + ball.radius + 2, y + ball.radius + 2, 1, 1);
  const data = imageData.data;

  let imageData2 = c.getImageData(x - ball.radius + 2, y - ball.radius + 2, 1, 1);
  const data2 = imageData2.data;

  let imageData3 = c.getImageData(x + ball.radius + 2, y - ball.radius + 2, 1, 1);
  const data3 = imageData3.data;

  let imageData4 = c.getImageData(x - ball.radius + 2, y + ball.radius + 2, 1, 1);
  const data4 = imageData4.data;

  const [r2, g2, b2] = [data[0], data[1], data[2]];
  const [r3, g3, b3] = [data2[0], data2[1], data2[2]];
  const [r4, g4, b4] = [data3[0], data3[1], data3[2]];
  const [r5, g5, b5] = [data4[0], data4[1], data4[2]];

  if (r2 == r && g2 == g && b2 == b) {
   colorHIT+=1; 
  }
  if (r3 == r && g3 == g && b3 == b) {
    colorHIT+=1;
  }
  if (r4 == r && g4 == g && b4 == b) {
    colorHIT+=1;
  }
  if (r5 == r && g5 == g && b5 == b) {
    colorHIT+=1;
  }

  return  colorHIT >= 3 ? true : false;
}

function render() {
  // angle -> angulo atual
  // target angle -> novo angulo
  
  let targetAngle = angle;

  if (isRotatingLeft) {
    targetAngle -= rotationSpeed;
  }
  
  if (isRotatingRight) {
    targetAngle += rotationSpeed;
  }
  
  c.clearRect(0, 0, canvas.width, canvas.height);
  c.save();
  
  c.translate(canvas.width / 2, canvas.height / 2);
  c.rotate(angle);
  c.translate(-canvas.width / 2, -canvas.height / 2);
  
  maze.draw();
  
  ball.update(targetAngle);
  ball.draw(c);
  
  angle = ball.lastRotatedAngle;
  
  c.restore();

  animation = requestAnimationFrame(render);

  GameState()
}

function initGame(numCol, numRow) {
  hasWon = false;
  Controls()
  
  maze = new Maze(400, numCol, numRow);
  maze.setup();

  gameStartTime = Date.now();
  ball = new Ball(maze, margin);
  
  render();

}

// Função que lida com a vitória. 
function GameState() {
  let winsHeader = document.querySelector("#numberOfWins");

  let currentTime = Date.now();
  let timePlayed = (currentTime - gameStartTime) / 1000
  
  if (colorCollision(255, 51, 102) && !hasWon && timePlayed >= 3) {
    wins +=1;
    hasWon = true;
    winsHeader.innerHTML = `Wins: ${wins}`;
    modal.style.display = "block";
    cancelAnimationFrame(animation);
  } 
  
}

let gravitySlider = document.querySelector("#gravity");
let frictionSlider = document.querySelector("#friction");
let resetBTN = document.querySelector("#resetBTN");

function updateProperties() {

  gravitySlider.addEventListener("input", () => {
    ball.gravity = parseFloat(gravitySlider.value);
  });

  frictionSlider.addEventListener("input", () => {
    ball.friction = parseFloat(frictionSlider.value);
  });

}

function Controls() {
  
  document.addEventListener('keydown', (e) => {
    switch(e.key) {
      case 'ArrowLeft':
      case 'a':
        isRotatingLeft = true;
        break;
      case 'ArrowRight':
      case 'd':
        isRotatingRight = true;
        break;
    }
  });

  document.addEventListener('keyup', (e) => {
    switch(e.key) {
      case 'ArrowLeft':
      case 'a':
        isRotatingLeft = false;
        break;
      case 'ArrowRight':
      case 'd':
        isRotatingRight = false;
        break;
    }
  });

  gravitySlider.addEventListener("input", updateProperties)
  frictionSlider.addEventListener("input", updateProperties)

  resetBTN.addEventListener("click", () => {
    
    ball.gravity = 0.65;
    ball.friction = 0.65;

    gravitySlider.value = 0.65;
    frictionSlider.value = 0.65;

  });
  
}

initGame(numCols, numRows)

// Modal de vitória
var modal = document.querySelector("#myModal")
var btn = document.querySelector("#modalBtn")

// Fechar modal ao clicar fora da modal
window.addEventListener("click", (event) => {
  if ( event.target == modal ) {
    modal.style.display = "none";
  }
})

// Botão para voltar para o menu
var leaveBTN = document.querySelector("#leaveBTN");
leaveBTN.addEventListener("click", () => {
  window.location.href = "./Menu.html";
})

// Botão para voltar a jogar
var playAgain = document.querySelector("#yesBTN");
playAgain.addEventListener("click", () => {
  modal.style.display = "none";
  initGame(numCols, numRows)
})
