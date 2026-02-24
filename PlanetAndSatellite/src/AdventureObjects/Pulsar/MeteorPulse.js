import { GenericSatellite } from '../../generalClasses/GenericSatellite.js';

export class MeteorPulse extends GenericSatellite {
    constructor(scene, x, y, texture, targetPlanets, setHealthBar, radius, gravitySystem, setRestart) {
        super(scene, x, y, texture, targetPlanets, setHealthBar, radius, gravitySystem, setRestart);
        
        // 陨石特有属性
        this.orbitRadius = 600; // 绕转半径
        this.orbitAngle = 0; // 当前轨道角度
        this.planetCenter = { x: 0, y: 0 }; // 行星中心位置
        
        // 计算轨道速度（弧度/帧），根据距离的-3/2次方成正比
        // 基础速度为0.01，距离600
        this.calculateOrbitSpeed();
        
        // 轨迹红线相关属性
        this.trailPoints = []; // 存储轨迹点
        this.trailDuration = 3000; // 轨迹持续时间（毫秒）
        this.trailGraphics = null; // 轨迹绘制对象
        
        // 设置深度，确保陨石显示在其他元素之上
        this.setDepth(100);
        
        // 确保陨石可见
        this.visible = true;
        
        console.log('陨石创建成功，位置:', this.x, this.y);
        console.log('陨石纹理:', this.texture.key);
        console.log('陨石大小:', this.displayWidth, this.displayHeight);
        console.log('陨石可见性:', this.visible);
        
        // 初始化静态纹理
        this.initializeAnimation();
        
        // 初始化轨迹
        this.initializeTrail();
    }
    
    // 初始化静态纹理
    initializeAnimation() {
        console.log('初始化陨石静态纹理');
        console.log('陨石位置:', this.x, this.y);
        
        // 调整陨石大小，缩小到现在的60%
        this.setScale(0.072);
        
        // 不要覆盖纹理，使用构造函数中指定的纹理
        // this.setTexture('meteor_test');
        
        // 确保陨石可见
        this.visible = true;
        console.log('陨石纹理:', this.texture.key);
        console.log('陨石大小:', this.displayWidth, this.displayHeight);
        console.log('陨石可见性:', this.visible);
    }
    
    // 初始化轨迹
    initializeTrail() {
        this.trailGraphics = this.scene.add.graphics();
        this.trailGraphics.setDepth(5); // 轨迹在陨石下方
    }
    
    // 设置行星中心位置
    setPlanetCenter(x, y) {
        this.planetCenter.x = x;
        this.planetCenter.y = y;
    }
    
    // 设置轨道半径并重新计算速度
    setOrbitRadius(radius) {
        this.orbitRadius = radius;
        this.calculateOrbitSpeed();
    }
    
    // 更新轨道位置
    updateOrbitPosition() {
        // 保存当前位置用于计算飞行方向
        const oldX = this.x;
        const oldY = this.y;
        
        // 顺时针轨道运动
        this.orbitAngle += this.orbitSpeed;
        
        // 计算新位置
        const newX = this.planetCenter.x + Math.cos(this.orbitAngle) * this.orbitRadius;
        const newY = this.planetCenter.y + Math.sin(this.orbitAngle) * this.orbitRadius;
        
        // 计算飞行方向向量
        const dx = newX - oldX;
        const dy = newY - oldY;
        
        // 计算旋转角度（弧度）
        const angle = Math.atan2(dy, dx);
        
        // 应用旋转，使陨石头朝向飞行方向
        this.rotation = angle;
        
        // 更新位置
        if (this.position) {
            this.position.set(newX, newY);
        }
        this.x = newX;
        this.y = newY;
        
        // 更新previousPosition以避免物理引擎问题
        if (this.previousPosition) {
            this.previousPosition.set(newX, newY);
        }
    }
    
    // 计算轨道速度
    calculateOrbitSpeed() {
        // 基础速度为0.01，距离600
        const baseSpeed = 0.01;
        const baseRadius = 600;
        
        // 根据开普勒第三定律，轨道速度与距离的-3/2次方成正比
        this.orbitSpeed = baseSpeed * Math.pow(this.orbitRadius / baseRadius, -1.5);
        console.log(`陨石轨道速度计算：距离=${this.orbitRadius}，速度=${this.orbitSpeed}`);
    }
    
    // 绘制轨迹红线
    drawTrail(currentTime) {
        // 清除之前的轨迹
        this.trailGraphics.clear();
        
        // 移除超过3秒的轨迹点
        this.trailPoints = this.trailPoints.filter(point => currentTime - point.time < this.trailDuration);
        
        // 绘制轨迹红线，随时间渐变变淡
        if (this.trailPoints.length > 1) {
            // 分段绘制轨迹，每段使用不同的透明度
            for (let i = 0; i < this.trailPoints.length - 1; i++) {
                const currentPoint = this.trailPoints[i];
                const nextPoint = this.trailPoints[i + 1];
                
                // 计算当前点的时间比例（0-1），0表示最老，1表示最新
                const timeRatio = 1 - (currentTime - currentPoint.time) / this.trailDuration;
                
                // 计算透明度，最老的点透明度为0.1，最新的点透明度为1
                const alpha = 0.1 + timeRatio * 0.9;
                
                // 绘制这段轨迹
                this.trailGraphics.lineStyle(3, 0xff0000, alpha); // 3px宽的红线，透明度渐变
                this.trailGraphics.beginPath();
                this.trailGraphics.moveTo(currentPoint.x, currentPoint.y);
                this.trailGraphics.lineTo(nextPoint.x, nextPoint.y);
                this.trailGraphics.strokePath();
            }
        }
    }
    
    // 初始化速度
    initializeVelocity() {
        // 陨石沿固定轨道运动，设置初始速度为0
        this.initialVelocity = new Phaser.Math.Vector2(0, 0);
    }
    
    // 更新方法
    update(time, delta) {
        // 更新轨道位置
        this.updateOrbitPosition();
        
        // 添加当前位置到轨迹点数组
        this.trailPoints.push({ x: this.x, y: this.y, time: time });
        
        // 绘制轨迹红线
        this.drawTrail(time);
        
        // 不调用父类更新方法，避免物理引擎覆盖轨道位置
        // 只更新必要的属性
        this.body.position.set(this.position.x - this.body.width / 2, this.position.y - this.body.height / 2);
        this.body.updateBounds();
    }
    
    // 销毁方法
    destroy() {
        // 清理轨迹
        if (this.trailGraphics) {
            this.trailGraphics.destroy();
        }
        
        // 调用父类销毁方法
        super.destroy();
    }
}