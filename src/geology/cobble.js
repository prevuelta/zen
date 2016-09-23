'use strict';

let THREE = require('three');

let Entropy = require('../abstract/entropy');

/*

NOTES:

- Start with basic shape
- Decay main shape ??
- Set of entropy methods (nick, crack, break)

*/

function Cobble (scene) {

    let geo = new THREE.BoxGeometry( 1, 0.2, 1, 5, 2, 2);

    geo.centroid = new THREE.Vector3();

    for ( var i = 0, l = geo.vertices.length; i < l; i ++ ) {
        geo.centroid.add(geo.vertices[ i ]);
    }

    geo.centroid.divideScalar( geo.vertices.length );

    let pit = Math.floor(Math.random() * geo.vertices.length);

    let one = Math.floor(Math.random() * geo.vertices.length);
    let two = Math.floor(Math.random() * geo.vertices.length);

    let min = Math.min(one, two);
    let max = Math.max(one, two);


    Entropy.pit(geo, pit);
    Entropy.erode(geo, pit);
    Entropy.crack(geo, min, max);

    // for ( var i = 0, l = geo.vertices.length; i < l; i ++ ) {

        // let v = geo.vertices[i];
        // console.log(v);
        // let dist = geo.centroid.distanceTo(v);
        // let dir = v.clone();
        // dir.normalize();
        // dir.multiplyScalar(dist/(5*(1+Math.random())));
        // console.log(dir);
        // v.sub(dir);
        // console.log("Distance", );
    // }

    // material
    let material = new THREE.MeshLambertMaterial( {
        color: 0xffffff,
        shading: THREE.FlatShading,
        polygonOffset: true,
        polygonOffsetFactor: 1, // positive value pushes polygon further away
        polygonOffsetFactor: 1
    });

    let mesh = new THREE.Mesh( geo, material );

    var helper = new THREE.WireframeHelper( mesh, 0x444444 ); // or THREE.WireframeHelper

    mesh.add( helper );

    console.log("CENTER", geo.centroid);

    return mesh;
}

module.exports = Cobble;