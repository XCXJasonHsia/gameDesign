import { RocketPulse } from '../../../AdventureObjects/Pulsar/RocketPulse.js';
import { PlanetPulse } from '../../../AdventureObjects/Pulsar/PlanetPulse.js';
import { GenericScene, GenericUIScene } from '../../../generalClasses/GenericScene.js';
import { GravitySystem } from '../../../Engines/GravitySystem.js';

export class ScenePulsar extends GenericScene {
    constructor() {
        super('ScenePulsar', true, 'rocket', false, 'UIScenePulsar');
    }

    create() {
        super.create();
        const uiScene = this.scene.get('UIScenePulsar');
        this.uiScene = uiScene;

        // 现在初始化完成，再显示成功区域覆盖层
        this.showSuccessAreaOverlay();
    }
    
    setupZoomControls() {
        super.setupZoomControls();
        // 缩放范围
        this.minZoom = 0.2;
        this.maxZoom = 3;
    }

    resetLeader() {
        super.resetLeader();
        this.cameras.main.setZoom(0.9);
    }
    initializeBackground() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.centerX = centerX;
        this.centerY = centerY;
        const bg = this.add.image(centerX, centerY, 'bg11');
        bg.setDepth(-100); // 设置背景为最底层
        bg.setScale(2); // 背景图片放大x倍
        
        // 添加旋转的pulse_flag.png作为背景
        this.pulseFlag = this.add.image(centerX, centerY, 'pulse_flag');
        this.pulseFlag.setDepth(-50); // 设置在背景之上，行星之下
        
        // 添加旋转动画
        this.tweens.add({
            targets: this.pulseFlag,
            rotation: 2 * Math.PI,
            duration: 10000,
            repeat: -1,
            ease: 'Linear'
        });
        
        // 设置初始相机缩放
        this.cameras.main.setZoom(0.72); // 设置相机缩放值为0.72（原来的0.9减少20%）
    }

    showSuccessAreaOverlay() {
        // 显示成功判定区域的overlayer
        const midX = this.centerX;
        const midY = this.centerY;
        
        // 创建成功判定区域的圆形
        this.successArea = this.add.circle(
            midX,
            midY,
            30, // 半径
            0x00ff00,
            0.2
        );
        this.successArea.setDepth(-50); // 设置在背景之上，脉冲星之下
        // 不设置scrollFactor为0，这样它会随相机移动
    }
    

    initializePlanets() {
        // 使用pulse.png作为行星，放在屏幕中心
        this.initialPlanetPositions = [];
        this.planets = [];
        
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        
        // 添加pulse行星到初始位置数组
        this.initialPlanetPositions.push({x: centerX, y: centerY});
        
        // 创建pulse行星，设置适当的半径和质量以确保它具有吸引力
        const pulsePlanet = new PlanetPulse(this, centerX, centerY, 'pulse_planet', 150, 10000);
        this.planets.push(pulsePlanet);
    }

    initializeSatellites() {
        // 在脉冲星场景中不需要卫星
    }

    initializeRocket() {
        const height = 100;
        this.initialRocketPosition = null;
        
        // 先销毁旧的火箭实例，避免图像残留
        if (this.rocket) {
            this.rocket.destroy();
            this.rocket = null;
        }
        
        // 在屏幕左侧创建火箭，距离脉冲行星足够远
        this.initialRocketPosition = {x: this.centerX - 600, y: this.centerY};
        this.rocket = new RocketPulse(this, this.initialRocketPosition.x, 
            this.initialRocketPosition.y, 'cartoon_rocket', this.planets, false, 30, this.gravitySystem, true, false);
        
        // 设置火箭为leader，以便相机能够跟随它
        this.leader = this.rocket;
        
        // 确保飞船受到引力作用并有初速度
        if (this.rocket && this.planets.length > 0) {
            // 初始化飞船速度，使其能够围绕脉冲行星做轨道运动
            this.rocket.initializeVelocity();
            
            // 手动设置火箭的初始速度，确保它有足够的速度开始运动
            if (this.rocket.body) {
                this.rocket.body.setVelocity(200, 0);
            }
        }
    }

    checkLeaderBoundaries() {
        if (!this.leader || this.planets.length === 0) return;
        
        // 定义边界距离（从行星中心算起）
        const maxDistance = 2000;
        
        // 计算火箭到行星的距离
        const dx = this.leader.x - this.planets[0].x;
        const dy = this.leader.y - this.planets[0].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.distance = distance;
        
        // 如果飞出太远，重置位置
        if (this.distance > maxDistance) {
            console.log('火箭飞出太远，正在重置...');
            this.resetLeader();
        }
    }

    update(time, delta) {
        if(this.isPaused === true) return;
        super.update(time, delta);
        this.ifSuccess();
    }

    ifSuccess() {
        if(this.leader) {
            const midX = this.centerX;
            const midY = this.centerY;
            
            // 计算飞船到中间位置的距离
            const dx = this.leader.x - midX;
            const dy = this.leader.y - midY;
            const distanceToMid = Math.sqrt(dx * dx + dy * dy);
            
            // 计算飞船的速度大小
            const velocityX = this.leader.body.velocity.x;
            const velocityY = this.leader.body.velocity.y;
            const velocityMagnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
            
            // 检查飞船是否在中间位置附近且速度较小
            if(distanceToMid < 150 && velocityMagnitude < 50) {
                this.isPaused = true;
                this.physics.world.pause();
                this.tweens.pauseAll();

                console.log('enter Success');
                this.uiScene.showSuccessText();
            }
        }
    }
}

export class UIScenePulsar extends GenericUIScene {
    constructor() {
        super('UIScenePulsar');
        this.mainScene = null; // 稍后在 create 方法中初始化
    }

    create() {
        super.create();
        
        // 初始化主场景引用
        this.mainScene = this.scene.get('ScenePulsar');
    }

    showSuccessAreaOverlay() {
        // 显示成功判定区域的overlayer
        if(this.mainScene) {
            const midX = this.mainScene.centerX;
            const midY = this.mainScene.centerY;
            
            // 创建成功判定区域的圆形
            const successArea = this.add.circle(
                midX,
                midY,
                150, // 半径
                0x00ff00,
                0.2
            );
            successArea.setDepth(-50); // 设置在背景之上，脉冲星之下
            // 不设置scrollFactor为0，这样它会随相机移动
        }
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
                    this.scene.stop('ScenePulsar');
                    this.scene.start('Game');
                });
    }
}
