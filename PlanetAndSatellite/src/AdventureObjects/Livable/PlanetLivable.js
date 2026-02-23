import {GenericPlanet} from '../../generalClasses/GenericPlanet.js'

export class PlanetLivable extends GenericPlanet {
    constructor(scene, x, y, texture, radius, setHealthBar, bodyMass) {
        super(scene, x, y, texture, radius, setHealthBar, bodyMass);
        // 规定这个planet类的G和power（即幂律）
        this.G = 400; // 增大引力常数，增强引力
        this.power = -1.5;
        this.setTexture(texture);
        this.anims.create({
            key: 'livable_planet_anim',
            frames: this.anims.generateFrameNumbers(texture, {start: 0, end: 11 }), 
            frameRate: 6, 
            repeat: -1
        });
        this.anims.play('livable_planet_anim');
    }

}