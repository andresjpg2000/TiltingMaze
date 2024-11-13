const canvas = document.querySelector("#myCanvas");
let c = canvas.getContext("2d");
let current;
let angle = 0; // initial angle of rotation
let margin = 200;
const halfMargin = margin / 2;

class Maze{
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
        canvas.style.background = "black"

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
            current.color = "green"
            current.highlight()
            current.removeWalls(current, next)
            current = next
        } else if (this.stack.length > 0) {
            current.color = "black"
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
      this.color = "black"
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
        c.lineWidth = 2
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
    this.radius = 15;
    this.color = "orange";
    this.x = margin / 2 + this.radius + 1;
    this.y = margin / 2 + this.radius + 1;
    this.dx = 0;
    this.dy = 0;
    this.gravity = 0.15;
    this.friction = 0.95;
    this.bounce = 0.5;
    this.maze = maze;
    this.margin = margin;
    this.lastRotatedAngle = 0;
    this.rotationStep = 0.05;
  }

  getRotatedPosition(angle) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    return rotatePoint(this.x, this.y, centerX, centerY, angle);
  }

  currentCell(rotationAngle = 0) {
    const rotatedPos = this.getRotatedPosition(-rotationAngle);
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
    if (!cell) return true;
    
    const cellSize = this.maze.size / this.maze.rows;
    const halfMargin = this.margin / 2;
    
    const cellLeft = (cell.colNum * cellSize) + halfMargin;
    const cellRight = cellLeft + cellSize;
    const cellTop = (cell.rowNum * cellSize) + halfMargin;
    const cellBottom = cellTop + cellSize;
    
    const buffer = 1;

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
    if (Math.abs(angleChange) > 0.0001) {
      const increment = angleChange;
      const newAngle = this.lastRotatedAngle + increment;
      const rotatedPos = this.getRotatedPosition(increment);
      
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
    this.dx = Math.max(Math.min(this.dx, maxVelocity), -maxVelocity);
    this.dy = Math.max(Math.min(this.dy, maxVelocity), -maxVelocity);

    const newX = this.x + this.dx;
    const newY = this.y + this.dy;

    if (!this.checkWallCollision(newX, newY, this.lastRotatedAngle)) {
      this.x = newX;
      this.y = newY;
    } else {
      this.dx *= -0.5;
      this.dy *= -0.5;
    }

    if (Math.abs(this.dx) < 0.01) this.dx = 0;
    if (Math.abs(this.dy) < 0.01) this.dy = 0;
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

function render() {
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
  requestAnimationFrame(render);
}

// Keyboard controls
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

// Game state
const maze = new Maze(500, 10, 10);
const ball = new Ball(maze, margin);
const rotationSpeed = 0.002;
let isRotatingLeft = false;
let isRotatingRight = false;

maze.setup();
render();
// console.log(maze.grid)

