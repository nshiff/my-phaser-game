import Phaser from "phaser";

export class MathSpirographDemo extends Phaser.Scene {
  private graphics!: Phaser.GameObjects.Graphics;
  private points: Phaser.Math.Vector2[] = [];
  private t: number = 0;

  constructor() {
    super("MathSpirographDemo");
  }

  create() {
    this.graphics = this.add.graphics();
  }

  update(time: number, delta: number) {
    const { width, height } = this.sys.game.canvas;

    // Center of the spirograph
    const centerX = width / 2;
    const centerY = height / 2;
    // Parameters for the hypotrochoid
    const R = 150; // large circle radius
    const r = 60; // small circle radius
    const d = 80; // offset from the center of the small circle

    // Increment t based on delta time (delta is in ms)
    this.t += delta * 0.001; // t in seconds

    // Hypotrochoid equations:
    // x(t) = (R - r) * cos(t) + d * cos(((R - r) / r) * t)
    // y(t) = (R - r) * sin(t) - d * sin(((R - r) / r) * t)
    const x =
      centerX +
      (R - r) * Math.cos(this.t) +
      d * Math.cos(((R - r) / r) * this.t);
    const y =
      centerY +
      (R - r) * Math.sin(this.t) -
      d * Math.sin(((R - r) / r) * this.t);

    // Add the new point
    this.points.push(new Phaser.Math.Vector2(x, y));

    // Clear and draw the spirograph path
    this.graphics.clear();
    this.graphics.lineStyle(2, 0xffffff, 1);
    if (this.points.length > 1) {
      this.graphics.beginPath();
      this.graphics.moveTo(this.points[0].x, this.points[0].y);
      for (let i = 1; i < this.points.length; i++) {
        this.graphics.lineTo(this.points[i].x, this.points[i].y);
      }
      this.graphics.strokePath();
    }

    // Draw the current point
    this.graphics.fillStyle(0xff0000, 1);
    this.graphics.fillCircle(x, y, 4);

    // Reset the drawing after a full cycle (approximation)
    if (this.t > 2 * Math.PI * r) {
      this.t = 0;
      this.points = [];
    }
  }
}
