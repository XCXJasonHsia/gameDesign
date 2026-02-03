export class Planet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 设置为静态，不受外力影响
        this.setImmovable(true);
        this.body.mass = 10000; // 行星质量
        
        // 引力常数 - 适当调大以获得稳定的轨道
        this.G = 1000;
        
        // 标记为行星
        this.isPlanet = true;

        // 不应用重力系统
        this.GravitySystem = null;
    }
}