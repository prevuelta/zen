let THREE = require('three');

let frag = require('../shaders/water.frag');
let vert = require('../shaders/water.vert');

let terrainFrag = require('../shaders/terrain.frag');
let terrainVert = require('../shaders/terrain.vert');

let earth = new THREE.MeshLambertMaterial({
    color: 0x666666,
    side: THREE.FrontSide,
    shading: THREE.FlatShading,
});

let water = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 1.0 },
        resolution: { value: new THREE.Vector2() },
    },
    vertexShader: vert,
    fragmentShader: frag,
    transparent: true,
});

let terrain = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 1.0 },
        resolution: { value: new THREE.Vector2() },
    },
    vertexShader: terrainVert,
    fragmentShader: terrainFrag,
});

module.exports = {
    EARTH: earth,
    WATER: water,
    TERRAIN: terrain,
    PHONG: new THREE.MeshPhongMaterial(),
    BASIC: new THREE.MeshBasicMaterial({
        color: '#ff0000',
    }),
    BLUE: new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        color: 0x0000ff,
    }),
    GREEN: new THREE.MeshBasicMaterial({
        color: 0x00ff00,
    }),
};
