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

        Entropy.edge(heightMap, 1);
        Displacement.cellNoise(heightMap, 10);

    Displacement.limit(heightMap, 0, 0.3);
    // Displacement.softLimit(heightMap, 0, 0.5);
        Displacement.noise(heightMap, 0.2);

        Entropy.erode(heightMap, 1);
    // Entropy.erode(heightMap);
    // Entropy.erode(heightMap);
    // Entropy.erode(heightMap);
    // Entropy.erode(heightMap);
    // Entropy.normalize(heightMap, 1);

    // let start = [];
    // let end = [];

    // for (let i = 0; i < heightMap.length; i++) {
    //     start.push([heightMap.length,0,0]);
    //     end.push([heightMap.length,0,heightMap.length]);
    // }

    // heightMap.push(end);
    // heightMap.unshift(start);

    // for (let i = 0; i < heightMap.length; i++) {

    //     let endIndex = heightMap[i].length - 1;
    //     let vStart = [x,y,0];
    //     let vEnd = [x,y,endIndex];

    //     heightMap[i].push(vEnd);
    //     heightMap[i].unshift(vStart);
    // }

    let vertices = [];

    /* Vertices */
    for (let i = 0; i < heightMap.length; i++) {
        for(let j = 0; j < heightMap.length; j++) {
            x = i*baseAmp;
            y = heightMap[i][j] * heightAmp;
            z = j*baseAmp;
            vertices.push([x, y, z]);
        }
    }

    // for (let i = 0; i < heightMap.length; i++) {

    //     let endIndex = heightMap[i].length - 1;
    //     let vStart = [i*baseAmp, 0, 0];
    //     let vEnd = [i*baseAmp, 0, endIndex];

    //     heightMap[i].push(vEnd);
    //     heightMap[i].unshift(vStart);
    // }


    geometry.vertices = vertices.map(v => { 
        let [x, y, z] = v;
        return new THREE.Vector3(x,y,z)
    });
            // geometry.vertices.push(vertice);

    // Displacement.turbulence(geometry.vertices, size*baseAmp, 10, -4, 4);

    // geometry.vertices.forEach((v, i) => {
        // if (!(i % size) || i % size === size-1 || i < size || i > size * size - size) {
            // v.y = 0;
        // }
        // v.y = v.y < 0 ? 0 : v.y > 1000 ? 1000 : v.y;// < 4 ? v.y - (4 - v.y) : v.y;
        // return v;
    // });

    /* Faces */
    for (let i = 0; i < heightMap.length; i++) {
        for (let j = 0; j < heightMap[i].length; j++) {
            // let s =  Math.sqrt(geometry.vertices.length);
            // if ((i+1)%size !== 0 && i < (size * size) - size) {
             let length = heightMap[i].length;
             let k = (i * heightMap.length) + j;

             if (i < heightMap.length-1 && j < length-1) {
                geometry.faces.push(new THREE.Face3(k, k+1, k+length));
                geometry.faces.push(new THREE.Face3(k+1, k+length+1, k+length));
            }
        }
    }

    // geometry.faces.push(new THREE.Face3(size * size-1, size-1, 0));
    // geometry.faces.push(new THREE.Face3(0, size * size - size, size * size - 1));

    /* Will smooth terrain */
    // geometry.computeVertexNormals();

    geometry.computeFaceNormals();
    geometry.mergeVertices();

    var buffer_g = new THREE.BufferGeometry();
    buffer_g.fromGeometry(geometry);

    let mesh = new THREE.Mesh(buffer_g, Materials.TERRAIN);

    mesh.add( Helpers.wireframe(geometry) );

    console.log('Terrain created...')

    return {
        mesh: mesh,
        geometry: geometry,
        heightMap: heightMap,
        highestPoint () {
            let highest = geometry.vertices.sort((a,b) => a.y - b.y).pop();
            return highest;
        }
    };
}

module.exports = Terrain;