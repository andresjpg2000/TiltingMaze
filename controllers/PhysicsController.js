export class PhysicsController {
  constructor(canvasWidth, canvasHeight, margin) {
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;
    this.engine.gravity.y = 0;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.margin = margin;
    this.halfMargin = margin / 2;
    this.ballBody = null;
    this.wallBodies = [];
    this.targetSensor = null;
    this.isInTargetZone = false;
  }

  initPhysics(mazeModel, ballModel) {
    this.clearPhysics();
    this.createWallBodies(mazeModel);
    this.createBallBody(mazeModel, ballModel);
    this.createTargetSensor(mazeModel);
  }

  createWallBodies(mazeModel) {
    const wallSegments = mazeModel.getAllWallSegments();
    const offsetX = this.halfMargin;
    const offsetY = this.halfMargin;
    const wallThickness = 4;

    wallSegments.forEach(segment => {
      const x1 = segment.x1 + offsetX;
      const y1 = segment.y1 + offsetY;
      const x2 = segment.x2 + offsetX;
      const y2 = segment.y2 + offsetY;

      const centerX = (x1 + x2) / 2;
      const centerY = (y1 + y2) / 2;
      const width = Math.abs(x2 - x1) || wallThickness;
      const height = Math.abs(y2 - y1) || wallThickness;

      const wall = Matter.Bodies.rectangle(centerX, centerY, width, height, {
        isStatic: true,
        friction: 0.05,
        restitution: 0.4,
        label: 'wall'
      });

      Matter.World.add(this.world, wall);
      this.wallBodies.push(wall);
    });
  }

  createBallBody(mazeModel, ballModel) {
    const startCell = mazeModel.getStartCell();
    const x = startCell.x + startCell.size / 2 + this.halfMargin;
    const y = startCell.y + startCell.size / 2 + this.halfMargin;

    this.ballBody = Matter.Bodies.circle(x, y, ballModel.getRadius(), {
      restitution: ballModel.restitution,
      friction: 0.1,
      frictionAir: 1 - ballModel.friction,
      density: 0.001,
      label: 'ball'
    });

    Matter.World.add(this.world, this.ballBody);
  }

  createTargetSensor(mazeModel) {
    const targetCell = mazeModel.getTargetCell();
    const centerX = targetCell.x + targetCell.size / 2 + this.halfMargin;
    const centerY = targetCell.y + targetCell.size / 2 + this.halfMargin;
    const sensorSize = targetCell.size * 0.6;

    this.targetSensor = Matter.Bodies.rectangle(centerX, centerY, sensorSize, sensorSize, {
      isStatic: true,
      isSensor: true,
      label: 'target'
    });

    Matter.World.add(this.world, this.targetSensor);
  }

  setupCollisionDetection(onWinCallback) {
    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      event.pairs.forEach(pair => {
        if ((pair.bodyA.label === 'ball' && pair.bodyB.label === 'target') ||
            (pair.bodyA.label === 'target' && pair.bodyB.label === 'ball')) {
          this.isInTargetZone = true;
          onWinCallback();
        }
      });
    });

    Matter.Events.on(this.engine, 'collisionEnd', (event) => {
      event.pairs.forEach(pair => {
        if ((pair.bodyA.label === 'ball' && pair.bodyB.label === 'target') ||
            (pair.bodyA.label === 'target' && pair.bodyB.label === 'ball')) {
          this.isInTargetZone = false;
        }
      });
    });
  }

  updateGravity(angle, gravityStrength) {
    this.engine.gravity.x = gravityStrength * Math.sin(angle);
    this.engine.gravity.y = gravityStrength * Math.cos(angle);
  }

  step() {
    Matter.Engine.update(this.engine, 1000 / 60);
    
    // Velocity clamping
    const maxVelocity = 5;
    if (this.ballBody) {
      const vx = Math.max(Math.min(this.ballBody.velocity.x, maxVelocity), -maxVelocity);
      const vy = Math.max(Math.min(this.ballBody.velocity.y, maxVelocity), -maxVelocity);
      Matter.Body.setVelocity(this.ballBody, { x: vx, y: vy });
    }
  }

  getBallPosition() {
    if (!this.ballBody) return { x: 0, y: 0 };
    return {
      x: this.ballBody.position.x,
      y: this.ballBody.position.y
    };
  }

  clearPhysics() {
    Matter.World.clear(this.world);
    Matter.Engine.clear(this.engine);
    this.wallBodies = [];
    this.ballBody = null;
    this.targetSensor = null;
    this.isInTargetZone = false;
  }
}
