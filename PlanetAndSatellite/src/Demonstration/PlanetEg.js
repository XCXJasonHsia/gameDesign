import {GenericPlanet} from '../generalClasses/GenericPlanet.js'

export class PlanetEg extends GenericPlanet {
    constructor(scene, x, y, texture, radius, fightMode, bodyMass) {
        super(scene, x, y, texture, radius, fightMode, bodyMass);
        // 规定这个planet类的G和power（即幂律）
        this.G = 2000; 
        this.power = -2;
    }

}