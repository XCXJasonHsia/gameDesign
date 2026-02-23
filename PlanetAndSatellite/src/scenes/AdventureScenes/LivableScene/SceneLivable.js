import { PlanetLivable } from '../../../AdventureObjects/Livable/PlanetLivable.js';
import { GenericScene, GenericUIScene } from '../../../generalClasses/GenericScene.js';
import { SatelliteLivable } from '../../../AdventureObjects/Livable/SatelliteLivable.js';
import { RocketLivable } from '../../../AdventureObjects/Livable/RocketLivable.js';

export class SceneLivable extends GenericScene {
    constructor() {
        super('SceneLivable', true, 'rocket', false, 'UISceneLivable');
        this.safeLandingSpeed = 2;
    }
    

    initializeBackground() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.centerX = centerX;
        this.centerY = centerY;
        console.log('Creating background with key: bg2');
        const bg = this.add.image(centerX, centerY, 'bg2');
        console.log('Background created:', bg);
        bg.setDepth(-100); // 设置背景为最底层
        bg.setScale(1.5); // 背景图片放大1.5倍（原来的50%）
        
        // 设置初始相机缩放
        this.cameras.main.setZoom(0.8);
    }
    

    initializePlanets() {
        this.initialPlanetPositions = [];
        this.initialPlanetPositions.push({x: this.centerX, y: this.centerY});
        this.planets.push(new PlanetLivable(this, this.initialPlanetPositions[0].x, this.initialPlanetPositions[0].y, 
                                        'livable_planet_spriteSheet', 90, false, 2000)); 
    }

    initializeSatellites() {
        const height = 128;
        this.initialSatellitePositions = [];
        if (this.planets.length > 0) {
            const planet = this.planets[0];
            const distanceFromCenter = planet.radius + height;
            this.initialSatellitePositions.push({x: this.initialPlanetPositions[0].x + distanceFromCenter, 
                                                y: this.initialPlanetPositions[0].y});
            this.satellites.push(new SatelliteLivable(this, this.initialSatellitePositions[0].x, this.initialSatellitePositions[0].y, 
                'cartoon_moon', this.planets, false, 15, this.gravitySystem, true));
        }
    }

    initializeRocket() {
        const height = 280;
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
            this.rocket = new RocketLivable(this, this.initialRocketPosition.x, 
                this.initialRocketPosition.y, 'cartoon_rocket', this.planets, false, 30, this.gravitySystem, true, false);
        }
    }

    update(time, delta) {
        super.update(time, delta);
        
        // 实时更新火箭速度状态
        this.updateRocketSpeedStatus();
        
        // 检查火箭是否与行星碰撞
        this.checkRocketPlanetCollision();
    }

    // 实时更新火箭速度状态
    updateRocketSpeedStatus() {
        if (!this.rocket) return;
        
        // 计算火箭速度
        const velocityX = this.rocket.position.x - this.rocket.previousPosition.x;
        const velocityY = this.rocket.position.y - this.rocket.previousPosition.y;
        const velocityMagnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
        
        // 检查是否在安全降落速度范围内
        const isInSafeRange = velocityMagnitude < this.safeLandingSpeed;
        
        // 获取UI场景并更新速度状态显示
        const uiScene = this.scene.get(this.sceneKeyUI);
        if (uiScene && uiScene.showSpeedStatus) {
            uiScene.showSpeedStatus(isInSafeRange);
        }
    }

    checkRocketPlanetCollision() {
        if (!this.rocket || this.rocket.isAttached) return;
        
        for (const planet of this.planets) {
            if (this.rocket.checkCollisionWithPlanet(planet)) {
                // 计算火箭速度（使用Verlet积分法的速度计算）
                const velocityX = this.rocket.position.x - this.rocket.previousPosition.x;
                const velocityY = this.rocket.position.y - this.rocket.previousPosition.y;
                const velocityMagnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
                
                // 速度阈值，小于此值视为安全降落
                const safeLandingSpeed = this.safeLandingSpeed;
                
                // 获取UI场景
                const uiScene = this.scene.get(this.sceneKeyUI);
                
                if (velocityMagnitude < safeLandingSpeed) {
                    // 降落成功
                    console.log('降落成功！速度:', velocityMagnitude);
                    this.showLandingMessage(uiScene, '降落成功', true);
                    // 1秒后使用黑入效果开启SurfaceplayScene
                    setTimeout(() => {
                        if (uiScene && uiScene.fadeOut) {
                            uiScene.fadeOut(() => {
                                this.scene.stop(this.sceneKeyUI);
                                this.scene.start('SurfaceplayScene', {videoPlayed: false});
                            });
                        }
                    }, 1000);
                } else {
                    // 降落失败
                    console.log('降落失败！速度:', velocityMagnitude);
                    this.showLandingMessage(uiScene, '降落失败', false);
                    // 1秒后重置
                    this.resetRocketAfterDelay();
                }
                
                break;
            }
        }
    }

    showLandingMessage(uiScene, message, isSuccess) {
        if (!uiScene) return;
        
        // 使用UI场景中的方法显示降落结果
        if (uiScene.showLandingResult) {
            uiScene.showLandingResult(message, isSuccess);
        } 
    }

    resetRocketAfterDelay() {
        // 1秒后重置火箭
        setTimeout(() => {
            if (this.rocket) {
                // 获取UI场景
                const uiScene = this.scene.get(this.sceneKeyUI);
                
                // 使用黑入黑出效果重置火箭
                if (uiScene && uiScene.fadeOut) {
                    uiScene.fadeOut(() => {
                        // 清除UI场景中的降落失败消息
                        if (uiScene && uiScene.messageText) {
                            uiScene.messageText.destroy();
                            uiScene.messageText = null;
                        }
                        
                        // 重置火箭
                        this.rocket.resetToInitialState();
                        
                        // 显示黑出效果结束
                        if (uiScene && uiScene.fadeIn) {
                            uiScene.fadeIn();
                        }
                    });
                } else {
                    // 后备方案：如果UI场景不存在或没有fadeOut方法，直接重置
                    // 清除UI场景中的降落失败消息
                    if (uiScene && uiScene.messageText) {
                        uiScene.messageText.destroy();
                        uiScene.messageText = null;
                    }
                    
                    // 重置火箭
                    this.rocket.resetToInitialState();
                }
            }
        }, 1000);
    }

    resetLeader() {
        super.resetLeader();
        
        // 确保清除所有UI显示，包括速度状态和燃油警告
        const uiScene = this.scene.get(this.sceneKeyUI);
        if (uiScene && uiScene.clearUIDisplay) {
            uiScene.clearUIDisplay();
        }
        
        this.cameras.main.setZoom(0.8);
    }
}

export class UISceneLivable extends GenericUIScene {
    constructor() {
        super('UISceneLivable');
        this.messageText = null;
        this.speedStatusText = null;
        this.fuelWarningText = null;
    }

    // 重写设置说明文本的方法
    setUpInstructions() {
        const instructions = [
            'W/A/S/D: 控制火箭推进器',
            '空格键: 增加推力',
            'R: 重置火箭位置', 
            'ESC: 暂停',
            '+/-: 缩放星图',
            'H: 显示/隐藏说明',
            '目标: 安全降落到行星表面'
        ];
        this.instructions = instructions;
    }

    // 显示速度范围状态
    showSpeedStatus(isInSafeRange) {
        // 清除现有速度状态显示
        if (this.speedStatusText) {
            this.speedStatusText.destroy();
        }
        
        // 创建速度状态文本
        const screenWidth = this.cameras.main.width;
        
        this.speedStatusText = this.add.text(
            screenWidth - 20, 120,
            isInSafeRange ? '✓ 可安全降落' : '✗ 速度过快',
            {
                fontSize: '16px',
                fill: isInSafeRange ? '#00ff00' : '#ff0000',
                backgroundColor: '#00000080',
                padding: { x: 10, y: 5 }
            }
        );
        this.speedStatusText.setOrigin(1, 0.5);
        this.speedStatusText.setScrollFactor(0);
        this.speedStatusText.setDepth(999);
        
        // 添加到UI层
        if (this.UILayer) {
            this.UILayer.add(this.speedStatusText);
        }
    }

    // 显示燃油耗尽警告
    showFuelWarning() {
        // 清除现有燃油警告
        if (this.fuelWarningText) {
            this.fuelWarningText.destroy();
        }
        
        // 创建燃油警告文本
        const screenWidth = this.cameras.main.width;
        
        this.fuelWarningText = this.add.text(
            screenWidth - 20, 160,
            '燃油耗尽！',
            {
                fontSize: '16px',
                fill: '#ff0000',
                backgroundColor: '#00000080',
                padding: { x: 10, y: 5 }
            }
        );
        this.fuelWarningText.setOrigin(1, 0.5);
        this.fuelWarningText.setScrollFactor(0);
        this.fuelWarningText.setDepth(999);
        
        // 添加到UI层
        if (this.UILayer) {
            this.UILayer.add(this.fuelWarningText);
        }
    }

    // 清除燃油警告
    clearFuelWarning() {
        if (this.fuelWarningText) {
            this.fuelWarningText.destroy();
            this.fuelWarningText = null;
        }
    }

    // 重写清除UI显示的方法，确保清除所有自定义UI元素
    clearUIDisplay() {
        super.clearUIDisplay();
        
        // 清除速度状态显示
        if (this.speedStatusText) {
            this.speedStatusText.destroy();
            this.speedStatusText = null;
        }
        
        // 清除燃油警告显示
        if (this.fuelWarningText) {
            this.fuelWarningText.destroy();
            this.fuelWarningText = null;
        }
        
        // 清除降落结果消息
        if (this.messageText) {
            this.messageText.destroy();
            this.messageText = null;
        }
    }

    // 显示降落结果消息
    showLandingResult(message, isSuccess) {
        // 清除现有UI显示
        this.clearUIDisplay();
        
        // 创建降落结果消息
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        const screenCenterX = screenWidth / 2;
        const screenCenterY = screenHeight / 2;
        
        const messageText = this.add.text(
            screenCenterX, screenCenterY,
            message,
            {
                fontSize: '48px',
                fill: isSuccess ? '#00ff00' : '#ff0000',
                stroke: '#000000',
                strokeThickness: 4,
                fontFamily: 'Arial, sans-serif',
                padding: { x: 20, y: 10 }
            }
        );
        messageText.setOrigin(0.5);
        messageText.setDepth(1001);
        messageText.setScrollFactor(0);
        
        // 添加到UI层
        if (this.UILayer) {
            console.log('uilayer added.');
            this.UILayer.add(messageText);
        }
        this.messageText = messageText;
    }
}
