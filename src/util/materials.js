'use strict';

let THREE = require('three');

let earth = new THREE.MeshLambertMaterial( {
    color: 0xFFFFFF,
    side: THREE.DoubleSide,
    shading: THREE.FlatShading
});

module.exports = {
    EARTH: earth
};