export class NPC extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name = 'NPC') {
        super(scene, x, y, 'dude_');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.name = name;
        this.scene = scene;
        this.setBounce(0.2);
        this.setCollideWorldBounds(true);
        //this.setScale(48 / 607); // 缩小到原来的大小
        this.initAnimations();
        this.body.gravity.y = 1000;

        // 创建container来管理所有非sprite的UI元素
        this.uiContainer = scene.add.container();

        // 随机移动相关属性
        this.moveRange = 200; // 移动范围
        this.minX = x - this.moveRange / 2;
        this.maxX = x + this.moveRange / 2;
        this.moveSpeed = 100;
        this.moveDirection = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
        this.waitTime = 1000;
        this.moveTime = 1000;
        this.isWaiting = null;
        
        // 交流相关属性
        this.isPlayerNearby = false;
        this.talkHint = null;
        this.dialogueBox = null;
        this.dialogueText = null;
        this.dialogues = [
            '你好，旅行者！',
            '欢迎来到这个世界！',
            '小心前方的危险！',
            '祝你旅途愉快！'
        ];
        
        // 添加C键监听
        scene.input.keyboard.on('keydown-C', this.talkToPlayer, this);
    }
    
    initAnimations() {
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude_', {start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude_', frame: 4 } ],
            frameRate: 1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude_', {start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
    }

    update(time, delta) {
        // 随机移动逻辑
        if (this.isWaiting === true) {
            if (this.waitTime > 0) {
                this.waitTime -= delta;
                this.setVelocityX(0);
                this.anims.play('turn', true);
            }
            else {
                this.isWaiting = false;
                this.moveTime = Phaser.Math.Between(1000, 3000);
            }
        } else {
            if (this.moveTime > 0) {
                this.moveTime -= delta;
                if(this.reachBoundary === true) return;
                if (this.moveDirection < 0) {
                    this.anims.play('left', true);
                } else {
                    this.anims.play('right', true);
                }
                // 移动
                this.setVelocityX(this.moveSpeed * this.moveDirection);
            
                // 检查是否到达移动范围边界
                if (this.reachBoundary === false && (this.x <= this.minX && this.moveDirection === -1 
                    || this.x >= this.maxX && this.moveDirection === 1)) {
                    this.setVelocityX(0);
                    this.moveDirection = -1 * this.moveDirection;
                    this.reachBoundary = true;
                }
            } else {
                this.isWaiting = true;
                this.waitTime = Phaser.Math.Between(1000, 3000);
                this.reachBoundary = false;
            }   
        }
    }

    // 检测到玩家靠近
    onPlayerNearby() {
        this.isPlayerNearby = true;
        if (!this.talkHint) {
            this.talkHint = this.scene.add.text(this.x, this.y - 50, '按C键交流', {
                fontSize: '16px',
                fill: '#ffffff',
                backgroundColor: '#00000080',
                padding: { x: 10, y: 5 }
            });
            this.talkHint.setOrigin(0.5);
            this.uiContainer.add(this.talkHint); // 添加到container中
        }
        this.talkHint.setVisible(true);
    }

    // 玩家离开
    onPlayerLeave() {
        this.isPlayerNearby = false;
        if (this.talkHint) {
            this.talkHint.destroy();
            this.talkHint = null;
        }
        if (this.dialogueBox) {
            this.hideDialogue();
        }
    }

    // 与玩家交流
    talkToPlayer() {
        if (this.isPlayerNearby && !this.dialogueBox) {
            this.showDialogue();
        }
    }

    // 显示对话
    showDialogue() {
        // 创建对话框
        this.dialogueBox = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height - 100,
            this.scene.cameras.main.width - 100,
            150,
            0x000000,
            0.8
        );
        this.dialogueBox.setScrollFactor(0);
        this.uiContainer.add(this.dialogueBox); // 添加到container中
        
        // 选择随机对话
        const randomDialogue = this.dialogues[Phaser.Math.Between(0, this.dialogues.length - 1)];
        
        // 创建对话文本
        this.dialogueText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height - 100,
            `${this.name}: ${randomDialogue}`,
            {
                fontSize: '20px',
                fill: '#ffffff',
                wordWrap: {
                    width: this.scene.cameras.main.width - 120,
                    useAdvancedWrap: true
                }
            }
        );
        this.dialogueText.setOrigin(0.5);
        this.dialogueText.setScrollFactor(0);
        this.uiContainer.add(this.dialogueText); // 添加到container中
        
        // 3秒后自动关闭对话
        this.scene.time.delayedCall(3000, this.hideDialogue, [], this);
    }

    // 隐藏对话
    hideDialogue() {
        if (this.dialogueBox) {
            this.dialogueBox.destroy();
            this.dialogueBox = null;
        }
        if (this.dialogueText) {
            this.dialogueText.destroy();
            this.dialogueText = null;
        }
    }

    // 清理资源
    destroy() {
        // 移除事件监听器
        if (this.scene && this.scene.input && this.scene.input.keyboard) {
            this.scene.input.keyboard.off('keydown-C', this.talkToPlayer, this);
        }
        
        // 销毁container，这样会一次性销毁所有非sprite的UI元素
        if (this.uiContainer) {
            this.uiContainer.destroy();
        }
        
        super.destroy();
    }
}
