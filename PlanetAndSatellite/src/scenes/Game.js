import {Planet} from '../GameObjects/Planet.js'
import {Satellite} from '../GameObjects/Satellite.js'
import {GravitySystem} from '../Engines/GravitySystem.js'

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
        
    }

    create() {
        //创建背景
        this.add.image(400, 300, 'bg');

        // 创建引力系统
        this.gravitySystem = new GravitySystem(this);

        // 创建行星
        const planet = new Planet(this, 400, 300, 'star');
        this.gravitySystem.addPlanet(planet);
        
        //创建卫星组，之后以一个卫星作为展示
        const satellites = [];
        const distances = [150];
        const angles = [0];
        
        angles.forEach(angle => {
            distances.forEach(distance => {
                const x = planet.x + Math.cos(angle) * distance;
                const y = planet.y + Math.sin(angle) * distance;
                
                const satellite = new Satellite(
                    this, x, y, 'star', 
                    planet, this.gravitySystem
                );
                
                this.gravitySystem.addSatellite(satellite);
                satellites.push(satellite);
            });
        });

        /*
        // 创建多个卫星展示不同初始条件
        const satellites = [];
        
        // 不同距离的卫星
        const distances = [150, 200, 250];
        const angles = [0, Math.PI/2, Math.PI];
        
        angles.forEach(angle => {
            distances.forEach(distance => {
                const x = planet.x + Math.cos(angle) * distance;
                const y = planet.y + Math.sin(angle) * distance;
                
                const satellite = new Satellite(
                    this, x, y, 'satellite', 
                    planet, this.gravitySystem
                );
                
                this.gravitySystem.addSatellite(satellite);
                satellites.push(satellite);
            });
        });
        */
        // 创建信息显示
        this.infoText = this.add.text(20, 100, '', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#00000080',
            padding: { x: 10, y: 5 }
        });
        
        // 更新循环
        this.events.on('update', (time, delta) => {
            // 更新所有卫星
            satellites.forEach(sat => {
                sat.update(time, delta);
            });
            
            // 更新信息显示
            if (satellites.length > 0) {
                const sat = satellites[0];
                const dx = sat.x - planet.x;
                const dy = sat.y - planet.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const velocity = Math.sqrt(sat.body.velocity.x ** 2 + sat.body.velocity.y ** 2);
                
                this.infoText.setText([
                    `距离: ${distance.toFixed(1)}`,
                    `速度: ${velocity.toFixed(1)}`,
                    `引力强度: ${Math.abs(this.gravitySystem.power).toFixed(2)}`,
                    `拖动滑动条改变引力幂律`
                ]);
            }
        });

        // 启用物理世界的碰撞
        this.physics.world.setBoundsCollision(true, true, true, true);

        // 添加重置按钮（可选）
        // 在 Game.js 的 resetButton 部分修改：
        const resetButton = this.add.text(600, 50, '重置轨道', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        })
        .setInteractive()
        .on('pointerdown', () => {
            // 重置所有卫星
            satellites.forEach((sat, index) => {
                const angle = angles[Math.floor(index / distances.length)];
                const distance = distances[index % distances.length];
                sat.position.set(
                    planet.x + Math.cos(angle) * distance,
                    planet.y + Math.sin(angle) * distance
                );
                sat.previousPosition.copy(sat.position);
                sat.initializeOrbitalVelocity();
                sat.trail = []; // 清除轨迹
                // 重置黏附状态
                if (sat.reset) {
                    sat.reset();
                }
            });
        });
    }

    update() {
        
    }

}