import { PlanetDual } from '../../../AdventureObjects/DualPlanets/PlanetDual.js';
import { Rocket23 } from '../../../AdventureObjects/DualPlanets/Rocket23.js';
import { Satellite23 } from '../../../AdventureObjects/DualPlanets/Satellite23.js';
import { GenericScene, GenericUIScene } from '../../../generalClasses/GenericScene.js';

export class SceneDualPlanets extends GenericScene {
    constructor() {
        super('SceneDualPlanets', false, 'rocket', false, 'UISceneDualPlanets');
    }

    create() {
        super.create();
        const uiScene = this.scene.get('UISceneDualPlanets');
        this.uiScene = uiScene;

        this.showSuccessAreaOverlay();
    }
    
    setupZoomControls() {
        super.setupZoomControls();
        // 缩放范围
        this.minZoom = 0.1;
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
        const bg = this.add.image(centerX, centerY, 'bg2');
        bg.setDepth(-100); // 设置背景为最底层
        bg.setScale(2); // 背景图片放大x倍
        
        // 设置初始相机缩放
        this.cameras.main.setZoom(0.72); // 设置相机缩放值为0.72（原来的0.9减少20%）
    }

    showSuccessAreaOverlay() {
        // 显示成功判定区域的overlayer
        if(this.planetDual) {
            const planet1X = this.planetDual.planet1.x;
            const planet1Y = this.planetDual.planet1.y;
            const planet2X = this.planetDual.planet2.x;
            const planet2Y = this.planetDual.planet2.y;
            
            // 计算两颗星球的正中间位置
            const midX = (planet1X + planet2X) / 2;
            const midY = (planet1Y + planet2Y) / 2;
            
            // 创建成功判定区域的圆形
            this.successArea = this.add.circle(
                midX,
                midY,
                30, // 半径
                0x00ff00,
                0.2
            );
            this.successArea.setDepth(-50); // 设置在背景之上，行星之下
            // 不设置scrollFactor为0，这样它会随相机移动
        }
    }
    

    initializePlanets() {
        this.initialPlanetPositions = [];
        this.planets = [];
        this.initialPlanetPositions.push({x: this.centerX - 800, y: this.centerY});
        this.initialPlanetPositions.push({x: this.centerX + 800, y: this.centerY});
        this.planetDual = new PlanetDual(this, this.initialPlanetPositions[0].x, this.initialPlanetPositions[0].y, 
        this.initialPlanetPositions[1].x, this.initialPlanetPositions[1].y, 'planet_angry_spriteSheet', 'planet_angry_spriteSheet', 200, 200, 10000, 10000);
        this.planets.push(this.planetDual.planet1);
        this.planets.push(this.planetDual.planet2);
    }

    initializeSatellites() {
        // 在双行星场景中不需要卫星
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
            this.rocket = new Rocket23(this, this.initialRocketPosition.x, 
                this.initialRocketPosition.y, 'cartoon_rocket', this.planets, false, 30, this.gravitySystem, true, false);
            
            // 设置火箭为leader，以便相机能够跟随它
            this.leader = this.rocket;
        }
    }

    checkLeaderBoundaries() {
        // 取消边际限制
    }

    update(time, delta) {
        if(this.isPaused === true) return;
        this.planetDual.update(time, delta);
        super.update(time, delta);
        this.ifSuccess();
        
        // 更新成功判定区域的位置
        this.updateSuccessAreaOverlay();
    }

    updateSuccessAreaOverlay() {
        // 更新成功判定区域的位置
        if(this.successArea && this.planetDual) {
            const planet1X = this.planetDual.planet1.x;
            const planet1Y = this.planetDual.planet1.y;
            const planet2X = this.planetDual.planet2.x;
            const planet2Y = this.planetDual.planet2.y;
            
            // 计算两颗星球的正中间位置
            const midX = (planet1X + planet2X) / 2;
            const midY = (planet1Y + planet2Y) / 2;
            
            // 更新成功判定区域的位置
            this.successArea.x = midX;
            this.successArea.y = midY;
        }
    }

    ifSuccess() {
        if(this.leader && this.planetDual) {
            const planet1X = this.planetDual.planet1.x;
            const planet1Y = this.planetDual.planet1.y;
            const planet2X = this.planetDual.planet2.x;
            const planet2Y = this.planetDual.planet2.y;
            
            // 计算两颗星球的正中间位置
            const midX = (planet1X + planet2X) / 2;
            const midY = (planet1Y + planet2Y) / 2;
            
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

export class UISceneDualPlanets extends GenericUIScene {
    constructor() {
        super('UISceneDualPlanets');
        this.mainScene = null; // 稍后在 create 方法中初始化
        this.gravityArrow = null; // 指向成功区域的箭头
    }

    create() {
        super.create();
        
        // 初始化主场景引用
        this.mainScene = this.scene.get('SceneDualPlanets');
        
        // 创建指向成功区域的箭头
        this.createGravityArrow();
    }
    
    // 创建指向成功区域的箭头
    createGravityArrow() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        
        // 创建箭头图像
        this.gravityArrow = this.add.image(screenWidth / 2, screenHeight / 2, 'arrow');
        this.gravityArrow.setScrollFactor(0); // 不随相机移动
        this.gravityArrow.setDepth(1000); // 确保在UI层上，设置更高的深度
        this.gravityArrow.setScale(0.2); // 缩小箭头60%
        this.gravityArrow.visible = true; // 初始可见
    }
    
    update(time, delta) {
        super.update(time, delta);
        this.updateArrowPosition();
    }
    
    // 更新箭头位置和方向
    updateArrowPosition() {
        if (!this.mainScene || !this.mainScene.leader || !this.mainScene.planetDual) {
            if (this.gravityArrow) {
                this.gravityArrow.visible = false;
            }
            return;
        }
        
        // 检查是否已经显示成功文本，如果是则隐藏箭头
        if (this.successText) {
            if (this.gravityArrow) {
                this.gravityArrow.visible = false;
            }
            return;
        }
        
        // 检查successArea是否在相机画面中
        if (this.isSuccessAreaInCamera()) {
            if (this.gravityArrow) {
                this.gravityArrow.visible = false;
            }
            return;
        }
        
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        const screenCenterX = screenWidth / 2;
        const screenCenterY = screenHeight / 2;
        
        // 获取火箭位置
        const rocketX = this.mainScene.leader.x;
        const rocketY = this.mainScene.leader.y;
        
        // 计算两颗星球的正中间位置（成功区域位置）
        const planet1X = this.mainScene.planetDual.planet1.x;
        const planet1Y = this.mainScene.planetDual.planet1.y;
        const planet2X = this.mainScene.planetDual.planet2.x;
        const planet2Y = this.mainScene.planetDual.planet2.y;
        const successAreaX = (planet1X + planet2X) / 2;
        const successAreaY = (planet1Y + planet2Y) / 2;
        
        // 计算从火箭到成功区域的向量
        const dx = successAreaX - rocketX;
        const dy = successAreaY - rocketY;
        
        // 计算向量长度
        const length = Math.sqrt(dx * dx + dy * dy);
        
        // 计算单位向量
        const unitX = dx / length;
        const unitY = dy / length;
        
        // 只调整箭头大小，保持半径不变
        const baseRadius = 260;
        const baseScale = 0.2;
        const radius = baseRadius; // 保持半径不变
        const arrowScale = baseScale; // 箭头大小固定，不随相机缩放改变
        
        // 计算箭头在以屏幕中心为圆心的圆周上的位置
        const arrowX = screenCenterX + unitX * radius;
        const arrowY = screenCenterY + unitY * radius;
        
        // 更新箭头位置
        this.gravityArrow.setPosition(arrowX, arrowY);
        
        // 更新箭头大小
        this.gravityArrow.setScale(arrowScale);
        
        // 计算箭头的旋转角度（弧度）
        const angle = Math.atan2(dy, dx);
        
        // 更新箭头旋转角度
        this.gravityArrow.setRotation(angle);
        
        // 确保箭头可见
        this.gravityArrow.visible = true;
    }
    
    // 检查successArea是否在相机画面中
    isSuccessAreaInCamera() {
        if (!this.mainScene || !this.mainScene.successArea || !this.mainScene.cameras || !this.mainScene.cameras.main) {
            return false;
        }
        
        const camera = this.mainScene.cameras.main;
        const successArea = this.mainScene.successArea;
        const zoom = camera.zoom;

        // 获取相机视口的边界
        const cameraLeft = camera.scrollX + camera.width / 2 - camera.width/(2 * zoom);
        const cameraRight = camera.scrollX + camera.width / 2 + camera.width/(2 * zoom);
        const cameraTop = camera.scrollY + camera.height/2 - camera.height/(2*zoom);
        const cameraBottom = camera.scrollY + camera.height/2 + camera.height/(2*zoom);
        //console.log('cameraLeftRightTopBottom', cameraLeft, cameraRight, cameraTop, cameraBottom);
        // 获取successArea的边界
        const successAreaLeft = successArea.x - successArea.radius;
        const successAreaRight = successArea.x + successArea.radius;
        const successAreaTop = successArea.y - successArea.radius;
        const successAreaBottom = successArea.y + successArea.radius;
        //console.log('successArea:', successAreaLeft, successAreaRight, successAreaTop, successAreaBottom);
        // 检查successArea是否与相机视口相交
        return !(successAreaRight < cameraLeft || 
                 successAreaLeft > cameraRight || 
                 successAreaBottom < cameraTop || 
                 successAreaTop > cameraBottom);
    }

    showSuccessAreaOverlay() {
        // 显示成功判定区域的overlayer
        if(this.mainScene && this.mainScene.planetDual) {
            const planet1X = this.mainScene.planetDual.planet1.x;
            const planet1Y = this.mainScene.planetDual.planet1.y;
            const planet2X = this.mainScene.planetDual.planet2.x;
            const planet2Y = this.mainScene.planetDual.planet2.y;
            
            // 计算两颗星球的正中间位置
            const midX = (planet1X + planet2X) / 2;
            const midY = (planet1Y + planet2Y) / 2;
            
            // 创建成功判定区域的圆形
            const successArea = this.add.circle(
                midX,
                midY,
                150, // 半径
                0x00ff00,
                0.2
            );
            successArea.setDepth(-50); // 设置在背景之上，行星之下
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

        // 记录场景完成状态
        const completedScenes = JSON.parse(localStorage.getItem('completedScenes') || '[]');
        if (!completedScenes.includes('SceneDualPlanets')) {
            completedScenes.push('SceneDualPlanets');
            localStorage.setItem('completedScenes', JSON.stringify(completedScenes));
        }

        this.time.delayedCall(3000, () => {
                    this.scene.stop('SceneDualPlanets');
                    this.scene.start('MapScene', { mode: localStorage.getItem('mapSceneMode') || 'adventure' });
                });
    }
}
