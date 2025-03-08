import { Boot } from "./scenes/Boot";
import { GameOver } from "./scenes/GameOver";
import { MainMenu } from "./scenes/MainMenu";
import { Preloader } from "./scenes/Preloader";
import { BezierDemoScene } from "./scenes/claude/BezierDemoScene.ts";
import { FortuneTellerScene } from "./scenes/claude/FortuneTellerScene.ts";
import { SpaceShooterGame } from "./scenes/claude/SpaceShooterGame.ts";

import { Game, Types } from "phaser";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  parent: "game-container",
  backgroundColor: "#028af8",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    Boot,
    Preloader,
    MainMenu,
    GameOver,
    // -- demo scenes --
    BezierDemoScene,
    FortuneTellerScene,
    SpaceShooterGame,
  ],
};

export default new Game(config);
