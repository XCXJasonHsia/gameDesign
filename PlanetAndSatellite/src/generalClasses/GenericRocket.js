import { GenericSatellite } from './GenericSatellite.js'

export class GenericRocket extends GenericSatellite {
    constructor(scene, x, y, texture, targetPlanets, setHealthBar, radius,  gravitySystem, setRestart, infiniteFuel) {
        super(scene, x, y, texture, targetPlanets, setHealthBar, radius, gravitySystem, setRestart);
        
        // Rocket特有属性
        this.thrustPower = 100; // 推进器推力
        this.fuel = 1000; // 燃料量
        this.maxFuel = 1000; // 最大燃料
        this.fuelConsumptionRate = 1.69; // 燃料消耗率，再增加30%
        this.infiniteFuel = infiniteFuel;
        
        // 控制状态
        this.isThrustingForward = false;
        this.isThrustingBackward = false;
        this.isThrustingLeft = false;
        this.isThrustingRight = false;
        
        // 喷气相关时间
        this.thrustCooldown = 0; // 当前冷却时间
        this.maxThrustCooldown = 2000; // 最大冷却时间（毫秒），调整为3秒
        this.lastThrustEndTime = 0; // 上次喷气结束时间
        this.isThrusting = false; // 是否正在喷气
        this.thrustStartTime = 0; // 本次喷气开始时间
        this.maxThrustDuration = 3000; // 最大加速时长（毫秒），设置为1.5秒
        this.thrustDurationRemaining = 0; // 剩余加速时间
        
        // 创建推进器火焰效果
        this.createThrusterEffects(scene);
        
        // 创建燃料显示UI
        if(this.infiniteFuel === false)
            this.createFuelDisplay(scene);
        
        
        
        // 设置按键监听
        this.setupControls();
        
        // 初始化火箭朝向
        this.initializeRocketOrientation();
        
    }

    setHealthBarHeight() {
        if(this.setHealthBar === true) {
            this.healthBarHeight = 25;
        }
        else {
            super.setHealthBarHeight();
        }
    }
    
    createThrusterEffects(scene) {
         // 创建容器作为所有附加元素的父级, 可以解决graphics不为Sprite的children从而无法析构这个问题
        this.containerForNotChildrenObjects = scene.add.container();

        // 前向推进器火焰
        this.forwardFlame = scene.add.graphics();
        this.forwardFlame.setDepth(-1);
        this.containerForNotChildrenObjects.add(this.forwardFlame);
        // 后向推进器火焰
        this.backwardFlame = scene.add.graphics();
        this.backwardFlame.setDepth(-1);
        this.containerForNotChildrenObjects.add(this.backwardFlame);
        // 左向推进器火焰
        this.leftFlame = scene.add.graphics();
        this.leftFlame.setDepth(-1);
        this.containerForNotChildrenObjects.add(this.leftFlame);
        // 右向推进器火焰
        this.rightFlame = scene.add.graphics();
        this.rightFlame.setDepth(-1);
        this.containerForNotChildrenObjects.add(this.rightFlame);
    }
    
    createFuelDisplay(scene) {
        // 燃料文本
        const fuelPercent = Math.floor((this.fuel / this.maxFuel) * 100);
        this.fuelText = scene.add.text(
            this.x - 25, this.y - this.displayHeight/2 - 1, // 初始位置，向左移动25px
            `燃料: ${fuelPercent}%`,
            {
                fontSize: '9.18px', // 缩小15%
                fill: '#ffffff',
                backgroundColor: '#00000080',
                padding: { x: 2.3, y: 1.5 } // 相应缩小15%
            }
        );
        this.fuelText.setOrigin(0, 0.5); // 左对齐
        this.fuelText.setDepth(1000);
        
        // 获取文字宽度，使燃料条与之等长
        const textWidth = this.fuelText.width;
        
        // 燃料条背景（红色，表示已消耗的部分）
        this.fuelBarBg = scene.add.rectangle(
            this.x - 25, this.y - this.displayHeight/2 + 8, // 向左移动25px，更靠近飞船
            textWidth, 6.12, // 与文字等长，高度缩小15%
            0xff0000 // 红色背景
        );
        this.fuelBarBg.setOrigin(0, 0.5); // 左对齐
        this.fuelBarBg.setDepth(1000);
        
        // 燃料条前景
        this.fuelBar = scene.add.rectangle(
            this.x - 25, this.y - this.displayHeight/2 + 8, // 向左移动25px，与背景一致
            textWidth, 6.12, // 与文字等长，高度缩小15%
            0x00ff00
        );
        this.fuelBar.setOrigin(0, 0.5); // 左对齐，与背景一致
        this.fuelBar.setDepth(1000);

        this.containerForNotChildrenObjects.add(this.fuelText, this.fuelBar, this.fuelBarBg);
    }
    
    // 创建冷却时间显示
    createCooldownDisplay(scene) {
        // 获取屏幕宽度，用于定位到右上角
        const screenWidth = scene.cameras.main.width;
        
        // 创建冷却时间显示文本，固定在屏幕右上角
        this.cooldownText = scene.add.text(
            screenWidth - 20, 20, // 右上角位置
            '', // 初始为空
            {
                fontSize: '16px',
                fill: '#ff0000',
                backgroundColor: '#00000080',
                padding: { x: 10, y: 5 }
            }
        );
        this.cooldownText.setOrigin(1, 0.5); // 右对齐
        this.cooldownText.setScrollFactor(0); // 固定位置，不随相机移动
        this.cooldownText.setDepth(1000);
        this.cooldownText.visible = false; // 初始隐藏
    }
    
    // 创建能量状态显示
    createEnergyStateDisplay(scene) {
        // 获取屏幕宽度，用于定位到右上角
        const screenWidth = scene.cameras.main.width;
        
        // 创建能量状态显示文本，固定在屏幕右上角，冷却时间下方
        this.energyStateText = scene.add.text(
            screenWidth - 20, 60, // 右上角位置，冷却时间下方
            '', // 初始为空
            {
                fontSize: '16px',
                fill: '#ffff00',
                backgroundColor: '#00000080',
                padding: { x: 10, y: 5 }
            }
        );
        this.energyStateText.setOrigin(1, 0.5); // 右对齐
        this.energyStateText.setScrollFactor(0); // 固定位置，不随相机移动
        this.energyStateText.setDepth(1000);
    }
    
    setupControls() {
        // 存储按键状态
        const keys = this.scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
        });
        
        this.controlKeys = keys;
        
        // 存储初始推力值
        this.baseThrustPower = 100;
        this.boostThrustPower = 200;
    }

    update(time, delta) {
        
        // 更新控制状态
        this.updateControls();
        
        // 检查燃料是否充足
        if (this.infiniteFuel === true && this.fuel <= 0) {
            this.disableThrusters();
        }
        
        // 调用父类的update方法进行基本物理更新
        this.delta = delta;
        super.update(time, delta);
        
        // 更新火箭朝向
        this.updateRocketOrientation();
        
        // 更新推进器火焰
        this.updateThrusterEffects();
        
        // 更新燃料显示
        if(this.infiniteFuel !== true)
            this.updateFuelDisplay();
        
        // 更新冷却时间显示
        this.updateCooldownDisplay();
        
        // 更新剩余加速时间显示
        this.updateThrustDurationDisplay();
        
        // 更新能量状态显示
        this.updateEnergyStateDisplay();
    }

    updateControls() {
        if (!this.controlKeys) return;
        
        // 检查燃料是否充足
        const hasFuel = this.infiniteFuel || this.fuel > 0;
        
        // 更新时间相关变量
        const currentTime = this.scene.time.now;
        
        // 更新冷却时间
        if (!this.isThrusting) {
            this.thrustCooldown = Math.max(0, this.maxThrustCooldown - (currentTime - this.lastThrustEndTime));
        }
        
        // 检查是否有任何推力按键被按下
        const isAnyThrustKeyDown = this.controlKeys.up.isDown || 
                                  this.controlKeys.down.isDown || 
                                  this.controlKeys.left.isDown || 
                                  this.controlKeys.right.isDown;
        
        // 检查是否可以喷气
        const canThrust = hasFuel && this.thrustCooldown <= 0;
        
        // 开始喷气或持续喷气
        if (canThrust && isAnyThrustKeyDown) {
            // 无论是否刚开始喷气，都先更新推进器状态
            this.isThrustingForward = this.controlKeys.up.isDown;
            this.isThrustingBackward = this.controlKeys.down.isDown;
            this.isThrustingLeft = this.controlKeys.left.isDown;
            this.isThrustingRight = this.controlKeys.right.isDown;
            
            // 空格键：增加推力
            if (this.controlKeys.space.isDown) {
                this.thrustPower = this.boostThrustPower;
            } else {
                this.thrustPower = this.baseThrustPower;
            }
            
            // 如果是刚开始喷气，记录开始时间
            if (!this.isThrusting) {
                this.isThrusting = true;
                this.thrustStartTime = currentTime;
            }
            
            // 计算剩余加速时间
            const thrustDuration = currentTime - this.thrustStartTime;
            this.thrustDurationRemaining = Math.max(0, this.maxThrustDuration - thrustDuration);
            
            // 检查是否达到最大加速时长
            if (this.thrustDurationRemaining <= 0) {
                // 达到最大加速时长，停止喷气
                this.isThrusting = false;
                this.disableThrusters();
                this.lastThrustEndTime = currentTime;
                this.thrustDurationRemaining = 0;
            }
            
        }
        // 停止喷气
        else if (this.isThrusting && !isAnyThrustKeyDown) {
            this.isThrusting = false;
            this.disableThrusters();
            this.lastThrustEndTime = currentTime;
            this.thrustDurationRemaining = 0;
            
        }
        // 冷却中或燃料不足
        else if (!isAnyThrustKeyDown) {
            this.disableThrusters();
            this.thrustDurationRemaining = 0;
        }
    }

    rocketBoostAcceleration() {
        if (this.isAttached) return;
        // 检查燃料是否充足
        if (!this.infiniteFuel && this.fuel <= 0) return;

        const deltaSeconds = this.delta / 100;
        const velocity = this.body.velocity.clone();
        const speed = velocity.length();

        // 计算速度方向
        let direction = new Phaser.Math.Vector2(0, 1); // 默认向下
        if (speed > 3) {
            direction = velocity.normalize();
        }
        
        // 计算总燃料消耗
        let fuelConsumed = 0;

        // 前向推力（沿当前速度方向）
        if (this.isThrustingForward) {
            const thrustForce = direction.scale(this.thrustPower * deltaSeconds);
            this.acceleration.x += thrustForce.x;
            this.acceleration.y += thrustForce.y;
            fuelConsumed += this.fuelConsumptionRate * deltaSeconds;
        }
        
        // 后向推力
        if (this.isThrustingBackward) {
            const thrustForce = direction.scale(-this.thrustPower * deltaSeconds);
            this.acceleration.x += thrustForce.x;
            this.acceleration.y += thrustForce.y;
            fuelConsumed += this.fuelConsumptionRate * deltaSeconds;
        }
        
        // 左向推力（法向，垂直向左）
        if (this.isThrustingLeft) {
            const leftVector = new Phaser.Math.Vector2(-direction.y, direction.x);
            const thrustForce = leftVector.scale(this.thrustPower * deltaSeconds);
            this.acceleration.x += thrustForce.x;
            this.acceleration.y += thrustForce.y;
            fuelConsumed += this.fuelConsumptionRate * deltaSeconds;
        }
        
        // 右向推力（法向，垂直向右）
        if (this.isThrustingRight) {
            const rightVector = new Phaser.Math.Vector2(direction.y, -direction.x);
            const thrustForce = rightVector.scale(this.thrustPower * deltaSeconds);
            this.acceleration.x += thrustForce.x;
            this.acceleration.y += thrustForce.y;
            fuelConsumed += this.fuelConsumptionRate * deltaSeconds;
        }
        
        // 消耗燃料
        if (!this.infiniteFuel && fuelConsumed > 0) {
            this.fuel -= fuelConsumed;
            if (this.fuel < 0) this.fuel = 0;
        }
    }
    
    updateThrusterEffects() {
        // 清空所有火焰
        this.forwardFlame.clear();
        this.backwardFlame.clear();
        this.leftFlame.clear();
        this.rightFlame.clear();
        
        // 计算火箭方向
        const velocity = this.body.velocity.clone();
        const speed = velocity.length();
        let direction = new Phaser.Math.Vector2(0, 1); // 默认向下
        
        if (speed > 3) {
            direction = velocity.normalize();
        }
        
        // 火箭位置
        const rocketX = this.x;
        const rocketY = this.y;
        
        // 计算法线方向
        const normalLeft = new Phaser.Math.Vector2(-direction.y, direction.x);
        const normalRight = new Phaser.Math.Vector2(direction.y, -direction.x);
        
        // 前向推进器火焰
        if (this.isThrustingForward && this.fuel > 0) {
            this.forwardFlame.lineStyle(10, 0xff6600, 0.8);
            this.forwardFlame.beginPath();
            this.forwardFlame.moveTo(rocketX, rocketY);
            const flameEnd = new Phaser.Math.Vector2(
                rocketX - direction.x * 30,
                rocketY - direction.y * 30
            );
            this.forwardFlame.lineTo(flameEnd.x, flameEnd.y);
            this.forwardFlame.strokePath();
        }
        
        // 后向推进器火焰
        if (this.isThrustingBackward && this.fuel > 0) {
            this.backwardFlame.lineStyle(10, 0xff3300, 0.8);
            this.backwardFlame.beginPath();
            this.backwardFlame.moveTo(rocketX, rocketY);
            const flameEnd = new Phaser.Math.Vector2(
                rocketX + direction.x * 30,
                rocketY + direction.y * 30
            );
            this.backwardFlame.lineTo(flameEnd.x, flameEnd.y);
            this.backwardFlame.strokePath();
        }
        
        // 左向推进器火焰
        if (this.isThrustingLeft && this.fuel > 0) {
            this.leftFlame.lineStyle(10, 0xff9933, 0.8);
            this.leftFlame.beginPath();
            this.leftFlame.moveTo(rocketX, rocketY);
            const flameEnd = new Phaser.Math.Vector2(
                rocketX - normalLeft.x * 25,
                rocketY - normalLeft.y * 25
            );
            this.leftFlame.lineTo(flameEnd.x, flameEnd.y);
            this.leftFlame.strokePath();
        }
        
        // 右向推进器火焰
        if (this.isThrustingRight && this.fuel > 0) {
            this.rightFlame.lineStyle(10, 0xff9933, 0.8);
            this.rightFlame.beginPath();
            this.rightFlame.moveTo(rocketX, rocketY);
            const flameEnd = new Phaser.Math.Vector2(
                rocketX - normalRight.x * 25,
                rocketY - normalRight.y * 25
            );
            this.rightFlame.lineTo(flameEnd.x, flameEnd.y);
            this.rightFlame.strokePath();
        }
    }

    updateFuelDisplay() {
        // 更新燃料条和文本位置，使其始终位于飞船正上方
        const fuelTextY = this.y - this.displayHeight/2 - 1;
        const fuelBarY = this.y - this.displayHeight/2 + 8;
        const fuelX = this.x - 25; // 向左移动25px
        
        if (this.fuelText) {
            this.fuelText.setPosition(fuelX, fuelTextY);
            this.fuelText.setOrigin(0, 0.5); // 左对齐
            const fuelPercent = Math.floor((this.fuel / this.maxFuel) * 100);
            this.fuelText.setText(`燃料: ${fuelPercent}%`);
        }
        
        // 获取文字宽度，使燃料条与之等长
        const textWidth = this.fuelText ? this.fuelText.width : 60;
        
        if (this.fuelBarBg) {
            this.fuelBarBg.setPosition(fuelX, fuelBarY);
            this.fuelBarBg.setOrigin(0, 0.5); // 左对齐
            this.fuelBarBg.width = textWidth; // 与文字等长
        }
        
        if (this.fuelBar) {
            // 保持燃料条前景的原点为左侧，与背景一致
            this.fuelBar.setOrigin(0, 0.5);
            this.fuelBar.setPosition(fuelX, fuelBarY);
            
            const fuelPercent = this.fuel / this.maxFuel;
            // 计算燃料条宽度，从左侧开始向右扩展
            this.fuelBar.width = textWidth * fuelPercent;
            
            // 根据燃料量改变颜色
            if (fuelPercent > 0.5) {
                this.fuelBar.fillColor = 0x00ff00; // 绿色
            } else if (fuelPercent > 0.2) {
                this.fuelBar.fillColor = 0xffff00; // 黄色
            } else {
                this.fuelBar.fillColor = 0xff0000; // 红色
            }
        }
        
        // 更新燃油警告
        this.updateFuelWarning();
    }
    
    // 创建燃油警告显示
    createFuelWarning(scene) {
        // 获取屏幕宽度，用于定位到右上角
        const screenWidth = scene.cameras.main.width;
        
        // 创建燃油警告文本，固定在屏幕右上角，束缚态/散射态文字下方，与束缚态文字右对齐
        this.fuelWarningText = scene.add.text(
            screenWidth - 20, 120, // 右上角位置，束缚态/散射态文字下方，向下移动20px以避开束缚态文字
            '', // 初始为空
            {
                fontSize: '16px', // 与束缚态文字使用相同的字体大小
                fill: '#ff0000', // 亮红色
                backgroundColor: '#00000080', // 与束缚态文字使用相同的背景色
                padding: { x: 10, y: 5 } // 与束缚态文字使用相同的padding
            }
        );
        this.fuelWarningText.setOrigin(1, 0.5); // 右对齐，与束缚态文字使用相同的对齐方式
        this.fuelWarningText.setScrollFactor(0); // 固定位置，不随相机移动
        this.fuelWarningText.setDepth(999); // 确保在UILayer上
        this.fuelWarningText.visible = false; // 初始隐藏
        
        // 添加到UI层
        if (scene.UILayer) {
            scene.UILayer.add(this.fuelWarningText);
        } else {
            // 如果没有UILayer，尝试添加到UI场景
            const uiScene = scene.scene.get(scene.sceneKeyUI);
            if (uiScene && uiScene.add) {
                // 重新创建文本并添加到UI场景
                this.fuelWarningText.destroy();
                this.fuelWarningText = uiScene.add.text(
                    screenWidth - 20, 120, // 右上角位置，向下移动20px以避开束缚态文字
                    '', // 初始为空
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
                this.fuelWarningText.visible = false;
            }
        }
        
        // 初始化闪烁计时器
        this.fuelWarningTimer = 0;
        this.fuelWarningVisible = false;
    }
    
    // 更新燃油警告显示
    updateFuelWarning() {
        // 确保警告文本已创建
        if (!this.fuelWarningText && this.scene) {
            this.createFuelWarning(this.scene);
        }
        
        if (!this.fuelWarningText) return;
        
        const fuelPercent = this.fuel / this.maxFuel;
        
        if (fuelPercent <= 0) {
            // 燃油耗尽
            this.fuelWarningText.setText('燃油耗尽！');
            this.fuelWarningText.visible = true;
            this.fuelWarningVisible = true;
        } else if (fuelPercent <= 0.2) {
            // 燃油即将耗尽，闪烁显示
            this.fuelWarningText.setText('燃油即将耗尽');
            
            // 每500毫秒切换一次可见性
            const currentTime = this.scene.time.now;
            if (currentTime - this.fuelWarningTimer > 500) {
                this.fuelWarningVisible = !this.fuelWarningVisible;
                this.fuelWarningTimer = currentTime;
            }
            
            this.fuelWarningText.visible = this.fuelWarningVisible;
        } else {
            // 燃油充足，隐藏警告
            this.fuelWarningText.visible = false;
            this.fuelWarningVisible = false;
        }
    }
    
    // 更新冷却时间显示
    updateCooldownDisplay() {
        // 计算剩余冷却时间（秒）
        let remainingCooldown = 0;
        let remainingSeconds = "0.0";
        
        // 只有在lastThrustEndTime不为0时才计算冷却时间，确保游戏一开始不显示冷却状态
        if (this.lastThrustEndTime > 0) {
            const currentTime = this.scene.time.now;
            const elapsedTime = currentTime - this.lastThrustEndTime;
            remainingCooldown = Math.max(0, this.maxThrustCooldown - elapsedTime);
            remainingSeconds = (remainingCooldown / 1000).toFixed(1);
        }
        
        // 使用UI场景更新冷却时间显示
        const uiScene = this.scene.scene.get(this.scene.sceneKeyUI);
        if (uiScene && uiScene.updateCooldownDisplay) {
            uiScene.updateCooldownDisplay(remainingSeconds, remainingCooldown > 0);
        }
    }
    
    // 更新剩余加速时间显示
    updateThrustDurationDisplay() {
        // 计算剩余加速时间（秒）
        const remainingSeconds = (this.thrustDurationRemaining / 1000).toFixed(1);
        
        // 使用UI场景更新剩余加速时间显示
        const uiScene = this.scene.scene.get(this.scene.sceneKeyUI);
        if (uiScene && uiScene.updateThrustDurationDisplay) {
            uiScene.updateThrustDurationDisplay(remainingSeconds, this.isThrusting && this.thrustDurationRemaining > 0);
        }
    }
    
    // 更新能量状态显示
    updateEnergyStateDisplay() {
        // 初始化能量状态相关变量
        if (!this.energyState) {
            this.energyState = "束缚态"; // 初始状态
            this.lastEnergyStateChange = 0; // 上次状态改变的时间
            this.stateStabilityTime = 1000; // 状态稳定所需时间（毫秒）
            this.energyThreshold = 10; // 能量阈值，避免微小波动导致切换
        }
        
        // 计算火箭的总能量
        const totalEnergy = this.calculateTotalEnergy();
        const currentTime = this.scene.time.now;
        
        // 确定理想能量状态
        let idealState = totalEnergy > this.energyThreshold ? "散射态" : (totalEnergy < -this.energyThreshold ? "束缚态" : this.energyState);
        
        // 状态稳定机制：只有当理想状态与当前状态不同，并且已经持续了足够的时间，才切换状态
        if (idealState !== this.energyState) {
            // 记录状态变化的开始时间
            if (!this.stateChangeStartTime) {
                this.stateChangeStartTime = currentTime;
            }
            
            // 检查是否已经持续了足够的时间
            if (currentTime - this.stateChangeStartTime >= this.stateStabilityTime) {
                // 切换状态
                this.energyState = idealState;
                this.lastEnergyStateChange = currentTime;
                this.stateChangeStartTime = null;
            }
        } else {
            // 如果理想状态与当前状态相同，重置状态变化开始时间
            this.stateChangeStartTime = null;
        }
        
        // 使用UI场景更新能量状态显示
        const uiScene = this.scene.scene.get(this.scene.sceneKeyUI);
        if (uiScene && uiScene.updateEnergyStateDisplay) {
            uiScene.updateEnergyStateDisplay(this.energyState);
        }
    }
    
    // 计算火箭的总能量
    
    calculateTotalEnergy() {
        // 简化计算，假设火箭质量为1
        const mass = 1;
        
        // 计算动能：K = 0.5 * m * v²
        const velocity = new Phaser.Math.Vector2(this.body.velocity.x, this.body.velocity.y);
        const speedSquared = velocity.lengthSq();
        const kineticEnergy = 0.5 * mass * speedSquared;
        
        // 找到最近的行星作为主要引力源
        let closestPlanet = null;
        let closestDistance = Infinity;
        
        if (this.targetPlanets && this.targetPlanets.length > 0) {
            for (const planet of this.targetPlanets) {
                const distance = Phaser.Math.Distance.Between(
                    this.position.x, this.position.y,
                    planet.x, planet.y
                );
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestPlanet = planet;
                }
            }
        }
        
        // 如果没有找到行星，返回动能（假设在太空中）
        if (!closestPlanet) {
            return kineticEnergy;
        }
        
        // 计算势能：U = -G * M * m / r （对于平方反比引力）
        // 注意：这里使用简化计算，实际游戏中的引力可能有不同的幂律
        const G = this.G || 100;
        const planetMass = closestPlanet.mass || 1000;
        const distance = Math.max(closestDistance, 1); // 避免除零
        
        // 对于平方反比引力（r^-2），势能公式
        const potentialEnergy = -G * planetMass * mass / distance;
        
        // 计算总能量
        const totalEnergy = kineticEnergy + potentialEnergy;
        
        return totalEnergy;
    }
    
    disableThrusters() {
        this.isThrustingForward = false;
        this.isThrustingBackward = false;
        this.isThrustingLeft = false;
        this.isThrustingRight = false;
    }

    // 增加燃料方法暂未用到
    addFuel(amount) {
        this.fuel += amount;
        if (this.fuel > this.maxFuel) {
            this.fuel = this.maxFuel;
        }
    }

    resetToInitialState() {
        this.fuel = this.maxFuel;
        
        // 重置喷气相关时间变量，确保在游戏开始或重新开始时冷却状态被清空
        this.thrustCooldown = 0; // 重置当前冷却时间
        this.lastThrustEndTime = 0; // 重置上次喷气结束时间
        this.isThrusting = false; // 重置喷气状态
        this.thrustStartTime = 0; // 重置本次喷气开始时间
        this.thrustDurationRemaining = 0; // 重置剩余加速时间
        
        // 重置燃油警告状态，确保在游戏开始或重新开始时警告文字被清空
        if (this.fuelWarningText) {
            this.fuelWarningText.setText(''); // 清空警告文字
            this.fuelWarningText.visible = false; // 隐藏警告
        }
        this.fuelWarningTimer = 0;
        this.fuelWarningVisible = false;
        
        super.resetToInitialState();
    }
    
    // 销毁方法，确保正确清理所有相关显示对象
    destroy() {
        // 清理燃料显示相关对象
        if (this.fuelText) {
            this.fuelText.destroy();
            this.fuelText = null;
        }
        if (this.fuelBarBg) {
            this.fuelBarBg.destroy();
            this.fuelBarBg = null;
        }
        if (this.fuelBar) {
            this.fuelBar.destroy();
            this.fuelBar = null;
        }
        
        // 清理燃料警告相关对象
        if (this.fuelWarningText) {
            this.fuelWarningText.destroy();
            this.fuelWarningText = null;
        }
        
        // 清理推进器效果
        if (this.leftFlame) {
            this.leftFlame.destroy();
            this.leftFlame = null;
        }
        if (this.rightFlame) {
            this.rightFlame.destroy();
            this.rightFlame = null;
        }
        
        // 清理冷却时间和其他显示对象
        if (this.cooldownText) {
            this.cooldownText.destroy();
            this.cooldownText = null;
        }
        if (this.thrustDurationText) {
            this.thrustDurationText.destroy();
            this.thrustDurationText = null;
        }
        
        // 调用父类的destroy方法
        super.destroy();
    }

    // 初始化火箭朝向
    initializeRocketOrientation() {
        // 计算初始速度方向
        const velocity = this.body.velocity.clone();
        const speed = velocity.length();
        
        if (speed > 0) {
            // 根据速度方向计算角度
            const angle = Math.atan2(velocity.y, velocity.x);
            // 设置火箭朝向
            this.rotation = angle;
        }
    }
    
    // 更新火箭朝向，使其始终沿着前进方向
    updateRocketOrientation() {
        const velocity = this.body.velocity.clone();
        const speed = velocity.length();
        
        if (speed > 0.1) { // 避免速度过小时的抖动
            // 根据速度方向计算角度
            const angle = Math.atan2(velocity.y, velocity.x);
            // 设置火箭朝向
            this.rotation = angle;
        }
    }
    
    destroy(fromScene) {
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        // 清理燃料显示
        if (this.fuelBarBg) {
            this.fuelBarBg.destroy();
            this.fuelBarBg = null;
        }
        if (this.fuelBar) {
            this.fuelBar.destroy();
            this.fuelBar = null;
        }
        if (this.fuelText) {
            this.fuelText.destroy();
            this.fuelText = null;
        }
        
        // 清理控制键引用
        this.controlKeys = null;
        
        // 调用父类的destroy方法
        super.destroy(fromScene);
    }
    
}
