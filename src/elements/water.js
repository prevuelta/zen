'use strict';

const THREE = require('../util/patchedThree');
const Materials = require('../util/materials');

function Water (size, height) {

    let geometry = new THREE.BoxGeometry(size,height,size);

    // let material = new THREE.MeshLambertMaterial( {
    //     color: 0x00ffff,
    //     side: THREE.DoubleSide,
    //     shading: THREE.FlatShading,
    //     opacity: 0.3
    // });


    let mesh = new THREE.Mesh(geometry, Materials.WATER);

    return mesh;
}

module.exports = Water;