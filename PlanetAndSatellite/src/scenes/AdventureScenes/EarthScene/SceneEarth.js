import { PlanetEarth } from '../../../AdventureObjects/Earth/PlanetEarth.js';
import { Rocket11 } from '../../../AdventureObjects/Earth/Rocket11.js';
import { SatelliteMoon } from '../../../AdventureObjects/Earth/SatelliteMoon.js';
import { GenericScene, GenericUIScene } from '../../../generalClasses/GenericScene.js';

export class SceneEarth extends GenericScene {
    constructor() {
        super('SceneEarth', true, 'rocket', false, 'UISceneEarth');
        this.uiScene = null;
    }
    
    create() {
        super.create();
        const uiScene = this.scene.get('UISceneEarth');
        this.uiScene = uiScene;
        if (this.uiScene.tutorialStep === this.uiScene.tutorialSteps.length) {
            this.startAdventure();
        }
    }
    initializeBackground() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.centerX = centerX;
        this.centerY = centerY;
        const bg = this.add.image(centerX, centerY, 'bg2');
        bg.setDepth(-100); 
        bg.setScale(1); 
        
        // 设置初始相机缩放
        this.cameras.main.setZoom(0.5);
    }

    showSuccessAreaOverlay() {
        // 显示成功判定区域的overlayer
        if(this.planets[0] && this.cameras && this.cameras.main) {
            const earth = this.planets[0];
            const successBoundary = 1000;
            const screenWidth = this.cameras.main.width;
            const screenHeight = this.cameras.main.height;
            
            // 创建整个屏幕大小的绿色半透明背景
            const outerArea = this.add.rectangle(
                screenWidth / 2,
                screenHeight / 2,
                screenWidth,
                screenHeight,
                0x00ff00,
                0.2
            );
            outerArea.setDepth(-51); // 设置在背景之上，行星之下
            
            // 创建圆形遮罩，显示出中间的游戏场景
            const maskCircle = this.add.circle(
                earth.x,
                earth.y,
                successBoundary,
                0x000000,
                1
            );
            maskCircle.setDepth(-50); // 设置在绿色背景之上
            
            // 使用圆形作为遮罩，将中间的绿色背景移除
            outerArea.setMask(new Phaser.Display.Masks.BitmapMask(this, maskCircle));
            
            // 让遮罩跟随相机移动，通过在update方法中更新位置
            this.successMaskCircle = maskCircle;
            this.successOuterArea = outerArea;
        }
    }

    update(time, delta) {
        if(this.isPaused === true) return;
        super.update(time, delta);
        this.ifSuccess();
        
        // 更新成功判定区域的遮罩位置，使其跟随相机移动
        if(this.successMaskCircle && this.planets[0]) {
            const earth = this.planets[0];
            this.successMaskCircle.x = earth.x;
            this.successMaskCircle.y = earth.y;
        }
    }
    

    initializePlanets() {
        this.initialPlanetPositions = [];
        this.initialPlanetPositions.push({x: this.centerX, y: this.centerY});
        this.planets.push(new PlanetEarth(this, this.initialPlanetPositions[0].x, this.initialPlanetPositions[0].y, 
                                        'scene1earth', 'scene1meatpie', 200, false, 2000))
    }

    initializeSatellites() {
        const height = 400;
        this.initialSatellitePositions = [];
        if (this.planets.length > 0) {
            const planet = this.planets[0];
            const distanceFromCenter = planet.radius + height;
            this.initialSatellitePositions.push({x: this.initialPlanetPositions[0].x + distanceFromCenter, 
                                                y: this.initialPlanetPositions[0].y});
            this.satellites.push(new SatelliteMoon(this, this.initialSatellitePositions[0].x, this.initialSatellitePositions[0].y, 
                'scene1moon', this.planets, false, 60, this.gravitySystem, true));
        }
    }

    initializeRocket() {
        const height = 500;
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
            this.rocket = new Rocket11(this, this.initialRocketPosition.x, 
                this.initialRocketPosition.y, 'cartoon_rocket', this.planets, false, 30, this.gravitySystem, true, false);
        }
    }
    
    update(time, delta) {
        if(this.isPaused === true) return;
        super.update(time, delta);
        this.ifSuccess();
    }

    ifSuccess() {
        const successBoundary = 1000;
        const uiScene = this.scene.get('UISceneEarth');
        if(this.gameStarted === true && this.planets[0] && this.planets[0].earthCollapse === true && this.distance > successBoundary) {
            this.isPaused = true;
            this.physics.world.pause();
            this.tweens.pauseAll();

            console.log('enter Success');
            uiScene.showSuccessText();
        }
    }

    // 开始冒险流程
    startAdventure() {
        console.log('开始冒险流程');
        this.gameStarted = true;
        super.resetLeader();
        // 禁用所有按键
        this.disableControls();
        
        // 找到地球
        const earth = this.planets[0];
        if (!earth) return;
        
        // 镜头缓慢平移到地球中心
        this.cameraPanToEarth(earth);
    }
    
    disableControls() {
        // 禁用键盘输入
        if (this.input && this.input.keyboard) {
            this.input.keyboard.enabled = false;
        }
    }
    
    cameraPanToEarth(earth) {
        // 停止相机跟随
        this.cameras.main.stopFollow();
        
        // 镜头缓慢平移到地球中心
        this.tweens.add({
            targets: this.cameras.main,
            scrollX: earth.x - this.cameras.main.width / 2,
            scrollY: earth.y - this.cameras.main.height / 2,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                // 平移完成后设置earthCollapse为true
                this.triggerEarthCollapse(earth);
            }
        });
    }
    
    triggerEarthCollapse(earth) {
        // 设置earthCollapse为true
        earth.earthCollapse = true;
        
        // 显示成功判定区域的overlayer
        this.showSuccessAreaOverlay();
        
        // 显示提示信息
        this.showEarthCollapseMessage();
        
        // 迅速恢复正常
        this.time.delayedCall(1500, () => {
            this.restoreNormal();
        });
    }
    
    showEarthCollapseMessage() {
        // 获取UI场景
        if (this.uiScene) {
            this.uiScene.showEarthCollapseMessage();
        }
    }
    
    restoreNormal() {
        // 恢复按键控制
        if (this.input && this.input.keyboard) {
            this.input.keyboard.enabled = true;
        }
        
        // 重新开始相机跟随
        if (this.cameraFollow && this.leader) {
            // 镜头缓慢移动到leader并缩放为0.5
            this.tweens.add({
                targets: this.cameras.main,
                scrollX: this.leader.x - this.cameras.main.width / 2,
                scrollY: this.leader.y - this.cameras.main.height / 2,
                zoom: 0.5,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => {
                    // 移动完成后开始相机跟随
                    this.cameras.main.startFollow(this.leader);
                    this.cameras.main.setLerp(this.cameraSmoothness, this.cameraSmoothness);
                }
            });
        }
        
        console.log('游戏已恢复正常');
    }
    
    // 重写resetLeader方法，确保按R键重置时也会重置开始游戏后的内容
    resetLeader() {
        // 调用父类的resetLeader方法
        super.resetLeader();
        
        // 重置地球的崩塌状态
        const earth = this.planets[0];
        if (earth) {
            earth.earthCollapse = false;
        }
        
        // 撤除成功判定区域的覆盖层
        if (this.successOuterArea) {
            this.successOuterArea.destroy();
            this.successOuterArea = null;
        }
        if (this.successMaskCircle) {
            this.successMaskCircle.destroy();
            this.successMaskCircle = null;
        }
        
        // 确保UI场景中的所有显示也被重置
        const uiScene = this.scene.get('UISceneEarth');
        if (uiScene) {
            
            // 销毁碰撞提示语
            if (uiScene.collisionHintText) {
                uiScene.collisionHintText.destroy();
                uiScene.collisionHintText = null;
            }
            
            // 销毁地球崩塌提示语
            if (uiScene.collapseMessageText) {
                uiScene.collapseMessageText.destroy();
                uiScene.collapseMessageText = null;
            }
            
            // 销毁教程文本
            if (uiScene.tutorialText) {
                uiScene.tutorialText.destroy();
                uiScene.tutorialText = null;
            }
            
            // 销毁冷却提示语
            if (uiScene.cooldownTutorialText) {
                uiScene.cooldownTutorialText.destroy();
                uiScene.cooldownTutorialText = null;
            }
            
            // 销毁最终提示语
            if (uiScene.finalMessageText) {
                uiScene.finalMessageText.destroy();
                uiScene.finalMessageText = null;
            }
            
            // 移除所有覆盖层
            if (uiScene.overlays && uiScene.overlays.length > 0) {
                uiScene.overlays.forEach(overlay => {
                    overlay.destroy();
                });
                uiScene.overlays = [];
            }

            if (uiScene.tutorialStep >= uiScene.tutorialSteps.length) {
                this.startAdventure();
            }
        }
        console.log('SceneEarth 已完全重置');
    }
    
    // 重写checkLeaderBoundaries方法，禁用飞出过远重置
    checkLeaderBoundaries() {
        if(this.gameStarted === true && this.planets[0] && this.planets[0].earthCollapse === true) {
            super.checkLeaderBoundaries();
        }
    }
}

export class UISceneEarth extends GenericUIScene {
    constructor() {
        super('UISceneEarth');
        this.tutorialStep = 0;
        this.tutorialText = null;
        this.collisionHintText = null;
        this.tutorialSteps = [
            { key: 'W', text: '按 W/S/A/D 喷气(可同时按)' }, 
            { key: 'SPACE', text: '按空格+W/S/A/D增加推力' },
            { key: 'PLUS', text: '按 +/- 放大缩小，放大星图' },
        ];
        this.mainScene = null; // 稍后在 create 方法中初始化
    }
    
    create() {
        super.create();
        
        // 初始化主场景引用
        this.mainScene = this.scene.get('SceneEarth');
        //console.log("mainScene initialized:", this.mainScene);
        
        // 开始第一个教程步骤
        this.startNextTutorialStep();
    }
    
    setUpCustomUIElements() {
        // 初始为空，教程文本会在步骤中动态创建
        this.customUIElements = [];
    }
    
    startNextTutorialStep() {
        if (this.tutorialStep < this.tutorialSteps.length) {
            const step = this.tutorialSteps[this.tutorialStep];
            this.createTutorialText(step.text);
            
            // 添加对应按键的监听
            this.input.keyboard.once(`keydown-${step.key}`, () => {
                this.hideTutorialText();
            });
        }
    }
    
    createTutorialText(text) {
        // 清除之前的提示语
        if (this.tutorialText) {
            this.tutorialText.destroy();
        }
        
        // 创建新的提示语
        this.tutorialText = this.add.text(
            20,
            150,
            text,
            {
                fontSize: '20px',
                fill: '#ffff00',
                backgroundColor: '#00000080',
                padding: { x: 15, y: 10 }
            }
        );
        this.tutorialText.setScrollFactor(0);
        this.tutorialText.setDepth(999);
        if (this.UILayer) {
            this.UILayer.add(this.tutorialText);
        }
    }
    
    hideTutorialText() {
        if (this.tutorialText) {
            this.tutorialText.visible = false;
        }
        
        // 如果是W键（第一个步骤），显示冷却提示
        if (this.tutorialStep === 0) {
            // 停留一秒后显示冷却提示
            this.time.delayedCall(1000, () => {
                this.showCooldownTutorial();
            });
        } else {
            // 其他步骤，直接进入下一步
                this.tutorialStep++;
                
                // 检查是否所有教程步骤都已完成
                if (this.tutorialStep < this.tutorialSteps.length) {
                    // 每两步之间添加3秒间隔
                    this.time.delayedCall(3000, () => {
                        this.startNextTutorialStep();
                    });
                } else {
                    // 所有教程步骤完成，显示最终提示
                    this.time.delayedCall(3000, () => {
                        this.showFinalMessage();
                    });
                }
        }
    }
    
    showCooldownTutorial() {
        // 创建覆盖层（除冷却时间窗口外）
        this.createOverlay();
        
        // 在冷却时间显示框旁边添加提示语
        const screenWidth = this.cameras.main.width;
        this.cooldownTutorialText = this.add.text(
            screenWidth - 200,
            40,
            '引擎过热后会冷却',
            {
                fontSize: '16px',
                fill: '#ffffff',
                backgroundColor: '#00000080',
                padding: { x: 10, y: 5 }
            }
        );
        this.cooldownTutorialText.setOrigin(1, 0.5);
        this.cooldownTutorialText.setScrollFactor(0);
        this.cooldownTutorialText.setDepth(1001); // 确保在覆盖层之上
        
        // 停止整个界面两秒钟
        if (this.mainScene) {
            this.mainScene.isPaused = true;
            this.mainScene.physics.world.pause();
            this.mainScene.tweens.pauseAll();
        }
        
        // 两秒后恢复正常
        this.time.delayedCall(2000, () => {
            this.hideCooldownTutorial();
            if (this.mainScene) {
                this.mainScene.isPaused = false;
                this.mainScene.physics.world.resume();
                this.mainScene.tweens.resumeAll();
            }
            
            // 进入下一个教程步骤
            this.tutorialStep++;
            
            // 检查是否所有教程步骤都已完成
            if (this.tutorialStep < this.tutorialSteps.length) {
                // 每两步之间添加3秒间隔
                this.time.delayedCall(3000, () => {
                    this.startNextTutorialStep();
                });
            } else {
                // 所有教程步骤完成，显示最终提示
                this.time.delayedCall(3000, () => {
                    this.showFinalMessage();
                });
            }
        });
    }
    
    createOverlay() {
        // 获取屏幕尺寸
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        
        // 冷却时间显示区域的位置和大小
        const cooldownAreaWidth = 250;
        const cooldownAreaHeight = 60;
        const cooldownAreaX = screenWidth - cooldownAreaWidth;
        const cooldownAreaY = 0;
        
        // 创建覆盖层数组，用于后续清理
        this.overlays = [];
        
        // 创建左上角覆盖层
        const topLeftOverlay = this.add.rectangle(
            cooldownAreaX / 2,
            screenHeight / 2,
            cooldownAreaX,
            screenHeight,
            0x000000,
            0.7
        );
        topLeftOverlay.setScrollFactor(0);
        topLeftOverlay.setDepth(1000);
        this.overlays.push(topLeftOverlay);
        
        // 创建右下角覆盖层
        const bottomRightOverlay = this.add.rectangle(
            screenWidth - cooldownAreaWidth / 2,
            cooldownAreaY + cooldownAreaHeight + (screenHeight - cooldownAreaHeight) / 2,
            cooldownAreaWidth,
            screenHeight - cooldownAreaHeight,
            0x000000,
            0.7
        );
        bottomRightOverlay.setScrollFactor(0);
        bottomRightOverlay.setDepth(1000);
        this.overlays.push(bottomRightOverlay);
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
                    this.scene.stop('SceneEarth')
                    this.scene.start('Game');
                });
    }

    hideCooldownTutorial() {
        // 移除提示语
        if (this.cooldownTutorialText) {
            this.cooldownTutorialText.destroy();
            this.cooldownTutorialText = null;
        }
        
        // 移除覆盖层
        if (this.overlays && this.overlays.length > 0) {
            this.overlays.forEach(overlay => {
                overlay.destroy();
            });
            this.overlays = [];
        }
    }
    
    update() {
        // 每帧检查火箭的 isattached 状态
        //console.log("update called");
        this.checkRocketAttached();
    }
    
    checkRocketAttached() {
        //console.log("checkRocketAttached called");
        // 使用已初始化的主场景引用
        //console.log("this.mainScene:", this.mainScene);
        if (this.mainScene) {
            //console.log("this.mainScene.rocket:", this.mainScene.rocket);
            if (this.mainScene.rocket) {
                //console.log("this.mainScene.rocket.isAttached:", this.mainScene.rocket.isAttached);
                //console.log("this.collisionHintText:", this.collisionHintText);
                if (this.mainScene.rocket.isAttached === true && !this.collisionHintText) {
                    //console.log("Showing collision hint");
                    this.showCollisionHint();
                }
            }
        }
    }
    
    showCollisionHint() {
        // 创建碰撞提示语
        this.collisionHintText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            '按 R 重置游戏',
            {
                fontSize: '24px',
                fill: '#ff0000',
                backgroundColor: '#00000080',
                padding: { x: 20, y: 15 }
            }
        );
        this.collisionHintText.setOrigin(0.5);
        this.collisionHintText.setScrollFactor(0);
        this.collisionHintText.setDepth(1002);
        
        // 添加R键监听，按下后隐藏提示
        this.input.keyboard.once('keydown-R', () => {
            if (this.collisionHintText) {
                this.collisionHintText.destroy();
                this.collisionHintText = null;
            }
        });
    }
    
    showFinalMessage() {
        // 创建最终提示语
        this.finalMessageText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            '现在我们正式开始冒险吧！',
            {
                fontSize: '32px',
                fill: '#ffffff',
                backgroundColor: '#00000080',
                padding: { x: 30, y: 20 }
            }
        );
        this.finalMessageText.setOrigin(0.5);
        this.finalMessageText.setScrollFactor(0);
        this.finalMessageText.setDepth(1003);
        
        // 停留3秒后执行后续操作
        this.time.delayedCall(3000, () => {
            if (this.finalMessageText) {
                this.finalMessageText.destroy();
                this.finalMessageText = null;
            }
            
            // 调用主场景的开始冒险方法
            if (this.mainScene && this.mainScene.startAdventure) {
                this.mainScene.startAdventure();
            }
        });
    }
    
    showEarthCollapseMessage() {
        // 确保之前的提示信息已经被销毁
        if (this.collapseMessageText) {
            this.collapseMessageText.destroy();
            this.collapseMessageText = null;
        }
        
        // 创建提示信息
        this.collapseMessageText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 100,
            '重力忽然变大\n地球被压成了肉饼！',
            {
                fontSize: '28px',
                fill: '#ff0000',
                backgroundColor: '#00000080',
                padding: { x: 20, y: 15 },
                align: 'center'
            }
        );
        this.collapseMessageText.setOrigin(0.5);
        this.collapseMessageText.setScrollFactor(0);
        this.collapseMessageText.setDepth(1004);
        
        // 1.5秒后移除提示信息
        this.time.delayedCall(1500, () => {
            if (this.collapseMessageText) {
                this.collapseMessageText.destroy();
                this.collapseMessageText = null;
            }
        });
    }

    showSuccessAreaOverlay() {
        // 显示成功判定区域的overlayer
        if(this.mainScene && this.mainScene.planets[0]) {
            const earth = this.mainScene.planets[0];
            const successBoundary = 1000;
            
            const successArea = this.add.circle(
                earth.x,
                earth.y,
                successBoundary,
                0x00ff00,
                0.2
            );
            successArea.setDepth(-50); // 设置在背景之上，行星之下
            successArea.setScrollFactor(0); // 固定位置，不随相机移动
        }
    }
    
    // 清理资源
    destroy() {
        // 移除教程文本
        if (this.tutorialText) {
            this.tutorialText.destroy();
            this.tutorialText = null;
        }
        
        // 移除碰撞提示语
        if (this.collisionHintText) {
            this.collisionHintText.destroy();
            this.collisionHintText = null;
        }
        
        // 移除最终提示语
        if (this.finalMessageText) {
            this.finalMessageText.destroy();
            this.finalMessageText = null;
        }
        
        // 移除地球崩塌提示语
        if (this.collapseMessageText) {
            this.collapseMessageText.destroy();
            this.collapseMessageText = null;
        }
        
        // 移除冷却提示语
        if (this.cooldownTutorialText) {
            this.cooldownTutorialText.destroy();
            this.cooldownTutorialText = null;
        }
        
        // 移除覆盖层
        if (this.overlays && this.overlays.length > 0) {
            this.overlays.forEach(overlay => {
                overlay.destroy();
            });
            this.overlays = [];
        }
        
        // 移除成功文本
        if (this.successText) {
            this.successText.destroy();
            this.successText = null;
        }
        
        // 调用父类的destroy方法
        super.destroy();
    }
}