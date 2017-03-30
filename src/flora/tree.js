'use strict';

const THREE = require('three');
const Helpers = require('../util/helpers');

const Materials = require('../util/materials');


function Tree () {

    const height = 3;
    const increment = 0.2;
    const limit = 10;
    const branchLimit = 20;
    let iteration = 0;

    function branch (origin) {

        iteration++;
        if (iteration > limit)
            return origin;

        let points = [origin];

        for (let i = increment; i < Math.floor(Math.random() * branchLimit); i+=increment) {
            // Will split?
            let split = Math.random() > 0.8;
            // if (split) {
                // points.push(branch([Math.random(), i, Math.random()]))
            // } else {
                points.push([Math.random(), i, Math.random()]);
            // }
        }

        return points;
    }


    let treeModel = branch([0, 0, 0]);

    // for (let i = increment; i < height; i+=increment) {
    //     // Will split?
    //     vertices.push([Math.random(), i, Math.random()]);
    // }
    function renderBranch () {

    }

    // renderModel(tree);
    console.log(treeModel.map(c => new THREE.Vector3(c[0], c[1], c[2])));

    var geometry = new THREE.TubeGeometry(treeModel, 20, 2, 8, false );

    // let geometries = [];

    // geometry.vertices = vertices.map(v => new THREE.Vector3(v[0], v[1], v[2]));
    // geometry.computeFaceNormals();
    // geometry.mergeVertices();

    let mesh = new THREE.Line(geometry, new THREE.LineBasicMaterial({
        color: 0xff0000,
        linewidth: 4
    }));

    // mesh.add( Helpers.wireframe(geometry) );

    return mesh;

}

module.exports = Tree;