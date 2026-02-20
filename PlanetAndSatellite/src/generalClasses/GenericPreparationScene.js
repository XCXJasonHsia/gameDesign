export class GenericPreparationScene extends Phaser.Scene {
    constructor(sceneKey, sceneKeyGame) {
        super(sceneKey);
        this.sceneKeyGame = sceneKeyGame;
    }
    
    create() {
        // 设置背景
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        
        // 创建背景
        const bg = this.add.image(centerX, centerY, 'bg_prepare.png');
        bg.setDepth(-100);
        bg.setScale(1);
        
        // 创建标题
        const title = this.add.text(centerX, centerY - 210, '个人准备界面', {
            fontSize: '36px',
            fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            padding: { x: 10, y: 10 }
        });
        title.setOrigin(0.5);

        const helpText = this.add.text(centerX, 50, '按h查看提示', {
            fontSize: '20px',
            fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            padding: { x: 10, y: 5 }
        });
        helpText.setOrigin(0.5);
        
        // 创建飞船图像
        const rocket = this.add.image(centerX, centerY - 100, 'rocket');
        rocket.setScale(0.1863);
        rocket.setInteractive();
        
        // 实现飞船随机漂移和倾斜动画
        this.tweens.add({
            targets: rocket,
            x: {
                value: () => centerX + Phaser.Math.Between(-50, 50),
                duration: 2000,
                repeat: -1,
                yoyo: true,
                ease: 'Sine.easeInOut'
            },
            y: {
                value: () => centerY - 100 + Phaser.Math.Between(-20, 20),
                duration: 2500,
                repeat: -1,
                yoyo: true,
                ease: 'Sine.easeInOut'
            },
            rotation: {
                value: () => Phaser.Math.Between(-10, 10) * Math.PI / 180,
                duration: 1500,
                repeat: -1,
                yoyo: true,
                ease: 'Sine.easeInOut'
            }
        });
        
        // 飞船点击事件
        rocket.on('pointerdown', () => {
            // 停止当前动画
            this.tweens.killTweensOf(rocket);
            
            // 点击时飞船变大并略微变黄
            this.tweens.add({
                targets: rocket,
                scale: 0.25,
                tint: 0xffffcc,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    // 跳转到对应场景
                    this.scene.start(this.sceneKeyGame, {});
                }
            });
        });
        
        // 飞船鼠标悬停效果
        rocket.on('pointerover', () => {
            // 鼠标悬停时飞船略微变大
            this.tweens.add({
                targets: rocket,
                scale: 0.22,
                duration: 200,
                ease: 'Power2'
            });
        });
        
        // 飞船鼠标离开效果
        rocket.on('pointerout', () => {
            // 鼠标离开时飞船恢复原始大小
            this.tweens.add({
                targets: rocket,
                scale: 0.1863,
                duration: 200,
                ease: 'Power2'
            });
        });
        

        
        // 创建"地图"按钮
        const mapButton = this.add.text(this.cameras.main.width - 20, this.cameras.main.height - 100, '地图', {
            fontSize: '18px',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 17, y: 8 }
        });
        mapButton.setOrigin(1, 0);
        mapButton.setInteractive();
        
        // 按钮悬停效果
        mapButton.on('pointerover', () => {
            mapButton.setStyle({ 
                fill: '#66aaff',
                backgroundColor: '#444444'
            });
            this.tweens.add({
                targets: mapButton,
                scale: 1.1,
                duration: 200,
                ease: 'Power2'
            });
        });
        
        mapButton.on('pointerout', () => {
            mapButton.setStyle({ 
                fill: '#ffffff',
                backgroundColor: '#333333'
            });
            this.tweens.add({
                targets: mapButton,
                scale: 1,
                duration: 200,
                ease: 'Power2'
            });
        });
        
        // 按钮点击事件
        mapButton.on('pointerdown', () => {
            // 按钮点击动画
            this.tweens.add({
                targets: mapButton,
                scale: 0.9,
                duration: 100,
                ease: 'Power2',
                yoyo: true,
                onComplete: () => {
                    // 跳转到地图界面
                    this.scene.start('MapScene', {});
                }
            });
        });
        
        // 创建"返回主界面"按钮
        const backButton = this.add.text(this.cameras.main.width - 20, this.cameras.main.height - 50, '返回主界面', {
            fontSize: '18px',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 17, y: 8 }
        });
        backButton.setOrigin(1, 0);
        backButton.setInteractive();
        
        // 按钮悬停效果
        backButton.on('pointerover', () => {
            backButton.setStyle({ 
                fill: '#ff6666',
                backgroundColor: '#444444'
            });
            this.tweens.add({
                targets: backButton,
                scale: 1.1,
                duration: 200,
                ease: 'Power2'
            });
        });
        
        backButton.on('pointerout', () => {
            backButton.setStyle({ 
                fill: '#ffffff',
                backgroundColor: '#333333'
            });
            this.tweens.add({
                targets: backButton,
                scale: 1,
                duration: 200,
                ease: 'Power2'
            });
        });
        
        // 按钮点击事件
        backButton.on('pointerdown', () => {
            // 按钮点击动画
            this.tweens.add({
                targets: backButton,
                scale: 0.9,
                duration: 100,
                ease: 'Power2',
                yoyo: true,
                onComplete: () => {
                    // 跳转到主界面
                    this.scene.start('Game', {});
                }
            });
        });
    }
}