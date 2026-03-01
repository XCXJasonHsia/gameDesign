import { RocketPulse } from '../../../AdventureObjects/Pulsar/RocketPulse.js';
import { PlanetPulse } from '../../../AdventureObjects/Pulsar/PlanetPulse.js';
import { MeteorPulse } from '../../../AdventureObjects/Pulsar/MeteorPulse.js';
import { GenericScene, GenericUIScene } from '../../../generalClasses/GenericScene.js';
import { GravitySystem } from '../../../Engines/GravitySystem.js';

export class ScenePulsar extends GenericScene {
    constructor() {
        super('ScenePulsar', true, 'rocket', false, 'UIScenePulsar');
    }

    create() {
        
        super.create();
        const uiScene = this.scene.get('UIScenePulsar');
        this.uiScene = uiScene;

        // 初始化光环数组
        this.halos = [];
        // 开始生成光环
        this.startGeneratingHalos();
        
        // 初始化陨石
        this.initializeMeteors();
        
        // 闪屏效果将在UI场景中生成，不需要在主场景中初始化

        // 现在初始化完成，再显示成功区域覆盖层
        this.showSuccessAreaOverlay();
        
    }

    // 开始生成光环
    startGeneratingHalos() {
        //console.log('开始生成光环');
        
        // 定义一个函数来生成光环并调度下一次生成
        const scheduleNextHalo = () => {
            //console.log('触发光环生成');
            this.generateHalo();
            
            // 随机延迟后再次生成光环，频率调整，延长上限时间间隔
            const nextDelay = Phaser.Math.Between(240, 2250); // 下限保持不变，上限延长到1.8倍
            //console.log('调度下一次光环生成，延迟:', nextDelay, 'ms');
            this.time.delayedCall(nextDelay, scheduleNextHalo, [], this);
        };
        
        // 立即生成第一个光环
        this.generateHalo();
        
        // 调度下一次光环生成，频率增加
        const initialDelay = 850; // 初始延迟缩短到0.5倍
        //console.log('调度下一次光环生成，初始延迟:', initialDelay, 'ms');
        this.time.delayedCall(initialDelay, scheduleNextHalo, [], this);
    }
    
    // 开始生成闪屏效果
    startGeneratingFlashes() {
        //console.log('开始生成闪屏效果');
        
        // 定义第一个生成机制的函数（频率降低50%，闪屏大小上限增加30%，下限升高40%）
        const scheduleNextFlash1 = () => {
            //console.log('触发光屏生成（机制1）');
            this.generateFlash(35, 364); // 下限升高40%，上限增加30%
            
            // 随机延迟后再次生成闪屏，频率增加到现在的160%
            const nextDelay = Phaser.Math.Between(109, 547); // 175-875ms 增加到现在的160%
            //console.log('调度下一次闪屏生成（机制1），延迟:', nextDelay, 'ms');
            this.time.delayedCall(nextDelay, scheduleNextFlash1, [], this);
        };
        
        // 定义第二个生成机制的函数（频率增加60%，闪屏大小上限降低20%，下限降低40%）
        const scheduleNextFlash2 = () => {
            //console.log('触发光屏生成（机制2）');
            this.generateFlash(4, 40); // 下限降低40%，上限降低20%
            
            // 随机延迟后再次生成闪屏，频率降低到现在的50%
            const nextDelay = Phaser.Math.Between(52, 262); // 26-131ms 降低到现在的50%
            //console.log('调度下一次闪屏生成（机制2），延迟:', nextDelay, 'ms');
            this.time.delayedCall(nextDelay, scheduleNextFlash2, [], this);
        };
        
        // 立即生成第一个闪屏
        this.generateFlash(35, 364);
        
        // 调度第一个生成机制
        const initialDelay1 = Phaser.Math.Between(109, 547); // 增加到现在的160%
        //console.log('调度下一次闪屏生成（机制1），初始延迟:', initialDelay1, 'ms');
        this.time.delayedCall(initialDelay1, scheduleNextFlash1, [], this);
        
        // 调度第二个生成机制
        const initialDelay2 = Phaser.Math.Between(52, 262); // 降低到现在的50%
        //console.log('调度下一次闪屏生成（机制2），初始延迟:', initialDelay2, 'ms');
        this.time.delayedCall(initialDelay2, scheduleNextFlash2, [], this);
    }
    
    // 生成闪屏效果
    generateFlash(minSize = 25, maxSize = 280) {
        // 随机位置
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        const x = Phaser.Math.Between(0, screenWidth);
        const y = Phaser.Math.Between(0, screenHeight);
        
        // 随机大小（有范围）
        const size = Phaser.Math.Between(minSize, maxSize);
        
        // 随机持续时间（0.1-0.7s之间，上限延长40%）
        const duration = Phaser.Math.FloatBetween(0.1, 0.7) * 1000; // 转换为毫秒
        
        //console.log('生成闪屏效果，位置:', x, y, '大小:', size, '持续时间:', duration, 'ms');
        
        // 创建闪屏精灵
        const flash = this.add.sprite(x, y, 'flash_1');
        flash.setScale(size / flash.width);
        flash.setDepth(50); // 设置在最上层
        
        // 添加到闪屏数组
        this.flashes.push(flash);
        //console.log('闪屏已添加到数组，当前闪屏数量:', this.flashes.length);
        
        // 快速随机切换帧以达到闪屏效果
        let elapsedTime = 0;
        const frameChangeInterval = 50; // 每50ms切换一次帧
        const fadeStartTime = 50; // 至少持续0.05秒之后再开始减弱
        
        const frameChangeEvent = this.time.addEvent({
            delay: frameChangeInterval,
            callback: () => {
                // 随机切换帧
                const randomFrame = Phaser.Math.Between(1, 10);
                flash.setTexture(`flash_${randomFrame}`);
                
                // 更新经过的时间
                elapsedTime += frameChangeInterval;
                
                // 至少持续0.05秒之后再开始减弱
                if (elapsedTime >= fadeStartTime) {
                    // 计算剩余时间比例，逐渐降低不透明度
                    const remainingRatio = 1 - ((elapsedTime - fadeStartTime) / (duration - fadeStartTime));
                    flash.setAlpha(0.8 * remainingRatio);
                }
                
                // 如果超过持续时间，销毁闪屏
                if (elapsedTime >= duration) {
                    frameChangeEvent.remove();
                    this.removeFlash(flash);
                }
            },
            callbackScope: this,
            loop: true
        });
    }
    
    // 移除闪屏效果
    removeFlash(flash) {
        // 从数组中移除闪屏
        const index = this.flashes.indexOf(flash);
        if (index !== -1) {
            this.flashes.splice(index, 1);
            //console.log('闪屏已销毁，剩余闪屏数量:', this.flashes.length);
        }
        
        // 销毁闪屏精灵
        flash.destroy();
    }

    // 生成光环
    generateHalo() {
        const planet = this.planets[0];
        if (!planet) {
            //console.log('没有行星，无法生成光环');
            return;
        }

        //console.log('生成光环，行星位置:', planet.x, planet.y);
        
        // 创建一个白色的圆形作为光环，使用行星在游戏世界中的位置
        const halo = this.add.circle(planet.x, planet.y, 100, 0xffffff, 0.384); // 初始不透明度减小40%
        halo.setDepth(10); // 设置在行星之上以便调试
        halo.collided = false; // 初始化碰撞状态为false
        
        // 添加到光环数组
        this.halos.push(halo);
        //console.log('光环已添加到数组，当前光环数量:', this.halos.length);

        // 光环外扩散动画
        this.tweens.add({
            targets: halo,
            radius: 4000, // 调整最终半径到4000
            alpha: 0,
            duration: 3000, // 保持动画持续时间不变
            ease: 'Linear',
            onComplete: () => {
                // 动画完成后从数组中移除并销毁光环
                const index = this.halos.indexOf(halo);
                if (index !== -1) {
                    this.halos.splice(index, 1);
                    //console.log('光环已销毁，剩余光环数量:', this.halos.length);
                }
                halo.destroy();
            }
        });
    }
    
    setupZoomControls() {
        super.setupZoomControls();
        // 缩放范围
        this.minZoom = 0.2;
        this.maxZoom = 3;
    }

    resetLeader() {
        super.resetLeader();
        this.cameras.main.setZoom(0.9);
    }
    initializeBackground() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.centerX = centerX;
        this.centerY = centerY;
        const bg = this.add.image(centerX, centerY, 'bg11');
        bg.setDepth(-100); // 设置背景为最底层
        bg.setScale(2); // 背景图片放大x倍
        
        // 添加旋转的pulse_flag.png作为背景
        this.pulseFlag = this.add.image(centerX, centerY, 'pulse_flag');
        this.pulseFlag.setDepth(-50); // 设置在背景之上，行星之下
        
        // 添加旋转动画
        this.tweens.add({
            targets: this.pulseFlag,
            rotation: -2 * Math.PI,
            duration: 10000,
            repeat: -1,
            ease: 'Linear'
        });
        
        // 设置初始相机缩放
        this.cameras.main.setZoom(0.72); // 设置相机缩放值为0.72（原来的0.9减少20%）
    }

    showSuccessAreaOverlay() {
        // 显示成功判定区域的overlayer
        const midX = this.centerX;
        const midY = this.centerY;
        
        // 创建成功判定区域的圆形
        this.successArea = this.add.circle(
            midX,
            midY,
            30, // 半径
            0x00ff00,
            0.2
        );
        this.successArea.setDepth(-50); // 设置在背景之上，脉冲星之下
        // 不设置scrollFactor为0，这样它会随相机移动
    }
    

    initializePlanets() {
        // 使用pulse.png作为行星，放在屏幕中心
        this.initialPlanetPositions = [];
        this.planets = [];
        
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        
        // 添加pulse行星到初始位置数组
        this.initialPlanetPositions.push({x: centerX, y: centerY});
        
        // 创建pulse行星，设置适当的半径和质量以确保它具有吸引力
        const pulsePlanet = new PlanetPulse(this, centerX, centerY, 'pulse_planet', 144, false, 10000);
        this.planets.push(pulsePlanet);
    }
    
    // 初始化陨石
    initializeMeteors() {
        this.meteors = [];
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        // 创建第一个陨石（距离600）
        const meteor1 = new MeteorPulse(this, centerX + 600, centerY, 'meteor_test', this.planets, false, 20, this.gravitySystem, false);
        meteor1.setPlanetCenter(centerX, centerY);
        this.meteors.push(meteor1);
        
        // 创建第二个陨石（距离800，使用test(2)纹理，缩小到40%，落后40°）
        const meteor2 = new MeteorPulse(this, centerX + 800, centerY, 'meteor_test2', this.planets, false, 20, this.gravitySystem, false);
        meteor2.setPlanetCenter(centerX, centerY);
        meteor2.setOrbitRadius(800);
        meteor2.setScale(0.0288); // 0.072 * 0.4
        meteor2.orbitAngle = -Math.PI * (40 / 180); // 落后40°
        this.meteors.push(meteor2);
        
        // 创建第三个陨石（距离1600，使用test(1)纹理，缩小到30%，落后170°）
        const meteor3 = new MeteorPulse(this, centerX + 1600, centerY, 'meteor_test', this.planets, false, 20, this.gravitySystem, false);
        meteor3.setPlanetCenter(centerX, centerY);
        meteor3.setOrbitRadius(1600);
        meteor3.setScale(0.0216); // 0.072 * 0.3
        meteor3.orbitAngle = -Math.PI * (170 / 180); // 落后170°
        this.meteors.push(meteor3);
        
        // 创建第四个陨石（距离1750，使用test(3)纹理，缩小到70%，落后90°）
        const meteor4 = new MeteorPulse(this, centerX + 1750, centerY, 'meteor_test3', this.planets, false, 20, this.gravitySystem, false);
        meteor4.setPlanetCenter(centerX, centerY);
        meteor4.setOrbitRadius(1750);
        meteor4.setScale(0.0504); // 0.072 * 0.7
        meteor4.orbitAngle = -Math.PI * (90 / 180); // 落后90°
        this.meteors.push(meteor4);
        
        // 创建第五个陨石（距离1300，使用test(4)纹理，缩小到80%，落后260°）
        const meteor5 = new MeteorPulse(this, centerX + 1300, centerY, 'meteor_test4', this.planets, false, 20, this.gravitySystem, false);
        meteor5.setPlanetCenter(centerX, centerY);
        meteor5.setOrbitRadius(1300);
        meteor5.setScale(0.0576); // 0.072 * 0.8
        meteor5.orbitAngle = -Math.PI * (260 / 180); // 落后260°
        this.meteors.push(meteor5);
        
        // 创建第六个陨石（距离1000，使用test(1)纹理，缩小到50%，提前50°）
        const meteor6 = new MeteorPulse(this, centerX + 1000, centerY, 'meteor_test', this.planets, false, 20, this.gravitySystem, false);
        meteor6.setPlanetCenter(centerX, centerY);
        meteor6.setOrbitRadius(1000);
        meteor6.setScale(0.036); // 0.072 * 0.5
        meteor6.orbitAngle = Math.PI * (50 / 180); // 提前50°
        this.meteors.push(meteor6);
        
        // 创建第七个陨石（距离1500，使用test(2)纹理，增大到120%，提前20°）
        const meteor7 = new MeteorPulse(this, centerX + 1500, centerY, 'meteor_test2', this.planets, false, 20, this.gravitySystem, false);
        meteor7.setPlanetCenter(centerX, centerY);
        meteor7.setOrbitRadius(1500);
        meteor7.setScale(0.0864); // 0.072 * 1.2
        meteor7.orbitAngle = Math.PI * (20 / 180); // 提前20°
        this.meteors.push(meteor7);
        
        // 创建第八个陨石（距离500，使用test(3)纹理，缩小到50%，提前100°）
        const meteor8 = new MeteorPulse(this, centerX + 500, centerY, 'meteor_test3', this.planets, false, 20, this.gravitySystem, false);
        meteor8.setPlanetCenter(centerX, centerY);
        meteor8.setOrbitRadius(500);
        meteor8.setScale(0.036); // 0.072 * 0.5
        meteor8.orbitAngle = Math.PI * (100 / 180); // 提前100°
        this.meteors.push(meteor8);
        
        // 增加一个在1500处大小增大到110%落后40°的陨石
        const meteor9 = new MeteorPulse(this, centerX + 1500, centerY, 'meteor_test2', this.planets, false, 20, this.gravitySystem, false);
        meteor9.setPlanetCenter(centerX, centerY);
        meteor9.setOrbitRadius(1500);
        meteor9.setScale(0.0792); // 0.072 * 1.1
        meteor9.orbitAngle = -Math.PI * (40 / 180); // 落后40°
        //console.log('创建陨石9，纹理:', 'meteor_test2');
        this.meteors.push(meteor9);
        
        // 增加一个在900处提前100°大小为150%的陨石
        const meteor10 = new MeteorPulse(this, centerX + 900, centerY, 'meteor_test3', this.planets, false, 20, this.gravitySystem, false);
        meteor10.setPlanetCenter(centerX, centerY);
        meteor10.setOrbitRadius(900);
        meteor10.setScale(0.108); // 0.072 * 1.5
        meteor10.orbitAngle = Math.PI * (100 / 180); // 提前100°
        //console.log('创建陨石10，纹理:', 'meteor_test3');
        this.meteors.push(meteor10);
        
        // 增加一个在1900处大小为200%落后120°的陨石
        const meteor11 = new MeteorPulse(this, centerX + 1900, centerY, 'meteor_test4', this.planets, false, 20, this.gravitySystem, false);
        meteor11.setPlanetCenter(centerX, centerY);
        meteor11.setOrbitRadius(1900);
        meteor11.setScale(0.144); // 0.072 * 2.0
        meteor11.orbitAngle = -Math.PI * (120 / 180); // 落后120°
        //console.log('创建陨石11，纹理:', 'meteor_test4');
        this.meteors.push(meteor11);
        
        // 增加一个在1000处大小为130%落后100°的陨石
        const meteor12 = new MeteorPulse(this, centerX + 1000, centerY, 'meteor_test', this.planets, false, 20, this.gravitySystem, false);
        meteor12.setPlanetCenter(centerX, centerY);
        meteor12.setOrbitRadius(1000);
        meteor12.setScale(0.0936); // 0.072 * 1.3
        meteor12.orbitAngle = -Math.PI * (100 / 180); // 落后100°
        //console.log('创建陨石12，纹理:', 'meteor_test');
        this.meteors.push(meteor12);
        
        // 增加一个在2400处大小为180%落后10°的陨石
        const meteor13 = new MeteorPulse(this, centerX + 2400, centerY, 'meteor_test4', this.planets, false, 20, this.gravitySystem, false);
        meteor13.setPlanetCenter(centerX, centerY);
        meteor13.setOrbitRadius(2400);
        meteor13.setScale(0.1296); // 0.072 * 1.8
        meteor13.orbitAngle = -Math.PI * (10 / 180); // 落后10°
        //console.log('创建陨石13，纹理:', 'meteor_test4');
        this.meteors.push(meteor13);
        
        // 增加一个在3000处大小为300%提前120°的陨石
        const meteor14 = new MeteorPulse(this, centerX + 3000, centerY, 'meteor_test3', this.planets, false, 20, this.gravitySystem, false);
        meteor14.setPlanetCenter(centerX, centerY);
        meteor14.setOrbitRadius(3000);
        meteor14.setScale(0.216); // 0.072 * 3.0
        meteor14.orbitAngle = Math.PI * (120 / 180); // 提前120°
        //console.log('创建陨石14，纹理:', 'meteor_test3');
        this.meteors.push(meteor14);
        
        // 增加一个在2800处大小为40%落后20°的陨石
        const meteor15 = new MeteorPulse(this, centerX + 2800, centerY, 'meteor_test2', this.planets, false, 20, this.gravitySystem, false);
        meteor15.setPlanetCenter(centerX, centerY);
        meteor15.setOrbitRadius(2800);
        meteor15.setScale(0.0288); // 0.072 * 0.4
        meteor15.orbitAngle = -Math.PI * (20 / 180); // 落后20°
        //console.log('创建陨石15，纹理:', 'meteor_test2');
        this.meteors.push(meteor15);
        
        // 增加一个在2600处大小为80%落后200°的陨石
        const meteor16 = new MeteorPulse(this, centerX + 2600, centerY, 'meteor_test4', this.planets, false, 20, this.gravitySystem, false);
        meteor16.setPlanetCenter(centerX, centerY);
        meteor16.setOrbitRadius(2600);
        meteor16.setScale(0.0576); // 0.072 * 0.8
        meteor16.orbitAngle = -Math.PI * (200 / 180); // 落后200°
        //console.log('创建陨石16，纹理:', 'meteor_test4');
        this.meteors.push(meteor16);
        
        // 增加一个在3100处大小为30%落后100°的陨石
        const meteor17 = new MeteorPulse(this, centerX + 3100, centerY, 'meteor_test', this.planets, false, 20, this.gravitySystem, false);
        meteor17.setPlanetCenter(centerX, centerY);
        meteor17.setOrbitRadius(3100);
        meteor17.setScale(0.0216); // 0.072 * 0.3
        meteor17.orbitAngle = -Math.PI * (100 / 180); // 落后100°
        //console.log('创建陨石17，纹理:', 'meteor_test');
        this.meteors.push(meteor17);
        
        // 增加一个在2300处大小为60%落后240°的陨石
        const meteor18 = new MeteorPulse(this, centerX + 2300, centerY, 'meteor_test3', this.planets, false, 20, this.gravitySystem, false);
        meteor18.setPlanetCenter(centerX, centerY);
        meteor18.setOrbitRadius(2300);
        meteor18.setScale(0.0432); // 0.072 * 0.6
        meteor18.orbitAngle = -Math.PI * (240 / 180); // 落后240°
        //console.log('创建陨石18，纹理:', 'meteor_test3');
        this.meteors.push(meteor18);
        
        // 增加一个在3500处大小为90%提前100°的陨石
        const meteor19 = new MeteorPulse(this, centerX + 3500, centerY, 'meteor_test2', this.planets, false, 20, this.gravitySystem, false);
        meteor19.setPlanetCenter(centerX, centerY);
        meteor19.setOrbitRadius(3500);
        meteor19.setScale(0.0648); // 0.072 * 0.9
        meteor19.orbitAngle = Math.PI * (100 / 180); // 提前100°
        //console.log('创建陨石19，纹理:', 'meteor_test2');
        this.meteors.push(meteor19);
        
        // 增加一个在3700处大小为250%提前150°的陨石
        const meteor20 = new MeteorPulse(this, centerX + 3700, centerY, 'meteor_test3', this.planets, false, 20, this.gravitySystem, false);
        meteor20.setPlanetCenter(centerX, centerY);
        meteor20.setOrbitRadius(3700);
        meteor20.setScale(0.18); // 0.072 * 2.5
        meteor20.orbitAngle = Math.PI * (150 / 180); // 提前150°
        //console.log('创建陨石20，纹理:', 'meteor_test3');
        this.meteors.push(meteor20);
        
        // 增加一个在4000处大小为110%提前200°的陨石
        const meteor21 = new MeteorPulse(this, centerX + 4000, centerY, 'meteor_test4', this.planets, false, 20, this.gravitySystem, false);
        meteor21.setPlanetCenter(centerX, centerY);
        meteor21.setOrbitRadius(4000);
        meteor21.setScale(0.0792); // 0.072 * 1.1
        meteor21.orbitAngle = Math.PI * (200 / 180); // 提前200°
        //console.log('创建陨石21，纹理:', 'meteor_test4');
        this.meteors.push(meteor21);
        
        // 增加一个在4000处大小为50%提前90°的陨石
        const meteor22 = new MeteorPulse(this, centerX + 4000, centerY, 'meteor_test', this.planets, false, 20, this.gravitySystem, false);
        meteor22.setPlanetCenter(centerX, centerY);
        meteor22.setOrbitRadius(4000);
        meteor22.setScale(0.036); // 0.072 * 0.5
        meteor22.orbitAngle = Math.PI * (90 / 180); // 提前90°
        //console.log('创建陨石22，纹理:', 'meteor_test');
        this.meteors.push(meteor22);
        
        // 增加一个在3800处大小为70%提前30°的陨石
        const meteor23 = new MeteorPulse(this, centerX + 3800, centerY, 'meteor_test2', this.planets, false, 20, this.gravitySystem, false);
        meteor23.setPlanetCenter(centerX, centerY);
        meteor23.setOrbitRadius(3800);
        meteor23.setScale(0.0504); // 0.072 * 0.7
        meteor23.orbitAngle = Math.PI * (30 / 180); // 提前30°
        //console.log('创建陨石23，纹理:', 'meteor_test2');
        this.meteors.push(meteor23);
    }
    
    // 检测飞船与陨石的碰撞
    checkMeteorCollisions() {
        if (!this.leader) return;
        
        // 遍历所有陨石
        this.meteors.forEach(meteor => {
            // 使用半径检测碰撞
            if (this.checkCollisionWithMeteor(this.leader, meteor)) {
                //console.log('飞船与陨石碰撞！');
                // 飞船粘在陨石上
                this.attachRocketToMeteor(this.leader, meteor);
            }
        });
    }
    
    // 检查飞船与陨石的碰撞（半径检测）
    checkCollisionWithMeteor(rocket, meteor) {
        // 确保使用正确的位置获取方式
        const rocketX = rocket.position ? rocket.position.x : rocket.x;
        const rocketY = rocket.position ? rocket.position.y : rocket.y;
        const meteorX = meteor.position ? meteor.position.x : meteor.x;
        const meteorY = meteor.position ? meteor.position.y : meteor.y;
        
        // 计算飞船到陨石的距离
        const dx = rocketX - meteorX;
        const dy = rocketY - meteorY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 计算飞船和陨石的半径
        const rocketRadius = rocket.radius || (rocket.displayWidth / 2);
        const meteorRadius = (meteor.radius || (meteor.displayWidth / 2)) * 2 * 0.85; // 陨石半径增加到原来的两倍，再缩小到85%
        
        // 检查是否碰撞
        return distance < rocketRadius + meteorRadius;
    }
    
    // 飞船粘在陨石上
    attachRocketToMeteor(rocket, meteor) {
        // 设置飞船为粘附状态
        rocket.isAttached = true;
        rocket.attachedMeteor = meteor;
        
        // 停止飞船的推进和物理更新
        rocket.isBoosting = false;
        rocket.acceleration.set(0, 0);
        
        // 计算飞船在陨石上的位置，使用增加到两倍再缩小到85%的陨石半径
        const rocketRadius = rocket.radius || (rocket.displayWidth / 2);
        const meteorRadius = (meteor.radius || (meteor.displayWidth / 2)) * 2 * 0.85; // 陨石半径增加到原来的两倍，再缩小到85%
        const totalRadius = rocketRadius + meteorRadius;
        
        // 计算从陨石到飞船的方向
        const dx = rocket.x - meteor.x;
        const dy = rocket.y - meteor.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // 将飞船移动到陨石表面
            const targetX = meteor.x + (dx / distance) * totalRadius;
            const targetY = meteor.y + (dy / distance) * totalRadius;
            
            // 更新飞船位置
            if (rocket.position) {
                rocket.position.set(targetX, targetY);
            }
            rocket.x = targetX;
            rocket.y = targetY;
            
            // 更新previousPosition以避免物理引擎问题
            if (rocket.previousPosition) {
                rocket.previousPosition.set(targetX, targetY);
            }
        }
        
        //console.log('飞船已粘在陨石上！');
    }
    
    // 更新粘附在陨石上的飞船位置
    updateAttachedRocketPosition() {
        if (!this.leader || !this.leader.isAttached || !this.leader.attachedMeteor) return;
        
        const rocket = this.leader;
        const meteor = rocket.attachedMeteor;
        
        // 计算飞船在陨石上的位置，使用增加到两倍再缩小到85%的陨石半径
        const rocketRadius = rocket.radius || (rocket.displayWidth / 2);
        const meteorRadius = (meteor.radius || (meteor.displayWidth / 2)) * 2 * 0.85; // 陨石半径增加到原来的两倍，再缩小到85%
        const totalRadius = rocketRadius + meteorRadius;
        
        // 计算从陨石到飞船的方向（保持相对位置）
        const dx = rocket.x - meteor.x;
        const dy = rocket.y - meteor.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // 保持飞船在陨石表面
            const targetX = meteor.x + (dx / distance) * totalRadius;
            const targetY = meteor.y + (dy / distance) * totalRadius;
            
            // 更新飞船位置
            if (rocket.position) {
                rocket.position.set(targetX, targetY);
            }
            rocket.x = targetX;
            rocket.y = targetY;
            
            // 更新previousPosition以避免物理引擎问题
            if (rocket.previousPosition) {
                rocket.previousPosition.set(targetX, targetY);
            }
        }
    }

    initializeSatellites() {
        // 在脉冲星场景中不需要卫星
    }

    initializeRocket() {
        const height = 2000;
        this.initialRocketPosition = null;
        
        // 先销毁旧的火箭实例，避免图像残留
        if (this.rocket) {
            this.rocket.destroy();
            this.rocket = null;
        }
        
        // 在屏幕左侧创建火箭，距离脉冲行星足够远
        this.initialRocketPosition = {x: this.centerX - height, y: this.centerY};
        this.rocket = new RocketPulse(this, this.initialRocketPosition.x, 
            this.initialRocketPosition.y, 'cartoon_rocket', this.planets, false, 30, this.gravitySystem, true, false);
        
        // 设置火箭为leader，以便相机能够跟随它
        this.leader = this.rocket;
        
        // 确保飞船受到引力作用并有初速度
        if (this.rocket && this.planets.length > 0) {
            // 初始化飞船速度，使其能够围绕脉冲行星做轨道运动
            this.rocket.initializeVelocity();
            
            // 手动设置火箭的初始速度，确保它有足够的速度开始运动
            if (this.rocket.body) {
                this.rocket.body.setVelocity(200, 0);
            }
        }
    }

    checkLeaderBoundaries() {
        if (!this.leader || this.planets.length === 0) return;
        
        // 定义边界距离（从行星中心算起）
        const maxDistance = 2500;
        
        // 计算火箭到行星的距离
        const dx = this.leader.x - this.planets[0].x;
        const dy = this.leader.y - this.planets[0].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.distance = distance;
        
        // 如果飞出太远，重置位置
        if (this.distance > maxDistance) {
            console.log('火箭飞出太远，正在重置...');
            this.resetLeader();
        }
    }

    update(time, delta) {
        
        if(this.isPaused === true) return;
        super.update(time, delta);
        this.ifSuccess();
        
        // 更新光环位置，确保它们跟随行星移动
        const planet = this.planets[0];
        if (planet) {
            // 直接使用行星在游戏世界中的位置
            this.halos.forEach(halo => {
                halo.setPosition(planet.x, planet.y);
            });
            
            // 检测飞船与光环的碰撞
            this.checkHaloCollisions();
        }
        
        // 更新陨石
        if (this.meteors) {
            this.meteors.forEach(meteor => {
                meteor.update(time, delta);
            });
        }
        
        // 更新粘附在陨石上的飞船位置
        this.updateAttachedRocketPosition();
        
        // 检测飞船与陨石的碰撞
        this.checkMeteorCollisions();
        
    }
    
    // 检测飞船与光环的碰撞
    checkHaloCollisions() {
        if (!this.leader) return;
        
        const planet = this.planets[0];
        if (!planet) return;
        
        // 遍历所有光环
        this.halos.forEach(halo => {
            // 计算飞船到光环中心的距离
            const dx = this.leader.x - halo.x;
            const dy = this.leader.y - halo.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 计算碰撞半径（飞船半径 + 光环当前半径）
            const rocketRadius = this.leader.radius || (this.leader.displayWidth / 2);
            const haloRadius = halo.radius;
            
            // 检查是否碰撞
            if (distance < rocketRadius + haloRadius && !halo.collided) {
                //console.log('飞船与光环碰撞，距离:', distance, '飞船半径:', rocketRadius, '光环半径:', haloRadius);
                // 标记光环已碰撞，避免重复触发
                halo.collided = true;
                // 计算并应用向外的冲量
                this.applyHaloImpulse(planet);
                // 触发白屏效果
                if (this.uiScene) {
                    this.uiScene.triggerWhiteoutEffect();
                }
            }
        });
    }
    
    // 应用光环冲量
    applyHaloImpulse(planet) {
        if (!this.leader) return;
        
        // 计算飞船到行星的距离（使用position向量）
        const dx = this.leader.position.x - planet.x;
        const dy = this.leader.position.y - planet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 计算单位向量（向外方向）
        const unitX = dx / distance;
        const unitY = dy / distance;
        
        // 计算冲量大小，与距离成反比
        // 距离越小，冲量越大
        const baseImpulse = 1890; // 冲量大小，减小到现在的60%
        const impulse = baseImpulse / Math.pow(distance / 100, 1.7); // 与距离成1.7倍反比，距离越小冲量增长越快
        
        //console.log('应用光环冲量，距离:', distance, '冲量大小:', impulse);
        
        // 直接应用瞬时冲量，不使用持续冲量
        // 由于使用的是Verlet积分，速度是由position和previousPosition的差值计算的
        // 所以我们只需要修改previousPosition，保持position不变，这样速度就会增加
        const dt = 1 / 60; // 假设60fps
        const impulseX = unitX * impulse * dt;
        const impulseY = unitY * impulse * dt;
        
        // 只修改previousPosition，这样在下次积分时，速度就会包含这个冲量
        // 原理：velocity = (position - previousPosition) / dt
        // 减少previousPosition，相当于增加了速度
        this.leader.previousPosition.x -= impulseX;
        this.leader.previousPosition.y -= impulseY;
        
        // 同时更新显示位置，确保视觉效果同步
        this.leader.x = this.leader.position.x;
        this.leader.y = this.leader.position.y;
        
        //console.log('冲量应用完成，previousPosition变化:', -impulseX, -impulseY);
    }

    ifSuccess() {
        if(this.leader) {
            const midX = this.centerX;
            const midY = this.centerY;
            
            // 计算飞船到中间位置的距离
            const dx = this.leader.x - midX;
            const dy = this.leader.y - midY;
            const distanceToMid = Math.sqrt(dx * dx + dy * dy);
            
            // 计算飞船的速度大小
            const velocityX = this.leader.body.velocity.x;
            const velocityY = this.leader.body.velocity.y;
            const velocityMagnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
            
            // 检查飞船是否在中间位置附近且速度较小
            if(distanceToMid < 150 && velocityMagnitude < 50) {
                this.isPaused = true;
                this.physics.world.pause();
                this.tweens.pauseAll();

                console.log('enter Success');
                this.uiScene.showSuccessText();
            }
        }
    }
}

export class UIScenePulsar extends GenericUIScene {
    constructor() {
        super('UIScenePulsar');
        this.mainScene = null; // 稍后在 create 方法中初始化
        this.gravityArrow = null; // 指向引力中心的箭头
        this.flashes = []; // 闪屏效果数组
        this.whiteoutEffect = null; // 白屏效果，初始化为null
    }
    
    // 触发白屏效果
    triggerWhiteoutEffect() {
        // 如果已经有白屏效果在进行中，不重复触发
        if (this.whiteoutEffect) return;
        
        //console.log('触发白屏效果');
        
        // 创建全屏白色覆盖层
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        
        this.whiteoutEffect = this.add.rectangle(
            screenWidth / 2,
            screenHeight / 2,
            screenWidth,
            screenHeight,
            0xffffff,
            1
        );
        this.whiteoutEffect.setScrollFactor(0); // 不随相机移动
        this.whiteoutEffect.setDepth(1001); // 设置在最上层
        
        // 白屏持续0.1秒后在0.4秒内恢复
        this.time.delayedCall(100, () => {
            // 淡出效果，0.4秒内不透明度降到0
            this.tweens.add({
                targets: this.whiteoutEffect,
                alpha: 0,
                duration: 400,
                ease: 'Linear',
                onComplete: () => {
                    // 动画完成后销毁白屏效果
                    this.whiteoutEffect.destroy();
                    this.whiteoutEffect = null;
                    //console.log('白屏效果结束');
                }
            });
        });
    }

    create() {
        super.create();
        
        // 初始化主场景引用
        this.mainScene = this.scene.get('ScenePulsar');
        
        // 创建指向引力中心的箭头
        this.createGravityArrow();
        
        // 开始生成闪屏效果
        this.startGeneratingFlashes();
        
        // 在UI图层上绘制不透明度逐渐上升的黑色圆圈（半径280到300）
        this.drawBlackCircles();
    }
    
    // 绘制不透明度逐渐上升的黑色空心圆圈，密排形成渐变效果
    drawBlackCircles() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        const screenCenterX = screenWidth / 2;
        const screenCenterY = screenHeight / 2;
        
        // 创建graphics对象用于绘制空心圆圈
        const graphics = this.add.graphics();
        graphics.setScrollFactor(0); // 不随相机移动
        graphics.setDepth(997); // 设置在文本元素之下
        
        // 绘制多个黑色空心圆圈，半径从260到300，间隔1，形成密排渐变效果
        // 不透明度逐渐上升到100%，上升速度先快后慢
        for (let radius = 260; radius <= 300; radius++) {
            // 计算不透明度，从0到1逐渐上升，使用二次缓动函数使上升速度先快后慢
            const t = (radius - 260) / (300 - 260);
            const alpha = t * t; // 二次缓动，先快后慢
            
            // 设置线条样式
            graphics.lineStyle(1, 0x000000, alpha); // 线宽1，黑色，不透明度渐变
            
            // 绘制空心圆圈
            graphics.strokeCircle(screenCenterX, screenCenterY, radius);
        }
        
        // 额外在半径300到500处非常密排地绘制完全不透明的黑色空心圆圈
        for (let radius = 300; radius <= 500; radius++) {
            // 设置线条样式（完全不透明）
            graphics.lineStyle(1, 0x000000, 1); // 线宽1，黑色，完全不透明
            
            // 绘制空心圆圈
            graphics.strokeCircle(screenCenterX, screenCenterY, radius);
        }
    }

    // 创建指向引力中心的箭头
    createGravityArrow() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        
        // 创建箭头图像
        this.gravityArrow = this.add.image(screenWidth / 2, screenHeight / 2, 'arrow');
        this.gravityArrow.setScrollFactor(0); // 不随相机移动
        this.gravityArrow.setDepth(1000); // 确保在UI层上，设置更高的深度
        this.gravityArrow.setScale(0.2); // 缩小箭头60%
        this.gravityArrow.visible = true; // 初始可见
        console.log('Arrow created at:', screenWidth / 2, screenHeight / 2);
        console.log('Arrow scale:', this.gravityArrow.scale);
        console.log('Arrow depth:', this.gravityArrow.depth);
        console.log('Arrow visible:', this.gravityArrow.visible);
    }
    
    // 开始生成闪屏效果
    startGeneratingFlashes() {
        //console.log('开始生成闪屏效果');
        
        // 定义第一个生成机制的函数（频率降低50%，闪屏大小上限增加30%，下限升高40%）
        const scheduleNextFlash1 = () => {
            //console.log('触发光屏生成（机制1）');
            this.generateFlash(35, 364); // 下限升高40%，上限增加30%
            
            // 随机延迟后再次生成闪屏，频率增加到现在的160%
            const nextDelay = Phaser.Math.Between(109, 547); // 175-875ms 增加到现在的160%
            //console.log('调度下一次闪屏生成（机制1），延迟:', nextDelay, 'ms');
            this.time.delayedCall(nextDelay, scheduleNextFlash1, [], this);
        };
        
        // 定义第二个生成机制的函数（频率增加60%，闪屏大小上限降低20%，下限降低40%）
        const scheduleNextFlash2 = () => {
            //console.log('触发光屏生成（机制2）');
            this.generateFlash(4, 40); // 下限降低40%，上限降低20%
            
            // 随机延迟后再次生成闪屏，频率降低到现在的50%
            const nextDelay = Phaser.Math.Between(52, 262); // 26-131ms 降低到现在的50%
            //console.log('调度下一次闪屏生成（机制2），延迟:', nextDelay, 'ms');
            this.time.delayedCall(nextDelay, scheduleNextFlash2, [], this);
        };
        
        // 立即生成第一个闪屏
        this.generateFlash(35, 364);
        
        // 调度第一个生成机制
        const initialDelay1 = Phaser.Math.Between(109, 547); // 增加到现在的160%
        //console.log('调度下一次闪屏生成（机制1），初始延迟:', initialDelay1, 'ms');
        this.time.delayedCall(initialDelay1, scheduleNextFlash1, [], this);
        
        // 调度第二个生成机制
        const initialDelay2 = Phaser.Math.Between(52, 262); // 降低到现在的50%
        //console.log('调度下一次闪屏生成（机制2），初始延迟:', initialDelay2, 'ms');
        this.time.delayedCall(initialDelay2, scheduleNextFlash2, [], this);
    }
    
    // 生成闪屏效果
    generateFlash(minSize = 25, maxSize = 280) {
        // 随机位置
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        const x = Phaser.Math.Between(0, screenWidth);
        const y = Phaser.Math.Between(0, screenHeight);
        
        // 随机大小（有范围）
        const size = Phaser.Math.Between(minSize, maxSize);
        
        // 随机持续时间（0.05-1.12s之间，上限延长40%）
        const duration = Phaser.Math.FloatBetween(0.05, 1.12) * 1000; // 转换为毫秒
        
        // 随机色调调整（0-360度）
        const hue = Phaser.Math.Between(0, 360);
        
        // 随机饱和度调整（0-100%）
        const saturation = Phaser.Math.Between(0, 100);
        
        // 随机亮度调整（0.7-1.0之间，确保闪屏足够亮）
        const lightness = Phaser.Math.FloatBetween(0.7, 1.0);
        
        // 随机旋转角度（0度，90度，180度，270度）
        const rotationAngles = [0, Math.PI/2, Math.PI, 3*Math.PI/2];
        const rotation = rotationAngles[Phaser.Math.Between(0, 3)];
        
        //console.log('生成闪屏效果，位置:', x, y, '大小:', size, '持续时间:', duration, 'ms', '色调:', hue, '饱和度:', saturation, '亮度:', lightness, '旋转角度:', rotation);
        
        // 创建闪屏精灵
        const flash = this.add.sprite(x, y, 'flash_1');
        flash.setScale(size / flash.width);
        flash.setScrollFactor(0); // 不随相机移动
        flash.setDepth(999); // 设置在UI层上，但在箭头之下
        
        // 添加边缘虚化效果（使用 Phaser 3 兼容的方式）
        // 注意：在某些 Phaser 3 版本中，滤镜的使用方式可能不同
        // 这里我们使用 alpha 渐变来模拟边缘虚化效果
        flash.setAlpha(0.8); // 稍微降低透明度，使边缘看起来更柔和
        
        // 应用随机旋转
        flash.setRotation(rotation);
        
        // 应用随机色调、饱和度和亮度调整
        // 在Phaser 3中，我们可以使用tint属性来调整颜色
        // 首先将RGB颜色转换为HSL，调整后再转换回RGB
        // 这里我们使用一个简化的方法，通过随机tint值来实现颜色变化
        const randomTint = Phaser.Display.Color.HSLToColor(hue, saturation/100, lightness).color;
        flash.setTint(randomTint);
        
        // 添加到闪屏数组
        this.flashes.push(flash);
        //console.log('闪屏已添加到数组，当前闪屏数量:', this.flashes.length);
        
        // 快速随机切换帧以达到闪屏效果
        let elapsedTime = 0;
        const frameChangeInterval = 50; // 每50ms切换一次帧
        const fadeStartTime = 50; // 至少持续0.05秒之后再开始减弱
        
        const frameChangeEvent = this.time.addEvent({
            delay: frameChangeInterval,
            callback: () => {
                // 随机切换帧
                const randomFrame = Phaser.Math.Between(1, 10);
                flash.setTexture(`flash_${randomFrame}`);
                
                // 重新应用色调和饱和度调整到新帧
                flash.setTint(randomTint);
                
                // 更新经过的时间
                elapsedTime += frameChangeInterval;
                
                // 至少持续0.05秒之后再开始减弱
                if (elapsedTime >= fadeStartTime) {
                    // 计算剩余时间比例，逐渐降低不透明度
                    const remainingRatio = 1 - ((elapsedTime - fadeStartTime) / (duration - fadeStartTime));
                    flash.setAlpha(0.8 * remainingRatio);
                }
                
                // 如果超过持续时间，销毁闪屏
                if (elapsedTime >= duration) {
                    frameChangeEvent.remove();
                    this.removeFlash(flash);
                }
            },
            callbackScope: this,
            loop: true
        });
    }
    
    // 移除闪屏效果
    removeFlash(flash) {
        // 从数组中移除闪屏
        const index = this.flashes.indexOf(flash);
        if (index !== -1) {
            this.flashes.splice(index, 1);
            //console.log('闪屏已销毁，剩余闪屏数量:', this.flashes.length);
        }
        
        // 销毁闪屏精灵
        flash.destroy();
    }
    update(time, delta) {
        super.update(time, delta);
        this.updateArrowPosition();
    }
    // 更新箭头位置和方向
    updateArrowPosition() {
        if (!this.mainScene || !this.mainScene.leader || this.mainScene.planets.length === 0) {
            if (this.gravityArrow) {
                this.gravityArrow.visible = false;
                //console.log('Arrow hidden: missing mainScene, leader, or planets');
            }
            return;
        }
        
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        const screenCenterX = screenWidth / 2;
        const screenCenterY = screenHeight / 2;
        
        // 获取相机当前缩放级别
        const cameraZoom = this.mainScene.cameras.main.zoom;
        
        // 获取火箭位置
        const rocketX = this.mainScene.leader.x;
        const rocketY = this.mainScene.leader.y;
        
        // 获取引力中心位置（脉冲行星）
        const gravityCenterX = this.mainScene.planets[0].x;
        const gravityCenterY = this.mainScene.planets[0].y;
        
        // 计算从火箭到引力中心的向量
        const dx = gravityCenterX - rocketX;
        const dy = gravityCenterY - rocketY;
        
        // 计算向量长度
        const length = Math.sqrt(dx * dx + dy * dy);
        
        // 计算单位向量
        const unitX = dx / length;
        const unitY = dy / length;
        
        // 只调整箭头大小，保持半径不变
        const baseRadius = 260;
        const baseScale = 0.2;
        const radius = baseRadius; // 保持半径不变
        const arrowScale = baseScale; // 箭头大小固定，不随相机缩放改变
        
        // 计算箭头在以屏幕中心为圆心的圆周上的位置
        const arrowX = screenCenterX + unitX * radius;
        const arrowY = screenCenterY + unitY * radius;
        
        // 更新箭头位置
        this.gravityArrow.setPosition(arrowX, arrowY);
        
        // 更新箭头大小
        this.gravityArrow.setScale(arrowScale);
        
        // 计算箭头的旋转角度（弧度）
        const angle = Math.atan2(dy, dx);
        
        // 更新箭头旋转角度
        this.gravityArrow.setRotation(angle);
        
        // 确保箭头可见
        this.gravityArrow.visible = true;
        //console.log('Arrow updated: position=', arrowX, arrowY, 'rotation=', angle, 'scale=', arrowScale, 'radius=', radius, 'cameraZoom=', cameraZoom);
    }

    showSuccessAreaOverlay() {
        // 显示成功判定区域的overlayer
        if(this.mainScene) {
            const midX = this.mainScene.centerX;
            const midY = this.mainScene.centerY;
            
            // 创建成功判定区域的圆形
            const successArea = this.add.circle(
                midX,
                midY,
                150, // 半径
                0x00ff00,
                0.2
            );
            successArea.setDepth(-50); // 设置在背景之上，脉冲星之下
            // 不设置scrollFactor为0，这样它会随相机移动
        }
    }

    showSuccessText() {
        if(!this.overlays) {
            this.overlays = [];
        }
        if(!this.cameras || !this.cameras.main) {
            //console.log('camera unset.');
        }
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        const successOverlay = this.add.rectangle(
            screenWidth/2,
            screenHeight/2,
            screenWidth,
            screenHeight,
            0x000000,
            0.5
        );
        successOverlay.setScrollFactor(0);
        successOverlay.setDepth(1000);
        this.overlays.push(successOverlay);

        this.successText = this.add.text(
            screenWidth / 2,
            screenHeight / 2 - 100,
            'SUCCESS',
            {
                fontSize: '50px',
                fill: '#ffffff',
                backgroundColor: '#00000080',
                padding: { x: 0, y: 0 }
            }
        );
        this.successText.setOrigin(1, 0.5);
        this.successText.setScrollFactor(0);
        this.successText.setDepth(1001);

        // 记录场景完成状态
        const completedScenes = JSON.parse(localStorage.getItem('completedScenes') || '[]');
        if (!completedScenes.includes('ScenePulsar')) {
            completedScenes.push('ScenePulsar');
            localStorage.setItem('completedScenes', JSON.stringify(completedScenes));
        }

        this.time.delayedCall(3000, () => {
                    this.scene.stop('ScenePulsar');
                    this.scene.start('MapScene', { mode: localStorage.getItem('mapSceneMode') || 'adventure' });
                });
    }
}
