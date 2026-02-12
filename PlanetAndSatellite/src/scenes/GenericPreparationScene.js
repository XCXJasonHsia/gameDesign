import { GenericScene } from '../generalClasses/GenericScene.js';

export class GenericPreparationScene extends Phaser.Scene {
    constructor() {
        super('GenericPreparationScene');
    }
    
    create() {
        // 设置背景
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        
        // 创建背景
        const bg = this.add.image(centerX, centerY, 'bg');
        bg.setDepth(-100);
        bg.setScale(2);
        
        // 创建标题
        const title = this.add.text(centerX, centerY - 100, '个人准备界面', {
            fontSize: '36px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            padding: { x: 10, y: 10 }
        });
        title.setOrigin(0.5);
        
        // 创建"开始冒险"按钮
        const startButton = this.add.text(centerX, centerY + 100, '开始冒险', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#00000080',
            padding: { x: 20, y: 10 }
        });
        startButton.setOrigin(0.5);
        startButton.setInteractive();
        
        // 按钮点击事件
        startButton.on('pointerdown', () => {
            // 跳转到冒险模式（SceneEg）
            this.scene.start('SceneEg');
        });
        
        // 按钮悬停效果
        startButton.on('pointerover', () => {
            startButton.setStyle({
                fill: '#ffff00',
                backgroundColor: '#000000cc'
            });
        });
        
        startButton.on('pointerout', () => {
            startButton.setStyle({
                fill: '#ffffff',
                backgroundColor: '#00000080'
            });
        });
    }
}