import {GravitySystem} from '../Engines/GravitySystem.js'

export class Satellite extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, targetPlanets, gravitySystem) {
        super(scene, x, y, texture);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.targetPlanets = targetPlanets; // 现在是一个行星数组
        this.gravitySystem = gravitySystem;
        
        // 存储初始位置
        this.initialX = x;
        this.initialY = y;
        
        // 禁用物理引擎的自动位置更新
        this.body.enable = false;
        
        // 韦尔莱积分法状态变量
        this.position = new Phaser.Math.Vector2(x, y);
        this.previousPosition = new Phaser.Math.Vector2(x, y);
        this.acceleration = new Phaser.Math.Vector2(0, 0);
        
        // 引力参数 - 现在每个行星有不同的幂律，所以这里存储G值
        this.G = gravitySystem ? gravitySystem.G : 1000;
        
        // 时间跟踪
        this.lastUpdateTime = 0;
        this.fixedTimeStep = 1 / 200;
        
        // 初始化速度（在两个行星正中间上下震荡）
        //this.initializeOscillationVelocity();
        this.initializeOrbitalVelocity();
        // 存储轨道轨迹（用于可视化）
        this.trail = [];
        this.maxTrailLength = 80;
        
        // 创建轨迹图形
        this.createTrailGraphics(scene);

        // 设置碰撞机制
        this.setupCollisionProperties();

        // 设置卫星宽度
        this.displayWidth = 15;
        this.displayHeight = 15;
        
        // 粘附状态
        this.isAttached = false;
        this.attachedPlanet = null;
        
        // 卫星属性
        this.mass = 10; // 卫星质量
        this.collisionDamageMultiplier = 0.005 // 伤害系数

        // 存储每个行星的引力加速度贡献（用于调试）
        this.planetAccelerations = new Map();
        
        // 碰撞后重置的计时器
        this.resetTimer = null;
        this.resetDelay = 1000; // 1秒后重置
    }

    setupCollisionProperties() {
        // 设置弹性为0（碰撞后不反弹）
        this.setBounce(0);
        
        // 关闭阻尼（防止自动减速）
        this.setDamping(false);
        
        // 设置为动态物体
        this.body.moves = true;
        
        // 启用物理身体（但在初始时是禁用的，直到需要碰撞时）
        this.body.enable = false;
        
        // 设置碰撞世界边界
        this.setCollideWorldBounds(false);
        
        // 设置质量（影响碰撞响应）
        this.body.mass = 1;
        
        // 设置速度阻尼为0.9
        this.setDrag(0.9);
    }
    
    createTrailGraphics(scene) {
        this.trailGraphics = scene.add.graphics();
        this.trailColor = 0x66aaff;
    }
    
    initializeVelocity() {
        // 给一个初始切向速度
        const initialVelocity = new Phaser.Math.Vector2(150, 0);
        
        // 设置前一帧位置
        const dt = this.fixedTimeStep;
        this.previousPosition.set(
            this.position.x - initialVelocity.x * dt,
            this.position.y - initialVelocity.y * dt
        );
    }

    initializeOrbitalVelocity() {
        this.targetPlanet = this.targetPlanets[0];
        const toPlanet = new Phaser.Math.Vector2(
            this.targetPlanet.x - this.position.x,
            this.targetPlanet.y - this.position.y
        );
        const distance = toPlanet.length();
        
        if (distance === 0) return;
        
        // 根据当前幂律计算圆形轨道速度
        // 对于幂律引力，圆形轨道速度公式：v = sqrt(G * M * r^(power))
        this.power = this.gravitySystem ? this.gravitySystem.getPlanetPower(this.targetPlanet) : -2;
        const effectivePower = this.power + 1; // 因为加速度是 r^power
        let orbitalSpeed;
        
        if (effectivePower === 0) {
            // 特殊情况：log(r)
            orbitalSpeed = Math.sqrt(this.G * this.targetPlanet.body.mass);
        } else {
            orbitalSpeed = Math.sqrt(this.G * this.targetPlanet.body.mass * Math.pow(distance, effectivePower));
        }
        
        // 限制速度范围
        orbitalSpeed = Phaser.Math.Clamp(orbitalSpeed, 50, 1000);
        
        // 计算切向方向
        const tangent = new Phaser.Math.Vector2(
            -toPlanet.y / distance,
            toPlanet.x / distance
        );
        
        // 设置初始速度
        const initialVelocity = tangent.scale(orbitalSpeed);
        
        // 设置前一帧位置
        const dt = this.fixedTimeStep;
        this.previousPosition.set(
            this.position.x - initialVelocity.x * dt,
            this.position.y - initialVelocity.y * dt
        );
    }
    
    // 初始化上下震荡速度（在两个行星正中间）
    initializeOscillationVelocity() {
        // 计算两个行星的中心点
        const centerX = (this.targetPlanets[0].x + this.targetPlanets[1].x) / 2;
        const centerY = (this.targetPlanets[0].y + this.targetPlanets[1].y) / 2;
        
        // 设置卫星位置在两个行星正中间
        this.position.set(centerX, centerY);
        this.x = centerX;
        this.y = centerY;
        
        // 给一个较小的垂直速度，实现稳定的上下震荡
        const oscillationSpeed = 50; // 减小震荡速度，避免飞出去
        const initialVelocity = new Phaser.Math.Vector2(0, -oscillationSpeed); // 向上运动
        
        // 设置前一帧位置（韦尔莱积分法需要前一帧位置）
        const dt = this.fixedTimeStep;
        this.previousPosition.set(
            this.position.x - initialVelocity.x * dt,
            this.position.y - initialVelocity.y * dt
        );
        
        // 设置当前速度
        this.body.velocity.set(initialVelocity.x, initialVelocity.y);
    }
    
    // 更新从所有行星接收的引力
    updateGravityFromPlanets() {
        // 这个方法在引力系统参数改变时被调用
        // 不需要在这里做任何事，因为computeAcceleration()会实时读取引力参数
    }
    
    update(time, delta) {
        // 如果已经粘附到某个行星，检查是否需要重置
        if (this.isAttached) {
            this.updateAttachedState(time);
            return;
        }
        
        // 检查是否与任何行星碰撞
        for (const planet of this.targetPlanets) {
            if (this.checkCollisionWithPlanet(planet)) {
                this.attachToPlanet(planet);
                return;
            }
        }
        
        const deltaTime = delta / 1000;
        
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
        this.x = this.position.x;
        this.y = this.position.y;
        this.body.position.set(this.position.x, this.position.y);
        
        // 更新轨迹
        this.updateTrail();
    }
    
    // 更新粘附状态
    updateAttachedState(time) {
        if (!this.attachedPlanet) return;
        
        // 保持位置与行星相对固定
        this.updateAttachedPosition();
        
        // 检查重置计时器
        if (this.resetTimer && time >= this.resetTimer) {
            this.resetToInitialState();
        }
    }
    
    // 更新粘附位置
    updateAttachedPosition() {
        if (!this.attachedPlanet) return;
        
        const planetRadius = this.attachedPlanet.displayWidth / 2;
        const satelliteRadius = this.displayWidth / 2;
        const totalRadius = planetRadius + satelliteRadius;
        
        // 计算从行星到当前位置的方向
        const dx = this.position.x - this.attachedPlanet.x;
        const dy = this.position.y - this.attachedPlanet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // 保持卫星在行星表面上
            this.position.set(
                this.attachedPlanet.x + (dx / distance) * totalRadius,
                this.attachedPlanet.y + (dy / distance) * totalRadius
            );
        }
        
        // 更新显示位置
        this.x = this.position.x;
        this.y = this.position.y;
        this.body.position.set(this.position.x, this.position.y);
    }
    
    // 更新物理
    updatePhysics(dt) {
        // 计算所有行星的合力加速度
        this.computeTotalAcceleration();
        
        // 韦尔莱积分
        this.verletIntegration(dt);
    }
    
    // 计算所有行星对卫星的总加速度
    computeTotalAcceleration() {
        // 重置加速度
        this.acceleration.set(0, 0);
        this.planetAccelerations.clear();
        
        // 对每个行星计算引力加速度并累加
        for (const planet of this.targetPlanets) {
            const planetAcc = this.computeAccelerationFromPlanet(planet);
            this.acceleration.x += planetAcc.x;
            this.acceleration.y += planetAcc.y;
            
            // 存储每个行星的贡献（用于调试）
            this.planetAccelerations.set(planet, planetAcc.clone());
        }
    }
    
    // 计算单个行星对卫星的加速度（使用物理距离比例尺）
    computeAccelerationFromPlanet(planet) {
        const dx = planet.x - this.position.x;
        const dy = planet.y - this.position.y;
        
        const displayDistance = Math.sqrt(dx * dx + dy * dy);
        // 使用物理距离（考虑比例尺）
        const physicalDistance = this.gravitySystem ? 
            this.gravitySystem.getPhysicalDistance(displayDistance) : displayDistance;
        
        // 避免除零和过近的距离
        if (physicalDistance < 10) {
            return new Phaser.Math.Vector2(0, 0);
        }
        
        // 从引力系统获取该行星的幂律
        const power = this.gravitySystem ? this.gravitySystem.getPlanetPower(planet) : -2;
        
        // 根据幂律计算加速度（使用物理距离）
        let accMagnitude;
        
        if (power === 0) {
            // r^0 = 常数引力
            accMagnitude = this.G * planet.body.mass;
        } else if (power === -1) {
            // r^-1
            accMagnitude = this.G * planet.body.mass / physicalDistance;
        } else if (power === -2) {
            // r^-2 (万有引力)
            accMagnitude = this.G * planet.body.mass / (physicalDistance * physicalDistance);
        } else {
            // 通用幂律：a = G * M * r^power
            accMagnitude = this.G * planet.body.mass * Math.pow(physicalDistance, power);
        }
        
        // 加速度向量（方向使用显示距离计算）
        const directionX = dx / displayDistance;
        const directionY = dy / displayDistance;
        
        return new Phaser.Math.Vector2(
            directionX * accMagnitude,
            directionY * accMagnitude
        );
    }
    
    verletIntegration(dt) {
        // 保存当前位置
        const currentX = this.position.x;
        const currentY = this.position.y;
        
        // 韦尔莱积分
        const newX = 2 * this.position.x - this.previousPosition.x + this.acceleration.x * dt * dt;
        const newY = 2 * this.position.y - this.previousPosition.y + this.acceleration.y * dt * dt;
        
        // 更新位置
        this.previousPosition.set(this.position.x, this.position.y);
        this.position.set(newX, newY);
        
        // 计算并更新速度
        const velocityX = (newX - currentX) / dt;
        const velocityY = (newY - currentY) / dt;
        this.body.velocity.set(velocityX, velocityY);
    }
    
    // 检查是否与行星碰撞
    checkCollisionWithPlanet(planet) {
        if (this.isAttached) return false;
        
        // 计算两个物体之间的距离
        const dx = this.position.x - planet.x;
        const dy = this.position.y - planet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 计算两个物体的半径
        const planetRadius = planet.displayWidth / 2;
        const satelliteRadius = this.displayWidth / 2;
        const minDistance = planetRadius + satelliteRadius;
        
        // 如果距离小于两者半径之和，则发生碰撞
        return distance < minDistance;
    }
    
    // 粘附到行星
    attachToPlanet(planet) {
        this.isAttached = true;
        this.attachedPlanet = planet;
        
        // 计算碰撞时的动量
        const velocityMagnitude = Math.sqrt(
            this.body.velocity.x * this.body.velocity.x + 
            this.body.velocity.y * this.body.velocity.y
        );
        
        // 动量 = 质量 × 速度
        const momentum = this.mass * velocityMagnitude;
        
        // 计算伤害：伤害与动量成正比
        const damage = momentum * this.collisionDamageMultiplier;
        
        // 对行星造成伤害
        if (planet.takeDamage) {
            planet.takeDamage(damage);
        }
        
        // 停止所有运动
        this.body.velocity.set(0, 0);
        this.acceleration.set(0, 0);
        
        // 将卫星位置固定在行星上
        const planetRadius = planet.displayWidth / 2;
        const satelliteRadius = this.displayWidth / 2;
        const totalRadius = planetRadius + satelliteRadius;
        
        // 计算从行星中心到卫星的方向
        const dx = this.position.x - planet.x;
        const dy = this.position.y - planet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // 将卫星移动到行星表面
            this.position.set(
                planet.x + (dx / distance) * totalRadius,
                planet.y + (dy / distance) * totalRadius
            );
        } else {
            // 如果完全重叠，放在行星右侧
            this.position.set(
                planet.x + totalRadius,
                planet.y
            );
        }
        
        // 更新显示位置
        this.x = this.position.x;
        this.y = this.position.y;
        this.body.position.set(this.position.x, this.position.y);
        
        // 清除轨迹
        this.trail = [];
        if (this.trailGraphics) {
            this.trailGraphics.clear();
        }
        
        // 设置重置计时器（1秒后重置）
        this.resetTimer = this.scene.time.now + this.resetDelay;
        
        console.log(`卫星撞击行星，造成${damage.toFixed(2)}点伤害，1秒后重置`);
    }
    
    // 重置到初始状态
    resetToInitialState() {
        // 重置黏附状态
        this.isAttached = false;
        this.attachedPlanet = null;
        this.resetTimer = null;
        
        // 重置位置到初始位置
        this.position.set(this.initialX, this.initialY);
        this.previousPosition.set(this.initialX, this.initialY);
        
        // 重新初始化震荡速度
        this.initializeOscillationVelocity();
        
        // 清除轨迹
        this.trail = [];
        if (this.trailGraphics) {
            this.trailGraphics.clear();
        }
        
        // 重置时间跟踪
        this.lastUpdateTime = 0;
        
        // 更新显示位置
        this.x = this.position.x;
        this.y = this.position.y;
        this.body.position.set(this.position.x, this.position.y);
        
        console.log('卫星已重置到初始状态');
    }
    
    updateTrail() {
        // 如果已粘附，不更新轨迹
        if (this.isAttached) return;

        // 添加当前位置到轨迹
        this.trail.push({
            x: this.position.x,
            y: this.position.y,
            alpha: 1.0
        });
        
        // 限制轨迹长度
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // 更新轨迹透明度
        for (let i = 0; i < this.trail.length; i++) {
            this.trail[i].alpha = i / this.trail.length;
        }
        
        // 绘制轨迹
        this.drawTrail();
    }
    
    drawTrail() {
        if (!this.trailGraphics || this.trail.length < 2) return;
        
        this.trailGraphics.clear();
        
        // 使用固定颜色绘制轨迹
        const trailColor = 0x66aaff;
        
        // 绘制轨迹线
        this.trailGraphics.lineStyle(2, trailColor, 0.3);
        this.trailGraphics.beginPath();
        this.trailGraphics.moveTo(this.trail[0].x, this.trail[0].y);
        
        for (let i = 1; i < this.trail.length; i++) {
            this.trailGraphics.lineTo(this.trail[i].x, this.trail[i].y);
        }
        
        this.trailGraphics.strokePath();
        
        // 绘制轨迹点
        for (let i = 0; i < this.trail.length; i += 5) {
            const point = this.trail[i];
            const alpha = point.alpha * 0.5;
            this.trailGraphics.fillStyle(trailColor, alpha);
            this.trailGraphics.fillCircle(point.x, point.y, 2);
        }
    }
    
    // 重置卫星状态（手动重置）
    reset() {
        this.resetToInitialState();
    }

    destroy() {
        // 清理轨迹图形
        if (this.trailGraphics) {
            this.trailGraphics.destroy();
        }
        super.destroy();
    }
}