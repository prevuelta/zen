(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

let THREE = require('three');

module.exports = {
    crack (geo, min, max) {
        // for (let i = min; i <= max; i++) {
            // this.pit(geo, i);
        // }
        geo.computeBoundingBox();
        console.log(geo.boundingBox);
    },
    pit (geo, testVertice) {

        let v = geo.vertices[testVertice];
        let dist = geo.centroid.distanceTo(v);
        let dir = v.clone();
        dir.normalize();
        // dir.multiplyScalar(dist/(5*(1+Math.random())));
        dir.multiplyScalar(0.1);//dist/(5*(1+Math.random())));
        v.sub(dir);


    },
    break (geo, min, max) {

    },
    erode (geo) {
        geo.vertices.forEach(v => {
            let dist = geo.centroid.distanceTo(v);
            let dir = v.clone();
            dir.normalize();
            dir.multiplyScalar(dist/(2*(1+Math.random())));
            v.sub(dir);
        });
    }
}
},{"three":"three"}],2:[function(require,module,exports){
'use strict';

function Field (origin, strength) {
    console.log(strength);
    return {
        x: origin.x,
        y: origin.y,
        z: origin.z,
        strength: strength,
        affect (v) {
            let dist = v.distanceTo(this);
            let dir = v.clone();
            dir.normalize();
            dir.multiplyScalar(this.strength/dist);
            v.sub(dir);
        }
    }
}

module.exports = Field;
},{}],3:[function(require,module,exports){
'use strict';

let THREE = require('three');


function Blade () {

    let height = 0.2 * Math.random();
    let nodes = 3;
    let stiffness = 0.2
    let x = 0;
    let y = 0.1;

    let nodeDelta = height/nodes;

    let splineVectors = Array.apply(null, Array(nodes)).map((n, i) => {
        x += Math.random() * 0.1;
        return new THREE.Vector3(x,y+(i*nodeDelta),0)
    });

    let spline = new THREE.CatmullRomCurve3(splineVectors);

    let lineWidth = 1+ Math.round(Math.random() * 5);

    var material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        linewidth: lineWidth
    });

    var geometry = new THREE.Geometry();
    var splinePoints = spline.getPoints(nodes);

    for(var i = 0; i < splinePoints.length; i++){
        geometry.vertices.push(splinePoints[i]);
    }

    let line =  new THREE.Line(geometry, material);

    return line;
}

let [x,z] = [0,0];

function Grass (options) {

    let bladeCount = 1024;
    let rowCount = 32;
    let spread = 0.1;

    let group = new THREE.Object3D();

    for (let i = 0;i < bladeCount; i++) {
        let blade = Blade();
        if (i % rowCount == 0)
            z++;
        blade.position.x = (i % rowCount) * (Math.random()*spread);
        blade.position.z = z * (Math.random()*spread);
        group.add(blade);
    }

    return group;

}


module.exports = Grass;
},{"three":"three"}],4:[function(require,module,exports){
'use strict';

let THREE = require('three');

let Entropy = require('../abstract/entropy');
let Field = require('../abstract/Field');
let Cross = require('../util/cross');
/*

NOTES:

- Start with basic shape
- Decay main shape ??
- Set of entropy methods (nick, crack, break)

*/

function Cobble (scene) {

    let geo = new THREE.BoxGeometry(1, 0.6 - (Math.random() * 0.2), 1, 4, 4, 4);

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

    let fields = [];

    let fieldCount = 3;

    for (let i = 0; i < fieldCount; i++) {
        fields.push(Field(fieldPos(), 0.01));
    }

    function fieldPos () {
        return {
            x: (Math.random() - 0.5) * 1,
            y: (Math.random() - 0.5) * 1,
            z: (Math.random() - 0.5) * 1
        }
    }

    let markers = new THREE.Object3D();

    fields.forEach(f => {

        let cross = Cross(0.05);

        cross.position.x = f.x;
        cross.position.y = f.y;
        cross.position.z = f.z;

        markers.add(cross);
    });

    geo.vertices.forEach(v => {
        fields.forEach(f => {
            f.affect(v, geo.centroid);
        });
    });

//
    // Entropy.pit(geo, pit);
    // Entropy.erode(geo, pit);
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
    mesh.add( markers );

    return mesh;
}

module.exports = Cobble;
},{"../abstract/Field":2,"../abstract/entropy":1,"../util/cross":7,"three":"three"}],5:[function(require,module,exports){
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
},{"../abstract/Field":2,"../abstract/entropy":1,"../util/cross":7,"../util/patchedThree":8,"quickhull3d":"quickhull3d","three-subdivision-modifier":"three-subdivision-modifier"}],6:[function(require,module,exports){

'use strict';

let THREE = require('three');

var scene = new THREE.Scene();

let Grass = require('./flora/grass');
let Cobble = require('./geology/cobble');
let Rock = require('./geology/rock');

scene.background = new THREE.Color('#ffffff');
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


let geos = [];

let maxCubes = 9;
let rowCount = Math.sqrt(maxCubes);

let texture = new THREE.TextureLoader();

// texture.load('assets/stone_texture.jpg', function (texture){
    // The actual texture is returned in the event.content
    var material = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        vertexColors: THREE.VertexColors
    });

    let group = new THREE.Object3D();

    let [x, z] = [0, 0];

    // for (let i = 0; i < maxCubes; i++) {
    //     var cube = Cobble(scene);

    //     if (i % rowCount == 0 && i)
    //         z++;

    //     x = i % rowCount;

    //     cube.position.x = x * 1.1;
    //     cube.position.z = z * 1.1;

    //     group.add( cube );
    // }
    let rock = Rock();

    rock.position.x = 1.1;

    rock.position.z = 1.1;

    group.add(rock);

    group.rotation.y = Math.PI/4;
    group.rotation.x = Math.PI/8;

    group.position.x-=rowCount/2;

    // group.scale.set(0.2, 0.2, 0.2);

    scene.add(group);
    scene.add(new THREE.AxisHelper(5));

    camera.position.z = 5;

    var light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light );

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.4);
    directionalLight.position.set( 2, 1, 0 );
    scene.add( directionalLight );

    // group.add(Grass());


    let yAxis = new THREE.Vector3(0,1,0);
    // let zAxis = new THREE.Vector3(1,0,0);

    function render() {
        // group.rotation.x += 0.01;
        // group.center();
        scene.rotateOnAxis(yAxis, Math.PI/480);
        // scene.rotateOnAxis(zAxis, Math.PI/960);
        requestAnimationFrame( render );
        renderer.render( scene, camera );
    }


    render();

// });
},{"./flora/grass":3,"./geology/cobble":4,"./geology/rock":5,"three":"three"}],7:[function(require,module,exports){
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
},{"three":"three"}],8:[function(require,module,exports){
/**
 * Break faces with edges longer than maxEdgeLength
 * - not recursive
 *
 * @author alteredq / http://alteredqualia.com/
 */


let THREE = require('three');

THREE.TessellateModifier = function ( maxEdgeLength ) {

    this.maxEdgeLength = maxEdgeLength;

};

THREE.TessellateModifier.prototype.modify = function ( geometry ) {

    var edge;

    var faces = [];
    var faceVertexUvs = [];
    var maxEdgeLengthSquared = this.maxEdgeLength * this.maxEdgeLength;

    for ( var i = 0, il = geometry.faceVertexUvs.length; i < il; i ++ ) {

        faceVertexUvs[ i ] = [];

    }

    for ( var i = 0, il = geometry.faces.length; i < il; i ++ ) {

        var face = geometry.faces[ i ];

        if ( face instanceof THREE.Face3 ) {

            var a = face.a;
            var b = face.b;
            var c = face.c;

            var va = geometry.vertices[ a ];
            var vb = geometry.vertices[ b ];
            var vc = geometry.vertices[ c ];

            var dab = va.distanceToSquared( vb );
            var dbc = vb.distanceToSquared( vc );
            var dac = va.distanceToSquared( vc );

            if ( dab > maxEdgeLengthSquared || dbc > maxEdgeLengthSquared || dac > maxEdgeLengthSquared ) {

                var m = geometry.vertices.length;

                var triA = face.clone();
                var triB = face.clone();

                if ( dab >= dbc && dab >= dac ) {

                    var vm = va.clone();
                    vm.lerp( vb, 0.5 );

                    triA.a = a;
                    triA.b = m;
                    triA.c = c;

                    triB.a = m;
                    triB.b = b;
                    triB.c = c;

                    if ( face.vertexNormals.length === 3 ) {

                        var vnm = face.vertexNormals[ 0 ].clone();
                        vnm.lerp( face.vertexNormals[ 1 ], 0.5 );

                        triA.vertexNormals[ 1 ].copy( vnm );
                        triB.vertexNormals[ 0 ].copy( vnm );

                    }

                    if ( face.vertexColors.length === 3 ) {

                        var vcm = face.vertexColors[ 0 ].clone();
                        vcm.lerp( face.vertexColors[ 1 ], 0.5 );

                        triA.vertexColors[ 1 ].copy( vcm );
                        triB.vertexColors[ 0 ].copy( vcm );

                    }

                    edge = 0;

                } else if ( dbc >= dab && dbc >= dac ) {

                    var vm = vb.clone();
                    vm.lerp( vc, 0.5 );

                    triA.a = a;
                    triA.b = b;
                    triA.c = m;

                    triB.a = m;
                    triB.b = c;
                    triB.c = a;

                    if ( face.vertexNormals.length === 3 ) {

                        var vnm = face.vertexNormals[ 1 ].clone();
                        vnm.lerp( face.vertexNormals[ 2 ], 0.5 );

                        triA.vertexNormals[ 2 ].copy( vnm );

                        triB.vertexNormals[ 0 ].copy( vnm );
                        triB.vertexNormals[ 1 ].copy( face.vertexNormals[ 2 ] );
                        triB.vertexNormals[ 2 ].copy( face.vertexNormals[ 0 ] );

                    }

                    if ( face.vertexColors.length === 3 ) {

                        var vcm = face.vertexColors[ 1 ].clone();
                        vcm.lerp( face.vertexColors[ 2 ], 0.5 );

                        triA.vertexColors[ 2 ].copy( vcm );

                        triB.vertexColors[ 0 ].copy( vcm );
                        triB.vertexColors[ 1 ].copy( face.vertexColors[ 2 ] );
                        triB.vertexColors[ 2 ].copy( face.vertexColors[ 0 ] );

                    }

                    edge = 1;

                } else {

                    var vm = va.clone();
                    vm.lerp( vc, 0.5 );

                    triA.a = a;
                    triA.b = b;
                    triA.c = m;

                    triB.a = m;
                    triB.b = b;
                    triB.c = c;

                    if ( face.vertexNormals.length === 3 ) {

                        var vnm = face.vertexNormals[ 0 ].clone();
                        vnm.lerp( face.vertexNormals[ 2 ], 0.5 );

                        triA.vertexNormals[ 2 ].copy( vnm );
                        triB.vertexNormals[ 0 ].copy( vnm );

                    }

                    if ( face.vertexColors.length === 3 ) {

                        var vcm = face.vertexColors[ 0 ].clone();
                        vcm.lerp( face.vertexColors[ 2 ], 0.5 );

                        triA.vertexColors[ 2 ].copy( vcm );
                        triB.vertexColors[ 0 ].copy( vcm );

                    }

                    edge = 2;

                }

                faces.push( triA, triB );
                geometry.vertices.push( vm );

                for ( var j = 0, jl = geometry.faceVertexUvs.length; j < jl; j ++ ) {

                    if ( geometry.faceVertexUvs[ j ].length ) {

                        var uvs = geometry.faceVertexUvs[ j ][ i ];

                        var uvA = uvs[ 0 ];
                        var uvB = uvs[ 1 ];
                        var uvC = uvs[ 2 ];

                        // AB

                        if ( edge === 0 ) {

                            var uvM = uvA.clone();
                            uvM.lerp( uvB, 0.5 );

                            var uvsTriA = [ uvA.clone(), uvM.clone(), uvC.clone() ];
                            var uvsTriB = [ uvM.clone(), uvB.clone(), uvC.clone() ];

                        // BC

                        } else if ( edge === 1 ) {

                            var uvM = uvB.clone();
                            uvM.lerp( uvC, 0.5 );

                            var uvsTriA = [ uvA.clone(), uvB.clone(), uvM.clone() ];
                            var uvsTriB = [ uvM.clone(), uvC.clone(), uvA.clone() ];

                        // AC

                        } else {

                            var uvM = uvA.clone();
                            uvM.lerp( uvC, 0.5 );

                            var uvsTriA = [ uvA.clone(), uvB.clone(), uvM.clone() ];
                            var uvsTriB = [ uvM.clone(), uvB.clone(), uvC.clone() ];

                        }

                        faceVertexUvs[ j ].push( uvsTriA, uvsTriB );

                    }

                }

            } else {

                faces.push( face );

                for ( var j = 0, jl = geometry.faceVertexUvs.length; j < jl; j ++ ) {

                    faceVertexUvs[ j ].push( geometry.faceVertexUvs[ j ][ i ] );

                }

            }

        }

    }

    geometry.faces = faces;
    geometry.faceVertexUvs = faceVertexUvs;

};

module.exports = THREE;
},{"three":"three"}]},{},[6]);
