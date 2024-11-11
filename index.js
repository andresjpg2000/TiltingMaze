const canvas = document.querySelector("#myCanvas");
let c = canvas.getContext("2d");
let current;
let angle = 0; // initial angle of rotation
let margin = 200;

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
        c.fillRect((this.colNum * this.size) + 1 + margin/2, (this.rowNum * this.size) + 1 + margin/2, this.size - 2, this.size - 2)
    }

    show() {
        this.drawWalls()
        c.fillStyle = this.color
        c.fillRect((this.colNum * this.size) + 1,(this.rowNum*this.size) + 1,this.size - 2,this.size - 2)
    }

}

class Ball {
  constructor(maze, margin) {
    this.radius = 15;
    this.color = "orange";
    this.x = margin/2 + this.radius + 1;
    this.y = margin/2 + this.radius + 1;
    this.dx = 0;
    this.dy = 0;
    this.gravity = 0.3;  // Reduced gravity for better control
    this.friction = 0.95;  // Increased friction for smoother movement
    this.maze = maze;
    this.margin = margin;
  }

  draw(c) {
    c.save();
    c.fillStyle = this.color;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }

  currentCell() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Get ball position relative to maze orientation
    const rotatedPos = rotatePoint(
      this.x, 
      this.y, 
      centerX, 
      centerY, 
      -angle  // Note the negative angle to reverse the rotation
    );

    const cellSize = this.maze.size / this.maze.rows;
    const adjustedX = rotatedPos.x - this.margin/2;
    const adjustedY = rotatedPos.y - this.margin/2;
    
    const col = Math.floor(adjustedX / cellSize);
    const row = Math.floor(adjustedY / cellSize);
    
    // Add bounds checking
    if (col >= 0 && col < this.maze.cols && row >= 0 && row < this.maze.rows) {
      return this.maze.grid[row][col];
    }
    return null;
  }

  update(angle) {
    // Calculate gravity based on rotation
    const gravityX = this.gravity * Math.sin(angle);
    const gravityY = this.gravity * Math.cos(angle);

    // Apply gravity
    this.dx += gravityX;
    this.dy += gravityY;

    // Apply friction
    this.dx *= this.friction;
    this.dy *= this.friction;

    // Limit maximum velocity
    const maxVelocity = 5;
    this.dx = Math.max(Math.min(this.dx, maxVelocity), -maxVelocity);
    this.dy = Math.max(Math.min(this.dy, maxVelocity), -maxVelocity);

    // Calculate new position
    const newX = this.x + this.dx;
    const newY = this.y + this.dy;

    // Get current cell
    const cell = this.currentCell();
    if (!cell) return;

    const cellSize = this.maze.size / this.maze.rows;
    const halfMargin = this.margin / 2;

    // Calculate cell boundaries
    const cellLeft = (cell.colNum * cellSize) + halfMargin;
    const cellRight = cellLeft + cellSize;
    const cellTop = (cell.rowNum * cellSize) + halfMargin;
    const cellBottom = cellTop + cellSize;

    // Handle collisions
    if (cell.walls.leftWall && newX - this.radius < cellLeft) {
      this.x = cellLeft + this.radius;
      this.dx *= -0.5;  // Reduced bounce factor
    } else if (cell.walls.rightWall && newX + this.radius > cellRight) {
      this.x = cellRight - this.radius;
      this.dx *= -0.5;
    } else {
      this.x = newX;
    }

    if (cell.walls.topWall && newY - this.radius < cellTop) {
      this.y = cellTop + this.radius;
      this.dy *= -0.5;
    } else if (cell.walls.bottomWall && newY + this.radius > cellBottom) {
      this.y = cellBottom - this.radius;
      this.dy *= -0.5;
    } else {
      this.y = newY;
    }

    // Stop tiny movements
    if (Math.abs(this.dx) < 0.01) this.dx = 0;
    if (Math.abs(this.dy) < 0.01) this.dy = 0;
  }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'ArrowLeft':
      isRotatingLeft = true;
      break;
    case 'a':
      isRotatingLeft = true;
      break;
    case 'ArrowRight':
      isRotatingRight = true;
      break;
    case 'd':
      isRotatingRight = true;
      break;
  }
});

document.addEventListener('keyup', (e) => {
  switch(e.key) {
    case 'ArrowLeft':
      isRotatingLeft = false;
      break;
    case 'a':
      isRotatingLeft = false;
      break;
    case 'ArrowRight':
      isRotatingRight = false;
      break;
    case 'd':
      isRotatingRight = false;
      break;
  }
});

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

function render() {
  
  // Update rotation based on keyboard input
  if (isRotatingLeft) {
    angle -= rotationSpeed;
  }
  if (isRotatingRight) {
    angle += rotationSpeed;
  }

  // Clear canvas
  c.clearRect(0, 0, canvas.width, canvas.height);
  
  // Save canvas state
  c.save();
  
  // Move to center, rotate, move back
  c.translate(canvas.width/2, canvas.height/2);
  c.rotate(angle);
  c.translate(-canvas.width/2, -canvas.height/2);
  
  // Draw maze
  maze.draw();
  
  // Update and draw ball
  ball.update(angle);
  ball.draw(c);
  
  // Restore canvas state
  c.restore();
  // console.log(ball.currentCell())
  requestAnimationFrame(render);

}

// Game state
const maze = new Maze(500, 10, 10);
const ball = new Ball(maze, margin);
const rotationSpeed = 0.002;  // Rotation speed in radians
let isRotatingLeft = false;
let isRotatingRight = false;

maze.setup()
render()

// console.log(maze.grid)

