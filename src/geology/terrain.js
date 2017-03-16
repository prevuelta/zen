'use strict';

const THREE = require('../util/patchedThree');
const SubdivisionModifier = require('three-subdivision-modifier');

let Util = require('../util/util');
let Helpers = require('../util/helpers');
let Displacement = require('../abstract/displacement');
let Matrix = require('../util/matrix');
const Entropy = require('../abstract/entropy');

let Materials = require('../util/materials');
let Field = require('../abstract/field');

            // if (i === 0) {
            //     height = 0;
            //     x = (i+1)*baseAmp;
            //     y = 0;
            // } else if (i === size -1) {
            //     height = 0;
            //     x = (i-1)*baseAmp;
            // } else {
            //     height = noiseGenerator.scaled([i, j]);
            //     x = i*baseAmp;
            //     y = j && j < size-1 ? height*yAmp : 0;
            // }
   //          // z = j && j < size -1 ? j*baseAmp : j === size -1 ? (j-1) * baseAmp : baseAmp;
   // let heights = [[]];
   //  let rawHeights = [];

   //  let j = 0;
   //  let height,vertice,x,y,z;

   //  for (let i = 0; i < size; i++) {
   //      heights[i] = [];

   //      for (let j = 0; j < size; j++) {
   //          if (i === 0) {
   //              height = 0;
   //              x = (i+1)*xAmp;
   //              y = 0;
   //          } else if (i === size -1) {
   //              height = 0;
   //              x = (i-1)*xAmp;
   //          } else {
   //              height = noiseGenerator.scaled([i, j]);
   //              x = i*xAmp;
   //              y = j && j < size-1 ? height*yAmp : 0;
   //          }

   //          z = j && j < size -1 ? j*xAmp : j === size -1 ? (j-1) * xAmp : xAmp;
   //          vertice = new THREE.Vector3(x,y,z);
   //          rawHeights.push(height);
   //          heights[i].push(height*yAmp);
   //          geometry.vertices.push(vertice);
   //      }

   //  }
       // geometry.heightMap = heights.reverse();

    // Util.imageMap(rawHeights);
//


function Terrain (size, baseAmp, heightAmp) {

    let vertice,
        height,
        x,y,z;

    let geometry = new THREE.Geometry();
    // let geometry = new Three.PlaneBufferGeometry(size*baseAmp, size*baseAmp, size, size);

    let heightMap = Matrix(size);

    console.log("wat")
    // Entropy.crack(heightMap);
    // Entropy.crack(heightMap);
    // Entropy.crack(heightMap);
    // Displacement.cellNoise(heightMap, 10);
    // Displacement.cellNoise(heightMap, 10);
    Entropy.edge(heightMap, 3);
    // Displacement.cellNoise(heightMap, 5);
    // Displacement.limit(heightMap, 0, 0.6);
    Displacement.noise(heightMap, 0.2);
    // Entropy.normalize(heightMap, 1);

    /* Vertices */
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            x = i*baseAmp;
            y = heightMap[i][j] * heightAmp;
            z = j*baseAmp;
            vertice = new THREE.Vector3(x,y,z);
            geometry.vertices.push(vertice);
        }
    }

    // Displacement.turbulence(geometry.vertices, size*baseAmp, 10, -4, 4);

    geometry.vertices.forEach((v, i) => {
        if (!(i % size) || i % size === size-1 || i < size || i > size * size - size) {
            v.y = 0;
        }
        // v.y = v.y < 0 ? 0 : v.y > 1000 ? 1000 : v.y;// < 4 ? v.y - (4 - v.y) : v.y;
        return v;
    });

    /* Faces */
    for (let i = 0; i < size * size; i++) {
        if ((i+1)%size !== 0 && i < (size * size) - size) {
            geometry.faces.push(new THREE.Face3(i, i+1, i+size));
            geometry.faces.push(new THREE.Face3(i+1, i+size+1, i+size));
        }
    }

    geometry.faces.push(new THREE.Face3(size * size-1, size-1, 0));
    geometry.faces.push(new THREE.Face3(0, size * size - size, size * size - 1));

    /* Will smooth terrain */
    // geometry.computeVertexNormals();

    geometry.computeFaceNormals();
    geometry.mergeVertices();

    var buffer_g = new THREE.BufferGeometry();
    buffer_g.fromGeometry(geometry);

    let mesh = new THREE.Mesh(buffer_g, Materials.EARTH);

    // mesh.add( Helpers.wireframe(geometry) );

    console.log('Terrain created...')

    return {
        mesh: mesh,
        geometry: geometry,
        heightMap: heightMap
    };
}

module.exports = Terrain;