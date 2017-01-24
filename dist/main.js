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

let THREE = require('three');

let Entropy = require('../abstract/entropy');
let Field = require('../abstract/Field');
let Cross = require('../util/cross');


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
},{"../abstract/Field":2,"../abstract/entropy":1,"../util/cross":7,"three":"three"}],6:[function(require,module,exports){

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
    group.add(Rock(scene));

    group.rotation.y = Math.PI/4;
    group.rotation.x = Math.PI/8;

    group.position.x-=rowCount/2;

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
        // scene.rotateOnAxis(yAxis, Math.PI/480);
        // scene.rotateOnAxis(zAxis, Math.PI/960);
        // requestAnimationFrame( render );
        console.log("rendering")
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
},{"three":"three"}]},{},[6]);
