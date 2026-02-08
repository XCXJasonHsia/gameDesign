import {GenericPlanet} from '../generalClasses/GenericPlanet.js'

export class PlanetEg extends GenericPlanet {
    constructor(scene, x, y, texture, radius, fightMode, bodyMass) {
        super(scene, x, y, texture, radius, fightMode, bodyMass);
        this.G = 2000; // 与GravitySystem中的G值保持一致
        this.power = -2;
    }

}