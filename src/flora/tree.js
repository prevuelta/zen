'use strict';

const THREE = require('three');
const Helpers = require('../util/helpers');

const Materials = require('../util/materials');

function Tree() {
    const height = 3;
    const increment = 0.2;
    const limit = 10;
    const branchLimit = 20;
    let iteration = 0;

    const vertices = [];

    function branch(start, end, iterations) {
        console.log(start, end, iterations);
        vertices.push(start, end);
        iterations--;
        if (iterations <= 0) return;
        console.log('Iteration tree', iterations);
        for (let i = 0; i < 3; i++) {
            const newEnd = [
                end[0] + Math.random() * 4,
                end[1],
                end[2] + Math.random() * 4,
            ];
            console.log('Another branch');
            branch(end, newEnd, iterations);
        }

        // Will split?
        // let split = Math.random() > 0.8;
        // if (split) {
        // points.push(branch([Math.random(), i, Math.random()]))
        // } else {
        // points.push([Math.random(), i, Math.random()]);
        // }
    }

    branch([0, 0, 0], [0, 2, 0], 4);

    const typedVertices = new Float32Array(vertices.length * 3);
    for (let i = 0; i < vertices.length; i++) {
        console.log(i);
        typedVertices[i * 3] = vertices[i][0];
        typedVertices[i * 3 + 1] = vertices[i][1];
        typedVertices[i * 3 + 2] = vertices[i][2];
    }

    console.log(typedVertices);

    // Example of simple tree:
    // [ [000, 020], [020,040], [020, 020]

    // for (let i = increment; i < height; i+=increment) {
    //     // Will split?
    //     vertices.push([Math.random(), i, Math.random()]);
    // }
    function renderBranch() {}

    // renderModel(tree);
    // console.log(treeModel.map(c => new THREE.Vector3(c[0], c[1], c[2])));

    const geometry = new THREE.BufferGeometry();
    geometry.addAttribute(
        'position',
        new THREE.BufferAttribute(typedVertices, 3),
    );

    // geometry.vertices = vertices.map(v => new THREE.Vector3(v[0], v[1], v[2]));
    // geometry.computeFaceNormals();
    // geometry.mergeVertices();

    let mesh = new THREE.LineSegments(
        geometry,
        new THREE.LineBasicMaterial({
            color: 0xff0000,
            linewidth: 4,
        }),
    );

    // mesh.add( Helpers.wireframe(geometry) );

    return mesh;
}

module.exports = Tree;
