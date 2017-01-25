'use strict';

let THREE = require('../util/patchedThree');

let Entropy = require('../abstract/entropy');
let Field = require('../abstract/Field');
let Cross = require('../util/cross');

const qh = require('quickhull3d');
const SubdivisionModifier = require('three-subdivision-modifier');

function Rock (size) {

    size = size || 2;
    let pointCount = 10;

    let points = [];
    let min = -size, max = size;
    for (var i = 0; i <= pointCount; i++) {
        points.push([
            randomFloat(min, max),
            randomFloat(min, max),
            randomFloat(min, max)
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

    points.forEach(p => {
        geo.vertices.push(new THREE.Vector3(p[0], p[1], p[2]));
    })

    outline.forEach((p, i) => {
        let [i1, i2, i3] = p;
        geo.faces.push(new THREE.Face3(i1, i2, i3));
    })

    // First we want to clone our original geometry.
    // Just in case we want to get the low poly version back.
    // debugger;
    // var smooth = THREE.Object3D.prototype.clone(geo);

    // Next, we need to merge vertices to clean up any unwanted vertex. 
    geo.mergeVertices();

    // Create a new instance of the modifier and pass the number of divisions.
    var modifier = new SubdivisionModifier(1);

    // Apply the modifier to our cloned geometry.
    modifier.modify( geo );


    geo.vertices.forEach(v => {
        // console.log(v)
        v.addScalar(randomFloat(-0.1, 0.1));
    });



    let LENGTH = 0.1;

    var tessellateModifier = new THREE.TessellateModifier( LENGTH );

    // for ( var i = 0; i < N; i ++ ) {

        tessellateModifier.modify( geo );

    // // }
    // geo.mergeVertices();

    /* Roughen */


    // var modifier2 = new SubdivisionModifier(1);

    // modifier2.modify( geo );

    // geo.mergeVertices();


// Finally, add our new detailed geometry to a mesh object and add it to our scene.
// var mesh = new THREE.Mesh( smooth, new THREE.MeshPhongMaterial( { color: 0x222222 } ) );


    // geo.computeFaceNormals();
    // geo.computeVertexNormals();

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

    /* Markers */

    let markers = new THREE.Object3D();

    points.forEach(f => {

        let cross = Cross(0.05);

        cross.position.x = f[0];
        cross.position.y = f[1];
        cross.position.z = f[2];

        markers.add(cross);
    });

    /* Fields */

    // geo.vertices.forEach(v => {
    //     fields.forEach(f => {
    //         f.affect(v, geo.centroid);
    //     });
    // });

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

    // let mesh = new THREE.Mesh( geo, material );
    let mesh = new THREE.Mesh( geo, material );

    var helper = new THREE.WireframeHelper( mesh, 0xFF0000 ); // or THREE.WireframeHelper

    mesh.add( helper );
    mesh.add( markers );

    return mesh;
}

module.exports = Rock;