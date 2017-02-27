'use strict';

const THREE = require('../util/patchedThree');
const SubdivisionModifier = require('three-subdivision-modifier');

let Util = require('../util/util');
let Displacement = require('../util/displacement');
let Matrix = require('../util/matrix');

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

    let trench = Matrix(size);

    let heightMap = Matrix(size);

    // let heightMap = Displacement.noise(matrix);

    /* Vertices */
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            x = i*baseAmp;
            y = heightMap[i][j] * heightAmp;
            z = j*baseAmp;
            // if (!j)
                // geometry.vertices.push(new THREE.Vector3(x, 0, z));
            vertice = new THREE.Vector3(x,y,z);
            geometry.vertices.push(vertice);
            // if (j === size -1)
                // geometry.vertices.push(new THREE.Vector3(0, 0, 0));
        }
    }

    /* Faces */
    for (let i = 0; i < size * size; i++) {
        if ((i+1)%size !== 0 && i < (size * size) - size) {
            geometry.faces.push(new THREE.Face3(i, i+1, i+size));
            geometry.faces.push(new THREE.Face3(i+1, i+size+1, i+size));
        }
    }

    // debugger;
 // geometry.computeVertexNormals();

    // var modifier = new SubdivisionModifier(2);
    // modifier.modify( geometry );
    let fields = [];
    for (let i = 0; i < 10;i ++)  {
        fields[i] = Field({x: Util.randomInt(0, size*2), y: 0, z: Util.randomInt(0, size*2)}, Util.randomInt(-4, 5));
    }

    geometry.vertices.forEach(v => {
        fields.forEach(f => f.affect(v));
        // v.y = Math.floor(v.y) / 2;
    });


    geometry.computeFaceNormals();
    geometry.mergeVertices();


    // geometry.vertice.foreach(v => { console.log(v);Math.floor(v.y);console.log(v);return v;});


    let mesh = new THREE.Mesh(geometry, Materials.EARTH);

    return {
        mesh: mesh,
        geometry: geometry,
        heightMap: heightMap
    };
}

module.exports = Terrain;