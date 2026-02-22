export class GenericPreparationScene extends Phaser.Scene {
    constructor(sceneKey, sceneKeyGame) {
        super(sceneKey);
        this.sceneKeyGame = sceneKeyGame;
    }
    
    create(data) {
        // 设置背景
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        
        // 创建背景
        const bg = this.add.image(centerX, centerY, 'bg_prepare.png');
        bg.setDepth(-100);
        bg.setScale(1);
        
        // 检查是否需要过渡效果
        const shouldFade = data && data.noFade ? false : true;
        
        if (shouldFade) {
            // 创建过渡效果的黑色矩形
            this.fadeRect = this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x000000);
            this.fadeRect.setAlpha(1);
            this.fadeRect.setDepth(1000);
            this.fadeRect.setScrollFactor(0); // 不随相机移动
            
            // 黑出效果（场景进入时的淡出动画）
            this.tweens.add({
                targets: this.fadeRect,
                alpha: 0,
                duration: 300,
                ease: 'Power2'
            });
        }
        
        // 确保fadeRect存在，用于后续的黑入效果
        if (!this.fadeRect) {
            this.fadeRect = this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x000000);
            this.fadeRect.setAlpha(0);
            this.fadeRect.setDepth(1000);
            this.fadeRect.setScrollFactor(0); // 不随相机移动
        }
        
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
                    // 黑入效果
                    this.tweens.add({
                        targets: this.fadeRect,
                        alpha: 1,
                        duration: 300,
                        ease: 'Power2',
                        onComplete: () => {
                            // 跳转到对应场景
                            this.scene.start(this.sceneKeyGame, {});
                        }
                    });
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
        

        
        // 创建"游戏指南"按钮
        const guideButton = this.add.text(this.cameras.main.width - 20, this.cameras.main.height - 150, '游戏指南', {
            fontSize: '18px',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 17, y: 8 }
        });
        guideButton.setOrigin(1, 0);
        guideButton.setInteractive();
        
        // 按钮悬停效果
        guideButton.on('pointerover', () => {
            guideButton.setStyle({ 
                fill: '#99ff99',
                backgroundColor: '#444444'
            });
            this.tweens.add({
                targets: guideButton,
                scale: 1.1,
                duration: 200,
                ease: 'Power2'
            });
        });
        
        guideButton.on('pointerout', () => {
            guideButton.setStyle({ 
                fill: '#ffffff',
                backgroundColor: '#333333'
            });
            this.tweens.add({
                targets: guideButton,
                scale: 1,
                duration: 200,
                ease: 'Power2'
            });
        });
        
        // 按钮点击事件
        guideButton.on('pointerdown', () => {
            // 按钮点击动画
            this.tweens.add({
                targets: guideButton,
                scale: 0.9,
                duration: 100,
                ease: 'Power2',
                yoyo: true,
                onComplete: () => {
                    // 直接跳转到游戏指南界面，不需要过渡效果
                    this.scene.start('GuideScene', {});
                }
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
                    // 黑入效果
                    this.tweens.add({
                        targets: this.fadeRect,
                        alpha: 1,
                        duration: 300,
                        ease: 'Power2',
                        onComplete: () => {
                            // 跳转到地图界面
                            this.scene.start('MapScene', {});
                        }
                    });
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
                    // 黑入效果
                    this.tweens.add({
                        targets: this.fadeRect,
                        alpha: 1,
                        duration: 300,
                        ease: 'Power2',
                        onComplete: () => {
                            // 跳转到主界面
                            this.scene.start('Game', {});
                        }
                    });
                }
            });
        });
        
        // 添加"目前所在星球："文字
        // 先创建背景矩形
        const planetBg = this.add.rectangle(20, this.cameras.main.height - 155, 185, 100, 0x000000, 0.5);
        planetBg.setStrokeStyle(2, 0xffffff, 0.8);
        planetBg.setOrigin(0, 0);
        
        // 再添加文字
        const planetText = this.add.text(30, this.cameras.main.height - 145, '目前所在星球：', {
            fontSize: '25px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        planetText.setOrigin(0, 0);
        
        // 键盘事件：按Enter键返回主界面
        this.input.keyboard.on('keydown-ENTER', () => {
            // 黑入效果
            this.tweens.add({
                targets: this.fadeRect,
                alpha: 1,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    this.scene.start('Game', {});
                }
            });
        });
    }
}