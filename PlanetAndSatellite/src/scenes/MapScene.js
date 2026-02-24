export class MapScene extends Phaser.Scene {
    constructor() {
        super('MapScene');
    }
    
    create() {
        // 设置背景
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        
        // 创建背景
        const bg = this.add.image(centerX, centerY, 'bg_map.png');
        bg.setDepth(-100);
        bg.setScale(1);
        
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
        
        // 创建标题
        const title = this.add.text(centerX, centerY - 200, '星图', {
            fontSize: '36px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            padding: { x: 10, y: 10 }
        });
        title.setOrigin(0.5);
        
        // 创建返回按钮
        const backButton = this.add.text(50, 30, '离开星图', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#00000080',
            padding: { x: 20, y: 10 }
        });
        backButton.setOrigin(0);
        backButton.setInteractive();
        
        // 按钮点击事件
        backButton.on('pointerdown', () => {
            // 黑入效果
            this.tweens.add({
                targets: this.fadeRect,
                alpha: 1,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    // 跳转到个人准备界面
                    this.scene.start('PreparationScene', {});
                }
            });
        });
        
        // 按钮悬停效果
        backButton.on('pointerover', () => {
            backButton.setStyle({
                fill: '#ffff00',
                backgroundColor: '#000000cc'
            });
        });
        
        backButton.on('pointerout', () => {
            backButton.setStyle({
                fill: '#ffffff',
                backgroundColor: '#00000080'
            });
        });
        
        // 创建星座点
        this.constellationPoints = [];
        this.selectedPoint = null;
        this.greenCircle = null;
        
        // 生成9个星座点的位置（分散不规则）
        const pointPositions = [
            { x: 175, y: 285 }, // 起源（向下移动15px，向右移动25px）
            { x: 300, y: 215 }, // 广袤星带（向下移动25px，然后所有星星向下移动50px）
            { x: 450, y: 270 }, // 绿洲星（所有星星向下移动50px）
            { x: 580, y: 230 }, // 脉冲星（所有星星向下移动50px）
            { x: 680, y: 330 }, // 余烬星（所有星星向下移动50px）
            { x: 660, y: 430 }, // 双星（所有星星向下移动50px）
            { x: 480, y: 470 }, // 神盾星（所有星星向下移动50px）
            { x: 330, y: 490 }, // 故土星域（所有星星向下移动50px）
            { x: 200, y: 400 }  // 终焉之洞（所有星星向下移动50px）
        ];
        
        // 星星名称
        const pointNames = [
            '起源',
            '广袤星带',
            '绿洲星',
            '脉冲星',
            '余烬星',
            '双星',
            '神盾星',
            '故土星域',
            '终焉之洞'
        ];
        
        // 创建9个白色的点
        for (let i = 0; i < pointPositions.length; i++) {
            const pos = pointPositions[i];
            const point = this.add.circle(pos.x, pos.y, 5, 0xffffff);
            point.setInteractive({ cursor: 'pointer' });
            point.index = i; // 保存点的索引
            
            // 添加白色文字标签（在星星上方）
            const text = this.add.text(pos.x, pos.y - 15, pointNames[i], {
                fontSize: '16px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            });
            text.setOrigin(0.5);
            
            // 添加点击事件
            point.on('pointerdown', () => {
                this.selectPoint(point);
            });
            
            // 添加悬停效果
            point.on('pointerover', () => {
                point.setRadius(8);
                point.setFillStyle(0xffff00);
            });
            
            point.on('pointerout', () => {
                if (this.selectedPoint === point) {
                    // 如果是选中的点，恢复为绿色和原始大小
                    point.setRadius(5);
                    point.setFillStyle(0x00ff00);
                } else {
                    // 如果不是选中的点，恢复为白色和原始大小
                    point.setRadius(5);
                    point.setFillStyle(0xffffff);
                }
            });
            
            this.constellationPoints.push(point);
        }
        
        // 创建绿圈（初始隐藏）
        this.greenCircle = this.add.circle(0, 0, 15, 0x00ff00, 0.3);
        this.greenCircle.setStrokeStyle(2, 0x00ff00);
        this.greenCircle.visible = false;
        
        // 加载保存的选中点
        this.loadSelectedPoint();
        
        // 键盘事件：按Enter键返回个人准备界面
        this.input.keyboard.on('keydown-ENTER', () => {
            // 黑入效果
            this.tweens.add({
                targets: this.fadeRect,
                alpha: 1,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    this.scene.start('PreparationScene', {});
                }
            });
        });
    }
    
    // 选择点的方法
    selectPoint(point) {
        // 检查当前点击的点是否已经是选中的点
        if (this.selectedPoint === point) {
            // 取消选中状态
            point.fillColor = 0xffffff;
            point.setRadius(5);
            this.selectedPoint = null;
            
            // 隐藏绿圈
            this.greenCircle.visible = false;
            
            // 从localStorage中删除选中的点信息
            localStorage.removeItem('selectedConstellationPoint');
            localStorage.removeItem('selectedStarIndex');
        } else {
            // 重置所有点为白色和原始大小
            for (let p of this.constellationPoints) {
                p.fillColor = 0xffffff;
                p.setRadius(5);
            }
            
            // 选择当前点为绿色并设置为原始大小
            point.fillColor = 0x00ff00;
            point.setRadius(5);
            this.selectedPoint = point;
            
            // 显示绿圈并移动到选中点
            this.greenCircle.x = point.x;
            this.greenCircle.y = point.y;
            this.greenCircle.visible = true;
            
            // 保存选中点的信息
            this.saveSelectedPoint(point);
            
            // 保存选中点的索引到localStorage，用于后续进入对应的关卡
            localStorage.setItem('selectedStarIndex', point.index.toString());
        }
        
        // 星图只起到记录位置的作用，点击星星后不退出星图界面
        // 保持星图的正常显示
    }
    
    // 保存选中点的信息
    saveSelectedPoint(point) {
        if (point && point.index !== undefined) {
            localStorage.setItem('selectedConstellationPoint', point.index.toString());
        }
    }
    
    // 加载保存的选中点
    loadSelectedPoint() {
        const savedIndex = localStorage.getItem('selectedConstellationPoint');
        if (savedIndex !== null) {
            const index = parseInt(savedIndex);
            if (index >= 0 && index < this.constellationPoints.length) {
                const savedPoint = this.constellationPoints[index];
                this.selectPoint(savedPoint);
            }
        }
    }
}