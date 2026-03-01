import { Boot } from './scenes/Boot.js';
import { Game } from './scenes/Game.js';
import { GameOver } from './scenes/GameOver.js';
import { Preloader } from './scenes/Preloader.js';
import { Adventure, OasisScene, AshesScene, AegisScene, TheOldHomeScene, OmegaScene, ScenePulsar, UIScenePulsar } from './scenes/Adventure.js';
import { Battle } from './scenes/Battle.js';
import { PreparationSceneEg } from './Demonstration/PreparationSceneEg.js';
import { SceneEg, UISceneEg } from './Demonstration/SceneEg.js';
import { PreparationScene11 } from './scenes/AdventureScenes/EarthScene/PreparationScene11.js';
import { SceneEarth, UISceneEarth } from './scenes/AdventureScenes/EarthScene/SceneEarth.js';
import { IntroSceneEarth } from './scenes/AdventureScenes/EarthScene/IntroSceneEarth.js';
import { PreparationScene12 } from './scenes/AdventureScenes/PlanetLinkScene/PreparationScene12.js';
import { SceneLinkOfPlanets, UISceneLinkOfPlanets } from './scenes/AdventureScenes/PlanetLinkScene/SceneLinkOfPlanets.js';
import { IntroSceneLinkOfPlanets } from './scenes/AdventureScenes/PlanetLinkScene/IntroSceneLinkOfPlanets.js';
import { PreparationScene23 } from './scenes/AdventureScenes/DualPlanetsScene/PreparationScene23.js';
import { SceneDualPlanets, UISceneDualPlanets } from './scenes/AdventureScenes/DualPlanetsScene/SceneDualPlanets.js';
import { IntroSceneDualPlanets } from './scenes/AdventureScenes/DualPlanetsScene/IntroSceneDualPlanets.js';
import { SceneLivable, UISceneLivable } from './scenes/AdventureScenes/LivableScene/SceneLivable.js';
import { IntroSceneLivable } from './scenes/AdventureScenes/LivableScene/IntroSceneLivable.js';
import { IntroScenePulsar } from './scenes/AdventureScenes/PulsarScene/IntroScenePulsar.js';
import { SurfaceplayScene } from './scenes/SurfaceScenes/Surfaceplay.js';
import { MapScene } from './scenes/MapScene.js';
import { GuideScene } from './scenes/GuideScene.js';
import { RocketVideoScene } from './scenes/SurfaceScenes/RocketVideoScene.js';
import { PreparationScene } from './scenes/PreparationScene.js';
const config = {
    type: Phaser.WEBGL,
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
    render: {
        pixelArt: false,
        antialias: true,
        antialiasGL: true,
        roundPixels: false
    },
    scene: [
        Boot,
        Preloader,
        Game,
        GameOver, 
        Adventure, 
        Battle, 
        PreparationScene,
        SceneEg, UISceneEg,
        PreparationScene11,  
        SceneEarth, UISceneEarth,
        IntroSceneEarth,
        PreparationScene12, 
        SceneLinkOfPlanets, UISceneLinkOfPlanets, 
        IntroSceneLinkOfPlanets,
        PreparationScene23, 
        SceneDualPlanets, UISceneDualPlanets,
        IntroSceneDualPlanets,
        SceneLivable, UISceneLivable, 
        IntroSceneLivable,
        SurfaceplayScene,
        MapScene,
        GuideScene,
        RocketVideoScene,
        OasisScene,
        ScenePulsar, UIScenePulsar,
        IntroScenePulsar,
        AshesScene,
        AegisScene,
        TheOldHomeScene,
        OmegaScene
    ]
};

new Phaser.Game(config);
