'use strict';

let THREE = require('../util/patchedThree');

const SubdivisionModifier = require('three-subdivision-modifier');

const Util = require('../util/util');

let Cross = require('../util/cross');
let SimplexNoise = require('simplex-noise');

let simplex = new SimplexNoise();

const FastSimplexNoise = require('fast-simplex-noise').default;

const noiseGen = new FastSimplexNoise({ frequency: 0.01, max: 1, min: 0, octaves: 8 })
const noiseGen2 = new FastSimplexNoise({ frequency: 0.01, max: 1, min: 0, octaves: 8 })


function Terrain (size, xAmp, yAmp) {

    let ravine = {
        start: Util.randomInt(3, 15),
        range: Util.randomInt(0, size/2),
        descent: 2,
        ascent: 2,
        depth: 0.2
    }

    let geometry = new THREE.Geometry();

    let heights = [[]];
    let rawHeights = [];

    let j = 0;
    let height,vertice,x,y,z;

    for (let i = 0; i < size; i++) {
        heights[i] = [];

        let offset = Math.floor(noiseGen2.scaled([i, 0]) * 10);
        let offset2 = Math.floor(noiseGen2.scaled([i, 1]) * 10);
        console.log("Offset", offset)
        for (let j = 0; j < size; j++) {
            if (i === 0) {
                height = 0;
                x = (i+1)*xAmp;
                y = 0;
            } else if (i === size -1) {
                height = 0;
                x = (i-1)*xAmp;
            } else {
                height = noiseGen.scaled([i, j]);
                if (j > ravine.start+offset && j < ravine.start + ravine.range - offset2) {
                    height -= ravine.depth * noiseGen2.scaled([i, j]);
                }
                x = i*xAmp;
                y = j && j < size-1 ? height*yAmp : 0;
            }

            z = j && j < size -1 ? j*xAmp : j === size -1 ? (j-1) * xAmp : xAmp;
            vertice = new THREE.Vector3(x,y,z);
            rawHeights.push(height);
            heights[i].push(height*yAmp);
            geometry.vertices.push(vertice);
        }

    }

    geometry.heightMap = heights.reverse();

    Util.imageMap(rawHeights);


    for (let i = 0; i < size * size; i++) {
        if ((i+1)%size !== 0 && i < (size * size) - size) {
            geometry.faces.push(new THREE.Face3(i, i+1, i+size));
            geometry.faces.push(new THREE.Face3(i+1, i+size+1, i+size));
            // geometry.faces.push(new THREE.Face3(i+size, i+1, i));
            // geometry.faces.push(new THREE.Face3(i+size, i+size+1, i+1));
        }
    }


    geometry.computeFaceNormals();
    geometry.mergeVertices();
    // geometry.computeVertexNormals();

    // var modifier = new SubdivisionModifier(2);
    // modifier.modify( geometry );

    let material = new THREE.MeshLambertMaterial( {
        color: 0xF5CF9A,
        side: THREE.DoubleSide,
        shading: THREE.FlatShading,
    });

    // let material = new THREE.MeshBasicMaterial( {
    //     color: 0x333333
    // });

    // var mS = (new THREE.Matrix4()).identity();
    //set -1 to the corresponding axis
    // mS.elements[0] = -1;
    // mS.elements[5] = -1;
    // mS.elements[10] = -1;

    // geometry.applyMatrix(mS);
    //mesh.applyMatrix(mS);
    //object.applyMatrix(mS);

    let mesh = new THREE.Mesh(geometry, material);

    let normals = new THREE.FaceNormalsHelper( mesh );

    // mesh.add(normals);

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