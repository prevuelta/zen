'use strict';

let THREE = require('three');

let Entropy = require('../abstract/entropy');
let Field = require('../abstract/Field');
let Cross = require('../util/cross');

let qh = require('quickhull3d');


function Rock () {

    let points = [];
    let min = -2, max = 2;
    for (var i = 0; i <= 20; i++) {
        points.push([
            randomInt(min, max),
            randomInt(min, max),
            randomInt(min, max)
        ]);
    }

    function randomFloat (min, max) {
        return Math.random() * (max - min) - max;
    }

    function randomInt (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // let geometry = new THREE.ConvexGeometry(points);

    console.log(points);

    // let outline = qh(points, {skipTriangulation: true });
    let outline = qh(points);

    let geo = new THREE.Geometry();

    // geo.vertices = points;

    points.forEach(p => {
        geo.vertices.push(new THREE.Vector3(p[0], p[1], p[2]));
    })

    // let triangles = THREE.Shape.Utils.triangulateShape ( points, [] );

    outline.forEach((p, i) => {
        let [i1, i2, i3] = p;
        geo.faces.push(new THREE.Face3(i1, i2, i3));
    })

    // outline.forEach(f => {
        // geo.faces.push(f)
    // });

    geo.computeFaceNormals();
    geo.computeVertexNormals();

        // let geo = new THREE.BoxGeometry(1, 0.6 - (Math.random() * 0.2), 1, 4, 4, 4);

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

    let markers = new THREE.Object3D();

    points.forEach(f => {

        let cross = Cross(0.05);

        cross.position.x = f[0];
        cross.position.y = f[1];
        cross.position.z = f[2];

        markers.add(cross);
    });

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
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: 1, // positive value pushes polygon further away
        polygonOffsetFactor: 1
    });

    let mesh = new THREE.Mesh( geo, material );

    var helper = new THREE.WireframeHelper( mesh, 0xFF0000 ); // or THREE.WireframeHelper

    mesh.add( helper );
    mesh.add( markers );

    return mesh;
}

module.exports = Rock;