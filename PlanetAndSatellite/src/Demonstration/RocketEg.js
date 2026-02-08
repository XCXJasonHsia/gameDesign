import { GenericRocket } from '../generalClasses/GenericRocket.js';

export class RocketEg extends GenericRocket {
    constructor(scene, x, y, texture, targetPlanets, setHealthBar, radius,  gravitySystem, infiniteFuel) {
        super(scene, x, y, texture, targetPlanets, setHealthBar, radius,  gravitySystem, infiniteFuel);
    }

    initializeVelocity() {
        // 确保有目标行星
        if (!this.targetPlanets || this.targetPlanets.length === 0) {
            console.warn('No target planets specified for satellite');
            return;
        }
        
        // 选择第一个目标行星作为轨道中心
        this.targetPlanet = this.targetPlanets[0];
        
        // 计算到行星的向量和距离
        const toPlanet = new Phaser.Math.Vector2(
            this.targetPlanet.x - this.position.x,
            this.targetPlanet.y - this.position.y
        );
        const displayDistance = toPlanet.length();
        
        // 避免除零错误
        if (displayDistance === 0) {
            console.warn('Rocket is at the same position as the planet');
            return;
        }
        
        // 根据powerManipulation决定使用哪个幂律值和G值
        const powerManipulation = this.gravitySystem && this.gravitySystem.scene ? this.gravitySystem.scene.powerManipulation : false;
        const power = !powerManipulation ? this.targetPlanet.power : (this.gravitySystem ? this.gravitySystem.getPlanetPower(this.targetPlanet) : this.targetPlanet.power);
        const G = !powerManipulation ? (this.targetPlanet.G || this.G) : (this.gravitySystem ? this.gravitySystem.G : (this.targetPlanet.G || this.G));
        
        // 使用与加速度计算相同的距离值（考虑比例尺）
        const physicalDistance = this.gravitySystem ? 
            this.gravitySystem.getPhysicalDistance(displayDistance) : displayDistance;
        
        // 避免除零和过近的距离
        if (physicalDistance < 10) {
            console.warn('Rocket is too close to the planet');
            return;
        }
        
        // 存储当前幂律值
        this.power = power;
        
        // 计算有效幂律（用于速度计算）
        const effectivePower = this.power + 1;
        
        // 根据当前幂律计算圆形轨道速度
        let orbitalSpeed;
        
        try {
            if (power === 0) {
                // r^0 = 常数引力
                orbitalSpeed = Math.sqrt(G * this.targetPlanet.mass * physicalDistance);
            } else if (power === -1) {
                // r^-1
                orbitalSpeed = Math.sqrt(G * this.targetPlanet.mass);
            } else if (power === -2) {
                // r^-2 (万有引力)
                orbitalSpeed = Math.sqrt(G * this.targetPlanet.mass / physicalDistance);
            } else {
                // 通用幂律：v = sqrt(G * M * r^(power + 1))
                orbitalSpeed = Math.sqrt(G * this.targetPlanet.mass * Math.pow(physicalDistance, effectivePower));
            }
            
            // 限制速度范围以确保稳定运动
            orbitalSpeed = Phaser.Math.Clamp(orbitalSpeed, 1, 1000);
            
            // 计算切向方向（垂直于径向）
            const tangent = new Phaser.Math.Vector2(
                -toPlanet.y / displayDistance,
                toPlanet.x / displayDistance
            );
            
            // 确保切向向量归一化
            tangent.normalize();
            
            // 设置初始速度
            const initialVelocity = tangent.scale(orbitalSpeed * 2 / 3);
            
            // 使用固定时间步长计算前一帧位置
            const dt = this.fixedTimeStep;
            this.previousPosition.set(
                this.position.x - initialVelocity.x * dt,
                this.position.y - initialVelocity.y * dt
            );
            
            // 调试信息
            console.log('Rocket initialized with:', {
                orbitalSpeed,
                power,
                G,
                physicalDistance,
                displayDistance
            });
            
        } catch (error) {
            console.error('Error calculating orbital velocity:', error);
        }
    }
}