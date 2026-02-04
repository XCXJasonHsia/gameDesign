import {GravitySystem} from '../Engines/GravitySystem.js'
/*
export class Satellite extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, targetPlanet, GravitySystem) {
        super(scene, x, y, texture);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.targetPlanet = targetPlanet; // 围绕的行星
        
        // 禁用物理引擎的自动位置更新，我们自己控制
        this.body.enable = false;

        // 引力参数
        this.power = gravitySystem ? gravitySystem.power : -2;
        this.G = gravitySystem ? gravitySystem.G : 8000;
        
        // 韦尔莱积分法所需的状态变量
        this.position = new Phaser.Math.Vector2(x, y);
        this.previousPosition = new Phaser.Math.Vector2(x, y);
        this.acceleration = new Phaser.Math.Vector2(0, 0);

        // 时间跟踪
        this.lastUpdateTime = 0;
        this.fixedTimeStep = 1 / 600; // 固定时间步长：60 FPS（改成600fps后进动问题明显改善）

        // 计算圆形轨道所需的初始速度
        //this.initializeOrbitalVelocity();
        const initialVelocity = new Phaser.Math.Vector2(0, -200);
        const dt = this.fixedTimeStep;
        this.previousPosition.set(
            this.position.x - initialVelocity.x * dt,
            this.position.y - initialVelocity.y * dt
        );
        // 积分方法选择
        this.integrator = 'velocityVerlet'; // 'verlet' 或 'velocityVerlet'

         // 存储轨道轨迹（用于可视化）
        this.trail = [];
        this.maxTrailLength = 100;
        
        // 创建轨迹图形（可选）
        this.createTrailGraphics(scene);
    }
    
    initializeOrbitalVelocity() {
        // 计算到行星的向量和距离
        const toPlanet = new Phaser.Math.Vector2(
            this.targetPlanet.x - this.position.x,
            this.targetPlanet.y - this.position.y
        );
        const distance = toPlanet.length();
        
        if (distance === 0) return;
        
        // 计算圆形轨道所需的速度大小：v = sqrt(G * M / r)
        const orbitalSpeed = Math.sqrt(this.G * this.targetPlanet.body.mass / distance);
        
        // 计算切向方向（垂直于半径方向）
        // 对于2D：切线向量 = (-dy, dx) / distance
        const tangent = new Phaser.Math.Vector2(
            -toPlanet.y / distance,
            toPlanet.x / distance
        );
        
        // 设置初始速度向量
        const initialVelocity = tangent.scale(orbitalSpeed);
        
        // 根据初始速度设置前一帧的位置（用于韦尔莱积分）
        // previous = current - velocity * dt
        const dt = this.fixedTimeStep;
        this.previousPosition.set(
            this.position.x - initialVelocity.x * dt,
            this.position.y - initialVelocity.y * dt
        );
    }
    
    //显示轨迹
    createTrailGraphics(scene) {
        this.trailGraphics = scene.add.graphics();
        this.trailColor = 0x66aaff;
    }

    
    updatePower(newPower) {
        // 更新幂律参数
        const oldPower = this.power;
        this.power = newPower;
        
        // 如果幂律改变很大，可能需要调整速度以避免轨道不稳定
        if (Math.abs(newPower - oldPower) > 0.5) {
            this.initializeOrbitalVelocity();
        }
        
    }

    update(time, delta) {
        // 使用固定时间步长进行物理更新
        const deltaTime = delta / 1000; // 转换为秒
        
        // 累积时间，进行多次固定步长更新（如果需要）
        if (this.lastUpdateTime === 0) {
            this.lastUpdateTime = time;
        }
        
        let frameTime = (time - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = time;
        
        // 限制最大步长，避免大跳跃
        frameTime = Math.min(frameTime, 0.1);
        
        // 使用固定时间步长进行子步更新
        let accumulator = 0;
        while (frameTime > 0) {
            const dt = Math.min(this.fixedTimeStep, frameTime);
            this.updatePhysics(dt);
            frameTime -= dt;
            accumulator += dt;
        }
        
        // 更新卫星的显示位置
        this.x = this.position.x;
        this.y = this.position.y;
        this.body.position.set(this.position.x, this.position.y);

        // 更新轨迹
        this.updateTrail();
    }
    
    updatePhysics(dt) {
        // 计算当前加速度
        this.computeAcceleration();
        
        // 根据选择的积分方法更新位置和速度
        if (this.integrator === 'verlet') {
            this.verletIntegration(dt);
        } else {
            this.velocityVerletIntegration(dt);
        }
    }
    
    computeAcceleration() {
        // 计算到行星的向量
        const dx = this.targetPlanet.x - this.position.x;
        const dy = this.targetPlanet.y - this.position.y;
        
        // 计算距离和方向
        const distanceSquared = dx * dx + dy * dy;
        const distance = Math.sqrt(distanceSquared);
        
        // 避免除零和过近的距离
        if (distance < 10) {
            this.acceleration.set(0, 0);
            return;
        }
        
        // 万有引力加速度公式：a = G * M / r²
        const accMagnitude = this.G * this.targetPlanet.body.mass / distanceSquared;
        
        // 加速度向量
        this.acceleration.set(
            (dx / distance) * accMagnitude,
            (dy / distance) * accMagnitude
        );
    }
    
    // 标准韦尔莱积分法
    verletIntegration(dt) {
        // 保存当前位置
        const currentX = this.position.x;
        const currentY = this.position.y;
        
        // 韦尔莱积分公式：newPosition = 2*current - previous + acceleration * dt²
        const newX = 2 * this.position.x - this.previousPosition.x + this.acceleration.x * dt * dt;
        const newY = 2 * this.position.y - this.previousPosition.y + this.acceleration.y * dt * dt;
        
        // 更新位置
        this.previousPosition.set(this.position.x, this.position.y);
        this.position.set(newX, newY);
        
        // 计算速度（可选，用于调试或显示）
        const velocityX = (newX - currentX) / dt;
        const velocityY = (newY - currentY) / dt;
        this.body.velocity.set(velocityX, velocityY);
    }
    
    // 速度韦尔莱积分法（更精确）
    velocityVerletIntegration(dt) {
        // 保存当前加速度
        const currentAcceleration = this.acceleration.clone();
        
        // 第一步：更新位置 using current velocity and acceleration
        // position += velocity * dt + 0.5 * acceleration * dt²
        // 但我们没有直接存储速度，所以使用位置计算
        if (this.velocity === undefined) {
            // 初始化速度
            const velocityX = (this.position.x - this.previousPosition.x) / dt;
            const velocityY = (this.position.y - this.previousPosition.y) / dt;
            this.velocity = new Phaser.Math.Vector2(velocityX, velocityY);
        }
        
        // 更新位置
        this.previousPosition.set(this.position.x, this.position.y);
        const newX = this.position.x + this.velocity.x * dt + 0.5 * currentAcceleration.x * dt * dt;
        const newY = this.position.y + this.velocity.y * dt + 0.5 * currentAcceleration.y * dt * dt;
        this.position.set(newX, newY);
        
        // 第二步：计算新的加速度
        const oldAcceleration = currentAcceleration;
        this.computeAcceleration(); // 计算新位置处的加速度
        const newAcceleration = this.acceleration;
        
        // 第三步：更新速度 using average of old and new acceleration
        // velocity += 0.5 * (oldAcceleration + newAcceleration) * dt
        this.velocity.x += 0.5 * (oldAcceleration.x + newAcceleration.x) * dt;
        this.velocity.y += 0.5 * (oldAcceleration.y + newAcceleration.y) * dt;
        
        // 同步物理引擎的速度
        this.body.velocity.set(this.velocity.x, this.velocity.y);
    }
}
*/
// 场景使用示例
/*
class GameScene extends Phaser.Scene {
    create() {
        // 启用物理
        this.physics.world.setFPS(60);
        
        // 创建行星（位置在屏幕中心）
        const planet = new Planet(this, 400, 300, 'planet');
        
        // 创建卫星（距离行星一定距离）
        const satellite = new Satellite(this, 550, 300, 'satellite', planet);
        
        // 调试信息显示
        let debugText = this.add.text(10, 10, '', {
            fontSize: '16px',
            fill: '#fff'
        });
        
        // 更新循环
        this.events.on('update', (time, delta) => {
            // 卫星的update方法会处理物理更新
            satellite.update(time, delta);
            
            // 显示调试信息
            const energy = satellite.getOrbitalEnergy ? satellite.getOrbitalEnergy() : 0;
            debugText.setText([
                `Frame Delta: ${delta}ms`,
                `Energy: ${energy.toFixed(2)}`,
                `Distance: ${Math.sqrt(
                    Math.pow(satellite.x - planet.x, 2) + 
                    Math.pow(satellite.y - planet.y, 2)
                ).toFixed(1)}`
            ]);
        });
    }
}
*/



export class Satellite extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, targetPlanet, gravitySystem) {
        super(scene, x, y, texture);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.targetPlanet = targetPlanet;
        this.gravitySystem = gravitySystem;
        
        // 禁用物理引擎的自动位置更新
        this.body.enable = false;
        
        // 韦尔莱积分法状态变量
        this.position = new Phaser.Math.Vector2(x, y);
        this.previousPosition = new Phaser.Math.Vector2(x, y);
        this.acceleration = new Phaser.Math.Vector2(0, 0);
        
        // 引力参数
        this.power = gravitySystem ? gravitySystem.power : -2;
        this.G = gravitySystem ? gravitySystem.G : 8000;
        
        // 时间跟踪
        this.lastUpdateTime = 0;
        this.fixedTimeStep = 1 / 200;
        
        // 计算初始轨道速度（基于当前幂律）
        this.initializeOrbitalVelocity();

        // 存储轨道轨迹（用于可视化）
        this.trail = [];
        this.maxTrailLength = 80;
        
        // 创建轨迹图形
        this.createTrailGraphics(scene);

        // 设置碰撞机制
        this.setupCollisionProperties();

        // 设置星球宽度
        this.displayWidth = 15;
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

        // 初始时未粘附
        this.isAttached = false;
    }
    
    createTrailGraphics(scene) {
        this.trailGraphics = scene.add.graphics();
        this.trailColor = 0x66aaff;
    }
    
    initializeOrbitalVelocity() {
        const toPlanet = new Phaser.Math.Vector2(
            this.targetPlanet.x - this.position.x,
            this.targetPlanet.y - this.position.y
        );
        const distance = toPlanet.length();
        
        if (distance === 0) return;
        
        // 根据当前幂律计算圆形轨道速度
        // 对于幂律引力，圆形轨道速度公式：v = sqrt(G * M * r^(power))
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
    
    updatePower(newPower) {
        // 更新幂律参数
        const oldPower = this.power;
        this.power = newPower;
        /*
        // 如果幂律改变很大，可能需要调整速度以避免轨道不稳定
        if (Math.abs(newPower - oldPower) > 0.5) {
            this.initializeOrbitalVelocity();
        }
        */
    }
    
    update(time, delta) {
        // 如果已经粘附，不进行物理更新
        if (this.isAttached) {
            // 保持位置与行星相对固定
            this.updateAttachedPosition();
            return;
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
            
            // 使用连续碰撞检测
            this.updatePhysicsWithCCD(dt);
            
            frameTime -= dt;
        }
        
        // 更新显示位置
        this.x = this.position.x;
        this.y = this.position.y;
        this.body.position.set(this.position.x, this.position.y);
        
        // 更新轨迹
        this.updateTrail();
    }
    
    // 更新粘附位置
    updateAttachedPosition() {
        const planetRadius = this.targetPlanet.displayWidth / 2;
        const satelliteRadius = this.displayWidth / 2;
        const totalRadius = planetRadius + satelliteRadius;
        
        // 计算从行星到当前位置的方向
        const dx = this.position.x - this.targetPlanet.x;
        const dy = this.position.y - this.targetPlanet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // 保持卫星在行星表面上
            this.position.set(
                this.targetPlanet.x + (dx / distance) * totalRadius,
                this.targetPlanet.y + (dy / distance) * totalRadius
            );
        }
        
        // 更新显示位置
        this.x = this.position.x;
        this.y = this.position.y;
        this.body.position.set(this.position.x, this.position.y);
    }
    
    // 带连续碰撞检测的物理更新
    updatePhysicsWithCCD(dt) {
        // 计算当前位置的速度
        const velocityX = (this.position.x - this.previousPosition.x) / dt;
        const velocityY = (this.position.y - this.previousPosition.y) / dt;
        const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
        
        // 计算物体的半径
        const planetRadius = this.targetPlanet.displayWidth / 2;
        const satelliteRadius = this.displayWidth / 2;
        const minDistanceForCollision = planetRadius + satelliteRadius;
        
        // 计算这一帧的位移向量
        const displacementX = velocityX * dt;
        const displacementY = velocityY * dt;
        const displacementLength = Math.sqrt(displacementX * displacementX + displacementY * displacementY);
        
        // 如果位移很小，使用普通检测
        if (displacementLength < minDistanceForCollision * 0.5) {
            this.updatePhysics(dt);
            this.checkCollisionWithPlanet();
            return;
        }
        
        // 使用连续碰撞检测：将位移分成多个小段
        const segments = Math.ceil(displacementLength / (minDistanceForCollision * 0.5));
        const segmentDt = dt / segments;
        const segmentDx = displacementX / segments;
        const segmentDy = displacementY / segments;
        
        let collided = false;
        
        for (let i = 0; i < segments; i++) {
            // 保存当前位置
            const currentX = this.position.x;
            const currentY = this.position.y;
            
            // 应用一小段位移
            this.position.x += segmentDx;
            this.position.y += segmentDy;
            
            // 检查碰撞
            if (this.checkCollisionWithPlanet()) {
                // 发生碰撞，调整位置到碰撞点
                this.position.x = currentX;
                this.position.y = currentY;
                this.attachToPlanet();
                collided = true;
                break;
            }
            
            // 更新前一帧位置用于下一段计算
            this.previousPosition.x = currentX;
            this.previousPosition.y = currentY;
        }
        
        // 如果没有碰撞，正常更新加速度
        if (!collided) {
            this.computeAcceleration();
            
            // 保存当前位置
            const currentX = this.position.x;
            const currentY = this.position.y;
            
            // 韦尔莱积分
            const newX = 2 * this.position.x - this.previousPosition.x + this.acceleration.x * dt * dt;
            const newY = 2 * this.position.y - this.previousPosition.y + this.acceleration.y * dt * dt;
            
            // 更新位置
            this.previousPosition.set(currentX, currentY);
            this.position.set(newX, newY);
            
            // 更新速度
            const newVelocityX = (newX - currentX) / dt;
            const newVelocityY = (newY - currentY) / dt;
            this.body.velocity.set(newVelocityX, newVelocityY);
        }
    }
    
    // 改进的碰撞检测
    checkCollisionWithPlanet() {
        if (this.isAttached) return false;
        
        // 计算两个物体之间的距离
        const dx = this.position.x - this.targetPlanet.x;
        const dy = this.position.y - this.targetPlanet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 计算两个物体的半径
        const planetRadius = this.targetPlanet.displayWidth / 2;
        const satelliteRadius = this.displayWidth / 2;
        const minDistance = planetRadius + satelliteRadius;
        
        // 增加一个缓冲区，防止刚好擦边而过
        const buffer = 2; // 2像素的缓冲区
        return distance < (minDistance + buffer);
    }
    
    // 原有的 updatePhysics 方法可以保留，但改为私有方法
    updatePhysics(dt) {
        // 计算加速度（使用当前幂律）
        this.computeAcceleration();
        
        // 韦尔莱积分
        this.verletIntegration(dt);
        
        // 检查碰撞
        this.checkCollisionWithPlanet();
    }
    
    
    // 粘附到行星
    attachToPlanet() {
        this.isAttached = true;
        
        // 停止所有运动
        this.body.velocity.set(0, 0);
        this.acceleration.set(0, 0);
        
        // 将卫星位置固定在行星上（考虑两个物体的半径）
        // 假设两个物体半径相同或行星较大，将卫星放在行星表面上
        const planetRadius = this.targetPlanet.displayWidth / 2;
        const satelliteRadius = this.displayWidth / 2;
        const totalRadius = planetRadius + satelliteRadius;
        
        // 计算从行星中心到卫星的方向
        const dx = this.position.x - this.targetPlanet.x;
        const dy = this.position.y - this.targetPlanet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // 将卫星移动到行星表面
            this.position.set(
                this.targetPlanet.x + (dx / distance) * totalRadius,
                this.targetPlanet.y + (dy / distance) * totalRadius
            );
        } else {
            // 如果完全重叠，放在行星右侧
            this.position.set(
                this.targetPlanet.x + totalRadius,
                this.targetPlanet.y
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
        
        //console.log('卫星已粘附到行星上');
    }
    
    // 检查是否与行星碰撞
    checkCollisionWithPlanet() {
        if (this.isAttached) return false;
        
        // 计算两个物体之间的距离
        const dx = this.position.x - this.targetPlanet.x;
        const dy = this.position.y - this.targetPlanet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 计算两个物体的半径
        const planetRadius = this.targetPlanet.displayWidth / 2;
        const satelliteRadius = this.displayWidth / 2;
        const minDistance = planetRadius + satelliteRadius;
        
        // 如果距离小于两者半径之和，则发生碰撞
        return distance < minDistance;
    }
    
    computeAcceleration() {
        const dx = this.targetPlanet.x - this.position.x;
        const dy = this.targetPlanet.y - this.position.y;
        
        const distanceSquared = dx * dx + dy * dy;
        const distance = Math.sqrt(distanceSquared);
        
        // 避免除零和过近的距离
        if (distance < 10) {
            this.acceleration.set(0, 0);
            return;
        }
        
        // 根据幂律计算加速度
        let accMagnitude;
        
        if (this.power === 0) {
            // r^0 = 常数引力
            accMagnitude = this.G * this.targetPlanet.body.mass;
        } else if (this.power === -1) {
            // r^-1
            accMagnitude = this.G * this.targetPlanet.body.mass / distance;
        } else if (this.power === -2) {
            // r^-2 (万有引力)
            accMagnitude = this.G * this.targetPlanet.body.mass / distanceSquared;
        } else {
            // 通用幂律：a = G * M * r^power
            accMagnitude = this.G * this.targetPlanet.body.mass * Math.pow(distance, this.power);
        }
        
        // 加速度向量
        this.acceleration.set(
            (dx / distance) * accMagnitude,
            (dy / distance) * accMagnitude
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
        
        // 根据幂律改变轨迹颜色
        let trailColor = this.trailColor;
        if (this.power < -2) {
            trailColor = 0xff6666; // 红色轨迹表示强引力
        } else if (this.power > -2) {
            trailColor = 0x66aaff; // 蓝色轨迹表示弱引力
        }
        
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
    
     // 重置卫星状态
    reset() {
        // 重置黏附状态
        this.isAttached = false;
        
        // 禁用物理身体
        this.body.enable = false;
        
        // 移除碰撞检测器（如果存在）
        if (this.scene.physics.world) {
            // 需要保存对碰撞器的引用以便移除
            // 这里简化处理，实际使用时可能需要改进
        }
        
        // 重置轨迹
        this.trail = [];
        if (this.trailGraphics) {
            this.trailGraphics.clear();
        }
        
        // 重置时间跟踪
        this.lastUpdateTime = 0;
    }

    destroy() {
        // 清理轨迹图形
        if (this.trailGraphics) {
            this.trailGraphics.destroy();
        }
        super.destroy();
    }
}