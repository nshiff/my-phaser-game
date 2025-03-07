import "phaser";

export class FortuneTellerScene extends Phaser.Scene {
  private responses: string[] = [
    "It is certain.",
    "It is decidedly so.",
    "Without a doubt.",
    "Yes, definitely.",
    "You may rely on it.",
    "As I see it, yes.",
    "Most likely.",
    "Outlook good.",
    "Yes.",
    "Signs point to yes.",
    "Reply hazy, try again.",
    "Ask again later.",
    "Better not tell you now.",
    "Cannot predict now.",
    "Concentrate and ask again.",
    "Don't count on it.",
    "My reply is no.",
    "My sources say no.",
    "Outlook not so good.",
    "Very doubtful.",
  ];

  private ball: Phaser.GameObjects.Image;
  private responseText: Phaser.GameObjects.Text;
  private instructionText: Phaser.GameObjects.Text;
  private isShaking: boolean = false;

  constructor() {
    super("FortuneTellerScene");
  }

  preload(): void {
    this.load.image(
      "ball",
      "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/orb-blue.png"
    );
  }

  create(): void {
    const { width, height } = this.sys.game.config;

    // Title
    this.add
      .text(Number(width) / 2, 60, "Fortune Teller", {
        fontFamily: "Arial",
        fontSize: "40px",
        color: "#333",
        stroke: "#000",
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    // Add the ball
    this.ball = this.add
      .image(Number(width) / 2, Number(height) / 2, "ball")
      .setScale(2);

    // Make the ball interactive
    this.ball.setInteractive({ useHandCursor: true });
    this.ball.on("pointerdown", this.shakeBall, this);

    // Add the response text
    this.responseText = this.add
      .text(Number(width) / 2, Number(height) / 2 + 50, "", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#FFFFFF",
        align: "center",
        wordWrap: { width: 180 },
      })
      .setOrigin(0.5);

    // Add instruction text
    this.instructionText = this.add
      .text(
        Number(width) / 2,
        Number(height) - 80,
        "Think of a question and click the ball to receive your fortune",
        {
          fontFamily: "Arial",
          fontSize: "20px",
          color: "#333",
        }
      )
      .setOrigin(0.5);
  }

  update(): void {
    // Update logic can be added here if needed
  }

  private shakeBall(): void {
    if (this.isShaking) return;

    this.isShaking = true;

    // Clear previous response
    this.responseText.setText("");

    // Store reference to this for closures
    const self = this;

    // Shake animation
    this.tweens.add({
      targets: this.ball,
      x: { from: this.ball.x - 10, to: this.ball.x + 10 },
      ease: "Sine.easeInOut",
      duration: 50,
      repeat: 10,
      yoyo: true,
      onComplete: function () {
        // Return to original position
        self.tweens.add({
          targets: self.ball,
          x: Number(self.sys.game.config.width) / 2,
          ease: "Power1",
          duration: 100,
          onComplete: function () {
            self.showResponse();
          },
        });
      },
    });
  }

  private showResponse(): void {
    // Pick a random response
    const currentResponse =
      this.responses[Math.floor(Math.random() * this.responses.length)];

    // Display the response
    this.responseText.setText(currentResponse);

    // Add a small delay before allowing another shake
    this.time.delayedCall(500, () => {
      this.isShaking = false;
    });
  }
}
