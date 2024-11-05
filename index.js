const canvas = document.querySelector("#myCanvas");
let c = canvas.getContext("2d");
let current;

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
        canvas.width = this.size
        canvas.height = this.size
        canvas.style.background = "black"
    
        this.grid.forEach((row) => {
          row.forEach((cell) => {
            cell.show() // This method will draw otu the walls of the cell
          })
        })
    
        this.DFSMaze() // We will implement this in a minute
    
        requestAnimationFrame(() => {
          this.draw()
        })
    }

    DFSMaze() {
        current.visited = true
        let next = current.getRandNeighbour() // We'll also define this in a minute
        
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
        c.fillRect((this.colNum * this.size) + 1, (this.rowNum * this.size) + 1, this.size - 2, this.size - 2)
    }

    show() {
        this.drawWalls()
        c.fillStyle = this.color
        c.fillRect((this.colNum * this.size)+1,(this.rowNum*this.size)+1,this.size - 2,this.size - 2)
    }

}
  
let maze = new Maze(500, 10, 10)
maze.setup()
maze.draw()
