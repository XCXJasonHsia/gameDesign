import { PlanetEg } from '../Demonstration/PlanetEg.js';
import { GenericScene, GenericUIScene } from '../generalClasses/GenericScene.js';
import { SatelliteEg } from '../Demonstration/SatelliteEg.js';
import { RocketEg } from '../Demonstration/RocketEg.js';

export class SceneEg extends GenericScene {
    constructor() {
        super('SceneEg', true, 'rocket', false, 'UISceneEg');
    }
    

    initializeBackground() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.centerX = centerX;
        this.centerY = centerY;
        const bg = this.add.image(centerX, centerY, 'bg');
        bg.setDepth(-100); // 设置背景为最底层
        bg.setScale(2); // 背景图片放大一倍
        
        // 设置初始相机缩放
        this.cameras.main.setZoom(0.9); // 设置相机缩放值为0.9
    }
    

    initializePlanets() {
        this.initialPlanetPositions = [];
        this.initialPlanetPositions.push({x: this.centerX, y: this.centerY});
        this.planets.push(new PlanetEg(this, this.initialPlanetPositions[0].x, this.initialPlanetPositions[0].y, 
                                        'cartoon_moon', 90, true, 2000)); // 行星缩小10%
    }

    initializeSatellites() {
        const height = 128; // 卫星距离行星更远60%（80 * 1.6）
        this.initialSatellitePositions = [];
        if (this.planets.length > 0) {
            const planet = this.planets[0];
            const distanceFromCenter = planet.radius + height;
            this.initialSatellitePositions.push({x: this.initialPlanetPositions[0].x + distanceFromCenter, 
                                                y: this.initialPlanetPositions[0].y});
            this.satellites.push(new SatelliteEg(this, this.initialSatellitePositions[0].x, this.initialSatellitePositions[0].y, 
                'star', this.planets, true, 15, this.gravitySystem, true));
        }
    }

    initializeRocket() {
        const height = 280; // 飞船距离行星更远40%（200 * 1.4）
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
                this.initialRocketPosition.y, 'cartoon_rocket', this.planets, true, 30, this.gravitySystem, true, false);
        }
    }
}

export class UISceneEg extends GenericUIScene {
    constructor() {
        super('UISceneEg');
    }
}