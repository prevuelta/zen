import THREE from 'three';
import './extendThree';

import OrbitControls from 'three-orbit-controls';

// import Grass from './flora/grass';
import Tree from './flora/tree';
// import Cobble from './geology/cobble';
// import Rock from './geology/rock';
import Terrain from './geology/terrain';
// import Water from './elements/water';

import Util from './util/util';
import Materials from './util/materials';
// import Displacement from './abstract/displacement';

// import shape2mesh from './util/shape2mesh';
import Helpers from './util/helpers';

import Stats from 'stats-js';

const orbitControls = OrbitControls(THREE);
let stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms

// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';

document.body.appendChild(stats.domElement);

// setInterval( function () {

//     stats.begin();

//     // your code goes here

//     stats.end();

// }, 1000 / 60 );

let camera, scene, renderer;

const xAmp = 0.4;
const yAmp = 4;
const size = 20;

const ROCKS = 0;
const yAxis = new THREE.Vector3(0, 1, 0);

let step = 0;
let stepLimit = 1200;

function initThree() {
    scene = new THREE.Scene();

    scene.background = new THREE.Color('#ffffff');
    camera = new THREE.PerspectiveCamera(
        30,
        window.innerWidth / window.innerHeight,
        1,
        10000
    );

    for (let i = 0; i < ROCKS; i++) {
        // let rock = Rock(Util.randomFloat(0.2, 3));
        // let geo = new THREE.SphereGeometry(0.6, 5, 5);
        // let rock = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({
        // color: 0xF4E0C5,
        // shading: THREE.FlatShading
        // }));
        // let rock = Rock(Util.randomFloat(0.2, 1));
        // group.add(rock);
        // rock.position.x = Util.randomInt(0, 30);
        // rock.position.z = Util.randomInt(0, 30);
        // scene.add(rock);
    }

    let terrain = Terrain(size, xAmp, yAmp);

    Util.imageMap(terrain.heightMap);

    // terrain.mesh.rotation.set(0, -Math.PI, 0);
    // terrain.oesh.position.set(size * xAmp/2, 0, size * xAmp/2);

    scene.add(terrain.mesh);

    let highest = terrain.highestPoint();

    let tree = Tree();

    // tree.position.set(highest.x, highest.y, highest.z);
    tree.position.set(
        size * xAmp / 2,
        0,
        size * xAmp / 2
        // terrain.mesh.position.x / 2,
        // terrain.mesh.position.y,
        // terrain.mesh.position.z / 2
    );

    scene.add(tree);

    // let water = Water(xAmp * size, 1);
    // water.position.set(0, yAmp/2, 0);
    // Displacement.turbulence(water.geometry.vertices, xAmp * size);
    //
    // scene.add(water);

    // texture.load('assets/stone_texture.jpg', function (texture){
    // The actual texture is returned in the event.content
    let material = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        vertexColors: THREE.VertexColors,
    });

    // scene.add(new THREE.AxisHelper(50));

    camera.position.z = 30;
    camera.position.y = 10;
    camera.position.x = 10;
    camera.target = new THREE.Vector3(0, 0, 0);

    var light = new THREE.AmbientLight(0x444444); // soft white light
    scene.add(light);

    var directionalLight = new THREE.DirectionalLight(0xff0000, 1);
    directionalLight.position.set(10, 10, 10);
    // directionalLight.rotationX(Math.PI/2);

    scene.add(directionalLight);

    let directionalLightHelper = new THREE.DirectionalLightHelper(
        directionalLight,
        0
    );
    // scene.add( directionalLightHelper);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    let controls = new orbitControls(camera);
}

function animate() {
    requestAnimationFrame(animate);
    // scene.rotateOnAxis(yAxis, Math.PI/480);
    render();
    stats.update();
}

function render() {
    renderer.render(scene, camera);
}

window.addEventListener(
    'resize',
    function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    },
    false
);

initThree();
animate();
