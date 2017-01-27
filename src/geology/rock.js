'use strict';

let THREE = require('../util/patchedThree');

let Entropy = require('../abstract/entropy');
let Field = require('../abstract/Field');
let Cross = require('../util/cross');
let Util = require('../util/util');

const qh = require('quickhull3d');
const SubdivisionModifier = require('three-subdivision-modifier');

function Rock (size) {

    size = size || 2;
    let pointCount = 10;

    let points = [];
    let min = -size, max = size;
    for (var i = 0; i <= pointCount; i++) {
        points.push([
            Util.randomFloat(min, max),
            Util.randomFloat(min, max),
            Util.randomFloat(min, max)
        ]);
    }



    // let geometry = new THREE.ConvexGeometry(points);

    // console.log(points);

    // let outline = qh(points, {skipTriangulation: true });
    let outline = qh(points);//.reduce((a, b) => a.concat(b)).map(i => points[i]).reduce((a, b) => a.concat(b));

    let geometry = new THREE.Geometry();


    // let vertices = new Float32Array(outline);

    // geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    // geometry.addAttribute( 'uniforms', {
    //         time: { value: 1.0 },
    //         resolution: { value: new THREE.Vector2() }
    //     });

        // uniforms: {
        //     time: { value: 1.0 },
        //     resolution: { value: new THREE.Vector2() }
        // },
        // attributes: {
        //     vertexOpacity: { value: [] }
        // },
    // debugger;
    geometry.vertices = points.map(p => {
        return new THREE.Vector3(p[0], p[1], p[2]);
    });

    outline.forEach((p, i) => {
        let [i1, i2, i3] = p;
        geometry.faces.push(new THREE.Face3(i1, i2, i3));
    });

    geometry.computeFaceNormals();
    geometry.mergeVertices();
    geometry.computeVertexNormals();

    // Next, we need to merge vertices to clean up any unwanted vertex. 
    // geometry.mergeVertices();

    // Create a new instance of the modifier and pass the number of divisions.
    // var modifier = new SubdivisionModifier(1);

    // Apply the modifier to our cloned geometry.
    // modifier.modify( geo );


    // geo.vertices.forEach(v => {
        // console.log(v)
        // v.addScalar(randomFloat(-0.1, 0.1));
    // });

    let LENGTH = 0.1;

    // var tessellateModifier = new THREE.TessellateModifier( LENGTH );
    // tessellateModifier.modify( geometry );

    // geo.mergeVertices();

    /* Roughen */


    var modifier2 = new SubdivisionModifier(3);

    modifier2.modify( geometry );

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
    // let material = new THREE.MeshLambertMaterial( {
    //     color: 0xffffff,
    //     shading: THREE.FlatShading,
    //     polygonOffset: true,
    //     polygonOffsetFactor: 1, // positive value pushes polygon further away
    //     polygonOffsetFactor: 1
    // });

    var material = new THREE.ShaderMaterial( {
        uniforms: {
            time: { value: 1.0 },
            resolution: { value: new THREE.Vector2() }
        },
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent

    });

    var buffer_g = new THREE.BufferGeometry();
    buffer_g.fromGeometry(geometry);

    // let mesh = new THREE.Mesh( geometry, material );
    let mesh = new THREE.Mesh( buffer_g, material );

    let wireframe = new THREE.WireframeGeometry( geometry ); // or THREE.WireframeHelper

    var line = new THREE.LineSegments( wireframe );
    line.material.depthTest = false;
    line.material.opacity = 0.25;
    line.material.transparent = true;

    // mesh.add( line );
    // mesh.add( markers );

    return mesh;
}

module.exports = Rock;