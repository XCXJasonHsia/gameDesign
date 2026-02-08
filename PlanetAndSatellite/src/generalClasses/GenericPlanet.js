export class GenericPlanet extends Phaser.Physics.Arcade.Sprite {
    // constructor里可以调的planet参数：radius,  setHealthBar(bool)， bodymass
    constructor(scene, x, y, texture, radius, setHealthBar, bodyMass) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);// 如果要用到内置的physics做事的话也行

        // 设置物体半径并在physics.body中更新
        this.radius = radius; // 保存半径为实例属性
        const scale = (radius * 2) / this.width; // 计算缩放比例
        this.setScale(scale);
        this.body.setCircle(radius); // 设置圆形碰撞体

        // 是否设置血量和攻击伤害的机制
        this.setHealthBar = setHealthBar;

        // 幂律是否可调整(unused)
        this.powerManipulation = this.scene.powerManipulation;
        // 不是fightMode时需要用到自己的幂律，需要在继承类中定义
        this.power = -2;

        // 设置为静态，不受外力影响（如果用到内置physics这几行才有效）
        this.setImmovable(true);
        this.body.mass = bodyMass; // 行星质量
        this.setBounce(0);// 碰撞时无弹性

        // 标记为行星
        this.isPlanet = true;
        this.mass = bodyMass;

        // 血量系统
        this.maxHealth = 1000; // 最大血量
        this.health = this.maxHealth; // 当前血量
        
        // fightMode下创建血条图形
        if (this.setHealthBar) {
            this.createHealthBar(scene);
        }
        
    }

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

    update() {
        if(this.setHealthBar){
            this.updateHealthBarPosition();
        }
    }


}