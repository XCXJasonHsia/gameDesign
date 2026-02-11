import { GenericPlanet } from './GenericPlanet.js';
import { GenericRocket } from './GenericRocket.js';
import { GenericSatellite } from './GenericSatellite.js';
import { GravitySystem } from '../Engines/GravitySystem.js';
export class GenericScene extends Phaser.Scene {
    constructor(sceneKey, cameraFollow, leader_str, powerManipulation) {
        if (!sceneKey) {
          throw new Error('必须提供sceneKey参数');
        }
        super(sceneKey);
        this.sceneKey = sceneKey;
        
        // 是否跟随
        this.cameraFollow = cameraFollow;
        //to change power or not
        this.powerManipulation = powerManipulation;
        
        // Scene基类中，设置了一组planets，一组satellites和一个Rocket
        this.planets = [];
        this.satellites = [];
        this.leader = null;
        this.leader_str = leader_str;
        this.gravitySystem = null;

        // initial positions should be arrays of 2Dvectors
        this.initialPlanetPositions = [];
        this.initialSatellitePositions = [];
        this.initialRocketPosition = null;

        // 相机控制参数
        this.cameraZoom = 1.0;
        this.minZoom = 0.5;
        this.maxZoom = 3.0;
        this.zoomSpeed = 0.1;
        
        // 相机跟随平滑度
        this.cameraSmoothness = 0.1;

        // 判断是否暂停的bool型
        this.isPaused = false;

        this.previousState = {};
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
        
            // 设置初始缩放
            this.cameras.main.setZoom(this.cameraZoom);
        }
        
        // 设置键盘控制
        this.setupKeyboardControls();
        
        // 创建说明文本
        this.scene.launch('GenericUIScene');
        this.scene.bringToTop('GenericUIScene');
        
    }

    // 这几个方法需要在继承类中实现！（初始化）
    initializeBackground() {}

    initializePlanets() {}

    initializeSatellites() {}

    initializeRocket() {}

    setupKeyboardControls() {
        // 获取键盘输入
        const keys = this.input.keyboard.addKeys({
            plus: Phaser.Input.Keyboard.KeyCodes.PLUS,
            minus: Phaser.Input.Keyboard.KeyCodes.MINUS,
            equals: Phaser.Input.Keyboard.KeyCodes.EQUALS,  // 有些键盘的加号是等号键
            zero: Phaser.Input.Keyboard.KeyCodes.ZERO,      // 重置缩放
            r: Phaser.Input.Keyboard.KeyCodes.R,            // 重置leader位置
            pause: Phaser.Input.Keyboard.KeyCodes.ESC       // 按esc实现暂停
        });
        
        this.zoomKeys = keys;
        
        // 监听按键事件

        if(this.cameraFollow) {
            this.input.keyboard.on('keydown-PLUS', () => this.zoomIn());
            this.input.keyboard.on('keydown-EQUALS', () => this.zoomIn());
            this.input.keyboard.on('keydown-MINUS', () => this.zoomOut());
            this.input.keyboard.on('keydown-ZERO', () => this.resetZoom());
        }
        this.input.keyboard.on('keydown-R', () => this.resetLeader());
        this.input.keyboard.on('keydown-ESC', () => this.gamePause());
    }

    zoomIn() {
        this.cameraZoom = Phaser.Math.Clamp(
            this.cameraZoom + this.zoomSpeed, 
            this.minZoom, 
            this.maxZoom
        );
        this.updateCameraZoom();
    }
    
    zoomOut() {
        this.cameraZoom = Phaser.Math.Clamp(
            this.cameraZoom - this.zoomSpeed, 
            this.minZoom, 
            this.maxZoom
        );
        this.updateCameraZoom();
    }
    
    resetZoom() {
        this.cameraZoom = 1.0;
        this.updateCameraZoom();
    }
    
    updateCameraZoom() {
        // 平滑过渡到目标缩放
        this.cameras.main.zoomTo(this.cameraZoom, 300);
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
            
            // 重置相机缩放
            this.cameraZoom = 1.0;
            this.cameras.main.setZoom(this.cameraZoom);
        }
        
        console.log('场景已完全重置');
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
        
        // 移除暂停覆盖层
        this.removePauseOverlay();
    }
    
    // 回到主界面（会出问题）
    goToMainMenu() {
        // 启动Game场景，让Phaser自动处理场景切换
        //this.scene.stop(this.sceneKey);
        this.scene.start('Game', {
                    fromScene: 'SceneEg',
                    previousState: this.previousState
                });
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
        
        // 如果飞出太远，重置位置
        if (distance > maxDistance) {
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
    constructor() {
        super('GenericUIScene');
        this.instructions = null;
        this.UILayer = null;
    }

    create() {
        // 创建UI层，确保UI在最上层但允许overlayer在其之上
        this.UILayer = this.add.layer();
        
        // 创建控制说明文本
        const style = {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#00000080',
            padding: { x: 10, y: 5 }
        };
        
        // 说明文本
        this.setUpInstructions();

        // 在左上角显示说明
        let y = 20;
        this.instructions.forEach(text => {
            const textObj = this.add.text(20, y, text, style);
            textObj.setScrollFactor(0);  // 不随相机移动
            textObj.setDepth(999);       // 确保在UILayer上，但允许overlayer在其之上
            this.UILayer.add(textObj);   // 添加到UI层
            y += 25;
        });
    }


    //在继承类中调用这个接口(const instructions 里面写显示的内容)
    setUpInstructions() {
        const instructions = [
            'W/A/S/D: 控制火箭推进器',
            '空格键: 增加推力',
            '+/-: 缩放视野',
            '0: 重置视野',
            'R: 重置火箭位置', 
            'ESC: 暂停'];
        this.instructions = instructions;
    }
}