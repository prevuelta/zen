'use strict';

const THREE = require('../util/patchedThree');
const SubdivisionModifier = require('three-subdivision-modifier');
const FastSimplexNoise = require('fast-simplex-noise').default;

let Util = require('../util/util');

const noiseGenerator = new FastSimplexNoise({ frequency: 0.01, max: 1, min: 0, octaves: 8 })


function HeightMap (size) {
    let heights = [];
    for (let i = 0; i < size; i++) for (let j = 0; j < size; j++) {
        if (!j)
            heights[i] = [];
        heights[i][j] = noiseGenerator.scaled([i, j]);
    }
    return heights;
}

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



function TerrainGeometry (size, baseAmp, heightAmp, rawFn) {

    let vertice,
        height,
        x,y,z;

    let geometry = new THREE.Geometry();

    let heightMap = HeightMap(size);

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

    /* Faces */
    for (let i = 0; i < size * size; i++) {
        if ((i+1)%size !== 0 && i < (size * size) - size) {
            geometry.faces.push(new THREE.Face3(i, i+1, i+size));
            geometry.faces.push(new THREE.Face3(i+1, i+size+1, i+size));
        }
    }

    geometry.computeFaceNormals();
    geometry.mergeVertices();

 // geometry.computeVertexNormals();

    // var modifier = new SubdivisionModifier(2);
    // modifier.modify( geometry );

    return geometry;

}

function Terrain (size, baseAmp, heightAmp) {

    let geometry = TerrainGeometry(size, baseAmp, heightAmp, function (u, v, val) {
        heights[u][v] = val;
    });

    let material = new THREE.MeshLambertMaterial( {
        color: 0xF5CF9A,
        side: THREE.DoubleSide,
        shading: THREE.FlatShading,
    });

    // let material = new THREE.MeshBasicMaterial( {
    //     color: 0x333333
    // });


    let mesh = new THREE.Mesh(geometry, material);

    return {
        mesh: mesh,
        geometry: geometry,
        heightMap: heightMap
    };
}

module.exports = Terrain;