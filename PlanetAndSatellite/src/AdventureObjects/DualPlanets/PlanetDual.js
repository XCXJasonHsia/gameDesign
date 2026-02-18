export class PlanetDual extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x1, y1, x2, y2, texture1, texture2, radius1, radius2, bodyMass1, bodyMass2) {
        super(scene, x1, y1, texture1);

        // 创建第一个行星
        this.planet1 = scene.add.sprite(x1, y1, texture1);
        scene.physics.add.existing(this.planet1);
        this.planet1.radius = radius1;
        const scale1 = (radius1 * 2) / this.planet1.width;
        this.planet1.setScale(scale1);
        this.planet1.body.setCircle(radius1);
        this.planet1.body.mass = bodyMass1;
        this.planet1.isPlanet = true;
        this.planet1.mass = bodyMass1;
        this.planet1.G = 4000;
        this.planet1.power = -2;

        // 创建第二个行星
        this.planet2 = scene.add.sprite(x2, y2, texture2);
        scene.physics.add.existing(this.planet2);
        this.planet2.radius = radius2;
        const scale2 = (radius2 * 2) / this.planet2.width;
        this.planet2.setScale(scale2);
        this.planet2.body.setCircle(radius2);
        this.planet2.body.mass = bodyMass2;
        this.planet2.isPlanet = true;
        this.planet2.mass = bodyMass2;
        this.planet2.G = 4000;
        this.planet2.power = -2;

        // 韦尔莱积分法状态变量
        this.planet1.position = new Phaser.Math.Vector2(x1, y1);
        this.planet1.previousPosition = new Phaser.Math.Vector2(x1, y1);
        this.planet1.acceleration = new Phaser.Math.Vector2(0, 0);

        this.planet2.position = new Phaser.Math.Vector2(x2, y2);
        this.planet2.previousPosition = new Phaser.Math.Vector2(x2, y2);
        this.planet2.acceleration = new Phaser.Math.Vector2(0, 0);

        // 时间跟踪
        this.lastUpdateTime = 0;
        this.fixedTimeStep = 1 / 200;

        // 禁用物理引擎的自动位置更新
        this.planet1.body.enable = false;
        this.planet2.body.enable = false;

        // 存储初始位置
        this.planet1.initialX = x1;
        this.planet1.initialY = y1;
        this.planet2.initialX = x2;
        this.planet2.initialY = y2;

        // 初始化速度（默认为零）
        this.initializeVelocity();

        // 标记为双行星系统
        this.isPlanetDual = true;
    }

    initializeVelocity() {
        // 初始化速度为零
        this.planet1.initialVelocity = new Phaser.Math.Vector2(0, 100);
        this.planet2.initialVelocity = new Phaser.Math.Vector2(0, -100);

        // 使用固定时间步长计算前一帧位置
        const dt = this.fixedTimeStep;
        this.planet1.previousPosition.set(
            this.planet1.position.x - this.planet1.initialVelocity.x * dt,
            this.planet1.position.y - this.planet1.initialVelocity.y * dt
        );
        this.planet2.previousPosition.set(
            this.planet2.position.x - this.planet2.initialVelocity.x * dt,
            this.planet2.position.y - this.planet2.initialVelocity.y * dt
        );
    }

    update(time, delta) {

        if (this.lastUpdateTime === 0) {
            this.lastUpdateTime = time;
        }
        
        let frameTime = (time - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = time;
        
        frameTime = Math.min(frameTime, 0.1);
        
        // 固定时间步长更新
        while (frameTime > 0) {
            const dt = Math.min(this.fixedTimeStep, frameTime);
            
            // 更新物理
            this.updatePhysics(dt);
            
            frameTime -= dt;
        }
        
        // 更新显示位置
        this.planet1.x = this.planet1.position.x;
        this.planet1.y = this.planet1.position.y;
        this.planet1.body.position.set(this.planet1.position.x - this.planet1.body.width / 2, this.planet1.position.y - this.planet1.body.height / 2);
        this.planet1.body.updateBounds();

        this.planet2.x = this.planet2.position.x;
        this.planet2.y = this.planet2.position.y;
        this.planet2.body.position.set(this.planet2.position.x - this.planet2.body.width / 2, this.planet2.position.y - this.planet2.body.height / 2);
        this.planet2.body.updateBounds();

        // 更新自身位置（取两个行星的中点）
        this.x = (this.planet1.x + this.planet2.x) / 2;
        this.y = (this.planet1.y + this.planet2.y) / 2;
    }

    updatePhysics(dt) {
        // 计算两个行星之间的引力加速度
        this.computeMutualAcceleration();
        
        // 韦尔莱积分
        this.verletIntegration(dt);
    }

    computeMutualAcceleration() {
        // 重置加速度
        this.planet1.acceleration.set(0, 0);
        this.planet2.acceleration.set(0, 0);

        // 计算两个行星之间的引力
        const dx = this.planet2.position.x - this.planet1.position.x;
        const dy = this.planet2.position.y - this.planet1.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 避免除零和过近的距离
        if (distance < 10) {
            return;
        }

        // 计算引力加速度
        const G = 4000;
        const power = -2;

        // 行星1受到的加速度
        const accMagnitude1 = G * this.planet2.mass / (distance * distance);
        const directionX1 = dx / distance;
        const directionY1 = dy / distance;
        this.planet1.acceleration.x += directionX1 * accMagnitude1;
        this.planet1.acceleration.y += directionY1 * accMagnitude1;

        // 行星2受到的加速度
        const accMagnitude2 = G * this.planet1.mass / (distance * distance);
        //console.log('planet1 mass, G, distance:', this.planet1.mass, G, distance);
        //console.log('planet2 accMagnitude:', accMagnitude2);
        const directionX2 = -dx / distance;
        const directionY2 = -dy / distance;
        this.planet2.acceleration.x += directionX2 * accMagnitude2;
        this.planet2.acceleration.y += directionY2 * accMagnitude2;
        //console.log('planet2 acc:', this.planet2.acceleration.y);
    }

    verletIntegration(dt) {
        // 更新行星1的位置
        const currentX1 = this.planet1.position.x;
        const currentY1 = this.planet1.position.y;
        const newX1 = 2 * this.planet1.position.x - this.planet1.previousPosition.x + this.planet1.acceleration.x * dt * dt;
        const newY1 = 2 * this.planet1.position.y - this.planet1.previousPosition.y + this.planet1.acceleration.y * dt * dt;
        this.planet1.previousPosition.set(this.planet1.position.x, this.planet1.position.y);
        this.planet1.position.set(newX1, newY1);
        const velocityX1 = (newX1 - currentX1) / dt;
        const velocityY1 = (newY1 - currentY1) / dt;
        this.planet1.body.velocity.set(velocityX1, velocityY1);

        // 更新行星2的位置
        const currentX2 = this.planet2.position.x;
        const currentY2 = this.planet2.position.y;
        const newX2 = 2 * this.planet2.position.x - this.planet2.previousPosition.x + this.planet2.acceleration.x * dt * dt;
        const newY2 = 2 * this.planet2.position.y - this.planet2.previousPosition.y + this.planet2.acceleration.y * dt * dt;
        this.planet2.previousPosition.set(this.planet2.position.x, this.planet2.position.y);
        this.planet2.position.set(newX2, newY2);
        const velocityX2 = (newX2 - currentX2) / dt;
        const velocityY2 = (newY2 - currentY2) / dt;
        this.planet2.body.velocity.set(velocityX2, velocityY2);
    }

    reset() {
        // 重置位置到初始位置
        this.planet1.position.set(this.planet1.initialX, this.planet1.initialY);
        this.planet1.previousPosition.set(this.planet1.initialX, this.planet1.initialY);
        this.planet1.acceleration.set(0, 0);

        this.planet2.position.set(this.planet2.initialX, this.planet2.initialY);
        this.planet2.previousPosition.set(this.planet2.initialX, this.planet2.initialY);
        this.planet2.acceleration.set(0, 0);

        // 重新初始化速度
        this.initializeVelocity();

        // 重置血量到最大值
        if (this.setHealthBar) {
            this.health = this.maxHealth;
            this.updateHealthBarPosition();
        }

        // 重置时间跟踪
        this.lastUpdateTime = 0;

        // 更新显示位置
        this.planet1.x = this.planet1.position.x;
        this.planet1.y = this.planet1.position.y;
        this.planet1.body.position.set(this.planet1.position.x, this.planet1.position.y);

        this.planet2.x = this.planet2.position.x;
        this.planet2.y = this.planet2.position.y;
        this.planet2.body.position.set(this.planet2.position.x, this.planet2.position.y);

        this.x = (this.planet1.x + this.planet2.x) / 2;
        this.y = (this.planet1.y + this.planet2.y) / 2;

        console.log('双行星系统已重置到初始状态');
    }

    destroy() {
        // 清理两个行星
        if (this.planet1) {
            this.planet1.destroy();
        }
        if (this.planet2) {
            this.planet2.destroy();
        }

        super.destroy();
    }
}
