import { PlanetEg } from '../Demonstration/PlanetEg.js';
import { GenericScene } from '../generalClasses/GenericScene.js';
import { SatelliteEg } from '../Demonstration/SatelliteEg.js';
import { RocketEg } from '../Demonstration/RocketEg.js';

export class SceneEg extends GenericScene {
    constructor() {
        super('SceneEg', true, 'rocket', false);
    }
    
    initializeBackground() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.centerX = centerX;
        this.centerY = centerY;
        //this.add.image(centerX, centerY, 'bg');
    }
    

    initializePlanets() {
        this.initialPlanetPositions = [];
        this.initialPlanetPositions.push({x: this.centerX, y: this.centerY});
        this.planets.push(new PlanetEg(this, this.initialPlanetPositions[0].x, this.initialPlanetPositions[0].y, 
                                        'cartoon_moon', 50, false, 1000));
    }

    initializeSatellites() {
        const height = 50;
        this.initialSatellitePositions = [];
        if (this.planets.length > 0) {
            const planet = this.planets[0];
            const distanceFromCenter = planet.radius + height;
            this.initialSatellitePositions.push({x: this.initialPlanetPositions[0].x + distanceFromCenter, 
                                                y: this.initialPlanetPositions[0].y});
            this.satellites.push(new SatelliteEg(this, this.initialSatellitePositions[0].x, this.initialSatellitePositions[0].y, 
                'star', this.planets, false, 15, this.gravitySystem));
        }
    }

    initializeRocket() {
        const height = 100;
        this.initialRocketPosition = null;
        
        // 先销毁旧的火箭实例，避免图像残留
        if (this.rocket) {
            this.rocket.destroy();
            this.rocket = null;
        }
        
        if(this.planets.length > 0) {
            const planet = this.planets[0];
            const distanceFromCenter = planet.radius + height;
            this.initialRocketPosition = {x: this.initialPlanetPositions[0].x, 
                                                y: this.initialPlanetPositions[0].y - distanceFromCenter};
            this.rocket = new RocketEg(this, this.initialRocketPosition.x, 
                this.initialRocketPosition.y, 'cartoon_rocket', this.planets, false, 30, this.gravitySystem, false);
        }
    }
}