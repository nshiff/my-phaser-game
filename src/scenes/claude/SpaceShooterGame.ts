import * as Phaser from "phaser";

export class SpaceShooterGame extends Phaser.Scene {
  private player: Phaser.GameObjects.Rectangle;
  private bullets: Phaser.GameObjects.Group;
  private enemies: Phaser.GameObjects.Group;
  private stars: Phaser.GameObjects.Group;
  private scoreText: Phaser.GameObjects.Text;
  private healthText: Phaser.GameObjects.Text;
  private gameOverText: Phaser.GameObjects.Text;
  private restartText: Phaser.GameObjects.Text;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey: Phaser.Input.Keyboard.Key;
  private lastFired: number = 0;
  private score: number = 0;
  private health: number = 3;
  private gameOver: boolean = false;
  private enemySpawnTime: number = 0;

  constructor() {
    super({ key: "SpaceShooterGame" });
  }

  create() {
    // Setup keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    // Create background stars
    this.stars = this.add.group();
    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(0, this.cameras.main.width);
      const y = Phaser.Math.Between(0, this.cameras.main.height);
      const size = Phaser.Math.Between(1, 3);
      const star = this.add.rectangle(x, y, size, size, 0xffffff);
      this.stars.add(star);
    }

    // Create player ship (a simple rectangle)
    this.player = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height - 50,
      30,
      20,
      0x00ff00
    );

    // Create a triangle shape on top of the rectangle to make it look like a ship
    const shipGraphics = this.add.graphics();
    shipGraphics.fillStyle(0x00ff00, 1);
    shipGraphics.fillTriangle(
      this.player.x - 15,
      this.player.y - 10,
      this.player.x + 15,
      this.player.y - 10,
      this.player.x,
      this.player.y - 25
    );

    // Create groups for bullets and enemies
    this.bullets = this.add.group();
    this.enemies = this.add.group();

    // Add score and health text
    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "24px",
      color: "#ffffff",
    });

    this.healthText = this.add.text(
      this.cameras.main.width - 150,
      16,
      "Health: 3",
      { fontSize: "24px", color: "#ffffff" }
    );

    // Game over text (hidden initially)
    this.gameOverText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "GAME OVER",
      { fontSize: "64px", color: "#ff0000" }
    );
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // Restart text (hidden initially)
    this.restartText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 80,
      "Press SPACE to restart",
      { fontSize: "24px", color: "#ffffff" }
    );
    this.restartText.setOrigin(0.5);
    this.restartText.setVisible(false);

    // Collision detection
    this.physics.add.collider(
      this.bullets,
      this.enemies,
      this.bulletHitEnemy,
      undefined,
      this
    );
  }

  update(time: number, delta: number) {
    if (this.gameOver) {
      if (this.spaceKey.isDown) {
        this.resetGame();
      }
      return;
    }

    // Move background stars for parallax effect
    this.stars.getChildren().forEach((star: any) => {
      star.y += 1;
      if (star.y > this.cameras.main.height) {
        star.y = 0;
        star.x = Phaser.Math.Between(0, this.cameras.main.width);
      }
    });

    // Player movement
    if (this.cursors.left.isDown) {
      this.player.x = Math.max(15, this.player.x - 5);
    } else if (this.cursors.right.isDown) {
      this.player.x = Math.min(this.cameras.main.width - 15, this.player.x + 5);
    }

    // Fire bullets
    if (this.spaceKey.isDown && time > this.lastFired) {
      const bullet = this.add.rectangle(
        this.player.x,
        this.player.y - 20,
        4,
        14,
        0xff0000
      );
      this.bullets.add(bullet);
      this.physics.add.existing(bullet);
      (bullet.body as Phaser.Physics.Arcade.Body).setVelocityY(-300);
      this.lastFired = time + 200;
    }

    // Update bullets
    this.bullets.getChildren().forEach((bullet: any) => {
      if (bullet.y < 0) {
        bullet.destroy();
      }
    });

    // Spawn enemies
    if (time > this.enemySpawnTime) {
      this.spawnEnemy();
      this.enemySpawnTime = time + Phaser.Math.Between(800, 2000);
    }

    // Check if enemies reached bottom
    this.enemies.getChildren().forEach((enemy: any) => {
      if (enemy.y > this.cameras.main.height) {
        enemy.destroy();
        this.decreaseHealth();
      }

      // Check for collision with player
      if (
        Phaser.Geom.Rectangle.Overlaps(
          new Phaser.Geom.Rectangle(
            this.player.x - 15,
            this.player.y - 15,
            30,
            30
          ),
          new Phaser.Geom.Rectangle(enemy.x - 20, enemy.y - 20, 40, 40)
        )
      ) {
        enemy.destroy();
        this.decreaseHealth();
      }
    });
  }

  spawnEnemy() {
    const x = Phaser.Math.Between(20, this.cameras.main.width - 20);
    const enemy = this.add.rectangle(x, 0, 40, 40, 0xff0000);
    this.enemies.add(enemy);
    this.physics.add.existing(enemy);
    (enemy.body as Phaser.Physics.Arcade.Body).setVelocityY(
      Phaser.Math.Between(100, 150)
    );
  }

  bulletHitEnemy(bullet: any, enemy: any) {
    bullet.destroy();
    enemy.destroy();
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);
  }

  decreaseHealth() {
    this.health--;
    this.healthText.setText(`Health: ${this.health}`);

    if (this.health <= 0) {
      this.gameOver = true;
      this.gameOverText.setVisible(true);
      this.restartText.setVisible(true);
    }
  }

  resetGame() {
    this.score = 0;
    this.health = 3;
    this.gameOver = false;
    this.gameOverText.setVisible(false);
    this.restartText.setVisible(false);
    this.scoreText.setText("Score: 0");
    this.healthText.setText("Health: 3");

    // Clear all enemies and bullets
    this.bullets.clear(true, true);
    this.enemies.clear(true, true);

    // Reset player position
    this.player.x = this.cameras.main.width / 2;
    this.player.y = this.cameras.main.height - 50;
  }
}
