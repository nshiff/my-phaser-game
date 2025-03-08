interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: number;
}

export class MultipleBouncingBallsDemo extends Phaser.Scene {
  private balls: Ball[] = [];
  private graphics!: Phaser.GameObjects.Graphics;
  private lastTime: number = 0;

  constructor() {
    super("MultipleBouncingBallsDemo");
  }

  create() {
    this.graphics = this.add.graphics();
    const numBalls = 16;
    for (let i = 0; i < numBalls; i++) {
      const ball: Ball = {
        x: Phaser.Math.Between(50, 750),
        y: Phaser.Math.Between(50, 550),
        vx: Phaser.Math.Between(-200, 200),
        vy: Phaser.Math.Between(-200, 200),
        radius: Phaser.Math.Between(15, 30),
        color: Phaser.Display.Color.RandomRGB().color,
      };
      this.balls.push(ball);
    }
  }

  update(time: number, delta: number) {
    let { width, height } = this.sys.game.canvas;

    if (this.lastTime === 0) {
      this.lastTime = time;
      return;
    }
    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    // Update ball positions and handle wall collisions
    for (const ball of this.balls) {
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      // Left/right walls
      if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx *= -1;
      } else if (ball.x + ball.radius > width) {
        ball.x = width - ball.radius;
        ball.vx *= -1;
      }
      // Top/bottom walls
      if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy *= -1;
      } else if (ball.y + ball.radius > height) {
        ball.y = height - ball.radius;
        ball.vy *= -1;
      }
    }

    // Check collisions between balls (simple elastic collision for equal mass)
    for (let i = 0; i < this.balls.length; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        const b1 = this.balls[i];
        const b2 = this.balls[j];
        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < b1.radius + b2.radius) {
          // Normal vector
          const nx = dx / dist;
          const ny = dy / dist;
          // Relative velocity
          const dvx = b1.vx - b2.vx;
          const dvy = b1.vy - b2.vy;
          // Dot product along the normal
          const dot = dvx * nx + dvy * ny;
          // Only resolve if balls are moving towards each other
          if (dot > 0) continue;
          // Apply impulse (assuming equal mass, impulse factor simplifies)\n          const impulse = dot;\n          b1.vx -= impulse * nx;\n          b1.vy -= impulse * ny;\n          b2.vx += impulse * nx;\n          b2.vy += impulse * ny;
          // Adjust positions to prevent overlap\n          const overlap = (b1.radius + b2.radius) - dist;\n          b1.x -= (overlap / 2) * nx;\n          b1.y -= (overlap / 2) * ny;\n          b2.x += (overlap / 2) * nx;\n          b2.y += (overlap / 2) * ny;
        }
      }
    }

    this.drawBalls();
  }

  private drawBalls() {
    this.graphics.clear();
    for (const ball of this.balls) {
      this.graphics.fillStyle(ball.color, 1);
      this.graphics.fillCircle(ball.x, ball.y, ball.radius);
    }
  }
}
