const canvas = document.querySelector("#myCanvas");
let c = canvas.getContext("2d");
let current;
let angle; // initial angle of rotation
let margin = 300;

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
            cell.show() // This method will draw otu the walls of the cell
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
        c.fillRect((this.colNum * this.size)+1,(this.rowNum*this.size)+1,this.size - 2,this.size - 2)
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

let maze = new Maze(500, 10, 10)
maze.setup()
maze.draw()

let centerX = maze.size / 2 + margin / 2;
let centerY = maze.size / 2 + margin / 2;

// Ball properties
let ball = {
  radius: 15,
  color: "orange",
  x: margin/2 + 15,      // initial x position
  y: margin/2 + 15, // initial y position
  dx: 0,           // x velocity
  dy: 0,           // y velocity
  gravity: 0.1,    // gravity affecting the ball
  friction: 0.4,  // friction factor on each bounce to slow it down over time

  draw() {
    c.fillStyle = this.color;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    c.fill();
  },

  update() {
    // Apply gravity
    this.dy += this.gravity;

    // Calculate rotated position for collision
    let rotatedPos = rotatePoint(this.x, this.y, centerX, centerY, -angle);

    // Collision detection and response in rotated space
  
    

    // Rotate back adjusted position
    let adjustedPos = rotatePoint(rotatedPos.x, rotatedPos.y, centerX, centerY, angle);
    this.x = adjustedPos.x;
    this.y = adjustedPos.y;

    // Update ball's position with velocities
    this.x += this.dx;
    this.y += this.dy;
  }
};

function render() {
  
  // Clear canvas
  c.clearRect(0, 0, c.width, c.height);

  maze.draw()

  ball.draw()

  // ball.update()

  requestAnimationFrame(render);

}

// Update angle based on mouse position
canvas.addEventListener("mousemove", (event) => {
  angle = (event.clientX / maze.size) * Math.PI * 2;
  // console.log(angle);
});

render()

console.log(maze.grid)

