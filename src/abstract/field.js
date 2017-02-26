'use strict';

function Field (origin, strength) {
    console.log(strength);
    return {
        x: origin.x,
        y: origin.y,
        z: origin.z,
        strength: strength,
        affect (v) {
            let dist = v.distanceTo(this);
            let dir = v.clone();
            dir.normalize();
            dir.multiplyScalar(this.strength/dist);
            v.add(dir);
        }
    }
}

module.exports = Field;