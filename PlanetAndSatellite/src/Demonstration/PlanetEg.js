import {GenericPlanet} from '../generalClasses/GenericPlanet.js'

export class PlanetEg extends GenericPlanet {
    constructor(scene, x, y, texture, radius, setHealthBar, bodyMass) {
        super(scene, x, y, texture, radius, setHealthBar, bodyMass);
        // 规定这个planet类的G和power（即幂律）
        this.G = 4000; // 增大引力常数，增强引力
        this.power = -2;
    }

}