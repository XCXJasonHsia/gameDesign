import {GenericPlanet} from '../../generalClasses/GenericPlanet.js';

export class Whirl extends GenericPlanet {
    constructor(scene, x, y, texture, radius, setHealthBar, bodyMass, index) {
        super(scene, x, y, texture, radius, setHealthBar, bodyMass);
        
        // 初始引力设置
        this.baseG = 1000; // 基础引力
        this.strongG = 10000; // 增强后的引力
        this.G = 0; // 当前引力，初始为0
        this.power = -2; // 引力幂律
        
        // 引力增强的距离阈值
        this.attractionRadius = 300; // 当飞船进入这个半径时，引力增强
        
        // 标记为whirl
        this.isWhirl = true;
        
        // 记录whirl的索引，用于标识
        this.whirlIndex = index || 0;
        
        // 创建编号文本
        this.createNumberText(scene);
        
        // 初始化动画
        this.initAnimations();
    }
    
    // 创建编号文本
    createNumberText(scene) {
        // 创建文本对象，显示whirl编号
        this.numberText = scene.add.text(this.x, this.y, (this.whirlIndex).toString(), {
            fontSize: '24px',
            fill: '#ffffff',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.numberText.setOrigin(0.5, 0.5); // 居中对齐
        this.numberText.setDepth(10); // 确保在whirl之上
    }
    
    // 更新方法，确保编号文本始终在whirl中央
    update() {
        super.update();
        if (this.numberText) {
            this.numberText.setPosition(this.x, this.y);
        }
    }
    
    // 初始化动画
    initAnimations() {
        // 尝试创建whirl的动画
        try {
            if (!this.scene.anims.exists('whirl_anim')) {
                // 检查是否可以生成帧
                const frames = this.scene.anims.generateFrameNumbers('whirl', {start: 0, end: 11});
                if (frames && frames.length > 0) {
                    this.scene.anims.create({
                        key: 'whirl_anim',
                        frames: frames,
                        frameRate: 12,
                        repeat: -1
                    });
                    // 播放动画
                    this.anims.play('whirl_anim');
                }
            } else {
                // 播放动画
                this.anims.play('whirl_anim');
            }
        } catch (error) {
            // 如果动画创建失败（可能是因为whirl不是spritesheet），则不播放动画
            console.log('Whirl animation not available, using static image');
        }
        
        // 将whirl精灵扩大为原来的两倍
        this.setScale(this.scaleX * 2, this.scaleY * 2);
        // 重新计算并更新碰撞体大小
        if (this.radius) {
            const newRadius = this.radius * 2;
            this.body.setCircle(newRadius);
        }
    }
    
    // 检查飞船距离并调整引力
    checkRocketDistance(rocket) {
        if (!rocket) return;
        
        // 计算飞船到whirl的距离
        const dx = this.x - rocket.x;
        const dy = this.y - rocket.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 记录之前的引力状态
        const wasActive = this.G > 0;
        
        // 根据距离调整引力
        if (distance < this.attractionRadius) {
            // 当飞船进入吸引半径，增强引力
            this.G = this.strongG;
            // 如果之前没有激活，现在激活了，输出log
            if (!wasActive) {
                console.log(`Whirl ${this.whirlIndex} 引力被激活！`);
            }
        } else {
            // 当飞船离开吸引半径，设置引力为0，不影响火箭
            this.G = 0;
            // 如果之前激活，现在关闭了，输出log
            if (wasActive) {
                console.log(`Whirl ${this.whirlIndex} 引力被关闭！`);
            }
        }
    }
    
    // 销毁方法，清理编号文本
    destroy(fromScene) {
        // 清理编号文本
        if (this.numberText) {
            this.numberText.destroy();
            this.numberText = null;
        }
        // 调用父类的destroy方法
        super.destroy(fromScene);
    }
}
