import {GenericPlanet} from '../../generalClasses/GenericPlanet.js';

export class PlanetEarth extends GenericPlanet {
    constructor(scene, x, y, earthTexture, meatpieTexture, radius, setHealthBar, bodyMass) {
        super(scene, x, y, earthTexture, radius, setHealthBar, bodyMass);
        this.G = 2000;
        this.power = -2;
        this.earthCollapse = false;
        this.earthTexture = earthTexture; // 保存地球纹理
        this.meatpieTexture = meatpieTexture; // 保存肉饼纹理

        this.delayTimeStart = null;
        this.interval = 2000;
    }

    update(time) {
        this.changePower(time);
        if(this.delayTimeStart && this.delayTimeStart + this.interval < time) {
            this.power = -1.7;
            this.G = 1000;
        }
        super.update();
    }

    changePower(time) {
        if(this.earthCollapse === true && !this.delayTimeStart) {
            // 切换到肉饼纹理
            this.setTexture(this.meatpieTexture);
            this.delayTimeStart = time;
            console.log('delayTimeStart:', this.delayTimeStart);
        } 
        else if(this.earthCollapse === false) {
            // 确保在未坍塌时显示地球纹理
            this.setTexture(this.earthTexture);
        }
    }
}