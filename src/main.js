
'use strict';

let THREE = require('three');

var scene = new THREE.Scene();

let Grass = require('./flora/grass');
let Cobble = require('./geology/cobble');

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

    for (let i = 0; i < maxCubes; i++) {
        var cube = Cobble(scene);

        if (i % rowCount == 0 && i)
            z++;

        x = i % rowCount;

        cube.position.x = x * 1;
        cube.position.z = z * 1;

        group.add( cube );
    }

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
        scene.rotateOnAxis(yAxis, Math.PI/480);
        // scene.rotateOnAxis(zAxis, Math.PI/960);
        requestAnimationFrame( render );
        renderer.render( scene, camera );
    }


    render();

// });