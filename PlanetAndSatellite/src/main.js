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
import { PreparationScene12 } from './scenes/AdventureScenes/PlanetLinkScene/PreparationScene12.js';
import { SceneLinkOfPlanets, UISceneLinkOfPlanets } from './scenes/AdventureScenes/PlanetLinkScene/SceneLinkOfPlanets.js';
import { PreparationScene23 } from './scenes/AdventureScenes/DualPlanetsScene/PreparationScene23.js';
import { SceneDualPlanets, UISceneDualPlanets } from './scenes/AdventureScenes/DualPlanetsScene/SceneDualPlanets.js';
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
        SceneEarth, UISceneEarth,
        PreparationScene12, 
        SceneLinkOfPlanets, UISceneLinkOfPlanets, 
        PreparationScene23, 
        SceneDualPlanets, UISceneDualPlanets
    ]
};

new Phaser.Game(config);
