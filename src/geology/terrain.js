'use strict';

let THREE = require('../util/patchedThree');

const SubdivisionModifier = require('three-subdivision-modifier');

const Util = require('../util/util');

let Cross = require('../util/cross');
let SimplexNoise = require('simplex-noise');

let simplex = new SimplexNoise();

const FastSimplexNoise = require('fast-simplex-noise').default;
const noiseGen = new FastSimplexNoise({ frequency: 0.01, max: 1, min: 0, octaves: 8 })


let ravine = {
    range: 4,
    descent: 3,
    ascent: 3,
    depth: 0.5
}

function Terrain (size, xAmp, yAmp) {
    let geometry = new THREE.Geometry();

    let heights = [[]];
    let rawHeights = [];

    let j = 0;

    for (let i = 0; i < size; i++) {
        heights[i] = [];
        for (let j = 0; j < size; j++) {
            // let height = simplex.noise2D(i % size, i);
            // let height = simplex.noise2D(i, j);
            let height = noiseGen.scaled([i, j]);
            rawHeights.push(height);
            // height = Math.random();
            // console.log(height/2);
            // height += 1;
            // if (i % size < size/1.5 && i % size > size/3)
                // height += Math.random();
            // let height = Math.abs(simplex.noise2D(i, 1));
            // height += Util.randomFloat(0, i % size / 4);
            // if (i && i % size === 0) {
                // j++;
            heights[i].push(height*yAmp);
            // } else {
                // heights[j].push(height*amplitude);
            // }
            let vertice = new THREE.Vector3(i*xAmp, height*yAmp, j*xAmp);
            geometry.vertices.push(vertice);
        }

    }

    geometry.heightMap = heights;

    Util.imageMap(rawHeights);


    for (let i = 0; i < size * size; i++) {
        if ((i+1)%size !== 0 && i < (size * size) - size) {
            geometry.faces.push(new THREE.Face3(i, i+1, i+size));
            geometry.faces.push(new THREE.Face3(i+1, i+size+1, i+size));
        }
    }


    geometry.computeFaceNormals();
    geometry.mergeVertices();
    geometry.computeVertexNormals();

    // var modifier = new SubdivisionModifier(2);
    // modifier.modify( geometry );

    let material = new THREE.MeshLambertMaterial( {
        color: 0xFFFFFF,
        side: THREE.DoubleSide,
        shading: THREE.FlatShading,
    });


    var mS = (new THREE.Matrix4()).identity();
    //set -1 to the corresponding axis
    mS.elements[0] = -1;
    // mS.elements[5] = -1;
    // mS.elements[10] = -1;

    geometry.applyMatrix(mS);
    //mesh.applyMatrix(mS);
    //object.applyMatrix(mS);

    let mesh = new THREE.Mesh(geometry, material);

    // mesh.position.x = -size*amplitude/2;
    // mesh.position.z = -size*amplitude/2;
    // mesh.position.y = 10;

    let markers = new THREE.Object3D();

    let wireframe = new THREE.WireframeGeometry( geometry ); // or THREE.WireframeHelper
    var line = new THREE.LineSegments( wireframe );
    line.material.depthTest = false;
    line.material.opacity = 0.5;
    line.material.transparent = true;

    // mesh.add( line );

    geometry.vertices.forEach(f => {
        let cross = Cross(0.5);

        cross.position.x = f.x;
        cross.position.y = f.y;
        cross.position.z = f.z;

        markers.add(cross);
    });

    // mesh.add(markers);

    return mesh;
}

module.exports = Terrain;