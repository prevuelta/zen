'use strict';

let THREE = require('three');
let CANNON = require('cannon');
let OrbitControls = require('three-orbit-controls')(THREE);

let Grass = require('./flora/grass');
let Tree = require('./flora/tree');
let Cobble = require('./geology/cobble');
let Rock = require('./geology/rock');
let Terrain = require('./geology/terrain');
let Water = require('./elements/water');

const Util = require('./util/util');
const Displacement = require('./abstract/displacement');

let shape2mesh = require('./util/shape2mesh');

const Stats = require('stats-js');

let stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms 

// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';

document.body.appendChild( stats.domElement );

// setInterval( function () {

//     stats.begin();

//     // your code goes here 

//     stats.end();

// }, 1000 / 60 );


let world,
    mass,
    body,
    terrain,
    terrainBody,
    groundBody,
    plane,
    shape,
    group,
    timeStep = 1/60,
    camera,
    scene,
    renderer,
    geometry,
    material,
    bodies = [],
    mesh,
    terrain2;

let geos = [];

const xAmp = 0.4;
const yAmp = 4;
const size = 20;

const ROCKS = 0;
const yAxis = new THREE.Vector3(0,1,0);

let step = 0;
let stepLimit = 1200;

initThree();
initCannon();
animate();

function initCannon() {

    // World
    world = new CANNON.World();
    world.gravity.set(0,-10,0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 2;

    // Ground plane
    let plane = new CANNON.Plane();
    groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(plane);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    world.add(groundBody);

    let matrix = terrain.heightMap.map(h => h.map(v => v*yAmp)).reverse();

    var hfShape = new CANNON.Heightfield(matrix, {
        elementSize: xAmp
    });
    // let hfShape = new CANNON.Box(new CANNON.Vec3(20, 6, 20));
    // // Create the heightfield shape
    // var hfShape = new CANNON.Heightfield([[1,2,3], [4,5,6], [1,2,3]], {
        // elementSize: 1 // Distance between the data points in X and Y directions
    // });

    // let boundsShape = new CANNON.Box(new CANNON.Vec3(xAmp*size, 100, xAmp*size));

    // let boundsBody = new CANNON.Body({
    //     mass: 0
    // });

    // boundsBody.addShape(boundsShape);

    // world.addBody(boundsBody);

    terrainBody = new CANNON.Body({
        mass: 0
    });


    terrainBody.addShape(hfShape);
    // terrainBody.position.set(0, 8, 0);
    terrainBody.shapeOrientations[0].setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI * 0.5);
    // terrainBody.position.set(-size * hfShape.elementSize / 2, 10, 10);
    // terrainBody.position.set(-size * xAmp / 2, 0, -size * xAmp / 2);
    terrainBody.position.set(-size * xAmp /2, 0, size * xAmp / 2);
    world.addBody(terrainBody);

    terrain2 = shape2mesh(terrainBody);

    // scene.add(terrain2);

    // let terrainShape = new CANNON.Trimesh(terrain.geometry.vertices.reduce((a, b) => a.concat([b.x, b.y, b.z]), []) , terrain.geometry.thing);

    // let terrainShape = new CANNON.Box(new CANNON.Vec3(10, 1, 10));


    // terrainBody.position.set(-12*4/2, 15, -12*4/2);
    // terrainBody.addShape(terrainShape);
    // world.addBody(terrainBody);

    for (let i = 0;i < ROCKS;i++) {

        let {geometry} = bodies[i].mesh;
        // geometry.computeBoundingBox();
        // let bbox = geometry.boundingBox;
        let bbox = new THREE.Box3().setFromObject(bodies[i].mesh);

        // console.log(bbox.size())
        // let [x, y, z] = bbox.size();
        // debugger;

        let x = bbox.max.x - bbox.min.x;
        let y = bbox.max.y - bbox.min.y;
        let z = bbox.max.z - bbox.min.z;

        // let shape = new CANNON.Trimesh(geometry.attributes.position.array, geometry.index.array);

        // let shape = new CANNON.Sphere(0.3);
        let shape = new CANNON.Box(new CANNON.Vec3(x/2,y/2,z/2));

        let body = new CANNON.Body({
            mass: 10
        });
        body.addShape(shape);
        body.position.set(Util.randomInt(-size*xAmp/2, size*xAmp/2), 10, Util.randomInt(-size*xAmp/2, size*xAmp/2));
        // body.position.vadd(terrainBody.position, body.position);
        bodies[i].body = body;
        world.addBody(body);

        // body.angularVelocity.set(0,0,-10);
    }
    // body.angularVelocity.set(0,0,-10);
    // body.angularDamping = 0.5;

}


function initThree () {

    scene = new THREE.Scene();

    scene.background = new THREE.Color('#ffffff');
    camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );

    group = new THREE.Object3D();

    group.position.y = 40;

    for (let i = 0; i < ROCKS; i++) {
        let rock = Rock(Util.randomFloat(0.2, 3));
        // let geo = new THREE.SphereGeometry(0.6, 5, 5);

        // let rock = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({
            // color: 0xF4E0C5,
            // shading: THREE.FlatShading
        // }));

        // let rock = Rock(Util.randomFloat(0.2, 1));
        // group.add(rock);
        // rock.position.x = Util.randomInt(0, 30);
        // rock.position.z = Util.randomInt(0, 30);
        scene.add(rock);
        bodies.push({mesh: rock});
    }

    terrain = Terrain(size, xAmp, yAmp);

    Util.imageMap(terrain.heightMap);

    // terrain.mesh.rotation.set(0, -Math.PI, 0);
    // terrain.mesh.position.set(size * xAmp/2, 0, size * xAmp/2);

    scene.add(terrain.mesh);

    let tree = Tree();

    let highest = terrain.highestPoint();

    tree.position.set(highest.x, highest.y, highest.z);
    // tree.position.set(2.8, 0.1, 5.2);

    scene.add(tree);

    let water = Water(xAmp * size, 1);
    // water.position.set(0, yAmp/2, 0);
    // Displacement.turbulence(water.geometry.vertices, xAmp * size);
// 
    // scene.add(water);


// texture.load('assets/stone_texture.jpg', function (texture){
    // The actual texture is returned in the event.content
    let material = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        vertexColors: THREE.VertexColors
    });

    scene.add(new THREE.AxisHelper(50));

    camera.position.z = 100;
    camera.position.y =20;
    camera.target = new THREE.Vector3( 0, 0, 0 );

    var light = new THREE.AmbientLight( 0x404040 ); // soft white light
    // scene.add( light );

    var directionalLight = new THREE.DirectionalLight( 0xFFFFFF, 1);
    directionalLight.position.set( 10, 150, 100 );
    scene.add( directionalLight );

    let directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0);
    scene.add( directionalLightHelper);

    var geometry = new THREE.PlaneBufferGeometry( xAmp*size, xAmp*size );
    plane = new THREE.Mesh( geometry, material );
    plane.rotation.x = Math.PI/2;
    plane.position.y = 0;
    // scene.add(plane);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    let controls = new OrbitControls( camera );

}

function animate () {
    requestAnimationFrame( animate );
    // scene.rotateOnAxis(yAxis, Math.PI/480);
    updatePhysics();
    render();
    stats.update();
}


function render() {
    renderer.render( scene, camera );
}


function updatePhysics () {
      // Step the physics world
    if (step < stepLimit)
        world.step(timeStep);
    step++;
      // Copy coordinates from Cannon.js to Three.js
    // terrain.position.copy(terrainBody.position);
    // terrain2.position.copy(terrainBody.position);
    // terrain.quaternion.copy(terrainBody.quaternion);
    // terrain2.quaternion.copy(terrainBody.quaternion);

    plane.position.copy(groundBody.position);
    plane.quaternion.copy(groundBody.quaternion);

    bodies.forEach(b => {
        b.mesh.position.copy(b.body.position);
        b.mesh.quaternion.copy(b.body.quaternion);
    });
}
