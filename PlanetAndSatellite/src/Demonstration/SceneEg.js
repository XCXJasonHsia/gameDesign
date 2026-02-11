import { PlanetEg } from '../Demonstration/PlanetEg.js';
import { GenericScene } from '../generalClasses/GenericScene.js';
import { SatelliteEg } from '../Demonstration/SatelliteEg.js';
import { RocketEg } from '../Demonstration/RocketEg.js';

export class SceneEg extends GenericScene {
    constructor() {
        super('SceneEg', true, 'rocket', false);
        //this.isPaused = false;
    }
    /*
    create() {
        this.input.keyboard.on('keydown-ESC', () => this.gamePause());
        super.create();
    }
    
    gamePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.onPause();
        } else {
            this.onResume();
        }
        
        console.log(`游戏已${this.isPaused ? '暂停' : '继续'}`);
    }
    
    // 暂停时的处理
    onPause() {
        // 暂停物理世界
        this.physics.world.pause();
        
        // 暂停所有tweens（动画）
        this.tweens.pauseAll();
        
        // 可以添加其他暂停逻辑，比如显示暂停界面等
        this.showPauseOverlay();
        
        // 添加Enter键监听，用于回到主界面
        this.input.keyboard.once('keydown-ENTER', this.goToMainMenu, this);
    }
    
    // 恢复时的处理
    onResume() {
        // 恢复物理世界
        this.physics.world.resume();
        
        // 恢复所有tweens（动画）
        this.tweens.resumeAll();
        
        // 移除暂停覆盖层
        this.removePauseOverlay();
    }
    
    // 回到主界面（会出问题）
    goToMainMenu() {
        // 启动Game场景，让Phaser自动处理场景切换
        //this.scene.stop('SceneEg');
        console.log('successfully stopped.');
        this.scene.start('Game');
    }
    
    // 显示暂停覆盖层
    showPauseOverlay() {
        // 获取相机中心位置
        const cameraCenterX = this.cameras.main.centerX;
        const cameraCenterY = this.cameras.main.centerY;
        
        // 创建半透明黑色覆盖层
        this.pauseOverlay = this.add.rectangle(cameraCenterX, cameraCenterY, 800, 600, 0x000000, 0.5);
        this.pauseOverlay.setDepth(1000);
        this.pauseOverlay.setScrollFactor(0); // 不随相机移动
        
        // 创建暂停文字
        this.pauseText = this.add.text(cameraCenterX, cameraCenterY - 50, '游戏暂停', {
            fontSize: '48px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.pauseText.setOrigin(0.5);
        this.pauseText.setDepth(1001);
        this.pauseText.setScrollFactor(0); // 不随相机移动
        
        // 创建提示文字
        this.instructionText = this.add.text(cameraCenterX, cameraCenterY + 20, '按esc继续游戏', {
            fontSize: '20px',
            fill: '#ffff00',
            backgroundColor: '#00000080',
            padding: { x: 10, y: 5 }
        });
        this.instructionText.setOrigin(0.5);
        this.instructionText.setDepth(1001);
        this.instructionText.setScrollFactor(0); // 不随相机移动
        
        // 创建回到主界面提示文字
        this.mainMenuText = this.add.text(cameraCenterX, cameraCenterY + 60, '按Enter回到主界面', {
            fontSize: '20px',
            fill: '#ffff00',
            backgroundColor: '#00000080',
            padding: { x: 10, y: 5 }
        });
        this.mainMenuText.setOrigin(0.5);
        this.mainMenuText.setDepth(1001);
        this.mainMenuText.setScrollFactor(0); // 不随相机移动
    }
    
    // 移除暂停覆盖层
    removePauseOverlay() {
        if (this.pauseOverlay) {
            this.pauseOverlay.destroy();
            this.pauseOverlay = null;
        }
        if (this.pauseText) {
            this.pauseText.destroy();
            this.pauseText = null;
        }
        if (this.instructionText) {
            this.instructionText.destroy();
            this.instructionText = null;
        }
        if (this.mainMenuText) {
            this.mainMenuText.destroy();
            this.mainMenuText = null;
        }
    }
    */

    initializeBackground() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.centerX = centerX;
        this.centerY = centerY;
        const bg = this.add.image(centerX, centerY, 'bg');
        bg.setDepth(-100); // 设置背景为最底层
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