import {GenericPlanet} from '../../generalClasses/GenericPlanet.js';

export class PlanetLink extends GenericPlanet {
    constructor(scene, x, y, texture, radius, setHealthBar, bodyMass) {
        super(scene, x, y, texture, radius, setHealthBar, bodyMass);
        
        this.G = 4000; // 增大引力常数，增强引力
        this.power = -2;
    }

    changePowerAndG(newPower, newG) {
        if(newPower) {
            this.power = newPower;
        }
        if(newG) {
            this.G = newG;
        }
    }

    rotateImage(angle) {
        this.angle = angle;
    }

}