import THREE from 'three';

import Cross from './cross';

//     let wireframe = new THREE.WireframeGeometry( geometry ); // or THREE.WireframeHelper
// var line = new THREE.LineSegments( wireframe );
// line.material.depthTest = false;
// line.material.opacity = 0.5;
// line.material.transparent = true;

// mesh.add( line );

// let markers = new THREE.Object3D();

// geometry.vertices.forEach(f => {
//     let cross = Cross(0.5);

//     cross.position.x = f.x;
//     cross.position.y = f.y;
//     cross.position.z = f.z;

//     markers.add(cross);
// });

// mesh.add(markers);;

// var mS = (new THREE.Matrix4()).identity();
//set -1 to the corresponding axis
// mS.elements[0] = -1;
// mS.elements[5] = -1;
// mS.elements[10] = -1;

// geometry.applyMatrix(mS);
//mesh.applyMatrix(mS);
//object.applyMatrix(mS);

export default {
    marker(pos, weight = 0.5, color = 0xff0000) {
        let cross = Cross(weight, color);

        cross.position.x = pos.x;
        cross.position.y = pos.y;
        cross.position.z = pos.z;

        return cross;
    },
    normals(mesh) {
        mesh.add(new THREE.FaceNormalsHelper(mesh));
    },
    boundingBox(mesh) {
        let helper = new THREE.BoundingBoxHelper(
            mesh,
            new THREE.Color(0xff0000),
        );
        mesh.add(helper);
        helper.update();
    },
    wireframe(geometry) {
        let line = new THREE.LineSegments(
            new THREE.WireframeGeometry(geometry),
        );
        line.material.depthTest = false;
        line.material.opacity = 0.5;
        line.material.transparent = true;
        return line;
    },
};
