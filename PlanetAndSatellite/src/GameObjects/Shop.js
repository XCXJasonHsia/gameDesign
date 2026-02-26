export class Shop {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        
        // 创建商店精灵，使用bomb图标并放大以与油井区分
        this.sprite = scene.physics.add.staticSprite(x, y, 'bomb');
        this.sprite.setScale(2); // 放大炸弹图标
        this.sprite.setSize(80, 80);
        this.sprite.setOffset(0, 0);
        
        // 商店状态
        this.isActive = true;
        
        // 升级选项
        this.upgrades = {
            coolingModule: {
                name: '瞬冷脉冲模组',
                description: '加快冷却速度',
                price: 50,
                level: 0,
                maxLevel: 3,
                effect: 0.2 // 每级减少20%冷却时间
            },
            fuelTank: {
                name: '无尽航迹燃料舱',
                description: '增加燃料容量',
                price: 75,
                level: 0,
                maxLevel: 3,
                effect: 20 // 每级增加20%燃料容量
            },
            engineBooster: {
                name: '跃迁核心加速器',
                description: '提高加速能力',
                price: 100,
                level: 0,
                maxLevel: 3,
                effect: 0.15 // 每级增加15%加速能力
            }
        };
    }
    
    // 检查是否可以购买升级
    canBuyUpgrade(upgradeKey, playerOil) {
        const upgrade = this.upgrades[upgradeKey];
        return upgrade && 
               upgrade.level < upgrade.maxLevel && 
               playerOil >= upgrade.price;
    }
    
    // 购买升级
    buyUpgrade(upgradeKey) {
        const upgrade = this.upgrades[upgradeKey];
        if (upgrade && upgrade.level < upgrade.maxLevel) {
            upgrade.level++;
            // 升级价格随等级增加
            upgrade.price = Math.floor(upgrade.price * 1.5);
            return upgrade.price;
        }
        return 0;
    }
    
    // 获取升级信息
    getUpgradeInfo(upgradeKey) {
        return this.upgrades[upgradeKey];
    }
    
    // 获取所有升级信息
    getAllUpgrades() {
        return this.upgrades;
    }
    
    // 获取商店状态
    isShopActive() {
        return this.isActive;
    }
    
    // 设置商店状态
    setActive(active) {
        this.isActive = active;
    }
}