export class PlanetPulse extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, radius, mass) {
        super(scene, x, y, texture);

        // 创建脉冲行星
        this.planet = scene.add.sprite(x, y, texture);
        scene.physics.add.existing(this.planet);
        this.planet.radius = radius;
        const scale = (radius * 2) / this.planet.width;
        this.planet.setScale(scale);
        this.planet.body.setCircle(radius);
        this.planet.body.mass = mass;
        this.planet.isPlanet = true;
        this.planet.mass = mass;
        this.planet.G = 4000;
        this.planet.power = -2;
        this.planet.texture = texture;

        // 韦尔莱积分法状态变量
        this.planet.position = new Phaser.Math.Vector2(x, y);
        this.planet.previousPosition = new Phaser.Math.Vector2(x, y);
        this.planet.acceleration = new Phaser.Math.Vector2(0, 0);

        // 时间跟踪
        this.lastUpdateTime = 0;
        this.fixedTimeStep = 1 / 200;

        // 禁用物理引擎的自动位置更新
        this.planet.body.enable = false;

        // 存储初始位置
        this.planet.initialX = x;
        this.planet.initialY = y;

        // 初始化速度（默认为零）
        this.initializeVelocity();

        // 标记为脉冲行星系统
        this.isPlanetPulse = true;

        //this.initAnimations();
    }

    initAnimations() {
        // 为脉冲行星创建并播放动画
        this.planet.anims.create({
            key: 'pulse_anim',
            frames: this.planet.anims.generateFrameNumbers(this.planet.texture, {start: 0, end: 1 }), 
            frameRate: 2, 
            repeat: -1
        });
        this.planet.anims.play('pulse_anim');
    }

    initializeVelocity() {
        // 初始化速度为零
        this.planet.initialVelocity = new Phaser.Math.Vector2(0, 0);

        // 使用固定时间步长计算前一帧位置
        const dt = this.fixedTimeStep;
        this.planet.previousPosition.set(
            this.planet.position.x - this.planet.initialVelocity.x * dt,
            this.planet.position.y - this.planet.initialVelocity.y * dt
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
        this.planet.x = this.planet.position.x;
        this.planet.y = this.planet.position.y;
        this.planet.body.position.set(this.planet.position.x - this.planet.body.width / 2, this.planet.position.y - this.planet.body.height / 2);
        this.planet.body.updateBounds();

        // 更新自身位置
        this.x = this.planet.x;
        this.y = this.planet.y;
    }

    updatePhysics(dt) {
        // 脉冲行星自身不需要加速度计算
        // 韦尔莱积分
        this.verletIntegration(dt);
    }

    verletIntegration(dt) {
        // 更新行星的位置
        const currentX = this.planet.position.x;
        const currentY = this.planet.position.y;
        const newX = 2 * this.planet.position.x - this.planet.previousPosition.x + this.planet.acceleration.x * dt * dt;
        const newY = 2 * this.planet.position.y - this.planet.previousPosition.y + this.planet.acceleration.y * dt * dt;
        this.planet.previousPosition.set(this.planet.position.x, this.planet.position.y);
        this.planet.position.set(newX, newY);
        const velocityX = (newX - currentX) / dt;
        const velocityY = (newY - currentY) / dt;
        this.planet.body.velocity.set(velocityX, velocityY);
    }

    reset() {
        // 重置位置到初始位置
        this.planet.position.set(this.planet.initialX, this.planet.initialY);
        this.planet.previousPosition.set(this.planet.initialX, this.planet.initialY);
        this.planet.acceleration.set(0, 0);

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
        this.planet.x = this.planet.position.x;
        this.planet.y = this.planet.position.y;
        this.planet.body.position.set(this.planet.position.x, this.planet.position.y);

        this.x = this.planet.x;
        this.y = this.planet.y;

        console.log('脉冲行星系统已重置到初始状态');
    }

    destroy() {
        // 清理行星
        if (this.planet) {
            this.planet.destroy();
        }

        super.destroy();
    }
}
