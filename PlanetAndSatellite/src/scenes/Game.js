export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
        this.previousState = {};
    }

    create() {
        // 添加背景
        this.add.image(400, 300, 'bg');
        
        // 游戏标题
        const title = this.add.text(400, 150, 'blablabla', {
            fontSize: '48px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        });
        title.setOrigin(0.5);
        
        // 副标题
        const subtitle = this.add.text(400, 200, 'chikenRoll', {
            fontSize: '24px',
            fill: '#ffcc00',
            stroke: '#000000',
            strokeThickness: 3
        });
        subtitle.setOrigin(0.5);
        
        // 创建 Battle 按钮
        const battleButton = this.add.text(400, 320, 'DualPlanets', {
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 30, y: 15 }
        });
        battleButton.setOrigin(0.5);
        battleButton.setInteractive();
        
        // battle 按钮的交互效果
        battleButton.on('pointerover', () => {
            battleButton.setStyle({ 
                fill: '#ffcc00',
                backgroundColor: '#444444'
            });
            this.tweens.add({
                targets: battleButton,
                scale: 1.1,
                duration: 200,
                ease: 'Power2'
            });
        });
        
        battleButton.on('pointerout', () => {
            battleButton.setStyle({ 
                fill: '#ffffff',
                backgroundColor: '#333333'
            });
            this.tweens.add({
                targets: battleButton,
                scale: 1,
                duration: 200,
                ease: 'Power2'
            });
        });
        
        // Battle 按钮点击事件
        battleButton.on('pointerdown', () => {
            // 点击音效（如果有的话）
            // this.sound.play('click');
            
            // 按钮点击动画
            this.tweens.add({
                targets: battleButton,
                scale: 0.9,
                duration: 100,
                ease: 'Power2',
                yoyo: true,
                onComplete: () => {
                    // 切换到 Battle 场景
                    this.scene.start('PreparationScene23', {
                    fromScene: 'Game',
                    previousState: this.previousState
                });
                }
            });
        });
        
        // 创建 Adventure 按钮
        const adventureButton = this.add.text(400, 400, 'SurfaceplayScene', {
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 30, y: 15 }
        });
        adventureButton.setOrigin(0.5);
        adventureButton.setInteractive();
        
        // Adventure 按钮的交互效果
        adventureButton.on('pointerover', () => {
            adventureButton.setStyle({ 
                fill: '#66aaff',
                backgroundColor: '#444444'
            });
            this.tweens.add({
                targets: adventureButton,
                scale: 1.1,
                duration: 200,
                ease: 'Power2'
            });
        });
        
        adventureButton.on('pointerout', () => {
            adventureButton.setStyle({ 
                fill: '#ffffff',
                backgroundColor: '#333333'
            });
            this.tweens.add({
                targets: adventureButton,
                scale: 1,
                duration: 200,
                ease: 'Power2'
            });
        });
        
        // Adventure 按钮点击事件
        adventureButton.on('pointerdown', () => {
            // 点击音效
            // this.sound.play('click');
            
            // 按钮点击动画
            this.tweens.add({
                targets: adventureButton,
                scale: 0.9,
                duration: 100,
                ease: 'Power2',
                yoyo: true,
                onComplete: () => {
                    // 切换到个人准备界面
                    this.scene.start('SurfaceplayScene', {
                    fromScene: 'Game',
                    previousState: this.previousState
                });
                    /*
                    // 暂时先显示提示信息，因为Adventure场景还没开发
                    const warningText = this.add.text(400, 480, '冒险模式开发中...', {
                        fontSize: '20px',
                        fill: '#ff6666',
                        backgroundColor: '#00000080',
                        padding: { x: 10, y: 5 }
                    });
                    warningText.setOrigin(0.5);
                    
                    // 3秒后消失
                    this.time.delayedCall(3000, () => {
                        warningText.destroy();
                    });
                    */
                    // 或者直接跳转到Game场景作为占位
                    // this.scene.start('Game');
                }
            });
        });
        /*
        // 游戏说明文本
        const instructions = this.add.text(400, 520, 
            '拖动下方滑动条调整行星引力幂律，使卫星撞击行星造成伤害', {
            fontSize: '16px',
            fill: '#cccccc',
            align: 'center'
        });
        instructions.setOrigin(0.5);
        
        // 添加开发者信息
        const developerInfo = this.add.text(400, 580, 
            '© 2023 引力行星碰撞模拟', {
            fontSize: '14px',
            fill: '#888888'
        });
        developerInfo.setOrigin(0.5);
        
        // 添加背景星星动画
        this.createStarfield();
        
        // 添加行星装饰（左侧）
        const leftPlanet = this.add.sprite(100, 100, 'star');
        leftPlanet.setTint(0xff6666);
        leftPlanet.setScale(1.5);
        
        // 添加行星装饰（右侧）
        const rightPlanet = this.add.sprite(700, 100, 'star');
        rightPlanet.setTint(0x6666ff);
        rightPlanet.setScale(1.5);
        
        // 行星浮动动画
        this.tweens.add({
            targets: leftPlanet,
            y: 130,
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
        
        this.tweens.add({
            targets: rightPlanet,
            y: 130,
            duration: 2000,
            ease: 'Sine.easeInOut',
            delay: 1000,
            yoyo: true,
            repeat: -1
        });
    }
    
    createStarfield() {
        // 创建星空背景
        const stars = this.add.graphics();
        
        // 绘制随机星星
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, 800);
            const y = Phaser.Math.Between(0, 600);
            const size = Phaser.Math.FloatBetween(0.5, 2);
            const alpha = Phaser.Math.FloatBetween(0.3, 1);
            
            stars.fillStyle(0xffffff, alpha);
            stars.fillCircle(x, y, size);
        }
        
        // 添加一些闪烁的星星
        const twinklingStars = [];
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, 800);
            const y = Phaser.Math.Between(0, 600);
            const size = Phaser.Math.FloatBetween(1, 3);
            
            const star = this.add.circle(x, y, size, 0xffffff);
            star.setAlpha(Phaser.Math.FloatBetween(0.3, 0.8));
            
            // 添加闪烁动画
            this.tweens.add({
                targets: star,
                alpha: Phaser.Math.FloatBetween(0.1, 0.5),
                duration: Phaser.Math.Between(1000, 3000),
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 2000)
            });
            
            twinklingStars.push(star);
        }
        */
    }
    
    update() {
        // 菜单场景不需要更新逻辑
    }
}
