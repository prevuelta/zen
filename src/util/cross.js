'use strict';

let THREE = require('three');

function Cross (size) {

    let material = new THREE.LineBasicMaterial({
        color: 0xff0000
    });

    let group = new THREE.Object3D();

    for (let i = 0;i < 3; i++) {
        let geometry = new THREE.Geometry();

        if (i === 0) {
            geometry.vertices.push(
                new THREE.Vector3( -size, 0, 0 ),
                new THREE.Vector3( size, 0, 0 )
            );
        } else if (i === 1) {
            geometry.vertices.push(
                new THREE.Vector3( 0, -size, 0 ),
                new THREE.Vector3( 0, size, 0 )
            );
        } else {
            geometry.vertices.push(
                new THREE.Vector3( 0, 0, -size),
                new THREE.Vector3( 0, 0, size)
            );
        }

        let line = new THREE.Line( geometry, material );

        group.add(line);
    }

    return group;

}

module.exports = Cross;