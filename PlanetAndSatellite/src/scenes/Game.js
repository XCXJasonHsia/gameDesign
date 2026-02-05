import {Planet} from '../GameObjects/Planet.js'
import {Satellite} from '../GameObjects/Satellite.js'
import {GravitySystem} from '../Engines/GravitySystem.js'

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    create() {
        // 创建背景
        this.add.image(400, 300, 'bg');

        // 创建引力系统
        this.gravitySystem = new GravitySystem(this);

        // 创建两个对称放置的行星
        const planets = [];
        
        // 行星1（左侧）
        const planet1 = new Planet(this, 150, 300, 'star');
        planet1.setTint(0xff6666); // 给行星1加上红色色调以示区别
        this.gravitySystem.addPlanet(planet1, 0);
        planets.push(planet1);
        
        // 行星2（右侧）
        const planet2 = new Planet(this, 650, 300, 'star');
        planet2.setTint(0x6666ff); // 给行星2加上蓝色色调以示区别
        this.gravitySystem.addPlanet(planet2, 1);
        planets.push(planet2);

        const initSatPosX = 150;
        const initSatPosY = 400;
        // 创建一个卫星，放在两个行星中间偏上的位置
        const satellite = new Satellite(
            this, initSatPosX, initSatPosY, 'star', 
            planets, this.gravitySystem
        );
        
        this.gravitySystem.addSatellite(satellite);

        // 创建信息显示
        this.infoText = this.add.text(20, 100, '', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#00000080',
            padding: { x: 10, y: 5 }
        });
        
        // 更新循环
        this.events.on('update', (time, delta) => {
            // 更新卫星
            satellite.update(time, delta);
            
            // 更新信息显示
            const dx1 = satellite.x - planet1.x;
            const dy1 = satellite.y - planet1.y;
            const distance1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
            
            const dx2 = satellite.x - planet2.x;
            const dy2 = satellite.y - planet2.y;
            const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            
            const velocity = Math.sqrt(satellite.body.velocity.x ** 2 + satellite.body.velocity.y ** 2);
            /*
            this.infoText.setText([
                `卫星状态: ${satellite.isAttached ? '已粘附' : '自由运动'}`,
                `到行星1距离: ${distance1.toFixed(1)}`,
                `到行星2距离: ${distance2.toFixed(1)}`,
                `速度: ${velocity.toFixed(1)}`,
                `拖动下方滑动条分别调整两个行星的引力幂律`
            ]);
            */
        });

        // 启用物理世界的碰撞
        this.physics.world.setBoundsCollision(true, true, true, true);

        // 添加重置按钮
        const resetButton = this.add.text(600, 50, '重置轨道', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        })
        .setInteractive()
        .on('pointerdown', () => {
            // 重置卫星位置到初始位置
            satellite.position.set(initSatPosX, initSatPosY);
            satellite.previousPosition.set(initSatPosX, initSatPosY);
            satellite.initializeOrbitalVelocity();
            satellite.trail = []; // 清除轨迹
            
            // 重置黏附状态
            if (satellite.reset) {
                satellite.reset();
            }
            
            // 清除轨迹图形
            if (satellite.trailGraphics) {
                satellite.trailGraphics.clear();
            }
        });
        /*
        // 添加说明文本
        const instructionText = this.add.text(20, 20, '双行星引力系统演示', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#00000080',
            padding: { x: 10, y: 10 }
        });

        const instructionText2 = this.add.text(20, 60, '每个行星都有独立的引力幂律控制', {
            fontSize: '16px',
            fill: '#ffcc00',
            backgroundColor: '#00000080',
            padding: { x: 10, y: 5 }
        });
        */
    }

    update() {
        // 主更新循环，如果需要可以在这里添加其他更新逻辑
    }
}