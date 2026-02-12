import {Planet} from '../BattleObjects/Planet.js'
import {Satellite} from '../BattleObjects/Satellite.js'
import {GravitySystem} from '../Engines/GravitySystem.js'

export class Battle extends Phaser.Scene {
    constructor() {
        super('Battle');
        
        // 游戏状态变量
        this.isPaused = false;
        
        // 存储游戏对象引用
        this.planets = [];
        this.satellite = null;
        this.gravitySystem = null;
        
        // 初始位置
        this.initSatPosX = 150;
        this.initSatPosY = 400;
    }

    create() {
        // 创建背景
        const bg = this.add.image(400, 300, 'bg');
        bg.setScale(2); // 背景图片放大一倍
        
        // 设置初始相机缩放
        this.cameras.main.setZoom(0.9); // 设置相机缩放值为0.9

        // 初始化游戏
        this.initializeGame();
        
        // 创建暂停按钮
        this.createPauseButton();
        
        // 设置键盘输入监听
        this.setupKeyboardInput();
        
        // 更新循环
        this.events.on('update', (time, delta) => {
            // 如果游戏暂停，不更新物理逻辑
            if (this.isPaused) {
                return;
            }
            
            // 更新键盘控制
            if (this.gravitySystem && this.gravitySystem.updateKeyboardControls) {
                this.gravitySystem.updateKeyboardControls();
            }
            
            // 更新卫星
            if (this.satellite && this.satellite.update) {
                this.satellite.update(time, delta);
            }
            
            // 更新信息显示
            if (this.satellite && this.planets.length >= 2) {
                const dx1 = this.satellite.x - this.planets[0].x;
                const dy1 = this.satellite.y - this.planets[0].y;
                const distance1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
                
                const dx2 = this.satellite.x - this.planets[1].x;
                const dy2 = this.satellite.y - this.planets[1].y;
                const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                
                const velocity = Math.sqrt(this.satellite.body.velocity.x ** 2 + this.satellite.body.velocity.y ** 2);
            }
            
            // 更新暂停按钮文本
            this.updatePauseButtonText();
        });

        // 启用物理世界的碰撞
        this.physics.world.setBoundsCollision(true, true, true, true);

        // 添加重新开始按钮
        this.createRestartButton();
    }
    
    // 初始化游戏
    initializeGame() {
        // 如果已有游戏对象，先清理
        this.cleanupGameObjects();
        
        // 创建引力系统
        this.gravitySystem = new GravitySystem(this);

        // 清空之前的行星数组
        this.planets = [];
        
        // 创建两个对称放置的行星
        // 行星1（左侧）
        const planet1 = new Planet(this, 150, 300, 'cartoon_moon');
        //planet1.setTint(0xff6666); // 给行星1加上红色色调以示区别
        this.gravitySystem.addPlanet(planet1, 0);
        this.planets.push(planet1);
        
        // 行星2（右侧）
        const planet2 = new Planet(this, 650, 300, 'cartoon_moon');
        //planet2.setTint(0x6666ff); // 给行星2加上蓝色色调以示区别
        this.gravitySystem.addPlanet(planet2, 1);
        this.planets.push(planet2);

        // 创建一个卫星，放在两个行星中间偏上的位置
        this.satellite = new Satellite(
            this, this.initSatPosX, this.initSatPosY, 'star', 
            this.planets, this.gravitySystem
        );
        
        // 确保卫星尺寸正确
        this.satellite.displayWidth = 15;
        this.satellite.displayHeight = 15;
        
        this.gravitySystem.addSatellite(this.satellite);
        
        // 重置引力参数为-2.0
        this.resetGravityPowers();
    }
    
    // 清理游戏对象
    cleanupGameObjects() {
        // 清理之前的卫星
        if (this.satellite) {
            if (this.satellite.trailGraphics) {
                this.satellite.trailGraphics.destroy();
            }
            this.satellite.destroy();
            this.satellite = null;
        }
        
        // 清理之前的行星
        this.planets.forEach(planet => {
            if (planet) {
                // 清理血条相关元素
                if (planet.healthBarBg) planet.healthBarBg.destroy();
                if (planet.healthBar) planet.healthBar.destroy();
                if (planet.healthText) planet.healthText.destroy();
                planet.destroy();
            }
        });
        this.planets = [];
        
        // 清理引力系统的UI元素
        if (this.gravitySystem) {
            this.cleanupGravitySystemUI();
        }
    }
    
    // 清理引力系统UI
    cleanupGravitySystemUI() {
        if (this.gravitySystem.sliders) {
            this.gravitySystem.sliders.forEach(sliderData => {
                if (sliderData.slider) sliderData.slider.destroy();
                if (sliderData.powerText) sliderData.powerText.destroy();
                if (sliderData.planetLabel) sliderData.planetLabel.destroy();
                if (sliderData.sliderBg) sliderData.sliderBg.destroy();
            });
            this.gravitySystem.sliders = [];
        }
        if (this.gravitySystem.powerTexts) {
            this.gravitySystem.powerTexts = [];
        }
    }
    
    // 重置引力参数为-2.0
    resetGravityPowers() {
        if (!this.gravitySystem) return;
        
        // 重置所有行星的引力幂律为-2.0
        this.planets.forEach((planet, index) => {
            this.gravitySystem.planetPowers.set(planet, -2.0);
            this.gravitySystem.keyboardControls[`planet${index + 1}`].targetPower = -2.0;
            this.gravitySystem.keyboardControls[`planet${index + 1}`].velocity = 0;
        });
        
        // 更新滑动条显示
        this.updateSliderDisplays();
        
        // 更新所有卫星的引力计算
        this.gravitySystem.updateAllSatellites();
    }
    
    // 更新滑动条显示
    updateSliderDisplays() {
        if (!this.gravitySystem || !this.gravitySystem.powerTexts) return;
        
        // 更新所有滑动条的文本显示
        this.planets.forEach((planet, index) => {
            if (this.gravitySystem.powerTexts[index]) {
                this.gravitySystem.powerTexts[index].setText(`r^-2.00`);
            }
        });
        
        // 重置滑动条位置到-2.0对应的位置
        this.resetSliderPositions();
    }
    
    // 重置滑动条位置
    resetSliderPositions() {
        if (!this.gravitySystem || !this.gravitySystem.sliders) return;
        
        this.planets.forEach((planet, index) => {
            const sliderData = this.gravitySystem.sliders[index];
            if (sliderData && sliderData.slider) {
                const slider = sliderData.slider;
                
                // 计算-2.0对应的滑动条位置
                const minX = slider.minX;
                const maxX = slider.maxX;
                
                // -2.0在-4到-1的范围内对应的比例
                const t = (-2.0 - this.gravitySystem.minPower) / (this.gravitySystem.maxPower - this.gravitySystem.minPower);
                const targetX = Phaser.Math.Linear(minX, maxX, t);
                
                // 设置滑动条位置
                slider.x = targetX;
                
                // 更新显示文本
                if (sliderData.powerText) {
                    sliderData.powerText.setText(`r^-2.00`);
                }
            }
        });
    }
    
    // 创建重新开始按钮
    createRestartButton() {
        this.restartButton = this.add.text(750, 60, '重新开始', {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 15, y: 8 }
        })
        .setInteractive()
        .on('pointerdown', () => {
            // 如果游戏暂停，先恢复游戏
            if (this.isPaused) {
                this.togglePause();
            }
            
            this.restartGame();
        });
        
        // 设置按钮右对齐
        this.restartButton.setOrigin(1, 0);
    }
    
    // 重新开始游戏
    restartGame() {
        // 完全重新初始化游戏
        this.initializeGame();
        
        // 重置相机缩放为0.9
        this.cameras.main.setZoom(0.9);
        
        console.log('游戏已重新开始！');
    }
    
    // 创建暂停按钮
    createPauseButton() {
        // 将暂停按钮放在右上角，重新开始按钮上方
        this.pauseButton = this.add.text(750, 30, '暂停', {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 12, y: 6 }
        })
        .setInteractive()
        .on('pointerdown', () => {
            this.togglePause();
        });
        
        // 设置按钮原点，使其右对齐
        this.pauseButton.setOrigin(1, 0);
        
        // 更新按钮文本
        this.updatePauseButtonText();
    }
    
    // 更新暂停按钮文本
    updatePauseButtonText() {
        if (this.pauseButton) {
            if (this.isPaused) {
                this.pauseButton.setText('继续');
                this.pauseButton.setBackgroundColor('#ff6600');
            } else {
                this.pauseButton.setText('暂停');
                this.pauseButton.setBackgroundColor('#333333');
            }
        }
    }
    
    // 设置键盘输入
    setupKeyboardInput() {
        // 空格键暂停/继续
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        this.spaceKey.on('down', () => {
            this.togglePause();
        });
        
        // ESC键也可以暂停/继续
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        
        this.escKey.on('down', () => {
            this.togglePause();
        });
        
        // R键重新开始游戏
        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        
        this.rKey.on('down', () => {
            if (this.isPaused) {
                this.togglePause();
            }
            this.restartGame();
        });
        
        // 0键重新开始游戏
        this.zeroKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ZERO);
        
        this.zeroKey.on('down', () => {
            if (this.isPaused) {
                this.togglePause();
            }
            this.restartGame();
        });
        
        // 小键盘0键重新开始游戏
        this.numpadZeroKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ZERO);
        
        this.numpadZeroKey.on('down', () => {
            if (this.isPaused) {
                this.togglePause();
            }
            this.restartGame();
        });
        
        // 行星1控制：A和D键
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        
        this.aKey.on('down', () => {
            this.gravitySystem.setKeyState('planet1', 'left', true);
        });
        
        this.aKey.on('up', () => {
            this.gravitySystem.setKeyState('planet1', 'left', false);
        });
        
        this.dKey.on('down', () => {
            this.gravitySystem.setKeyState('planet1', 'right', true);
        });
        
        this.dKey.on('up', () => {
            this.gravitySystem.setKeyState('planet1', 'right', false);
        });
        
        // 行星2控制：左右箭头键
        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        
        this.leftKey.on('down', () => {
            this.gravitySystem.setKeyState('planet2', 'left', true);
        });
        
        this.leftKey.on('up', () => {
            this.gravitySystem.setKeyState('planet2', 'left', false);
        });
        
        this.rightKey.on('down', () => {
            this.gravitySystem.setKeyState('planet2', 'right', true);
        });
        
        this.rightKey.on('up', () => {
            this.gravitySystem.setKeyState('planet2', 'right', false);
        });
    }
    
    // 切换暂停状态
    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.onPause();
        } else {
            this.onResume();
        }
        
        // 更新按钮文本
        this.updatePauseButtonText();
        
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
    
    // 显示暂停覆盖层
    showPauseOverlay() {
        // 创建半透明黑色覆盖层
        this.pauseOverlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.5);
        this.pauseOverlay.setDepth(1000);
        
        // 创建暂停文字
        this.pauseText = this.add.text(400, 250, '游戏暂停', {
            fontSize: '48px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.pauseText.setOrigin(0.5);
        this.pauseText.setDepth(1001);
        
        // 创建提示文字
        this.instructionText = this.add.text(400, 320, '按空格键或点击按钮继续游戏', {
            fontSize: '20px',
            fill: '#ffff00',
            backgroundColor: '#00000080',
            padding: { x: 10, y: 5 }
        });
        this.instructionText.setOrigin(0.5);
        this.instructionText.setDepth(1001);
        
        // 添加重新开始提示
        this.restartInstruction = this.add.text(400, 360, '按R键或0键重新开始游戏', {
            fontSize: '16px',
            fill: '#00ff00',
            backgroundColor: '#00000080',
            padding: { x: 10, y: 5 }
        });
        this.restartInstruction.setOrigin(0.5);
        this.restartInstruction.setDepth(1001);
        
        // 添加控制提示
        this.controlInstruction = this.add.text(400, 400, '行星1: A/D键  行星2: 左右箭头键', {
            fontSize: '16px',
            fill: '#66ccff',
            backgroundColor: '#00000080',
            padding: { x: 10, y: 5 }
        });
        this.controlInstruction.setOrigin(0.5);
        this.controlInstruction.setDepth(1001);
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
        if (this.restartInstruction) {
            this.restartInstruction.destroy();
            this.restartInstruction = null;
        }
        if (this.controlInstruction) {
            this.controlInstruction.destroy();
            this.controlInstruction = null;
        }
    }

    update() {
        // 如果游戏暂停，不执行任何更新逻辑
        if (this.isPaused) {
            return;
        }
        
        // 主更新循环，如果需要可以在这里添加其他更新逻辑
    }
}