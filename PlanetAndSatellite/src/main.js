import { Boot } from './scenes/Boot.js';
import { Game } from './scenes/Game.js';
import { GameOver } from './scenes/GameOver.js';
import { Preloader } from './scenes/Preloader.js';
import { Adventure } from './scenes/Adventure.js';
import { Battle } from './scenes/Battle.js';
import { PreparationSceneEg } from './Demonstration/PreparationSceneEg.js';
import { SceneEg, UISceneEg } from './Demonstration/SceneEg.js';
import { PreparationScene11 } from './scenes/AdventureScenes/EarthScene/PreparationScene11.js';
import { SceneEarth, UISceneEarth } from './scenes/AdventureScenes/EarthScene/SceneEarth.js';
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#028af8',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { x: 0, y: 0 },
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        Preloader,
        Game,
        GameOver, 
        Adventure, 
        Battle, 
        PreparationSceneEg,
        SceneEg, UISceneEg,
        PreparationScene11,  
        SceneEarth, UISceneEarth
    ]
};

new Phaser.Game(config);
