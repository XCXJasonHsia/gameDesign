import { Player } from '../../PlayerObjects/Player/Player.js'
import { NPC } from '../../PlayerObjects/NPC.js'
import { OilWell } from '../../GameObjects/OilWell.js'
import { Shop } from '../../GameObjects/Shop.js'

export class SurfaceplayScene extends Phaser.Scene {
    constructor() {
        super('SurfaceplayScene');
        this.isPaused = false;
        this.pauseOverlay = null;
        this.pauseText = null;
        this.instructionText = null;
        this.mainMenuText = null;
        this.cameraZoom = 1;
        this.cameraFollow = true;
        this.videoPlayed = false; // 标记是否已经播放过视频
        // 油井相关变量
        this.oilWells = [];
        this.nearOilWell = null;
        this.isDrilling = false;
        this.totalOil = 0;
        // 商店相关变量
        this.shop = null;
        this.nearShop = false;
        this.shopUI = null;
        this.fKey = null;
        this.eKey = null;
    }

    // 场景初始化方法，每次进入场景时都会调用
    init(data) {
        // 重置所有状态变量
        this.isPaused = false;
        this.pauseOverlay = null;
        this.pauseText = null;
        this.instructionText = null;
        this.mainMenuText = null;
        this.cameraZoom = 1;
        this.cameraFollow = true;
        // 从参数中获取videoPlayed状态，如果没有提供则默认为false
        this.videoPlayed = data && data.videoPlayed !== undefined ? data.videoPlayed : false;
        this.player = null;
        this.npcs = [];
        this.platforms = null;
        this.rocket = null;
        this.rockets = null;
        this.cursors = null;
        // 重置油井相关变量
        this.oilWells = [];
        this.nearOilWell = null;
        this.isDrilling = false;
        this.totalOil = 0;
        // 重置商店相关变量
        this.shop = null;
        this.nearShop = false;
        this.shopUI = null;
        this.fKey = null;
        this.eKey = null;
    }

    create() {
        // 创建五倍宽度的背景
        const skyWidth = 800 * 5;
        // 使用livableplanetbg作为背景，并调整大小与原来一致
        const sky = this.add.image(skyWidth / 2, 300, 'livableplanetbg').setScale(5*4000/1849, 3);
        
        this.platforms = this.physics.add.staticGroup();

        // 创5个平台相互拼接，每个平台宽度为400
        for (let i = 0; i < 5; i++) {
            const x =400 + i * 800;
            // 使用livableplanetground作为平台，并调整大小与原来一致
            this.platforms.create(x, 568, 'livableplanetground').setScale(2*416/383, 2).refreshBody();
        }
        
        // 添加一些平台
        this.platforms.create(600, 400, 'ground');
        this.platforms.create(750, 150, 'ground');
        // 添加更多平台到右侧
        this.platforms.create(1200, 300, 'ground');
        this.platforms.create(1800, 450, 'ground');
        this.platforms.create(2400, 200, 'ground');
        this.platforms.create(3000, 350, 'ground');
        this.platforms.create(3600, 250, 'ground');

        if (this.platforms) {
            this.platforms.getChildren().forEach(platform => {
                platform.setDepth(2);
            });
        }

        this.player = new Player(this, 250, 510).setDepth(3);
        if(this.videoPlayed === true) {
            this.rockets = this.physics.add.staticGroup();
            this.rockets.create(200, 490, 'broken_rocket').setScale(0.08).refreshBody().setDepth(1);
        }
        if (!this.videoPlayed) {
            this.player.setVisible(false); // 初始时隐藏player
            this.player.body.enable = false; // 初始时禁用物理体
        } else {
            this.player.setVisible(true); // 视频播放过，直接显示player
            this.player.body.enable = true; // 启用物理体
        }
        this.player.body.gravity.y = 1000;
        this.physics.add.collider(this.player, this.platforms);
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // 创建NPC
        this.npcs = [];
        this.npcs.push(new NPC(this, 1500, 450, '商人'));
        this.npcs.push(new NPC(this, 2500, 450, '守卫'));
        this.npcs.push(new NPC(this, 3500, 450, '智者'));
        
        // 添加NPC与平台的碰撞
        for (const npc of this.npcs) {
            this.physics.add.collider(npc, this.platforms);
        }
        
        // Create oil wells
        this.oilWells = [];
        this.oilWell1 = new OilWell(this, 300, 450);
        this.oilWells.push(this.oilWell1);
        
        // Set up collisions for oil well
        this.physics.add.collider(this.player, this.oilWell1.sprite);
        this.physics.add.collider(this.platforms, this.oilWell1.sprite);
        
        // Create shop
        this.shop = new Shop(this, 2000, 450);
        
        // Set up collision for shop
        this.physics.add.collider(this.player, this.shop.sprite);
        this.physics.add.collider(this.platforms, this.shop.sprite);
        
        // Shop interaction system
        this.nearShop = false;
        this.shopUI = null;
        this.shopText = this.add.text(16, 70, '按F键打开商店', {
            fontSize: '14px',
            fill: '#000'
        });
        this.shopText.setScrollFactor(0);
        this.shopText.setVisible(false);
        this.fKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        
        // Oil collection system
        this.nearOilWell = null;
        this.isDrilling = false;
        
        // UI for oil display
        this.oilText = this.add.text(16, 16, 'Oil: 0', {
            fontSize: '18px',
            fill: '#000'
        });
        this.oilText.setScrollFactor(0);
        
        this.drillText = this.add.text(16, 40, 'Press E to drill oil', {
            fontSize: '14px',
            fill: '#000'
        });
        this.drillText.setScrollFactor(0);
        this.drillText.setVisible(false);
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        
        // 调整世界边界到背景大小
        this.physics.world.setBounds(0, 0, skyWidth, 600);
        
        // 设置相机边界，确保相机不会拍摄超出背景的部分
        this.cameras.main.setBounds(0, 0, skyWidth, 600);
        
        if (!this.videoPlayed) {
            // 初始时将镜头固定，大小为1.0
            this.cameras.main.setZoom(1.0);
            this.cameras.main.stopFollow();
            this.cameras.main.setScroll(0, 0);
            
            // 添加火箭
            this.createRocket();
        } else {
            // 视频播放过，直接让相机跟随玩家
            this.cameras.main.setZoom(1.0);
            this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
        }
        
        // 设置玩家与NPC的重叠检测
        for (const npc of this.npcs) {
            this.physics.add.overlap(this.player, npc, () => {
                npc.onPlayerNearby();
            }, null, this);
        }
        
        // 添加ESC键事件监听器用于暂停/继续游戏
        this.input.keyboard.on('keydown-ESC', this.gamePause, this);
        
        // 添加相机缩放控制
        this.setupCameraZoomControls();
    }
    
    // 创建火箭
    createRocket() {
        // 计算火箭大小（宇航员高度的1.5倍左右）
        // 宇航员高度约为48px，所以火箭高度约为72px
        const rocketScale = 10 / 100; // 假设原始火箭图片高度为100px
        
        // 在画面左上方创建火箭
        this.rocket = this.physics.add.image(200, -100, 'rocket');
        this.rocket.setScale(rocketScale).refreshBody();
        this.rocket.body.gravity.y = 1000;
        
        // 添加火箭与平台的碰撞
        this.physics.add.collider(this.rocket, this.platforms, this.onRocketHitGround, null, this);
    }
    
    // 火箭撞击地面的回调
    onRocketHitGround(rocket, platform) {
        // 记录当前火箭的位置（特别是y坐标）
        const currentY = rocket.y;
        
        // 替换火箭图片为broken_rocket
        rocket.setTexture('broken_rocket');
        const resizeScale = 0.8;
        rocket.setScale(rocket.scaleX * resizeScale, rocket.scaleY * resizeScale); // 保持相同的缩放比例
        rocket.refreshBody(); // 刷新物理体
        
        // 调整位置，确保底部与地面接触
        rocket.y = currentY + 48;
        
        // 停止火箭的物理运动
        rocket.body.setVelocity(0, 0);
        rocket.body.enable = false;
        
        // 计算相机需要的缩放比例，使brokenrocket撑满整个屏幕
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        const rocketWidth = rocket.width * rocket.scaleX;
        const rocketHeight = rocket.height * rocket.scaleY;
        const scaleX = screenWidth / rocketWidth * 0.6;
        const scaleY = screenHeight / rocketHeight * 0.6;
        const finalScale = Math.max(scaleX, scaleY);
        
        // 使用tween实现相机平滑移动和缩放
        this.tweens.add({
            targets: this.cameras.main,
            scrollX: rocket.x - screenWidth / 2,
            scrollY: rocket.y - screenHeight / 2,
            zoom: finalScale,
            duration: 1500, // 1.5秒动画
            ease: 'Power2.easeOut',
            onComplete: () => {
                // 捕获当前相机视野和地面信息
                const cameraInfo = {
                    scrollX: this.cameras.main.scrollX,
                    scrollY: this.cameras.main.scrollY,
                    zoom: this.cameras.main.zoom,
                    width: this.cameras.main.width,
                    height: this.cameras.main.height
                };
                
                // 动画完成后，启动RocketVideoScene并传递参数
                this.scene.start('RocketVideoScene', { cameraInfo: cameraInfo });
            }
        });
    }

    // 设置相机缩放控制
    setupCameraZoomControls() {
        // 监听+键（等号键）放大
        this.input.keyboard.on('keydown-PLUS', this.zoomIn, this);
        this.input.keyboard.on('keydown-EQUALS', this.zoomIn, this);
        
        // 监听-键缩小
        this.input.keyboard.on('keydown-MINUS', this.zoomOut, this);
        
        // 监听0键重置缩放
        this.input.keyboard.on('keydown-ZERO', this.resetZoom, this);
    }

    // 相机放大
    zoomIn() {
        if (this.cameraZoom < 2) {
            this.cameraZoom += 0.1;
            this.cameras.main.setZoom(this.cameraZoom);
        }
    }

    // 相机缩小
    zoomOut() {
        if (this.cameraZoom > 0.5) {
            this.cameraZoom -= 0.1;
            this.cameras.main.setZoom(this.cameraZoom);
        }
    }

    // 重置相机缩放
    resetZoom() {
        this.cameraZoom = 1;
        this.cameras.main.setZoom(this.cameraZoom);
    }

    update(time, delta) {
        if (this.isPaused) return;
        
        if(this.cursors.left.isDown)
        {
            this.player.moveleft();
        }
        else if(this.cursors.right.isDown)
        {
            this.player.moveright();
        }
        else
        {
            this.player.idle();
        }

        if(Phaser.Input.Keyboard.JustDown(this.cursors.up))
        {
            this.player.jump();
        }
        
        // 更新所有NPC
        if (this.npcs) {
            for (const npc of this.npcs) {
                npc.update(time, delta);
                
                // 检测玩家是否离开NPC范围
                const distance = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y, 
                    npc.x, npc.y
                );
                if (distance > 100) {
                    npc.onPlayerLeave();
                }
            }
        }
        
        // Check for shop interaction
        this.checkShopProximity();
        
        // Handle shop opening
        if (Phaser.Input.Keyboard.JustDown(this.fKey) && this.nearShop && !this.shopUI) {
            this.openShop();
        }
        
        // Check for oil well interaction
        this.checkOilWellProximity();
        
        // Handle drilling
        if (Phaser.Input.Keyboard.JustDown(this.eKey) && this.nearOilWell && !this.isDrilling) {
            this.startDrilling();
        }
        
        // Update oil wells
        this.oilWells.forEach(oilWell => {
            const drilled = oilWell.update(time, delta);
            if (drilled) {
                this.collectOilFromWell(oilWell);
            }
        });
    }

    gamePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.onPause();
        } else {
            this.onResume();
        }
        
        console.log(`游戏已${this.isPaused ? '暂停' : '继续'}`);
    }

    // 暂停时的处理
    onPause() {
        // 暂停物理世界
        this.physics.world.pause();
        
        // 暂停所有tweens（动画）
        this.tweens.pauseAll();
        
        // 显示暂停界面
        this.showPauseOverlay();
        
        // 添加Enter键监听，用于回到主界面
        this.input.keyboard.once('keydown-ENTER', this.goToMainMenu, this);
    }

    // 恢复时的处理
    onResume() {
        // 恢复物理世界
        this.physics.world.resume();
        
        // 恢复所有tweens（动画）
        this.tweens.resumeAll();
        
        // 移除暂停覆盖层
        this.removePauseOverlay();
    }

    // 回到个人准备界面
    goToMainMenu() {
        // 移除暂停覆盖层
        this.removePauseOverlay();
        
        // 启动个人准备界面场景
        this.scene.start('PreparationScene', {
                    fromScene: 'SurfaceplayScene'
                });
    }

    // 显示暂停覆盖层
    showPauseOverlay() {
        // 获取屏幕尺寸
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        const screenCenterX = screenWidth / 2;
        const screenCenterY = screenHeight / 2;
        
        // 创建半透明黑色覆盖层
        this.pauseOverlay = this.add.rectangle(screenCenterX, screenCenterY, screenWidth, screenHeight, 0x000000, 0.5);
        this.pauseOverlay.setDepth(1000);
        this.pauseOverlay.setScrollFactor(0); // 不随相机移动
        
        // 创建暂停文字
        this.pauseText = this.add.text(screenCenterX, screenCenterY - 50, '游戏暂停', {
            fontSize: '48px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            fontFamily: 'Arial, sans-serif',
            padding: { x: 10, y: 10 }
        });
        this.pauseText.setOrigin(0.5);
        this.pauseText.setDepth(1001);
        this.pauseText.setScrollFactor(0); // 不随相机移动
        
        // 创建提示文字
        this.instructionText = this.add.text(screenCenterX, screenCenterY + 20, '按ESC继续游戏', {
            fontSize: '20px',
            fill: '#ffff00',
            backgroundColor: '#00000080',
            padding: { x: 10, y: 10 },
            fontFamily: 'Arial, sans-serif'
        });
        this.instructionText.setOrigin(0.5);
        this.instructionText.setDepth(1001);
        this.instructionText.setScrollFactor(0); // 不随相机移动
        
        // 创建回到主菜单的提示
        this.mainMenuText = this.add.text(screenCenterX, screenCenterY + 60, '按ENTER回到主菜单', {
            fontSize: '20px',
            fill: '#ffff00',
            backgroundColor: '#00000080',
            padding: { x: 10, y: 10 },
            fontFamily: 'Arial, sans-serif'
        });
        this.mainMenuText.setOrigin(0.5);
        this.mainMenuText.setDepth(1001);
        this.mainMenuText.setScrollFactor(0); // 不随相机移动
    }

    // 移除暂停覆盖层
    removePauseOverlay() {
        if (this.pauseOverlay) {
            this.pauseOverlay.destroy();
            this.pauseOverlay = null;
        }
        if (this.pauseText) {
            this.pauseText.destroy();
            this.pauseText = null;
        }
        if (this.instructionText) {
            this.instructionText.destroy();
            this.instructionText = null;
        }
        if (this.mainMenuText) {
            this.mainMenuText.destroy();
            this.mainMenuText = null;
        }
    }

    // 清理资源
    destroy() {
        // 移除暂停覆盖层
        this.removePauseOverlay();
        
        // 清理火箭
        if (this.rocket) {
            this.rocket.destroy();
            this.rocket = null;
        }
        
        // 清理NPC
        if (this.npcs) {
            for (const npc of this.npcs) {
                npc.destroy();
            }
            this.npcs = [];
        }
        
        // 清理油井
        if (this.oilWells) {
            this.oilWells = [];
        }
        
        // 清理商店UI
        if (this.shopUI) {
            this.closeShop();
        }
        
        // 移除键盘事件监听器
        if (this.input && this.input.keyboard) {
            this.input.keyboard.off('keydown-ESC', this.gamePause, this);
            this.input.keyboard.off('keydown-ENTER', this.goToMainMenu, this);
            this.input.keyboard.off('keydown-C');
            // 移除缩放相关的事件监听器
            if (this.cameraFollow) {
                this.input.keyboard.off('keydown-PLUS');
                this.input.keyboard.off('keydown-EQUALS');
                this.input.keyboard.off('keydown-MINUS');
                this.input.keyboard.off('keydown-ZERO');
            }
        }
        
        // 调用父类的destroy方法
        super.destroy();
    }
    
    // 商店相关方法
    checkShopProximity() {
        if (this.shop) {
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y, 
                this.shop.sprite.x, this.shop.sprite.y
            );
            
            if (distance < 100) {
                this.nearShop = true;
                this.shopText.setVisible(true);
            } else {
                this.nearShop = false;
                this.shopText.setVisible(false);
                // 如果玩家远离商店，关闭商店UI
                if (this.shopUI) {
                    this.closeShop();
                }
            }
        }
    }
    
    openShop() {
        if (!this.shopUI && this.shop) {
            // 创建商店UI容器
            this.shopUI = this.add.container();
            
            // 创建商店背景
            const background = this.add.rectangle(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                600,
                400,
                0x000000,
                0.8
            );
            background.setScrollFactor(0);
            this.shopUI.add(background);
            
            // 创建商店标题
            const title = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 - 150,
                '商店',
                {
                    fontSize: '24px',
                    fill: '#ffffff',
                    fontWeight: 'bold'
                }
            );
            title.setOrigin(0.5);
            title.setScrollFactor(0);
            this.shopUI.add(title);
            
            // 创建油数量显示
            const oilDisplay = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 - 100,
                `当前油: ${this.totalOil}`,
                {
                    fontSize: '16px',
                    fill: '#ffffff'
                }
            );
            oilDisplay.setOrigin(0.5);
            oilDisplay.setScrollFactor(0);
            this.shopUI.add(oilDisplay);
            
            // 获取升级信息
            const upgrades = this.shop.getAllUpgrades();
            let yOffset = -40;
            
            // 创建升级选项
            Object.keys(upgrades).forEach((key, index) => {
                const upgrade = upgrades[key];
                const buttonY = this.cameras.main.height / 2 + yOffset + index * 80;
                
                // 创建升级按钮
                const button = this.add.rectangle(
                    this.cameras.main.width / 2,
                    buttonY,
                    500,
                    60,
                    0x333333,
                    1
                );
                button.setScrollFactor(0);
                button.setInteractive();
                this.shopUI.add(button);
                
                // 创建商品图标
                let iconKey = 'bomb'; // 默认图标
                switch(key) {
                    case 'coolingModule':
                        iconKey = 'cooldownmodule'; // 瞬冷脉冲模组图标
                        break;
                    case 'fuelTank':
                        iconKey = 'fuelmodule'; // 无尽航迹燃料舱图标
                        break;
                    case 'engineBooster':
                        iconKey = 'speeding_upmodule'; // 跃迁核心加速器图标
                        break;
                }
                const icon = this.add.image(
                    this.cameras.main.width / 2 - 280,
                    buttonY,
                    iconKey
                );
                icon.setScale(0.05);
                icon.setScrollFactor(0);
                this.shopUI.add(icon);
                
                // 创建升级信息文本
                const upgradeText = this.add.text(
                    this.cameras.main.width / 2 - 230,
                    buttonY - 20,
                    `${upgrade.name} (Lv.${upgrade.level}/${upgrade.maxLevel})\n${upgrade.description}`,
                    {
                        fontSize: '14px',
                        fill: '#ffffff',
                        wordWrap: {
                            width: 300
                        }
                    }
                );
                upgradeText.setScrollFactor(0);
                this.shopUI.add(upgradeText);
                
                // 创建价格文本
                const priceText = this.add.text(
                    this.cameras.main.width / 2 + 150,
                    buttonY,
                    `价格: ${upgrade.price}`,
                    {
                        fontSize: '16px',
                        fill: '#ffff00'
                    }
                );
                priceText.setOrigin(0.5);
                priceText.setScrollFactor(0);
                this.shopUI.add(priceText);
                
                // 添加按钮点击事件
                button.on('pointerdown', () => {
                    this.buyUpgrade(key);
                });
            });
            
            // 创建关闭按钮
            const closeButton = this.add.rectangle(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 + 150,
                200,
                50,
                0x666666,
                1
            );
            closeButton.setScrollFactor(0);
            closeButton.setInteractive();
            this.shopUI.add(closeButton);
            
            const closeText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 + 150,
                '关闭',
                {
                    fontSize: '16px',
                    fill: '#ffffff'
                }
            );
            closeText.setOrigin(0.5);
            closeText.setScrollFactor(0);
            this.shopUI.add(closeText);
            
            closeButton.on('pointerdown', () => {
                this.closeShop();
            });
        }
    }
    
    closeShop() {
        if (this.shopUI) {
            this.shopUI.destroy();
            this.shopUI = null;
        }
    }
    
    buyUpgrade(upgradeKey) {
        if (this.shop && this.shop.isActive) {
            const upgrade = this.shop.upgrades[upgradeKey];
            if (this.shop.canBuyUpgrade(upgradeKey, this.totalOil)) {
                const price = this.shop.buyUpgrade(upgradeKey);
                this.totalOil -= price;
                this.updateOilText();
                
                // 关闭并重新打开商店UI以更新信息
                this.closeShop();
                this.openShop();
                
                // 显示购买成功消息
                const successText = this.add.text(
                    this.cameras.main.width / 2,
                    this.cameras.main.height / 2 - 180,
                    `购买成功！${upgrade.name} 升级到 Lv.${upgrade.level}`,
                    {
                        fontSize: '16px',
                        fill: '#00ff00'
                    }
                );
                successText.setOrigin(0.5);
                successText.setScrollFactor(0);
                this.shopUI.add(successText);
                
                // 2秒后移除成功消息
                this.time.delayedCall(2000, () => {
                    if (successText && successText.active) {
                        successText.destroy();
                    }
                });
            } else {
                // 显示购买失败消息
                const failText = this.add.text(
                    this.cameras.main.width / 2,
                    this.cameras.main.height / 2 - 180,
                    '油不足或已达到最高等级！',
                    {
                        fontSize: '16px',
                        fill: '#ff0000'
                    }
                );
                failText.setOrigin(0.5);
                failText.setScrollFactor(0);
                this.shopUI.add(failText);
                
                // 2秒后移除失败消息
                this.time.delayedCall(2000, () => {
                    if (failText && failText.active) {
                        failText.destroy();
                    }
                });
            }
        }
    }
    
    // 油井相关方法
    checkOilWellProximity() {
        let foundWell = null;
        
        this.oilWells.forEach(oilWell => {
            if (oilWell.isActive && Phaser.Math.Distance.Between(
                this.player.x, this.player.y, 
                oilWell.sprite.x, oilWell.sprite.y) < 100) {
                foundWell = oilWell;
            }
        });
        
        if (foundWell !== this.nearOilWell) {
            this.nearOilWell = foundWell;
            this.drillText.setVisible(!!foundWell);
        }
    }
    
    startDrilling() {
        if (this.nearOilWell && this.nearOilWell.isActive) {
            this.isDrilling = true;
            this.nearOilWell.startDrilling();
            this.drillText.setText('Drilling...');
        }
    }
    
    collectOilFromWell(oilWell) {
        const collectedOil = oilWell.collectOil();
        if (collectedOil > 0) {
            this.totalOil += collectedOil;
            this.updateOilText();
            this.drillText.setText('Oil collected! Press E to drill again');
            this.isDrilling = false;
        } else if (oilWell.isDepleted()) {
            this.drillText.setText('Oil well depleted!');
            this.isDrilling = false;
        }
    }
    
    updateOilText() {
        this.oilText.setText(`Oil: ${this.totalOil}`);
    }
        
    gameOver() {
        
    }
}
