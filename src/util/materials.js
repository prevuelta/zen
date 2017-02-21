'use strict';

let THREE = require('three');

let earth = new THREE.MeshLambertMaterial( {
    color: 0x999999,
    side: THREE.DoubleSide,
    shading: THREE.FlatShading
});

module.exports = {
    EARTH: earth
};