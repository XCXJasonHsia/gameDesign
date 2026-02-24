export class GuideScene extends Phaser.Scene {
    constructor() {
        super('GuideScene');
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
        const title = this.add.text(centerX, centerY - 200, '游戏指南', {
            fontSize: '36px',
            fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            padding: { x: 10, y: 10 }
        });
        title.setOrigin(0.5);
        
        // 创建背景矩形
        const bgRect = this.add.rectangle(centerX, centerY - 25, 720, 200, 0x000000, 0.5);
        bgRect.setStrokeStyle(2, 0xffffff, 0.8);
        bgRect.setDepth(-1);
        
        // 创建游戏指南文字说明
        const guideText1 = this.add.text(centerX, centerY - 100, '按WASD以向前后左右喷火', {
            fontSize: '24px',
            fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            padding: { x: 10, y: 5 }
        });
        guideText1.setOrigin(0.5);
        
        const guideText2 = this.add.text(centerX, centerY - 50, '按空格的同时喷火可以加大喷火速度', {
            fontSize: '24px',
            fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            padding: { x: 10, y: 5 }
        });
        guideText2.setOrigin(0.5);
        
        const guideText3 = this.add.text(centerX, centerY, '按esc以暂停游戏，再按esc继续游戏或按enter回到准备界面', {
            fontSize: '24px',
            fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            padding: { x: 10, y: 5 }
        });
        guideText3.setOrigin(0.5);
        
        const guideText4 = this.add.text(centerX, centerY + 50, '按R以重新开始关卡', {
            fontSize: '24px',
            fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            padding: { x: 10, y: 5 }
        });
        guideText4.setOrigin(0.5);
        
        // 创建返回按钮
        const backButton = this.add.text(this.cameras.main.width - 20, this.cameras.main.height - 50, '返回', {
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
                    // 跳回到个人准备界面，添加noFade参数避免过渡效果
                    this.scene.start('PreparationScene', { noFade: true });
                }
            });
        });
        
        // 键盘事件：按Enter键返回个人准备界面
        this.input.keyboard.on('keydown-ENTER', () => {
            this.scene.start('PreparationScene', { noFade: true });
        });
    }
}