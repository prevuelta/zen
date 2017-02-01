'use strict';

let THREE = require('../util/patchedThree');

const SubdivisionModifier = require('three-subdivision-modifier');

let Cross = require('../util/cross');
let SimplexNoise = require('simplex-noise');

let simplex = new SimplexNoise();
    console.log(simplex.noise2D(1, 1));

function Terrain (size, amplitude) {
    let geometry = new THREE.Geometry();

    for (let i = 0; i < size * size; i++) {
        let vertice = new THREE.Vector3(i%size, simplex.noise2D(i, i), Math.floor(i/size));
        vertice.multiplyScalar(amplitude);
        geometry.vertices.push(vertice);

    }

    let thing = [];

    for (let i = 0; i < size * size; i++) {
        if ((i+1)%size !== 0 && i < (size * size) - size) {
            thing.push(i, i+1, i+size);
            thing.push(i+1, i+size+1, i+size);
            geometry.faces.push(new THREE.Face3(i, i+1, i+size));
            geometry.faces.push(new THREE.Face3(i+1, i+size+1, i+size));
        }
    }

    geometry.thing = thing;

    geometry.computeFaceNormals();
    geometry.mergeVertices();
    geometry.computeVertexNormals();


    // var modifier = new SubdivisionModifier(2);
    // modifier.modify( geometry );


    let material = new THREE.MeshLambertMaterial( {
        color: 0x555555,
        side: THREE.DoubleSide,
        shading: THREE.FlatShading,
        polygonOffset: true,
        polygonOffsetFactor: 1, // positive value pushes polygon further away
        polygonOffsetFactor: 1
    });

    let mesh = new THREE.Mesh(geometry, material);

    mesh.position.x = -size*amplitude/2;
    mesh.position.z = -size*amplitude/2;
    mesh.position.y = 4;

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