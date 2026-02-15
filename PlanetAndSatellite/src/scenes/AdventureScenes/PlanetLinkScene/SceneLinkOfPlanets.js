import { PlanetLink } from '../../../AdventureObjects/LinkOfPlanets/PlanetLink.js';
import { Rocket12 } from '../../../AdventureObjects/LinkOfPlanets/Rocket12.js';
import { Satellite12 } from '../../../AdventureObjects/LinkOfPlanets/Satellite12.js';
import { GenericScene, GenericUIScene } from '../../../generalClasses/GenericScene.js';

export class SceneLinkOfPlanets extends GenericScene {
    constructor() {
        super('SceneLinkOfPlanets', true, 'rocket', false, 'UISceneLinkOfPlanets');
    }

    create() {
        super.create();
        const uiScene = this.scene.get('UISceneLinkOfPlanets');
        this.uiScene = uiScene;

        this.uiScene.showSuccessAreaOverlay();
    }
    

    initializeBackground() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.centerX = centerX;
        this.centerY = centerY;
        const bg = this.add.image(centerX, centerY, 'bg');
        bg.setDepth(-100); // 设置背景为最底层
        bg.setScale(10); // 背景图片放大x倍
        
        // 设置初始相机缩放
        this.cameras.main.setZoom(1.0); // 设置相机缩放值为0.9
    }

    showSuccessAreaOverlay() {
        // 显示成功判定区域的overlayer
        if(this.planets[3]) {
            const planetX = this.planets[3].x;
            const planetY = this.planets[3].y;
            
            // 创建成功判定区域的矩形
            const successArea = this.add.rectangle(
                planetX + 500, // 中心x坐标
                planetY, // 中心y坐标
                100, // 宽度
                600, // 高度
                0x00ff00,
                0.2
            );
            successArea.setDepth(-50); // 设置在背景之上，行星之下
            successArea.setScrollFactor(0); // 固定位置，不随相机移动
        }
    }
    

    initializePlanets() {
        this.initialPlanetPositions = [];
        this.initialPlanetPositions.push({x: this.centerX, y: this.centerY + 750});
        this.initialPlanetPositions.push({x: this.centerX + 750, y: this.centerY});
        this.initialPlanetPositions.push({x: this.centerX - 2250, y: this.centerY});
        this.initialPlanetPositions.push({x: this.centerX - 450, y: this.centerY - 1800});
        this.planets.push(new PlanetLink(this, this.initialPlanetPositions[0].x, this.initialPlanetPositions[0].y, 
                                        'planet_with_arrow_green', 200, false, 2000)); 
        this.planets[0].changePowerAndG(-2, 4000);
        this.planets[0].rotateImage(360 - 45);
        this.planets.push(new PlanetLink(this, this.initialPlanetPositions[1].x, this.initialPlanetPositions[1].y, 
                                        'planet_with_arrow_orange', 90, false, 2000)); 
        this.planets[1].changePowerAndG(-1.5, 400);
        this.planets[1].rotateImage(180);
        this.planets.push(new PlanetLink(this, this.initialPlanetPositions[2].x, this.initialPlanetPositions[2].y, 
                                        'planet_with_arrow_red', 120, false, 2000)); 
        this.planets[2].changePowerAndG(-1.2, 100);
        this.planets[2].rotateImage(360 - 45);
        this.planets.push(new PlanetLink(this, this.initialPlanetPositions[3].x, this.initialPlanetPositions[3].y, 
                                        'planet_with_arrow_yellow', 200, false, 2000)); 
        this.planets[3].changePowerAndG(-2.5, 7000);
        this.planets[3].rotateImage(0);
    }

    initializeSatellites() {
        const height = 200;
        this.initialSatellitePositions = [];
        if (this.planets.length > 0) {
            const planet = this.planets[2];
            const distanceFromCenter = planet.radius + height;
            this.initialSatellitePositions.push({x: this.initialPlanetPositions[2].x + distanceFromCenter, 
                                                y: this.initialPlanetPositions[2].y});
            this.satellites.push(new Satellite12(this, this.initialSatellitePositions[0].x, this.initialSatellitePositions[0].y, 
                'cartoon_moon', this.planets, false, 30, this.gravitySystem, true));
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
            this.rocket = new Rocket12(this, this.initialRocketPosition.x, 
                this.initialRocketPosition.y, 'cartoon_rocket', this.planets, false, 30, this.gravitySystem, true, false);
        }
    }

    checkLeaderBoundaries() {
        // 取消边际限制
    }

    update(time, delta) {
        if(this.isPaused === true) return;
        super.update(time, delta);
        this.ifSuccess();
    }

    ifSuccess() {
        const uiScene = this.scene.get('UISceneLinkOfPlanets');
        if(this.leader && this.planets[3]) {
            // 
            const planetX = this.planets[3].x;
            const rocketX = this.leader.x;
            const planetY = this.planets[3].y;
            const rocketY = this.leader.y;

            if(rocketX > planetX + 450 && rocketX < planetX + 550 && rocketY > planetY - 300 && rocketY < planetY + 300) {
                this.isPaused = true;
                this.physics.world.pause();
                this.tweens.pauseAll();

                console.log('enter Success');
                uiScene.showSuccessText();
            }
        }
    }
}

export class UISceneLinkOfPlanets extends GenericUIScene {
    constructor() {
        super('UISceneLinkOfPlanets');
        this.mainScene = null; // 稍后在 create 方法中初始化
    }

    create() {
        super.create();
        
        // 初始化主场景引用
        this.mainScene = this.scene.get('SceneLinkOfPlanets');
        
        // 显示成功判定区域的overlayer
        this.showSuccessAreaOverlay();
    }

    showSuccessText() {
        if(!this.overlays) {
            this.overlays = [];
        }
        if(!this.cameras || !this.cameras.main) {
            console.log('camera unset.');
        }
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        const successOverlay = this.add.rectangle(
            screenWidth/2,
            screenHeight/2,
            screenWidth,
            screenHeight,
            0x000000,
            0.5
        );
        successOverlay.setScrollFactor(0);
        successOverlay.setDepth(1000);
        this.overlays.push(successOverlay);

        this.successText = this.add.text(
            screenWidth / 2,
            screenHeight / 2 - 100,
            'SUCCESS',
            {
                fontSize: '50px',
                fill: '#ffffff',
                backgroundColor: '#00000080',
                padding: { x: 0, y: 0 }
            }
        );
        this.successText.setOrigin(1, 0.5);
        this.successText.setScrollFactor(0);
        this.successText.setDepth(1001);

        this.time.delayedCall(3000, () => {
                    this.scene.stop('SceneLinkOfPlanets');
                    this.scene.start('Game');
                });
    }

    showSuccessAreaOverlay() {
        console.log('enter success overlayer.');
        // 显示成功判定区域的overlayer
        if(this.mainScene && this.mainScene.planets[3]) {
            const planetX = this.mainScene.planets[3].x;
            const planetY = this.mainScene.planets[3].y;
            
            // 创建成功判定区域的矩形
            const successArea = this.add.rectangle(
                planetX + 500, // 中心x坐标
                planetY, // 中心y坐标
                100, // 宽度
                600, // 高度
                0x000000,
                0.2
            );
            successArea.setDepth(1000); // 设置在背景之上，行星之下
            successArea.setScrollFactor(0); // 固定位置，不随相机移动
        }
    }
}
