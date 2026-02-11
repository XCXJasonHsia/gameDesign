import { GenericSatellite } from './GenericSatellite.js'

export class GenericRocket extends GenericSatellite {
    constructor(scene, x, y, texture, targetPlanets, setHealthBar, radius,  gravitySystem, infiniteFuel) {
        super(scene, x, y, texture, targetPlanets, setHealthBar, radius,  gravitySystem);
        
        // Rocket特有属性
        this.thrustPower = 1000000000; // 推进器推力
        this.fuel = 1000; // 燃料量
        this.maxFuel = 1000; // 最大燃料
        this.fuelConsumptionRate = 1; // 燃料消耗率
        this.infiniteFuel = infiniteFuel;
        
        // 控制状态
        this.isThrustingForward = false;
        this.isThrustingBackward = false;
        this.isThrustingLeft = false;
        this.isThrustingRight = false;
        
        
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
    
    createThrusterEffects(scene) {
        // 前向推进器火焰
        this.forwardFlame = scene.add.graphics();
        this.forwardFlame.setDepth(-1);
        
        // 后向推进器火焰
        this.backwardFlame = scene.add.graphics();
        this.backwardFlame.setDepth(-1);
        
        // 左向推进器火焰
        this.leftFlame = scene.add.graphics();
        this.leftFlame.setDepth(-1);
        
        // 右向推进器火焰
        this.rightFlame = scene.add.graphics();
        this.rightFlame.setDepth(-1);
    }
    
    createFuelDisplay(scene) {
        // 燃料条背景
        this.fuelBarBg = scene.add.rectangle(
            20, 50, 
            200, 15, 
            0x333333
        );
        this.fuelBarBg.setOrigin(0, 0.5);
        this.fuelBarBg.setScrollFactor(0); // 不随相机移动
        this.fuelBarBg.setDepth(1000);
        
        // 燃料条前景
        this.fuelBar = scene.add.rectangle(
            20, 50, 
            200, 15, 
            0x00ff00
        );
        this.fuelBar.setOrigin(0, 0.5);
        this.fuelBar.setScrollFactor(0);
        this.fuelBar.setDepth(1000);
        
        // 燃料文本
        this.fuelText = scene.add.text(
            130, 50,
            `燃料: ${this.fuel}/${this.maxFuel}`,
            {
                fontSize: '14px',
                fill: '#ffffff',
                backgroundColor: '#00000080',
                padding: { x: 5, y: 3 }
            }
        );
        this.fuelText.setOrigin(0.5, 0.5);
        this.fuelText.setScrollFactor(0);
        this.fuelText.setDepth(1000);
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
        
        // 检查燃料耗尽
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
        
    }

    updateControls() {
        if (!this.controlKeys) return;
        
        // 检查燃料是否充足
        const hasFuel = this.infiniteFuel || this.fuel > 0;
        
        // 更新推进器状态
        if (hasFuel) {
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
        } else {
            // 燃料耗尽，禁用推进器
            this.disableThrusters();
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
        if (this.fuelBar) {
            const fuelPercent = this.fuel / this.maxFuel;
            this.fuelBar.width = 200 * fuelPercent;
            
            // 根据燃料量改变颜色
            if (fuelPercent > 0.5) {
                this.fuelBar.fillColor = 0x00ff00; // 绿色
            } else if (fuelPercent > 0.2) {
                this.fuelBar.fillColor = 0xffff00; // 黄色
            } else {
                this.fuelBar.fillColor = 0xff0000; // 红色
            }
        }
        
        if (this.fuelText) {
            this.fuelText.setText(`燃料: ${Math.floor(this.fuel)}/${this.maxFuel}`);
        }
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
        super.resetToInitialState();
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
    /*
    destroy() {
        // 清理火焰效果
        if (this.forwardFlame) {
            this.forwardFlame.clear();
            this.forwardFlame.destroy();
            this.forwardFlame = null;
        }
        if (this.backwardFlame) {
            this.backwardFlame.clear();
            this.backwardFlame.destroy();
            this.backwardFlame = null;
        }
        if (this.leftFlame) {
            this.leftFlame.clear();
            this.leftFlame.destroy();
            this.leftFlame = null;
        }
        if (this.rightFlame) {
            this.rightFlame.clear();
            this.rightFlame.destroy();
            this.rightFlame = null;
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
        super.destroy();
    }
    */
}
