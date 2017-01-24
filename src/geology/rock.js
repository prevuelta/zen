'use strict';

let THREE = require('three');

let Entropy = require('../abstract/entropy');
let Field = require('../abstract/Field');
let Cross = require('../util/cross');

let qh = require('quickhull3d');


function Rock (scene) {

        var x, y, z, max = 1.0,min = 0.1,points = [];
        for (var i = 0; i <= 10; i++) {
            x = Math.floor(Math.random() * (max - min + 1)) + min;
            y = Math.floor(Math.random() * (max - min + 1)) + min;
            z = Math.floor(Math.random() * (max - min + 1)) + min;
            points.push(new THREE.Vector3(x, y, z));
        }

        let geometry = new THREE.ConvexGeometry(points);

//     let geo = new THREE.BoxGeometry(1, 0.6 - (Math.random() * 0.2), 1, 4, 4, 4);

//     geo.centroid = new THREE.Vector3();

//     for ( var i = 0, l = geo.vertices.length; i < l; i ++ ) {
//         geo.centroid.add(geo.vertices[ i ]);
//     }

//     geo.centroid.divideScalar( geo.vertices.length );

//     let pit = Math.floor(Math.random() * geo.vertices.length);

//     let one = Math.floor(Math.random() * geo.vertices.length);
//     let two = Math.floor(Math.random() * geo.vertices.length);

//     let min = Math.min(one, two);
//     let max = Math.max(one, two);

//     let fields = [];

//     let fieldCount = 3;

//     for (let i = 0; i < fieldCount; i++) {
//         fields.push(Field(fieldPos(), 0.01));
//     }

//     function fieldPos () {
//         return {
//             x: (Math.random() - 0.5) * 1,
//             y: (Math.random() - 0.5) * 1,
//             z: (Math.random() - 0.5) * 1
//         }
//     }

//     let markers = new THREE.Object3D();

//     fields.forEach(f => {

//         let cross = Cross(0.05);

//         cross.position.x = f.x;
//         cross.position.y = f.y;
//         cross.position.z = f.z;

//         markers.add(cross);
//     });

//     geo.vertices.forEach(v => {
//         fields.forEach(f => {
//             f.affect(v, geo.centroid);
//         });
//     });

// //
//     // Entropy.pit(geo, pit);
//     // Entropy.erode(geo, pit);
//     Entropy.crack(geo, min, max);

//     // for ( var i = 0, l = geo.vertices.length; i < l; i ++ ) {

//         // let v = geo.vertices[i];
//         // console.log(v);
//         // let dist = geo.centroid.distanceTo(v);
//         // let dir = v.clone();
//         // dir.normalize();
//         // dir.multiplyScalar(dist/(5*(1+Math.random())));
//         // console.log(dir);
//         // v.sub(dir);
//         // console.log("Distance", );
//     // }

//     // material
    let material = new THREE.MeshLambertMaterial( {
        color: 0xffffff,
        shading: THREE.FlatShading,
        polygonOffset: true,
        polygonOffsetFactor: 1, // positive value pushes polygon further away
        polygonOffsetFactor: 1
    });

    let mesh = new THREE.Mesh( geo, material );

    // var helper = new THREE.WireframeHelper( mesh, 0x444444 ); // or THREE.WireframeHelper

    // mesh.add( helper );
//     mesh.add( markers );

    return mesh;
}

module.exports = Rock;