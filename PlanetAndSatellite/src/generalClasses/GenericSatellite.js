export class GenericSatellite extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, targetPlanets, setHealthBar, radius,  gravitySystem) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.targetPlanets = targetPlanets;
        this.gravitySystem = gravitySystem;

        // 引力参数 - 现在每个行星有不同的幂律，所以这里存储G值;当不改变幂律时默认按照第一个行星的幂律来
        this.G = (gravitySystem && this.scene.powerManipulation === true) ? gravitySystem.G : this.targetPlanets[0].G;

        // 存储初始位置
        this.initialX = x;
        this.initialY = y;
        this.initialVelocity = null;
        
        // 禁用物理引擎的自动位置更新
        this.body.enable = false;

        // 韦尔莱积分法状态变量
        this.position = new Phaser.Math.Vector2(x, y);
        this.previousPosition = new Phaser.Math.Vector2(x, y);
        this.acceleration = new Phaser.Math.Vector2(0, 0);

        // 时间跟踪
        this.lastUpdateTime = 0;
        this.fixedTimeStep = 1 / 200;

        // to be defined in the inheritance class
        this.initializeVelocityForVerlet();

        // 存储轨道轨迹（用于可视化）
        this.trail = [];
        this.maxTrailLength = 80;
        
        // 创建轨迹图形
        this.createTrailGraphics(scene);

        // 设置卫星宽度 to be defined
        this.radius = radius;
        this.displayHeight = 2 * this.radius;
        this.displayWidth = 2 * this.radius;
        
        // 设置body尺寸
        if (this.body) {
            this.body.width = 2 * this.radius;
            this.body.height = 2 * this.radius;
            this.body.updateBounds();
        }
        
        // 粘附状态
        this.isAttached = false;
        this.attachedPlanet = null;
        
        // 卫星属性
        this.setHealthBar = setHealthBar;
        this.mass = 10; // 卫星质量
        this.collisionDamageMultiplier = 0.005; // 伤害系数

        // 血量系统
        this.maxHealth = 100; // 最大血量
        this.health = this.maxHealth; // 当前血量
        this.healthBarHeight = null;
        this.setHealthBarHeight(); // 血条与卫星的竖直方向高度差
        // 当setHealthBar为true时创建血条
        if (this.setHealthBar) {
            this.createHealthBar(scene);
        }

        // 碰撞后重置的计时器
        this.resetTimer = null;
        this.resetDelay = 1000; // 1秒后重置
    }

    setHealthBarHeight() {
        this.healthBarHeight = 25;
    }

    initializeVelocityForVerlet() {
        // 确保有目标行星
        if (!this.targetPlanets || this.targetPlanets.length === 0) {
            console.warn('No target planets specified for satellite');
            return;
        }
        
        this.initializeVelocity();
            
        // 使用固定时间步长计算前一帧位置
        const dt = this.fixedTimeStep;
        this.previousPosition.set(
            this.position.x - this.initialVelocity.x * dt,
            this.position.y - this.initialVelocity.y * dt
        );
    }

    initializeVelocity() {};

    // 创建血条
    createHealthBar(scene) {
        // 血量文本
        const healthPercent = Math.floor((this.health / this.maxHealth) * 100);
        this.healthText = scene.add.text(
            this.x - 25, this.y - this.displayHeight/2 - this.healthBarHeight, // 初始位置，向左移动25px，使用healthBarHeight控制高度差
            `血量: ${healthPercent}%`,
            {
                fontSize: '9.18px', // 缩小15%
                fill: '#ffffff',
                backgroundColor: '#00000080',
                padding: { x: 2.3, y: 1.5 } // 相应缩小15%
            }
        );
        this.healthText.setOrigin(0, 0.5); // 左对齐
        this.healthText.setDepth(1000);
        
        // 获取文字宽度，使血条与之等长
        const textWidth = this.healthText.width;
        
        // 血条背景（红色，表示已消耗的部分）
        this.healthBarBg = scene.add.rectangle(
            this.x - 25, this.y - this.displayHeight/2 - this.healthBarHeight + 9, // 向左移动25px，使用healthBarHeight控制高度差
            textWidth, 6.12, // 与文字等长，高度缩小15%
            0xff0000 // 红色背景
        );
        this.healthBarBg.setOrigin(0, 0.5); // 左对齐
        this.healthBarBg.setDepth(1000);
        
        // 血条前景
        this.healthBar = scene.add.rectangle(
            this.x - 25, this.y - this.displayHeight/2 - this.healthBarHeight + 9, // 向左移动25px，使用healthBarHeight控制高度差
            textWidth, 6.12, // 与文字等长，高度缩小15%
            0x00ff00
        );
        this.healthBar.setOrigin(0, 0.5); // 左对齐，与背景一致
        this.healthBar.setDepth(1000);
    }

    // 更新血条
    updateHealthBar() {
        if (!this.setHealthBar) return;
        
        // 更新血条和文本位置，使其始终位于卫星正上方
        const healthTextY = this.y - this.displayHeight/2 - this.healthBarHeight;
        const healthBarY = this.y - this.displayHeight/2 - this.healthBarHeight + 9;
        const healthX = this.x - 25; // 向左移动25px
        
        if (this.healthText) {
            this.healthText.setPosition(healthX, healthTextY);
            this.healthText.setOrigin(0, 0.5); // 左对齐
            const healthPercent = Math.floor((this.health / this.maxHealth) * 100);
            this.healthText.setText(`血量: ${healthPercent}%`);
        }
        
        // 获取文字宽度，使血条与之等长
        const textWidth = this.healthText ? this.healthText.width : 60;
        
        if (this.healthBarBg) {
            this.healthBarBg.setPosition(healthX, healthBarY);
            this.healthBarBg.setOrigin(0, 0.5); // 左对齐
            this.healthBarBg.width = textWidth; // 与文字等长
        }
        
        if (this.healthBar) {
            // 保持血条前景的原点为左侧，与背景一致
            this.healthBar.setOrigin(0, 0.5);
            this.healthBar.setPosition(healthX, healthBarY);
            
            const healthPercent = this.health / this.maxHealth;
            // 计算血条宽度，从左侧开始向右扩展
            this.healthBar.width = textWidth * healthPercent;
            
            // 根据血量改变颜色
            if (healthPercent > 0.5) {
                this.healthBar.fillColor = 0x00ff00; // 绿色
            } else if (healthPercent > 0.2) {
                this.healthBar.fillColor = 0xffff00; // 黄色
            } else {
                this.healthBar.fillColor = 0xff0000; // 红色
            }
        }

        // 血量为0时复用重置逻辑
        if(this.health === 0) {
            isattached = true;
        }
    }

    // 受到伤害
    takeDamage(damage) {
        if (!this.setHealthBar) return;
        
        this.health -= damage;
        
        // 确保血量不为负
        if (this.health < 0) {
            this.health = 0;
        }
        
        // 更新血条
        this.updateHealthBar();
        
        // 如果血量为0，重置卫星
        if (this.health <= 0) {
            this.resetToInitialState();
        }
        
        // 添加伤害数字显示
        this.showDamageNumber(damage);
    }

    // 显示伤害数字
    showDamageNumber(damage) {
        const damageText = this.scene.add.text(
            this.x + Phaser.Math.Between(-20, 20),
            this.y - this.displayWidth / 2 - 30,
            `-${damage.toFixed(1)}`,
            {
                fontSize: '12px',
                fill: '#ff0000',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        damageText.setOrigin(0.5, 0.5);
        
        // 伤害数字动画：向上飘动并淡出
        this.scene.tweens.add({
            targets: damageText,
            y: damageText.y - 30,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                damageText.destroy();
            }
        });
    }

    // show the trail of the satellite
    createTrailGraphics(scene) {
        this.trailGraphics = scene.add.graphics();
        this.trailColor = 0x66aaff;
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
        
        // 检查是否与其他卫星碰撞
        this.checkCollisionWithOtherSatellites();
        
        //const deltaTime = delta / 1000;
        
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
        this.body.position.set(this.position.x - this.body.width / 2, this.position.y - this.body.height / 2);
        this.body.updateBounds();
        
        // 更新轨迹
        this.updateTrail();
        
        // 更新血条
        if (this.setHealthBar) {
            this.updateHealthBar();
        }
    }
    
    // 检查是否与其他卫星碰撞
    checkCollisionWithOtherSatellites() {
        if (!this.gravitySystem || !this.gravitySystem.satellites) return;
        
        for (const otherSatellite of this.gravitySystem.satellites) {
            // 跳过自身
            if (otherSatellite === this) continue;
            
            // 跳过已经粘附或销毁的卫星
            if (otherSatellite.isAttached || !otherSatellite.active) continue;
            
            // 检查碰撞
            if (this.checkCollisionWithSatellite(otherSatellite)) {
                //console.log('satellites about to collide.');
                this.handleSatelliteCollision(otherSatellite);
                break;
            }
        }
    }
    
    // 检查是否与单个卫星碰撞
    checkCollisionWithSatellite(satellite) {
        // 计算两个卫星之间的距离
        const dx = this.position.x - satellite.position.x;
        const dy = this.position.y - satellite.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 确保获取正确的半径值
        const thisRadius = this.radius || (this.displayWidth / 2);
        const otherRadius = satellite.radius || (satellite.displayWidth / 2);
        
        // 计算两个卫星的半径之和
        const minDistance = thisRadius + otherRadius;
        
        // 如果距离小于两者半径之和，则发生碰撞
        return distance < minDistance;
    }
    
    // 处理卫星之间的碰撞
    handleSatelliteCollision(otherSatellite) {
        console.log('Satellite collision detected!');
        
        // 设置粘附状态
        this.isAttached = true;
        otherSatellite.isAttached = true;
        
        // 计算碰撞时的动量
        const velocityMagnitude = Math.sqrt(
            this.body.velocity.x * this.body.velocity.x + 
            this.body.velocity.y * this.body.velocity.y
        );
        
        // 动量 = 质量 × 速度
        const momentum = this.mass * velocityMagnitude;
        
        // 计算伤害：伤害与动量成正比
        const damage = momentum * this.collisionDamageMultiplier;
        
        // 对两个卫星都造成伤害
        if (this.setHealthBar === true && this.takeDamage) {
            this.takeDamage(damage);
        }
        if (otherSatellite.setHealthBar === true && otherSatellite.takeDamage) {
            otherSatellite.takeDamage(damage);
        }
        
        // 停止所有运动
        this.body.velocity.set(0, 0);
        this.acceleration.set(0, 0);
        
        otherSatellite.body.velocity.set(0, 0);
        otherSatellite.acceleration.set(0, 0);
        
        // 调整卫星位置，使它们接触但不重叠
        const thisRadius = this.radius || (this.displayWidth / 2);
        const otherRadius = otherSatellite.radius || (otherSatellite.displayWidth / 2);
        const totalRadius = thisRadius + otherRadius;
        
        // 计算从当前卫星到另一个卫星的方向
        const dx = otherSatellite.position.x - this.position.x;
        const dy = otherSatellite.position.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // 调整两个卫星的位置
            const directionX = dx / distance;
            const directionY = dy / distance;
            
            // 将两个卫星分开到刚好接触的位置
            const midX = (this.position.x + otherSatellite.position.x) / 2;
            const midY = (this.position.y + otherSatellite.position.y) / 2;
            
            this.position.set(
                midX - directionX * totalRadius / 2,
                midY - directionY * totalRadius / 2
            );
            
            otherSatellite.position.set(
                midX + directionX * totalRadius / 2,
                midY + directionY * totalRadius / 2
            );
        } else {
            // 如果完全重叠，将另一个卫星放在当前卫星的右侧
            otherSatellite.position.set(
                this.position.x + totalRadius,
                this.position.y
            );
        }
        
        // 更新显示位置
        this.x = this.position.x;
        this.y = this.position.y;
        this.body.position.set(this.position.x, this.position.y);
        
        otherSatellite.x = otherSatellite.position.x;
        otherSatellite.y = otherSatellite.position.y;
        otherSatellite.body.position.set(otherSatellite.position.x, otherSatellite.position.y);
        
        // 清除轨迹
        this.trail = [];
        if (this.trailGraphics) {
            this.trailGraphics.clear();
        }
        
        otherSatellite.trail = [];
        if (otherSatellite.trailGraphics) {
            otherSatellite.trailGraphics.clear();
        }
        
        // 设置重置计时器（1秒后重置）
        this.resetTimer = this.scene.time.now + this.resetDelay;
        otherSatellite.resetTimer = this.scene.time.now + this.resetDelay;
        
        console.log(`卫星碰撞，造成${damage.toFixed(2)}点伤害,1秒后重置`);
    }

    // 更新粘附状态
    updateAttachedState(time) {
        if (this.attachedPlanet) {
            // 保持位置与行星相对固定
        this.updateAttachedPosition();
        }
        
        // 检查重置计时器
        if (this.resetTimer && time >= this.resetTimer) {
            this.resetToInitialState();
        }
    }
    // 更新粘附位置
    updateAttachedPosition() {
        if (!this.attachedPlanet) return;
        
        const totalRadius = this.attachedPlanet.radius + this.radius;
        
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
    // 重置到初始状态
    resetToInitialState() {
        // 重置黏附状态
        this.isAttached = false;
        this.attachedPlanet = null;
        this.resetTimer = null;
        
        // 重置位置到初始位置
        this.position.set(this.initialX, this.initialY);
        this.previousPosition.set(this.initialX, this.initialY);
        
        // 重新初始化速度
        this.initializeVelocityForVerlet();
        
        // 清除轨迹
        this.trail = [];
        if (this.trailGraphics) {
            this.trailGraphics.clear();
        }
        
        // 重置血量到最大值
        if (this.setHealthBar) {
            this.health = this.maxHealth;
            this.updateHealthBar();
        }
        
        // 重置时间跟踪
        this.lastUpdateTime = 0;
        
        // 更新显示位置
        this.x = this.position.x;
        this.y = this.position.y;
        this.body.position.set(this.position.x, this.position.y);
        
        // 重置所有设置了setHealthBar的planet、satellite或rocket的血量为最大
        if (this.targetPlanets) {
            this.targetPlanets.forEach(planet => {
                if (planet.setHealthBar && planet.maxHealth) {
                    planet.health = planet.maxHealth;
                    if (planet.updateHealthBarPosition) {
                        planet.updateHealthBarPosition();
                    }
                }
            });
        }
        
        if (this.gravitySystem && this.gravitySystem.satellites) {
            this.gravitySystem.satellites.forEach(satellite => {
                if (satellite.setHealthBar && satellite.maxHealth) {
                    satellite.health = satellite.maxHealth;
                    if (satellite.updateHealthBar) {
                        satellite.updateHealthBar();
                    }
                }
            });
        }
        
        console.log('卫星已重置到初始状态');
        console.log('所有设置了setHealthBar的天体血量已重置为最大值');

    }

    // 检查是否与行星碰撞
    checkCollisionWithPlanet(planet) {
        if (this.isAttached) return false;
        
        // 计算两个物体之间的距离
        const dx = this.position.x - planet.x;
        const dy = this.position.y - planet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 确保获取正确的半径值
        const planetRadius = planet.radius || (planet.displayWidth / 2);
        const satelliteRadius = this.radius || (this.displayWidth / 2);
        
        // 计算最小碰撞距离
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
        if (planet.setHealthBar === true && planet.takeDamage) {
            planet.takeDamage(damage);
        }
        
        // 停止所有运动
        this.body.velocity.set(0, 0);
        this.acceleration.set(0, 0);
        
        // 将卫星位置固定在行星上
        const planetRadius = planet.radius || (planet.displayWidth / 2);
        const satelliteRadius = this.radius || (this.displayWidth / 2);
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

    // 更新物理
    updatePhysics(dt) {
        // 计算所有行星的合力加速度
        this.computeTotalAcceleration();
        
        // 韦尔莱积分
        this.verletIntegration(dt);
    }
    
    // 计算所有行星对卫星的总加速度
    computeTotalAcceleration() {
        if (this.isAttached) return;
        // 重置加速度
        this.acceleration.set(0, 0);
        //this.planetAccelerations.clear();

        // to be defined in genericRocket
        this.rocketBoostAcceleration();
        // 对每个行星计算引力加速度并累加
        for (const planet of this.targetPlanets) {
            const planetAcc = this.computeAccelerationFromPlanet(planet);
            this.acceleration.x += planetAcc.x;
            this.acceleration.y += planetAcc.y;
            
            // 存储每个行星的贡献（用于调试）
            //this.planetAccelerations.set(planet, planetAcc.clone());
        }
    }
    
    rocketBoostAcceleration() {}

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
        
        // 根据powerManipulation决定使用哪个幂律值和G值
        const powerManipulation = this.gravitySystem && this.gravitySystem.scene ? this.gravitySystem.scene.powerManipulation : false;
        const power = !powerManipulation ? planet.power : (this.gravitySystem ? this.gravitySystem.getPlanetPower(planet) : planet.power);
        const G = !powerManipulation ? (planet.G || this.G) : (this.gravitySystem ? this.gravitySystem.G : (planet.G || this.G));
        
        // 根据幂律计算加速度（使用物理距离）
        let accMagnitude;
        
        if (power === 0) {
            // r^0 = 常数引力
            accMagnitude = G * planet.mass;
        } else if (power === -1) {
            // r^-1
            accMagnitude = G * planet.mass / physicalDistance;
        } else if (power === -2) {
            // r^-2 (万有引力)
            accMagnitude = G * planet.mass / (physicalDistance * physicalDistance);
        } else {
            // 通用幂律：a = G * M * r^power
            accMagnitude = G * planet.mass * Math.pow(physicalDistance, power);
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