'use strict';

let THREE = require('three');

function Field (origin, strength) {
    return {
        x: origin.x,
        y: origin.y,
        z: origin.z,
        strength: strength,
        affect (v) {
            let dist = v.distanceTo(this);
            // let dir = v.clone();
            // dir.normalize();
            // dir.multiplyScalar(this.strength/dist);
            // dir.x = 0;
            // dir.z = 0;
            // v.sub(dir);
            // if (dist < 1) {
                // v.add(new THREE.Vector3(0, this.strength, 0));
            // } else {
                v.add(new THREE.Vector3(0, Math.sin(dist)*this.strength/dist, 0));
            // }
        }
    }
}

module.exports = Field;

// class Field extends PVector{

//     void affect(PVector affectedLocation, float multiplier) {

//         float distance = PVector.dist(affectedLocation, this);

//         PVector v = PVector.sub(affectedLocation, this);

//         v.normalize();

//         v.mult( _strength * multiplier / distance);

//         affectedLocation.add(v);

//     }
// }
