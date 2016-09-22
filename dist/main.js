(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

    let spline = new THREE.SplineCurve3(splineVectors);

    let lineWidth = Math.round(Math.random() * 8);

    var material = new THREE.LineBasicMaterial({
        color: 0x008800,
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
},{"three":"three"}],2:[function(require,module,exports){

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
},{"./flora/grass":1,"three":"three"}]},{},[2]);
