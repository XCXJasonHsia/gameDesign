export class GenericIntroScene extends Phaser.Scene {
    constructor(sceneKey, nextSceneKey, title, content) {
        super(sceneKey);
        this.nextSceneKey = nextSceneKey;
        this.title = title;
        this.content = content;
    }
    
    create() {
        // 设置背景
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        
        // 创建黑色背景
        const bg = this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x000000);
        bg.setDepth(-100);
        
        // 创建标题
        const titleText = this.add.text(centerX, this.cameras.main.height + 100, this.title, {
            fontSize: '36px',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center',
            fontFamily: 'Arial, sans-serif'
        });
        titleText.setOrigin(0.5);
        titleText.setDepth(10);
        
        // 创建内容文本
        const contentText = this.add.text(centerX, this.cameras.main.height + 200, this.content, {
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1,
            align: 'center',
            fontFamily: 'Arial, sans-serif',
            wordWrap: {
                width: this.cameras.main.width - 100
            }
        });
        contentText.setOrigin(0.5);
        contentText.setDepth(10);
        
        // 创建滚动动画
        this.tweens.add({
            targets: [titleText, contentText],
            y: '-=1000',
            duration: 20000,
            ease: 'Linear',
            onComplete: () => {
                this.scene.start(this.nextSceneKey);
            }
        });
        
        // 添加按Enter键跳过的功能
        this.input.keyboard.once('keydown-ENTER', () => {
            this.scene.start(this.nextSceneKey);
        });
        
        // 添加提示文本
        const hintText = this.add.text(centerX, this.cameras.main.height - 50, '按Enter键跳过', {
            fontSize: '16px',
            fill: '#cccccc',
            align: 'center',
            fontFamily: 'Arial, sans-serif'
        });
        hintText.setOrigin(0.5);
        hintText.setDepth(10);
        hintText.setScrollFactor(0);
    }
}