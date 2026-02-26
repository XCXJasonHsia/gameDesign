export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(400, 300, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(400, 300, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(400 - 230, 300, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');
        this.load.image('bg', 'bg.png');
        this.load.image('bg2', 'bg2.png');
        this.load.image('bg11', 'bg11.png');
        this.load.image('pulse_planet', 'pulse/pulse_planet.png');
        this.load.image('pulse_flag', 'pulse/pulse_flag.png');
        this.load.image('bg_prepare.png', 'bg_prepare.png');
        this.load.image('star', 'star.png');
        this.load.image('cartoon_moon', 'cartoon_moon.png');
        this.load.image('cartoon_rocket', 'cartoon_rocket.png');
        this.load.image('rocket', 'rocket.png');
        this.load.image('broken_rocket', 'broken_rocket.png');
        this.load.image('arrow', 'arrow.png');
        this.load.image('cartoon_earth', 'cartoon_earth.png');
        this.load.image('scene1earth', 'EarthSceneAssets/scene1earth.png');
        this.load.image('scene1moon', 'EarthSceneAssets/scene1moon.png');
        this.load.image('scene1rocket', 'EarthSceneAssets/scene1rocket.png');
        this.load.image('scene1meatpie', 'EarthSceneAssets/scene1meatpie.png');
        this.load.image('planet_with_arrow_green', 'LinkOfPlanetsSceneAssets/planet_with_arrow_green.png');
        this.load.image('planet_with_arrow_orange', 'LinkOfPlanetsSceneAssets/planet_with_arrow_orange.png');
        this.load.image('planet_with_arrow_red', 'LinkOfPlanetsSceneAssets/planet_with_arrow_red.png');
        this.load.image('planet_with_arrow_yellow', 'LinkOfPlanetsSceneAssets/planet_with_arrow_yellow.png');
        this.load.image('sky','SurfacePlaySceneAssets/sky.png');
        this.load.image('ground', 'SurfacePlaySceneAssets/platform.png');      
        this.load.image('star', 'SurfacePlaySceneAssets/star.png');
        this.load.image('bomb', 'SurfacePlaySceneAssets/bomb.png');
        this.load.image('fire1', 'fire1.png');
        this.load.image('fire2', 'fire2.png');
        this.load.image('bg_map.png', 'bg_map.png');
        this.load.image('cooldownmodule', 'ShopObjects/CooldownModule.png');
        this.load.image('fuelmodule', 'ShopObjects/FuelModule.png');
        this.load.image('speeding_upmodule', 'ShopObjects/Speeding_upModule.png');
        
        this.load.image('livableplanetbg', 'SurfacePlaySceneAssets/livable_planet_bg.png');
        this.load.image('livableplanetground', 'SurfacePlaySceneAssets/livable_planet_ground.png');

        this.load.spritesheet(
            'dude',
            'SurfacePlaySceneAssets/dude.png',
            {frameWidth : 455, frameHeight : 607}
        );
        this.load.spritesheet(
            'dude_',
            'SurfacePlaySceneAssets/dude_.png',
            {frameWidth : 32, frameHeight : 48}
        );
        this.load.spritesheet(
            'planet_angry_spriteSheet', 
            'planet_angry_spriteSheet.png',
            {frameWidth: 481, frameHeight: 500}
            )
        this.load.spritesheet(
            'livable_planet_spriteSheet', 
            'Livable/livable_planet_spriteSheet.png',
            {frameWidth: 240, frameHeight: 240}
            )
        // 加载 broken_rocket_video_png 中的所有图片（按49到5的顺序）
        const frameFiles = [];
        for (let i = 49; i >= 5; i--) {
            frameFiles.push(`${i}.png`);
        }
        
        for (let i = 0; i < frameFiles.length; i++) {
            const frameNum = (i + 1).toString().padStart(3, '0');
            this.load.image(`rocket_frame_${frameNum}`, `broken_rocket_video_png/${frameFiles[i]}`);
        }
        
        // 加载脉冲星闪屏动画的10帧图片
        for (let i = 1; i <= 10; i++) {
            this.load.image(`flash_${i}`, `pulse/flash/1 (${i}).png`);
        }
        /*
        // 加载陨石动画的4帧图片
        for (let i = 1; i <= 4; i++) {
            this.load.image(`meteor_frame_${i}`, `pulse/rock/test${i}.png`);
        }
        */
        // 加载陨石静态纹理
        this.load.image('meteor_test', 'pulse/rock/test1.png');
        this.load.image('meteor_test2', 'pulse/rock/test2.png');
        this.load.image('meteor_test3', 'pulse/rock/test3.png');
        this.load.image('meteor_test4', 'pulse/rock/test4.png');
    }

    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('Game');
    }
}
