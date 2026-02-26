 export class OilWell {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        
        this.sprite = scene.physics.add.staticSprite(x, y, 'bomb');
        this.sprite.setSize(60, 100);
        this.sprite.setOffset(10, 20);

        this.oilAmount = 100;
        this.isActive = true;
        this.isBeingDrilled = false;
        this.drillTimer = 0;
        this.drillTimeRequired = 3000; // 3 seconds to drill
    }

    update(time, delta) {
        if (this.isBeingDrilled && this.isActive) {
            this.drillTimer += delta;
            if (this.drillTimer >= this.drillTimeRequired) {
                this.drillTimer = 0;
                this.isBeingDrilled = false;
                return true; // Drilling completed
            }
        }
        return false;
    }
    
    startDrilling() {
        if (this.isActive && !this.isBeingDrilled) {
            this.isBeingDrilled = true;
            this.drillTimer = 0;
        }
    }

    stopDrilling() {
        this.isBeingDrilled = false;
        this.drillTimer = 0;
    }

    collectOil() {
        if (this.isActive && this.oilAmount > 0) {
            const collectedOil = Math.min(10, this.oilAmount);
            this.oilAmount -= collectedOil;
            if (this.oilAmount <= 0) {
                this.oilAmount = 0;
                this.isActive = false;
                this.sprite.setTint(0x888888); // Gray out depleted oil well
            }
            return collectedOil;
        }
        return 0;
    }

    isDepleted() {
        return !this.isActive;
    }

    getOilAmount() {
        return this.oilAmount;
    }
}
