export class Planet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 设置为静态，不受外力影响
        this.setImmovable(true);
        this.body.mass = 10000; // 行星质量
        
        // 引力常数 - 适当调大以获得稳定的轨道
        this.G = 1000;
        
        // 标记为行星
        this.isPlanet = true;

        // 不应用重力系统
        this.GravitySystem = null;

        // 将行星图标调大2倍
        this.setScale(2, 2);
        
        // 调整碰撞体大小以匹配新的缩放
        this.refreshBody();

        // 碰撞时无弹性
        this.setBounce(0);

        // 星球宽度
        this.displayWidth = 100;
        this.displayHeight = 100;
        
        // 血量系统
        this.maxHealth = 1000; // 最大血量
        this.health = this.maxHealth; // 当前血量
        
        // 创建血条图形
        this.createHealthBar(scene);
    }
    
    // 创建血条
    createHealthBar(scene) {
        // 血条背景（红色）
        this.healthBarBg = scene.add.rectangle(
            this.x, 
            this.y - this.displayWidth / 2 - 10, 
            this.displayWidth + 10, 
            6, 
            0xff0000
        );
        this.healthBarBg.setOrigin(0.5, 0.5);
        
        // 血条前景（绿色）
        this.healthBar = scene.add.rectangle(
            this.x, 
            this.y - this.displayWidth / 2 - 10, 
            this.displayWidth + 10, 
            6, 
            0x00ff00
        );
        this.healthBar.setOrigin(0.5, 0.5);
        
        // 血量文本
        this.healthText = scene.add.text(
            this.x,
            this.y - this.displayWidth / 2 - 20,
            `${this.health}/${this.maxHealth}`,
            {
                fontSize: '10px',
                fill: '#ffffff',
                backgroundColor: '#00000080',
                padding: { x: 2, y: 1 }
            }
        );
        this.healthText.setOrigin(0.5, 0.5);
    }
    
    // 更新血条位置
    updateHealthBarPosition() {
        if (this.healthBarBg) {
            this.healthBarBg.x = this.x;
            this.healthBarBg.y = this.y - this.displayWidth / 2 - 10;
        }
        
        if (this.healthBar) {
            this.healthBar.x = this.x;
            this.healthBar.y = this.y - this.displayWidth / 2 - 10;
            
            // 更新血条宽度
            const healthPercent = this.health / this.maxHealth;
            this.healthBar.width = (this.displayWidth + 10) * healthPercent;
        }
        
        if (this.healthText) {
            this.healthText.x = this.x;
            this.healthText.y = this.y - this.displayWidth / 2 - 20;
            this.healthText.setText(`${Math.floor(this.health)}/${this.maxHealth}`);
        }
    }
    
    // 受到伤害
    takeDamage(damage) {
        this.health -= damage;
        
        // 确保血量不为负
        if (this.health < 0) {
            this.health = 0;
        }
        
        // 更新血条
        this.updateHealthBarPosition();
        
        // 如果血量为0，行星被摧毁
        if (this.health <= 0) {
            this.destroyPlanet();
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
    
    // 摧毁行星
    destroyPlanet() {
        // 添加爆炸效果
        //this.createExplosion();
        
        // 隐藏血条
        if (this.healthBarBg) this.healthBarBg.setVisible(false);
        if (this.healthBar) this.healthBar.setVisible(false);
        if (this.healthText) this.healthText.setVisible(false);
        
        // 行星变小并淡出
        this.scene.tweens.add({
            targets: this,
            scale: 0,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                // 行星被摧毁，从场景中移除
                this.destroy();
            }
        });
        
        console.log('行星被摧毁！');
    }
    /*
    // 创建爆炸效果
    createExplosion() {
        // 创建爆炸粒子
        const particles = this.scene.add.particles('star');
        
        const emitter = particles.createEmitter({
            x: this.x,
            y: this.y,
            speed: { min: 50, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 1000,
            gravityY: 0,
            quantity: 20
        });
        
        // 爆炸后1秒移除粒子
        this.scene.time.delayedCall(1000, () => {
            particles.destroy();
        });
    }
    */
    // 重写update方法以更新血条位置
    update() {
        this.updateHealthBarPosition();
    }
}
