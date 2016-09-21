
'use strict';

let THREE = require('three');

var scene = new THREE.Scene();
scene.background = new THREE.Color('#ffffff');
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );



let geos = [];

let maxCubes = 144;

for (let i = 0; i < maxCubes; i++) {
    geos.push(new THREE.BoxGeometry( 1, 0.2, 1 ));
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

        if (i % Math.sqrt(maxCubes) == 0 && i) {
            z++;
        }

        x = i % Math.sqrt(maxCubes);

        cube.position.x = x * 1.03;
        cube.position.z = z * 1.03;

        group.add( cube );
    })

    group.rotation.y = Math.PI/4;
    group.rotation.x = Math.PI/8;

    group.position.x-=Math.sqrt(maxCubes)/2;
    // group.position.z-=2;

    scene.add(group);
    scene.add(new THREE.AxisHelper(5));

    camera.position.z = 5;

    var light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light );

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1);
    directionalLight.position.set( 0, 1, 0 );
    scene.add( directionalLight );



    function render() {
        // cube.rotation.x += 0.01;
        // group.rotation.y += 0.01;
        requestAnimationFrame( render );
        renderer.render( scene, camera );
    }


    render();

});