import { GenericPlanet } from './GenericPlanet.js';
import { GenericRocket } from './GenericRocket.js';
import { GenericSatellite } from './GenericSatellite.js';
import { GravitySystem } from '../Engines/GravitySystem.js';
export class GenericScene extends Phaser.Scene {
    constructor(sceneKey, cameraFollow, leader_str, powerManipulation, sceneKeyUI) {
        if (!sceneKey || !sceneKeyUI) {
          throw new Error('必须提供sceneKey和SceneKeyUI参数');
        }
        super(sceneKey);
        this.sceneKey = sceneKey;
        this.sceneKeyUI = sceneKeyUI;
        
        this.leader_str = leader_str;

        // 是否跟随
        this.cameraFollow = cameraFollow;
        //to change power or not
        this.powerManipulation = powerManipulation;
         
        // 相机跟随平滑度
        this.cameraSmoothness = 0.1;

        // 判断是否暂停的bool型
        this.isPaused = false;

        this.previousState = {};
    }
    // 我设置了init用于处理场景切换时重置
    init(data) {
        // 判断是否暂停的bool型
        this.isPaused = false;

        // Scene基类中，设置了一组planets，一组satellites和一个Rocket
        this.planets = [];
        this.satellites = [];
        this.leader = null;
        
        this.gravitySystem = null;

        // initial positions should be arrays of 2Dvectors
        this.initialPlanetPositions = [];
        this.initialSatellitePositions = [];
        this.initialRocketPosition = null;
        
        // 创建说明文本
        this.scene.launch(this.sceneKeyUI);
        this.scene.bringToTop(this.sceneKeyUI);

        // 设置键盘控制
        this.setupKeyboardControls();
    }

    create() {
        
        // 默认只有一个行星，双星系统还没开发，之后再写
        this.initializeBackground();
        
        this.initializePlanets();
        
        
        // 初始化引力系统
        this.gravitySystem = new GravitySystem(this);
        
        // 添加行星到引力系统
        this.planets.forEach((planet, index) => {
            this.gravitySystem.addPlanet(planet, index);
        });
        
        // 现在初始化卫星和火箭，因为引力系统已经准备好了
        this.initializeSatellites();
        
        this.initializeRocket();
        
        
        // 添加卫星和火箭到引力系统
        this.satellites.forEach(satellite => {
            this.gravitySystem.addSatellite(satellite);
        });
        this.gravitySystem.addSatellite(this.rocket);
        
        // 设置了rocket和Satellite之后再确定camera跟随的对象,若有多个卫星则默认跟随第一个
        if(this.cameraFollow) {
            if(this.leader_str === 'rocket' && this.rocket !== null) {
                this.leader = this.rocket;
            }
            else if(this.leader_str === 'satellite' && this.satellites.length > 0 && this.satellites[0] !== null) {
                this.leader = this.satellites[0];
            }
            else {
                console.log('Leader unplaced. Camera cannot follow.')
            }

            // 设置相机跟随火箭
            this.cameras.main.startFollow(this.leader);
        
            // 设置相机跟随的平滑度
            this.cameras.main.setLerp(this.cameraSmoothness, this.cameraSmoothness);
        
            
        }
          
    }

    // 这几个方法需要在继承类中实现！（初始化）
    initializeBackground() {}

    initializePlanets() {}

    initializeSatellites() {}

    initializeRocket() {}

    setupKeyboardControls() {
        // 获取键盘输入
        const keys = this.input.keyboard.addKeys({
            r: Phaser.Input.Keyboard.KeyCodes.R,            // 重置leader位置
            pause: Phaser.Input.Keyboard.KeyCodes.ESC,       // 按空格键实现暂停
            h: Phaser.Input.Keyboard.KeyCodes.H             // 显示/隐藏说明文本
        });
        
        this.input.keyboard.on('keydown-R', () => this.resetLeader());
        this.input.keyboard.on('keydown-ESC', () => this.gamePause());
        this.input.keyboard.on('keydown-H', () => this.toggleInstructions());
        
        // 设置缩放控制
        this.setupZoomControls();
    }
    
    // 切换说明文本的可见性
    toggleInstructions() {
        const uiScene = this.scene.get(this.sceneKeyUI);
        if (uiScene && uiScene.toggleInstructions) {
            uiScene.toggleInstructions();
        }
    }
    
    // 设置缩放控制
    setupZoomControls() {
        // 缩放范围
        this.minZoom = 0.42; // 原来的0.6减少30%
        this.maxZoom = 4;
        
        // 缩放步长（增大以获得更明显的变化）
        this.zoomStep = 0.2;
        
        // 缩放动画标志
        this.isZooming = false;
        
        // 键盘缩放控制
        this.input.keyboard.on('keydown-PLUS', () => this.zoomIn());
        this.input.keyboard.on('keydown-EQUALS', () => this.zoomIn()); // 等号键作为备用
        this.input.keyboard.on('keydown-MINUS', () => this.zoomOut());
        
        // 鼠标滚轮缩放控制（平滑动画）
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            if (this.isZooming) return; // 如果正在缩放动画中，忽略新的滚轮事件
            
            const currentZoom = this.cameras.main.zoom;
            let targetZoom;
            
            if (deltaY < 0) {
                // 放大
                targetZoom = Math.min(currentZoom + this.zoomStep, this.maxZoom);
            } else if (deltaY > 0) {
                // 缩小
                targetZoom = Math.max(currentZoom - this.zoomStep, this.minZoom);
            }
            
            // 如果目标缩放值与当前值不同，执行平滑缩放动画
            if (targetZoom && targetZoom !== currentZoom) {
                this.smoothZoomTo(targetZoom);
            }
        });
    }
    
    // 放大
    zoomIn() {
        const currentZoom = this.cameras.main.zoom;
        if (currentZoom < this.maxZoom) {
            const targetZoom = Math.min(currentZoom + this.zoomStep, this.maxZoom);
            this.smoothZoomTo(targetZoom);
        }
    }
    
    // 缩小
    zoomOut() {
        const currentZoom = this.cameras.main.zoom;
        if (currentZoom > this.minZoom) {
            const targetZoom = Math.max(currentZoom - this.zoomStep, this.minZoom);
            this.smoothZoomTo(targetZoom);
        }
    }
    
    // 平滑缩放动画
    smoothZoomTo(targetZoom) {
        if (this.isZooming) return;
        
        this.isZooming = true;
        
        // 使用tween创建平滑的缩放动画
        this.tweens.add({
            targets: this.cameras.main,
            zoom: targetZoom,
            duration: 200, // 动画持续时间（毫秒）
            ease: 'Power2', // 缓动函数
            onComplete: () => {
                this.isZooming = false;
            }
        });
    }

    resetLeader() {
        // 完全重置整个场景
        this.destroyAllItems();
        
        // 重新初始化所有元素
        this.initializePlanets();
        
        // 重新初始化引力系统
        this.gravitySystem = new GravitySystem(this);

        this.initializeRocket();
        this.initializeSatellites();
        
        // 添加行星到引力系统
        this.planets.forEach((planet, index) => {
            this.gravitySystem.addPlanet(planet, index);
        });
        
        // 添加卫星到引力系统
        this.satellites.forEach(satellite => {
            this.gravitySystem.addSatellite(satellite);
        });
        this.gravitySystem.addSatellite(this.rocket);
        
        
        // 重新设置相机跟随
        if(this.cameraFollow) {
            if(this.leader_str === 'rocket' && this.rocket !== null) {
                this.leader = this.rocket;
            }
            else if(this.leader_str === 'satellite' && this.satellites.length > 0 && this.satellites[0] !== null) {
                this.leader = this.satellites[0];
            }
            else {
                console.log('Leader unplaced. Camera cannot follow.')
            }

            // 设置相机跟随
            this.cameras.main.startFollow(this.leader);
            
            // 重置相机缩放为0.9
            this.cameras.main.setZoom(1.5);
        }
        
        // 清除所有警告和状态显示
        if (this.thrustDurationText) {
            this.thrustDurationText.visible = false;
        }
        if (this.cooldownText) {
            this.cooldownText.visible = false;
        }
        if (this.energyStateText) {
            this.energyStateText.visible = false;
        }
        
        // 确保火箭的燃油警告被清除
        if (this.rocket && this.rocket.resetToInitialState) {
            this.rocket.resetToInitialState();
        }
        
        // 清除UI场景中的所有显示
        const uiScene = this.scene.get(this.sceneKeyUI);
        if (uiScene && uiScene.clearUIDisplay) {
            uiScene.clearUIDisplay();
        }
        
        console.log('游戏已重新开始');
    }
    
    destroyAllItems() {
        // 销毁火箭
        if(this.rocket) {
            this.rocket.destroy();
            this.rocket = null;
        }
        
        // 销毁卫星
        if(this.satellites) {
            for(const satellite of this.satellites) {
                if(satellite) {
                    satellite.destroy();
                }
            }
            this.satellites = [];
        }
        
        // 销毁行星
        if(this.planets) {
            for(const planet of this.planets) {
                if(planet) {
                    planet.destroy();
                }
            }
            this.planets = [];
        }

        this.gravitySystem.destroy();
        this.gravitySystem = null;
        
        // 重置初始位置数组
        this.initialPlanetPositions = [];
        this.initialSatellitePositions = [];
        this.initialRocketPosition = null;
    }
    
    destroyMovingItems() {
        if(this.rocket) {
            this.rocket.destroy();
            this.rocket = null;
        }
        if(this.satellites) {
            for(const satellite of this.satellites) {
                if(satellite) {
                    satellite.destroy();
                }
            }
            this.satellites = [];
        }
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
        
        // 移除UI场景中的暂停覆盖层
        const uiScene = this.scene.get(this.sceneKeyUI);
        if (uiScene && uiScene.removePauseOverlay) {
            uiScene.removePauseOverlay();
        }
        
        // 移除当前场景中的暂停覆盖层（后备方案）
        this.removePauseOverlay();
    }
    
    // 回到个人准备界面
    goToMainMenu() {
        // 移除UI场景中的暂停覆盖层
        const uiScene = this.scene.get(this.sceneKeyUI);
        if (uiScene && uiScene.removePauseOverlay) {
            uiScene.removePauseOverlay();
        }
        
        // 移除当前场景中的暂停覆盖层（后备方案）
        this.removePauseOverlay();
        
        // 使用UI场景的黑入效果
        const uiSceneInstance = this.scene.get(this.sceneKeyUI);
        if (uiSceneInstance && uiSceneInstance.fadeOut) {
            uiSceneInstance.fadeOut(() => {
                this.scene.stop(this.sceneKeyUI);
                // 启动个人准备界面场景
                this.scene.start('PreparationScene', {
                            fromScene: this.sceneKey,
                            previousState: this.previousState
                        });
            });
        } else {
            // 后备方案：如果UI场景不存在，直接切换场景
            this.scene.stop(this.sceneKeyUI);
            this.scene.start('PreparationScene', {
                        fromScene: this.sceneKey,
                        previousState: this.previousState
                    });
        }
    }
    
    // 显示暂停覆盖层
    showPauseOverlay() {
        // 获取UI场景
        const uiScene = this.scene.get(this.sceneKeyUI);
        if (uiScene && uiScene.showPauseOverlay) {
            uiScene.showPauseOverlay();
        } else {
            // 后备方案：如果UI场景不存在，使用当前场景
            // 获取相机中心位置和尺寸
            const cameraCenterX = this.cameras.main.centerX;
            const cameraCenterY = this.cameras.main.centerY;
            const cameraWidth = this.cameras.main.width;
            const cameraHeight = this.cameras.main.height;
            
            // 创建半透明黑色覆盖层，使用相机的实际尺寸
            this.pauseOverlay = this.add.rectangle(cameraCenterX, cameraCenterY, cameraWidth * 2, cameraHeight * 2, 0x000000, 0.5);
            this.pauseOverlay.setDepth(1000);
            this.pauseOverlay.setScrollFactor(0); // 不随相机移动
            
            // 创建暂停文字
            this.pauseText = this.add.text(cameraCenterX, cameraCenterY - 110, '游戏暂停', {
                fontSize: '48px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                fontFamily: 'Arial, sans-serif',
                padding: { x: 10, y: 10 }
            });
            this.pauseText.setOrigin(0.5);
            this.pauseText.setDepth(1001);
            this.pauseText.setScrollFactor(0); // 不随相机移动
            
            // 创建提示文字
            this.instructionText = this.add.text(cameraCenterX, cameraCenterY - 40, '按ESC继续游戏', {
                fontSize: '20px',
                fill: '#ffff00',
                backgroundColor: '#00000080',
                padding: { x: 10, y: 10 },
                fontFamily: 'Arial, sans-serif'
            });
            this.instructionText.setOrigin(0.5);
            this.instructionText.setDepth(1001);
            this.instructionText.setScrollFactor(0); // 不随相机移动
            
            // 创建回到个人准备界面提示文字
            this.mainMenuText = this.add.text(cameraCenterX, cameraCenterY + 30, '按Enter回到个人准备界面', {
                fontSize: '20px',
                fill: '#ffff00',
                backgroundColor: '#00000080',
                padding: { x: 10, y: 10 },
                fontFamily: 'Arial, sans-serif'
            });
            this.mainMenuText.setOrigin(0.5);
            this.mainMenuText.setDepth(1001);
            this.mainMenuText.setScrollFactor(0); // 不随相机移动
        }
    }
    
    // 移除暂停覆盖层
    removePauseOverlay() {
        // 移除当前场景中的暂停覆盖层（后备方案）
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

    update(time, delta) {
        // 若暂停则停止更新
        if(this.isPaused) return;
        
        // 更新引力系统（处理键盘控制等）
        if (this.powerManipulation === true && this.gravitySystem) {
            this.gravitySystem.updateKeyboardControls();
        }
        
        // 更新火箭（父类方法会处理物理模拟和控制）
        if (this.rocket) {
            this.rocket.update(time, delta);
        }
        
        if (this.satellites) {
            for(const satellite of this.satellites) {
                satellite.update(time, delta);
            }
        }

        // 更新母行星
        if (this.planets) {
            for(const planet of this.planets) {
                planet.update(time, delta);
            }
        }
        
        // 检查火箭是否飞出边界（如果飞出太远，重置位置）
        this.checkLeaderBoundaries();
        
    }
    
    checkLeaderBoundaries() {
        if (!this.leader) return;
        
        // 定义边界距离（从场景中心算起）
        const maxDistance = 2000;
        
        // 计算火箭到母行星的距离
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
    
    // 清理资源
    destroy() {
        // 移除暂停覆盖层
        this.removePauseOverlay();
        
        // 销毁所有游戏对象
        this.destroyAllItems();
        
        // 移除键盘事件监听器
        if (this.input && this.input.keyboard) {
            // 移除缩放相关的事件监听器
            if (this.cameraFollow) {
                this.input.keyboard.off('keydown-PLUS');
                this.input.keyboard.off('keydown-EQUALS');
                this.input.keyboard.off('keydown-MINUS');
                this.input.keyboard.off('keydown-ZERO');
            }
            // 移除其他事件监听器
            this.input.keyboard.off('keydown-R');
            this.input.keyboard.off('keydown-ESC');
            this.input.keyboard.off('keydown-ENTER', this.goToMainMenu, this);
        }
        
        // 清空数组和变量
        this.planets = [];
        this.satellites = [];
        this.initialPlanetPositions = [];
        this.initialSatellitePositions = [];
        this.initialRocketPosition = null;
        this.leader = null;
        this.zoomKeys = null;
        
        // 调用父类的destroy方法，让Phaser自动处理场景清理
        super.destroy();
    }
    
}


// 为了保证UI不跟着相机缩放，需要单独写一个类
export class GenericUIScene extends Phaser.Scene {
    constructor(sceneKey) {
        super(sceneKey);
        this.instructions = null;
        this.UILayer = null;
        this.cooldownText = null;
        this.energyStateText = null;
        this.thrustDurationText = null;
        this.pauseOverlay = null;
        this.pauseText = null;
        this.instructionText = null;
        this.mainMenuText = null;
        this.instructionsVisible = false; // 说明文本是否可见
        this.instructionTexts = []; // 存储说明文本对象的数组
    }

    create() {
        // 创建UI层，确保UI在最上层但允许overlayer在其之上
        this.UILayer = this.add.layer();
        
        // 创建过渡效果的黑色矩形
        this.createFadeRect();
        
        // 创建控制说明文本
        const defaultStyle = {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#00000080',
            padding: { x: 10, y: 5 }
        };
        
        // 说明文本（与setUpInstructions类似）
        this.setUpInstructions();

        // 在左上角显示说明
        let y = 20;
        this.instructions.forEach(text => {
            const textObj = this.add.text(20, y, text, defaultStyle);
            textObj.setScrollFactor(0);  // 不随相机移动
            textObj.setDepth(999);       // 确保在UILayer上，但允许overlayer在其之上
            textObj.visible = this.instructionsVisible; // 初始隐藏
            this.UILayer.add(textObj);   // 添加到UI层
            this.instructionTexts.push(textObj); // 存储到数组中
            y += 25;
        });
        
        // 创建自定义UI元素（与setUpInstructions类似，通过参数传入位置和文字）
        this.setUpCustomUIElements();
        this.createCustomUILayer(defaultStyle);
        
        // 创建冷却时间显示
        this.createCooldownDisplay();
        
        // 创建剩余加速时间显示
        this.createThrustDurationDisplay();
        
        // 创建能量状态显示
        this.createEnergyStateDisplay();
        
        // 执行黑出效果（场景进入时的淡出动画）
        this.fadeIn();
    }

    // 创建冷却时间显示
    createCooldownDisplay() {
        // 获取屏幕宽度，用于定位到右上角
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        
        // 创建冷却时间显示文本，固定在屏幕右上角（稍微下移）
        this.cooldownText = this.add.text(
            screenWidth - 20, 40, // 右上角位置，下移20px
            '', // 初始为空
            {
                fontSize: '16px',
                fill: '#ff4444', // 亮红色
                backgroundColor: '#00000080',
                padding: { x: 10, y: 5 }
            }
        );
        this.cooldownText.setOrigin(1, 0.5); // 右对齐
        this.cooldownText.setScrollFactor(0); // 固定位置，不随相机移动
        this.cooldownText.setDepth(1001);       // 确保在所有元素之上
        this.cooldownText.visible = false; // 初始隐藏
        this.UILayer.add(this.cooldownText); // 添加到UI层
        
        // 创建冷却状态的屏幕调灰覆盖层
        this.cooldownOverlay = this.add.rectangle(
            screenWidth / 2, screenHeight / 2,
            screenWidth, screenHeight,
            0x000000, 0.1 // 几乎完全透明
        );
        this.cooldownOverlay.setScrollFactor(0);
        this.cooldownOverlay.setDepth(999); // 低于UI文本
        this.cooldownOverlay.visible = false;
        this.UILayer.add(this.cooldownOverlay);
        
        // 创建中间显示的跳动冷却时间文本
        this.cooldownCenterText = this.add.text(
            screenWidth / 2, screenHeight / 4, // 放置在画面上侧
            '',
            {
                fontSize: '48px',
                fill: '#ffffff', // 白色
                fontWeight: 'bold',
                backgroundColor: '#00000080',
                padding: { x: 20, y: 10 }
            }
        );
        this.cooldownCenterText.setOrigin(0.5);
        this.cooldownCenterText.setScrollFactor(0);
        this.cooldownCenterText.setDepth(1002); // 高于其他UI
        this.cooldownCenterText.visible = false;
        this.UILayer.add(this.cooldownCenterText);
    }
    
    // 创建剩余加速时间显示
    createThrustDurationDisplay() {
        // 获取屏幕宽度，用于定位到右上角
        const screenWidth = this.cameras.main.width;
        
        // 创建剩余加速时间显示文本，固定在屏幕右上角，与冷却时间相同位置
        this.thrustDurationText = this.add.text(
            screenWidth - 20, 40, // 右上角位置，与冷却时间相同位置
            '', // 初始为空
            {
                fontSize: '16px',
                fill: '#ffff00', // 黄色
                backgroundColor: '#00000080',
                padding: { x: 10, y: 5 }
            }
        );
        this.thrustDurationText.setOrigin(1, 0.5); // 右对齐，与冷却时间对齐
        this.thrustDurationText.setScrollFactor(0); // 固定位置，不随相机移动
        this.thrustDurationText.setDepth(1001);       // 确保在所有元素之上
        this.thrustDurationText.visible = false; // 初始隐藏
        this.UILayer.add(this.thrustDurationText); // 添加到UI层
    }
    
    // 创建能量状态显示
    createEnergyStateDisplay() {
        // 获取屏幕宽度，用于定位到右上角
        const screenWidth = this.cameras.main.width;
        
        // 创建能量状态显示文本，固定在屏幕右上角，冷却时间下方（相应下移）
        this.energyStateText = this.add.text(
            screenWidth - 20, 80, // 右上角位置，冷却时间下方
            '', // 初始为空
            {
                fontSize: '16px',
                backgroundColor: '#00000080',
                padding: { x: 10, y: 5 }
            }
        );
        this.energyStateText.setOrigin(1, 0.5); // 右对齐
        this.energyStateText.setScrollFactor(0); // 固定位置，不随相机移动
        this.energyStateText.setDepth(1001);       // 确保在所有元素之上
        this.UILayer.add(this.energyStateText); // 添加到UI层
    }
    
    // 更新冷却时间显示
    updateCooldownDisplay(remainingSeconds, visible) {
        if (!this.cooldownText) return;
        
        // 更新冷却时间显示
        this.cooldownText.setText(`冷却: ${remainingSeconds}s`);
        this.cooldownText.visible = visible;
        
        // 更新冷却状态的屏幕调灰覆盖层和中间文本
        if (this.cooldownOverlay && this.cooldownCenterText) {
            this.cooldownOverlay.visible = visible;
            this.cooldownCenterText.visible = visible;
            
            if (visible) {
                // 更新中间冷却时间文本
                this.cooldownCenterText.setText(`冷却: ${remainingSeconds}s`);
                
                // 添加跳动动画
                this.tweens.add({
                    targets: this.cooldownCenterText,
                    scale: 1.2,
                    duration: 300,
                    yoyo: true,
                    repeat: -1
                });
            } else {
                // 停止动画
                this.tweens.killTweensOf(this.cooldownCenterText);
                this.cooldownCenterText.setScale(1);
            }
        }
    }
    
    // 更新剩余加速时间显示
    updateThrustDurationDisplay(remainingSeconds, visible) {
        if (!this.thrustDurationText) return;
        
        // 更新剩余加速时间显示
        this.thrustDurationText.setText(`加速: ${remainingSeconds}s`);
        this.thrustDurationText.visible = visible;
    }
    
    // 更新能量状态显示
    updateEnergyStateDisplay(state) {
        if (!this.energyStateText) return;
        
        // 根据状态设置不同的颜色
        if (state === '束缚态') {
            this.energyStateText.setStyle({ fill: '#00ff00' }); // 绿色
        } else if (state === '散射态') {
            this.energyStateText.setStyle({ fill: '#ffff00' }); // 黄色
        }
        
        // 更新能量状态文本
        this.energyStateText.setText(`能量状态: ${state}`);
    }
    
    // 显示暂停覆盖层
    showPauseOverlay() {
        // 获取屏幕尺寸
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        const screenCenterX = screenWidth / 2;
        const screenCenterY = screenHeight / 2;
        
        // 创建半透明黑色覆盖层，使用屏幕的实际尺寸
        this.pauseOverlay = this.add.rectangle(screenCenterX, screenCenterY, screenWidth, screenHeight, 0x000000, 0.5);
        this.pauseOverlay.setDepth(1000);
        this.pauseOverlay.setScrollFactor(0); // 不随相机移动
        
        // 创建暂停文字
        this.pauseText = this.add.text(screenCenterX, screenCenterY - 50, '游戏暂停', {
            fontSize: '48px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            fontFamily: 'Arial, sans-serif',
            padding: { x: 10, y: 10 }
        });
        this.pauseText.setOrigin(0.5);
        this.pauseText.setDepth(1001);
        this.pauseText.setScrollFactor(0); // 不随相机移动
        
        // 创建提示文字
        this.instructionText = this.add.text(screenCenterX, screenCenterY + 20, '按ESC继续游戏', {
            fontSize: '20px',
            fill: '#ffff00',
            backgroundColor: '#00000080',
            padding: { x: 10, y: 10 },
            fontFamily: 'Arial, sans-serif'
        });
        this.instructionText.setOrigin(0.5);
        this.instructionText.setDepth(1001);
        this.instructionText.setScrollFactor(0); // 不随相机移动
        
        // 创建回到个人准备界面提示文字
        this.mainMenuText = this.add.text(screenCenterX, screenCenterY + 90, '按Enter回到个人准备界面', {
            fontSize: '20px',
            fill: '#ffff00',
            backgroundColor: '#00000080',
            padding: { x: 10, y: 10 },
            fontFamily: 'Arial, sans-serif'
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
    
    // 清除所有UI显示
    clearUIDisplay() {
        // 清除冷却时间显示
        if (this.cooldownText) {
            this.cooldownText.visible = false;
        }
        
        // 清除剩余加速时间显示
        if (this.thrustDurationText) {
            this.thrustDurationText.visible = false;
        }
        
        // 清除能量状态显示
        if (this.energyStateText) {
            this.energyStateText.visible = false;
        }
    }
    
    // 切换说明文本的可见性
    toggleInstructions() {
        this.instructionsVisible = !this.instructionsVisible;
        this.instructionTexts.forEach(textObj => {
            textObj.visible = this.instructionsVisible;
        });
    }

    //在继承类中调用这个接口(const instructions 里面写显示的内容)
    setUpInstructions() {
        const instructions = [
            'W/A/S/D: 控制火箭推进器',
            '空格键: 增加推力',
            'R: 重置火箭位置', 
            'ESC: 暂停',
            '+/-: 缩放星图'];
        this.instructions = instructions;
    }
    
    // 存储自定义UI元素的数组
    customUIElements = [];
    
    // 设置自定义UI元素（与setUpInstructions类似）
    // 继承类可以重写此方法，定义包含{x, y, text, style}的对象数组
    setUpCustomUIElements() {
        // 默认空实现，继承类可以重写
        this.customUIElements = [];
    }
    
    // 创建自定义UI图层（与setUpInstructions类似，通过参数传入位置和文字）
    createCustomUILayer(defaultStyle) {
        this.customUIElements.forEach(element => {
            const { x, y, text, style } = element;
            const finalStyle = style || defaultStyle;
            
            const textObj = this.add.text(x, y, text, finalStyle);
            textObj.setScrollFactor(0);  // 不随相机移动
            textObj.setDepth(999);       // 确保在UILayer上
            this.UILayer.add(textObj);   // 添加到UI层
        });
    }
    
    // 创建过渡效果的黑色矩形
    createFadeRect() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        
        // 创建过渡效果的黑色矩形
        this.fadeRect = this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x000000);
        this.fadeRect.setAlpha(1);
        this.fadeRect.setDepth(1000);
        this.fadeRect.setScrollFactor(0); // 不随相机移动
    }
    
    // 黑出效果（场景进入时的淡出动画）
    fadeIn() {
        if (this.fadeRect) {
            this.tweens.add({
                targets: this.fadeRect,
                alpha: 0,
                duration: 300,
                ease: 'Power2'
            });
        }
    }
    
    // 黑入效果（场景退出时的淡入动画）
    fadeOut(callback) {
        if (this.fadeRect) {
            this.tweens.add({
                targets: this.fadeRect,
                alpha: 1,
                duration: 300,
                ease: 'Power2',
                onComplete: callback
            });
        } else {
            // 如果没有fadeRect，直接执行回调
            if (callback) callback();
        }
    }
}