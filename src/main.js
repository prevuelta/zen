
'use strict';

let THREE = require('three');

var scene = new THREE.Scene();

let Grass = require('./flora/grass');
let Cobble = require('./geology/cobble');
let Rock = require('./geology/rock');
let Util = require('./util/util');

scene.background = new THREE.Color('#ffffff');
var camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );

var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let geos = [];

const MAX = 48;
let rowCount = Math.sqrt(MAX);

let texture = new THREE.TextureLoader();

Util.renderScene = renderScene;
Util.addObjects = addObjects;


renderScene();
addObjects();

let group;

function addObjects () {
    if (typeof group !== 'undefined')
        scene.remove(group);

    group = new THREE.Object3D();

    let [x, z] = [0, 0];

    let rock = Rock(Util.randomInt(10, 26));
    group.add(rock);

    scene.add(group);
}

function renderScene () {
// texture.load('assets/stone_texture.jpg', function (texture){
    // The actual texture is returned in the event.content
    let material = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        vertexColors: THREE.VertexColors
    });

    // scene.add(new THREE.AxisHelper(5));

    camera.position.z = 100;
    camera.target = new THREE.Vector3( 0, 0, 0 );

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

}

// });