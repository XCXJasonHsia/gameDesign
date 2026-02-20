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
        
        // 创建标题
        const title = this.add.text(centerX, centerY - 200, '地图界面', {
            fontSize: '36px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            padding: { x: 10, y: 10 }
        });
        title.setOrigin(0.5);
        
        // 创建返回按钮
        const backButton = this.add.text(50, 30, '离开地图', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#00000080',
            padding: { x: 20, y: 10 }
        });
        backButton.setOrigin(0);
        backButton.setInteractive();
        
        // 按钮点击事件
        backButton.on('pointerdown', () => {
            // 跳转到个人准备界面
            this.scene.start('PreparationSceneEg', {});
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
        
        // 生成12个星座点的位置（更无序）
        const pointPositions = [
            { x: 150, y: 220 },
            { x: 280, y: 180 },
            { x: 350, y: 270 },
            { x: 520, y: 190 },
            { x: 650, y: 230 },
            { x: 180, y: 430 },
            { x: 220, y: 380 },
            { x: 440, y: 420 },
            { x: 580, y: 320 },
            { x: 690, y: 390 },
            { x: 290, y: 480 },
            { x: 510, y: 520 }
        ];
        
        // 创建12个白色的点
        for (let i = 0; i < pointPositions.length; i++) {
            const pos = pointPositions[i];
            const point = this.add.circle(pos.x, pos.y, 5, 0xffffff);
            point.setInteractive({ cursor: 'pointer' });
            point.index = i; // 保存点的索引
            
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
            this.scene.start('PreparationSceneEg', {});
        });
    }
    
    // 选择点的方法
    selectPoint(point) {
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