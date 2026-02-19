import { Player } from '../../PlayerObjects/Player/Player.js'

export class SurfaceplayScene extends Phaser.Scene {
    constructor() {
        super('SurfaceplayScene');

    }

    create() {
        this.add.image(400, 300, 'sky');
        
        this.platforms = this.physics.add.staticGroup();

        this.platforms.create(400,568,'ground').setScale(2).refreshBody();
        this.platforms.create(600,400,'ground');
        this.platforms.create(50,250,'ground');
        this.platforms.create(750,150,'ground');

        this.player = new Player(this,100,450);
        this.player.body.gravity.y = 1000;
        this.physics.add.collider(this.player,this.platforms);
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Make camera follow the player
        this.cameras.main.startFollow(this.player);
    }

    update() {
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
    }

        
    gameOver() {
        
    }
}
