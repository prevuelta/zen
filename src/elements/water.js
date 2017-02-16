'use strict';

const THREE = require('../util/patchedThree');

let waterFrag = require('../shaders/water.frag');
let vert = require('../shaders/test.vert');

function Water (size, height) {

    let geometry = new THREE.BoxGeometry(size,height,size);

    // let material = new THREE.MeshLambertMaterial( {
    //     color: 0x00ffff,
    //     side: THREE.DoubleSide,
    //     shading: THREE.FlatShading,
    //     opacity: 0.3
    // });

    let material = new THREE.ShaderMaterial( {
        uniforms: {
            time: { value: 1.0 },
            resolution: { value: new THREE.Vector2() }
        },
        vertexShader: vert,
        fragmentShader: waterFrag
    });

    let mesh = new THREE.Mesh(geometry, material);

    return mesh;
}

module.exports = Water;