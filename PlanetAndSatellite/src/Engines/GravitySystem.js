export class GravitySystem {
    constructor(scene) {
        this.scene = scene;
        this.G = 100;   // 引力常数
        
        // 存储所有天体的数组
        this.bodies = [];
        this.planets = [];
        this.satellites = [];
        
        // 行星引力幂律存储
        this.planetPowers = new Map();
        
        // 创建UI
        this.sliders = [];
        this.powerTexts = [];
        
        // 添加最大拖动速度（像素/毫秒）
        this.maxDragSpeed = 0.25;
        this.lastDragTime = 0;
        this.lastDragX = 0;
    }
    
    // 添加行星时创建对应的滑动条
    addPlanet(planet, index) {
        this.planets.push(planet);
        this.bodies.push(planet);
        planet.gravitySystem = this;
        
        // 为每个行星设置默认幂律
        this.planetPowers.set(planet, -2);
        
        // 创建对应的滑动条UI
        this.createPlanetSlider(planet, index);
    }
    
    createPlanetSlider(planet, index) {
        const scene = this.scene;
        
        // 滑动条位置（底部，根据索引排列）
        const totalPlanets = this.planets.length;
        const sliderSpacing = 200;
        const sliderX = 100 + (index * sliderSpacing);
        const sliderY = scene.sys.game.config.height - 100;
        
        // 创建行星标识文本
        const planetLabel = scene.add.text(sliderX - 20, sliderY - 50, `行星${index + 1}`, {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#00000080',
            padding: { x: 5, y: 3 }
        });
        
        // 创建引力幂律显示文本
        const powerText = scene.add.text(sliderX, sliderY - 30, `r^${this.planetPowers.get(planet)}`, {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#00000080',
            padding: { x: 10, y: 5 }
        });
        this.powerTexts.push(powerText);
        
        // 创建滑动条背景（灰色）
        const sliderBg = scene.add.rectangle(sliderX, sliderY, 150, 8, 0x666666);
        sliderBg.setOrigin(0, 0.5);
        
        // 创建滑动条（白色滑块）
        const slider = scene.add.rectangle(sliderX + 75, sliderY, 20, 30, 0xffffff);
        slider.setOrigin(0.5, 0.5);
        slider.setInteractive({ draggable: true });
        slider.planetRef = planet; // 存储对行星的引用
        
        // 存储滑块的初始X位置和限制范围
        slider.minX = sliderX;
        slider.maxX = sliderX + 150;
        slider.startX = slider.x;
        
        // 创建滑动条刻度
        this.createSliderTicks(sliderX, sliderY, planet);
        
        // 滑动条拖动事件
        scene.input.setDraggable(slider);
        
        // 添加拖动开始时的记录
        slider.on('dragstart', () => {
            this.lastDragTime = scene.time.now;
            this.lastDragX = slider.x;
        });
        
        slider.on('drag', (pointer, dragX, dragY) => {
            // 计算时间差
            const currentTime = scene.time.now;
            const timeDiff = currentTime - this.lastDragTime;
            
            // 计算拖动距离
            const dragDistance = Math.abs(dragX - this.lastDragX);
            
            // 计算速度（像素/毫秒）
            const dragSpeed = timeDiff > 0 ? dragDistance / timeDiff : 0;
            
            // 如果速度超过最大速度，限制拖动
            let newX;
            if (dragSpeed > this.maxDragSpeed) {
                // 计算允许的最大移动距离
                const maxDistance = this.maxDragSpeed * timeDiff;
                const direction = dragX > this.lastDragX ? 1 : -1;
                newX = this.lastDragX + (maxDistance * direction);
            } else {
                newX = dragX;
            }
            
            // 限制滑动范围
            newX = Phaser.Math.Clamp(newX, slider.minX, slider.maxX);
            
            // 更新滑块位置
            slider.x = newX;
            
            // 更新拖动记录
            this.lastDragTime = currentTime;
            this.lastDragX = newX;
            
            // 计算幂律值 (-4 到 0 的范围)
            const t = (newX - slider.minX) / (slider.maxX - slider.minX);
            const power = Phaser.Math.Linear(-4, 0, t);
            
            // 更新该行星的幂律
            this.planetPowers.set(planet, power);
            
            // 更新显示
            powerText.setText(`r^${power.toFixed(2)}`);
            
            // 实时更新所有卫星的引力计算
            this.updateAllSatellites();
        });

        this.sliders.push({
            slider,
            powerText,
            planetLabel,
            sliderBg
        });
    }
    
    createSliderTicks(sliderX, sliderY, planet) {
        const scene = this.scene;
        const minX = sliderX;
        const maxX = sliderX + 150;
        
        // 创建刻度线和标签
        for (let power = -4; power <= 0; power++) {
            const t = (power + 4) / 4; // 映射到0-1
            const x = Phaser.Math.Linear(minX, maxX, t);
            
            // 刻度线
            scene.add.rectangle(x, sliderY, 2, 10, 0xffffff);
            
            // 每2个刻度显示一个标签，避免重叠
            if (power % 2 === 0) {
                scene.add.text(x, sliderY + 10, `r^${power}`, {
                    fontSize: '10px',
                    fill: '#ffffff'
                }).setOrigin(0.5);
            }
        }
        /*
        // 两端的额外说明
        scene.add.text(minX - 5, sliderY - 10, '强', {
            fontSize: '12px',
            fill: '#ffffff'
        }).setOrigin(1, 0.5);
        
        scene.add.text(maxX + 5, sliderY - 10, '弱', {
            fontSize: '12px',
            fill: '#ffffff'
        }).setOrigin(0, 0.5);
        */
    }
    
    // 获取某个行星的引力幂律
    getPlanetPower(planet) {
        return this.planetPowers.get(planet) || -2;
    }
    
    updateAllSatellites() {
        // 更新所有卫星的引力计算
        this.satellites.forEach(satellite => {
            if (satellite.updateGravityFromPlanets) {
                satellite.updateGravityFromPlanets();
            }
        });
    }
    
    addSatellite(satellite) {
        this.satellites.push(satellite);
        this.bodies.push(satellite);
        satellite.gravitySystem = this;
        
        // 初始化卫星从所有行星接收引力
        satellite.updateGravityFromPlanets();
    }
    
    // 获取所有行星
    getAllPlanets() {
        return this.planets;
    }
}