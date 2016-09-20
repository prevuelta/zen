
'use strict';

let THREE = require('three');

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );



let geos = [];

for (let i = 0; i < 16; i++) {
    geos.push(new THREE.BoxGeometry( 1, 0.2, 1 ));
}

var material = new THREE.MeshLambertMaterial({
    color: 0x444444,
    side: THREE.DoubleSide,
    vertexColors: THREE.VertexColors
});

let group = new THREE.Object3D();

let [x, y] = [0, 0];

geos.forEach((geometry, i) => {
    var cube = new THREE.Mesh( geometry, material );

    if (i % 4 == 0 && i) {
        y++;
    }

    x = i % 4;

    cube.position.x = x * 1.03;
    cube.position.z = y * 1.03;

    group.add( cube );
})

group.rotation.y = Math.PI/4;
group.rotation.x = Math.PI/4;

scene.add(group);
scene.add(new THREE.AxisHelper(5));

camera.position.z = 5;

var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight.position.set( 0, 1, 0 );
scene.add( directionalLight );

function render() {
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.1;
    requestAnimationFrame( render );
    renderer.render( scene, camera );
}


render();