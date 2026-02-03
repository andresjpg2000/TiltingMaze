export class BallModel {
  constructor(mazeSize, cols) {
    this.radius = cols >= 8 ? 12 : 15;
    this.color = '#011627';
    this.gravity = 4;
    this.friction = 0.55;
    this.restitution = 0.4;
    this.maxVelocity = 5;
  }

  getRadius() {
    return this.radius;
  }

  getColor() {
    return this.color;
  }
}
