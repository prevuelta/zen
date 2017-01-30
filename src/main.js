'use strict';

let THREE = require('three');
let CANNON = require('cannon');

let Grass = require('./flora/grass');
let Cobble = require('./geology/cobble');
let Rock = require('./geology/rock');
let Util = require('./util/util');

let world,
    mass,
    body,
    shape,
    plane,
    group,
    timeStep = 1/60,
    camera,
    scene,
    renderer,
    geometry,
    material,
    bodies = [],
    mesh;


let geos = [];

const ROCKS = 2;

let yAxis = new THREE.Vector3(0,1,0);

// Util.addObjects = addObjects;

initThree();
initCannon();
animate();

function initCannon() {

    // World
    world = new CANNON.World();
    world.gravity.set(0,-1,0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;

    // Ground plane
    let plane = new CANNON.Plane();
    let groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(plane);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    world.add(groundBody);

    for (let i = 0;i < ROCKS;i++) {

        let {geometry} = bodies[i].mesh;
        geometry.computeBoundingBox();
        let bbox = geometry.boundingBox;
        // let bbox = new THREE.Box3().setFromObject(bodies[i].mesh);


        let x = Math.abs(bbox.max.x - bbox.min.x);
        let y = Math.abs(bbox.max.y - bbox.min.y);
        let z = Math.abs(bbox.max.z - bbox.min.z);

        console.log(x, y, z);

        let shape = new CANNON.Box(new CANNON.Vec3(x,y,z));
        let mass = 1;
        let body = new CANNON.Body({
            mass: 1
        });
        body.position.set(Util.randomInt(0, 20), Util.randomInt(0, 20), 10);
        body.addShape(shape);
        bodies[i].body = body;
        world.addBody(body);
    }
    // body.angularVelocity.set(0,0,-10);
    // body.angularDamping = 0.5;

}


function initThree () {

    scene = new THREE.Scene();

    scene.background = new THREE.Color('#ffffff');
    camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );

    // if (typeof group !== 'undefined') {
    //     scene.remove(group);
    //     return;
    // }

    group = new THREE.Object3D();

    group.position.y = 40;

    for (let i = 0; i < ROCKS; i++) {
        let rock = Rock(Util.randomInt(1, 3));
        // group.add(rock);
        rock.position.x = Util.randomInt(0, 30);
        rock.position.z = Util.randomInt(0, 30);
        scene.add(rock);
        bodies.push({mesh: rock});
    }

    // scene.add(group);

// texture.load('assets/stone_texture.jpg', function (texture){
    // The actual texture is returned in the event.content
    let material = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        vertexColors: THREE.VertexColors
    });

    scene.add(new THREE.AxisHelper(50));

    camera.position.z = 100;
    camera.position.y = 10;
    camera.target = new THREE.Vector3( 0, 0, 0 );

    var light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light );

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.4);
    directionalLight.position.set( 2, 1, 0 );
    scene.add( directionalLight );

    var geometry = new THREE.PlaneBufferGeometry( 50, 50 );
    let plane = new THREE.Mesh( geometry, material );
    plane.rotation.x = Math.PI/2;
    plane.position.y = 0;
    scene.add(plane);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

}

function animate () {
    requestAnimationFrame( animate );
    scene.rotateOnAxis(yAxis, Math.PI/480);
    updatePhysics();
    render();
}


function render() {
    renderer.render( scene, camera );
}


function updatePhysics () {
      // Step the physics world
      world.step(timeStep);
      // Copy coordinates from Cannon.js to Three.js
      bodies.forEach(b => {
        b.mesh.position.copy(b.body.position);
        b.mesh.quaternion.copy(b.body.quaternion);
      });
}
