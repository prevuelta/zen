const THREE = require('three');
const Helpers = require('../util/helpers');

const Materials = require('../util/materials');
const Util = require('../util/util');
const { randomFloat, randomInt } = Util;

const xAxis = new THREE.Vector3(1, 0, 0);
const zAxis = new THREE.Vector3(0, 0, 1);

const { PI } = Math;
const HALF_PI = PI / 2;

const LSystem = require('lindenmayer');

const FastSimplexNoise = require('fast-simplex-noise').default;
const branchNoise = new FastSimplexNoise({
    frequency: 0.02,
    min: 0,
    max: 1,
    octaves: 8,
});

function Tree() {
    const vertices = [];

    let currentVector;

    var system = new LSystem({
        axiom: '++FX',
        productions: { X: '>2@[-FX]+FX' },
        finals: {
            '+': () => {},
            '-': () => {},
            F: () => {
                console.log('f');
            },
            X: () => {
                console.log('x');
            },
        },
    });
    system.iterate(5);
    system.final();

    console.log('V', vertices);

    // branch(new THREE.Vector3(), getRandomTarget(new THREE.Vector3()), 4);

    // Example of simple tree:
    // [ [000, 020], [020,040], [020, 020]

    // for (let i = increment; i < height; i+=increment) {
    //     // Will split?
    //     vertices.push([Math.random(), i, Math.random()]);
    // }
    function renderBranch() {}

    // renderModel(tree);
    // console.log(treeModel.map(c => new THREE.Vector3(c[0], c[1], c[2])));

    const geometry = new THREE.Geometry();
    geometry.vertices = vertices;

    // geometry.vertices = vertices.map(v => new THREE.Vector3(v[0], v[1], v[2]));
    // geometry.computeFaceNormals();
    // geometry.mergeVertices();

    let mesh = new THREE.LineSegments(
        geometry,
        new THREE.LineBasicMaterial({
            color: 0xff0000,
            linewidth: 4,
        })
    );

    // mesh.add( Helpers.wireframe(geometry) );

    return mesh;
}

module.exports = Tree;
