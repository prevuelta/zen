
'use strict';

let THREE = require('three');

var scene = new THREE.Scene();

let Grass = require('./flora/grass');

scene.background = new THREE.Color('#ffffff');
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


let geos = [];

let maxCubes = 16;
let rowCount = Math.sqrt(maxCubes);

for (let i = 0; i < maxCubes; i++) {
    let geo = new THREE.BoxGeometry( 1, 0.2, 1, 10, 10, 10);
    // geo.vertices[2].y += Math.random();
    geos.push(geo);
}

let texture = new THREE.TextureLoader();


texture.load('assets/stone_texture.jpg', function (texture){
    // The actual texture is returned in the event.content
    var material = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        vertexColors: THREE.VertexColors,
        map: texture
    });

    let group = new THREE.Object3D();

    let [x, z] = [0, 0];

    geos.forEach((geometry, i) => {
        var cube = new THREE.Mesh( geometry, material );

        // cube.geometry.computeVertexNormals();

        if (i % rowCount == 0 && i)
            z++;

        x = i % rowCount;

        cube.position.x = x * 1.03;
        cube.position.z = z * 1.03;

        group.add( cube );
    })

    group.rotation.y = Math.PI/4;
    group.rotation.x = Math.PI/8;

    group.position.x-=rowCount/2;

    scene.add(group);
    scene.add(new THREE.AxisHelper(5));

    camera.position.z = 5;

    var light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light );

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.6);
    directionalLight.position.set( 0, 1, 0 );
    scene.add( directionalLight );

    group.add(Grass());

    let axis = new THREE.Vector3(0,1,0);

    function render() {
        // group.rotation.x += 0.01;
        // group.center();
        scene.rotateOnAxis(axis, Math.PI/480);
        requestAnimationFrame( render );
        renderer.render( scene, camera );
    }


    render();

});