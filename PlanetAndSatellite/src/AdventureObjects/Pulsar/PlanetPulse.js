import { GenericPlanet } from '../../generalClasses/GenericPlanet.js';

export class PlanetPulse extends GenericPlanet {
    constructor(scene, x, y, texture, radius, setHealthBar, bodyMass) {
        super(scene, x, y, texture, radius, setHealthBar, bodyMass);

        // 标记为脉冲行星系统
        this.isPlanetPulse = true;
        this.G = 1400;
        this.power = -1.7;
        //this.initAnimations();
    }
}

