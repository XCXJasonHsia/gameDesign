export class GravitySystem {
    constructor(scene) {
        this.scene = scene;
        this.power = -2; // 默认万有引力（r^-2）
        this.G = 1000;   // 引力常数
        
        // 存储所有天体的数组
        this.bodies = [];
        this.planets = [];
        this.satellites = [];
        
        // 创建UI
        this.createUI();
    }
    
    createUI() {
        const scene = this.scene;
        
        // 滑动条位置（左下角）
        const sliderX = 100;
        const sliderY = scene.sys.game.config.height - 80;
        
        // 创建引力幂律显示文本
        this.powerText = scene.add.text(20, sliderY - 30, `引力幂律: r^${this.power}`, {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#00000080',
            padding: { x: 10, y: 5 }
        });
        
        // 创建滑动条背景（灰色）
        const sliderBg = scene.add.rectangle(sliderX, sliderY, 300, 8, 0x666666);
        sliderBg.setOrigin(0, 0.5);
        
        // 创建滑动条（白色滑块）
        this.slider = scene.add.rectangle(sliderX + 150, sliderY, 20, 30, 0xffffff);
        this.slider.setOrigin(0.5, 0.5);
        this.slider.setInteractive({ draggable: true });
        
        // 创建滑动条刻度
        this.createSliderTicks(sliderX, sliderY);
        
        // 滑动条拖动事件
        scene.input.setDraggable(this.slider);
        
        scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            // 限制滑动范围
            const minX = sliderX;
            const maxX = sliderX + 300;
            const newX = Phaser.Math.Clamp(dragX, minX, maxX);
            
            gameObject.x = newX;
            
            // 计算幂律值 (-4 到 0 的范围)
            const t = (newX - minX) / (maxX - minX);
            this.power = Phaser.Math.Linear(-4, 0, t);
            
            // 更新显示
            this.updatePowerDisplay();
            
            // 实时更新所有卫星的引力计算
            this.updateAllSatellites();
        });
        
        // 点击滑动条背景也可以调整
        sliderBg.setInteractive();
        sliderBg.on('pointerdown', (pointer) => {
            const minX = sliderX;
            const maxX = sliderX + 300;
            
            this.slider.x = Phaser.Math.Clamp(pointer.x, minX, maxX);
            
            // 计算幂律值
            const t = (this.slider.x - minX) / (maxX - minX);
            this.power = Phaser.Math.Linear(-4, 0, t);
            
            // 更新显示
            this.updatePowerDisplay();
            
            // 实时更新所有卫星的引力计算
            this.updateAllSatellites();
        });
    }
    
    createSliderTicks(sliderX, sliderY) {
        const scene = this.scene;
        const minX = sliderX;
        const maxX = sliderX + 300;
        
        // 创建刻度线和标签
        for (let power = -4; power <= 0; power++) {
            const t = (power + 4) / 4; // 映射到0-1
            const x = Phaser.Math.Linear(minX, maxX, t);
            
            // 刻度线
            scene.add.rectangle(x, sliderY, 2, 15, 0xffffff);
            
            // 刻度标签
            scene.add.text(x, sliderY + 15, `r^${power}`, {
                fontSize: '12px',
                fill: '#ffffff'
            }).setOrigin(0.5);
        }
        
        // 两端的额外说明
        scene.add.text(minX - 10, sliderY - 20, '强', {
            fontSize: '14px',
            fill: '#ffffff'
        }).setOrigin(1, 0.5);
        
        scene.add.text(maxX + 10, sliderY - 20, '弱', {
            fontSize: '14px',
            fill: '#ffffff'
        }).setOrigin(0, 0.5);
    }
    
    updatePowerDisplay() {
        // 更新文本显示
        this.powerText.setText(`引力幂律: r^${this.power.toFixed(2)}`);
    }
    
    updateAllSatellites() {
        // 更新所有卫星的引力计算
        this.satellites.forEach(satellite => {
            if (satellite.updatePower) {
                satellite.updatePower(this.power);
            }
        });
    }
    
    addPlanet(planet) {
        this.planets.push(planet);
        this.bodies.push(planet);
        planet.gravitySystem = this;
    }
    
    addSatellite(satellite) {
        this.satellites.push(satellite);
        this.bodies.push(satellite);
        satellite.gravitySystem = this;
    }
}