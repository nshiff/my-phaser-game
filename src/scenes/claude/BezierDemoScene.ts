export class BezierDemoScene extends Phaser.Scene {
  private curves: Phaser.Curves.CubicBezier[] = [];
  private controlPoints: Phaser.GameObjects.Arc[] = [];
  private activePoints: Phaser.GameObjects.Arc[] = [];
  private activeCurveIndex: number = 0;
  private graphics!: Phaser.GameObjects.Graphics;
  private infoText!: Phaser.GameObjects.Text;
  private dragPoint: Phaser.GameObjects.Arc | null = null;
  private animatedPoint!: Phaser.GameObjects.Arc;
  private animationT: number = 0;
  private animationDirection: number = 1;
  private animationSpeed: number = 0.005;
  private showControlLines: boolean = true;

  constructor() {
    super({ key: "BezierDemo" });
  }

  create(): void {
    // Set background color
    this.cameras.main.setBackgroundColor("#f0f0f0");

    // Add graphics object for drawing curves
    this.graphics = this.add.graphics();

    // Create initial curves
    this.createCurve(100, 300, 250, 100, 550, 100, 700, 300);
    this.createCurve(100, 400, 250, 600, 550, 600, 700, 400);

    // Add info text
    this.infoText = this.add.text(
      20,
      20,
      "Bezier Curve Demo\nDrag control points to modify curves",
      {
        fontSize: "24px",
        color: "#000",
        fontFamily: "Arial",
      }
    );

    // Add a point that will animate along the curve
    this.animatedPoint = this.add.circle(0, 0, 10, 0xffff00);

    // Create button to toggle control lines
    const toggleButton = this.add
      .rectangle(700, 40, 200, 40, 0x4444aa)
      .setInteractive();
    const toggleText = this.add
      .text(700, 40, "Toggle Control Lines", {
        fontSize: "16px",
        color: "#fff",
        fontFamily: "Arial",
      })
      .setOrigin(0.5);

    toggleButton.on("pointerdown", () => {
      this.showControlLines = !this.showControlLines;
      this.drawCurves();
    });

    // Create button to switch active curve
    const switchButton = this.add
      .rectangle(700, 90, 200, 40, 0x4444aa)
      .setInteractive();
    const switchText = this.add
      .text(700, 90, "Switch Active Curve", {
        fontSize: "16px",
        color: "#fff",
        fontFamily: "Arial",
      })
      .setOrigin(0.5);

    switchButton.on("pointerdown", () => {
      this.activeCurveIndex = (this.activeCurveIndex + 1) % this.curves.length;
      this.highlightActiveCurve();
    });

    // Create button to add new curve
    const addButton = this.add
      .rectangle(700, 140, 200, 40, 0x4444aa)
      .setInteractive();
    const addText = this.add
      .text(700, 140, "Add New Curve", {
        fontSize: "16px",
        color: "#fff",
        fontFamily: "Arial",
      })
      .setOrigin(0.5);

    addButton.on("pointerdown", () => {
      const startX = Phaser.Math.Between(100, 300);
      const startY = Phaser.Math.Between(200, 400);
      this.createCurve(
        startX,
        startY,
        startX + 100,
        startY - 100,
        startX + 200,
        startY - 100,
        startX + 300,
        startY
      );
      this.activeCurveIndex = this.curves.length - 1;
      this.highlightActiveCurve();
    });

    // Set up input handling
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      // Check if we're clicking on a control point
      for (const point of this.controlPoints) {
        if (
          Phaser.Math.Distance.Between(point.x, point.y, pointer.x, pointer.y) <
          20
        ) {
          this.dragPoint = point;
          break;
        }
      }
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (this.dragPoint) {
        this.dragPoint.setPosition(pointer.x, pointer.y);
        this.updateCurveFromPoints();
      }
    });

    this.input.on("pointerup", () => {
      this.dragPoint = null;
    });

    // Initial drawing
    this.highlightActiveCurve();
    this.drawCurves();
  }

  update(): void {
    // Animate point along the active curve
    this.animationT += this.animationSpeed * this.animationDirection;

    if (this.animationT >= 1) {
      this.animationT = 1;
      this.animationDirection = -1;
    } else if (this.animationT <= 0) {
      this.animationT = 0;
      this.animationDirection = 1;
    }

    const activePoint = this.curves[this.activeCurveIndex].getPoint(
      this.animationT
    );
    this.animatedPoint.setPosition(activePoint.x, activePoint.y);

    // Redraw if dragging
    if (this.dragPoint) {
      this.drawCurves();
    }
  }

  private createCurve(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number
  ): void {
    // Create a new cubic bezier curve
    const curve = new Phaser.Curves.CubicBezier(
      new Phaser.Math.Vector2(x1, y1),
      new Phaser.Math.Vector2(x2, y2),
      new Phaser.Math.Vector2(x3, y3),
      new Phaser.Math.Vector2(x4, y4)
    );

    this.curves.push(curve);

    // Create control points
    const startPoint = this.add.circle(x1, y1, 10, 0x00ff00).setInteractive();
    const controlPoint1 = this.add
      .circle(x2, y2, 10, 0xff0000)
      .setInteractive();
    const controlPoint2 = this.add
      .circle(x3, y3, 10, 0xff0000)
      .setInteractive();
    const endPoint = this.add.circle(x4, y4, 10, 0x00ff00).setInteractive();

    this.controlPoints.push(startPoint, controlPoint1, controlPoint2, endPoint);
    this.activePoints.push(startPoint, controlPoint1, controlPoint2, endPoint);
  }

  private updateCurveFromPoints(): void {
    // Update all curves based on control point positions
    for (let i = 0; i < this.curves.length; i++) {
      const baseIndex = i * 4;
      const startPoint = this.controlPoints[baseIndex];
      const controlPoint1 = this.controlPoints[baseIndex + 1];
      const controlPoint2 = this.controlPoints[baseIndex + 2];
      const endPoint = this.controlPoints[baseIndex + 3];

      this.curves[i] = new Phaser.Curves.CubicBezier(
        new Phaser.Math.Vector2(startPoint.x, startPoint.y),
        new Phaser.Math.Vector2(controlPoint1.x, controlPoint1.y),
        new Phaser.Math.Vector2(controlPoint2.x, controlPoint2.y),
        new Phaser.Math.Vector2(endPoint.x, endPoint.y)
      );
    }
  }

  private drawCurves(): void {
    this.graphics.clear();

    // Draw each curve
    for (let i = 0; i < this.curves.length; i++) {
      const curve = this.curves[i];
      const isActive = i === this.activeCurveIndex;

      if (isActive) {
        // Draw active curve thicker
        this.graphics.lineStyle(4, 0x0088ff, 1);
      } else {
        // Draw inactive curves thinner
        this.graphics.lineStyle(2, 0x444444, 0.8);
      }

      curve.draw(this.graphics);

      // Draw control lines if enabled
      if (this.showControlLines) {
        const baseIndex = i * 4;
        const startPoint = this.controlPoints[baseIndex];
        const controlPoint1 = this.controlPoints[baseIndex + 1];
        const controlPoint2 = this.controlPoints[baseIndex + 2];
        const endPoint = this.controlPoints[baseIndex + 3];

        this.graphics.lineStyle(1, 0x888888, 0.5);

        // Draw lines between control points
        this.graphics.beginPath();
        this.graphics.moveTo(startPoint.x, startPoint.y);
        this.graphics.lineTo(controlPoint1.x, controlPoint1.y);
        this.graphics.moveTo(endPoint.x, endPoint.y);
        this.graphics.lineTo(controlPoint2.x, controlPoint2.y);
        this.graphics.strokePath();
      }
    }
  }

  private highlightActiveCurve(): void {
    // Reset all control points to default colors
    for (let i = 0; i < this.curves.length; i++) {
      const baseIndex = i * 4;
      const isActive = i === this.activeCurveIndex;

      for (let j = 0; j < 4; j++) {
        const point = this.controlPoints[baseIndex + j];

        if (isActive) {
          // End points are green, control points are red
          if (j === 0 || j === 3) {
            point.setFillStyle(0x00ff00);
          } else {
            point.setFillStyle(0xff0000);
          }

          // Make active points more visible
          point.setScale(1.2);
        } else {
          // Inactive points are gray and smaller
          point.setFillStyle(0x888888);
          point.setScale(0.8);
        }
      }
    }

    this.drawCurves();
  }
}
