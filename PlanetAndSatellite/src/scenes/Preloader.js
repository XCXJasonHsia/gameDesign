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
        this.load.image('star', 'star.png');
        this.load.image('cartoon_moon', 'cartoon_moon.png');
        this.load.image('cartoon_rocket', 'cartoon_rocket.png');
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
        this.load.spritesheet(
            'dude',
            'SurfacePlaySceneAssets/dude.png',
            {frameWidth : 32, frameHeight : 48}
        );
        this.load.spritesheet(
            'planet_angry_spriteSheet', 
            'planet_angry_spriteSheet.png',
            {frameWidth: 481, frameHeight: 500}
            )
    }

    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('Game');
    }
}
