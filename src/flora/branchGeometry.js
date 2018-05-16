import THREE from 'three';
import qh from 'quickhull3d';
import { verticesAroundAxis } from '../util/3dUtil';

export default function BranchGeometry(
    centerNode,
    branches,
    segments,
    hullSize = 1
) {
    const group = new THREE.Group();
    const nodeCount = branches.length;

    // Create planes
    const planes = [];
    for (let i = 0; i < nodeCount; i++) {
        const v1 = branches[i];
        for (let j = i + 1; j < nodeCount; j++) {
            const v2 = branches[j];

            const pNormal = v1
                .clone()
                .sub(v2)
                .normalize();

            const plane = new THREE.Plane(pNormal, 0);
            // centerNode.distanceTo(new THREE.Vector3())
            var planeHelper = new THREE.PlaneHelper(plane, 3, 0x000000);
            planeHelper.position.set(centerNode.x, centerNode.y, centerNode.z);
            group.add(planeHelper);
            planes.push(plane);
        }
    }

    // Branches
    const branchVertices = {
        flat() {
            return this.branchVertices.reduce((a, b) => [...a, ...b], []);
        },
        branchVertices: branches.map(n =>
            verticesAroundAxis(n, centerNode, segments, 0.4).map(v => {
                //ray from node in direction of centernode
                let rayVector = n
                    .clone()
                    .sub(centerNode)
                    .normalize()
                    .negate();
                let ray = new THREE.Ray(v, rayVector);
                let c = new THREE.Vector3();
                ray.intersectPlane(planes[0], c);
                planes.forEach((p, i) => {
                    if (i) {
                        const d = new THREE.Vector3();
                        ray.intersectPlane(p, d);
                        if (v.distanceTo(c) > v.distanceTo(d)) {
                            c = d;
                        }
                    }
                });
                var arrowHelper = new THREE.ArrowHelper(
                    rayVector,
                    v,
                    2,
                    0xff0000
                );
                group.add(arrowHelper);
                return {
                    outerVertex: v,
                    rayVector,
                    ray,
                    innerVertex: c,
                    distance: c.distanceTo(v),
                };
            })
        ),
    };

    const maxDistance = branches.reduce((a, b) => {
        return Math.max(a, b.distanceTo(centerNode));
    }, 0);

    // Create center hull
    let hull = qh(
        branchVertices.flat().map(({ outerVertex: { x, y, z } }) => [x, y, z])
    );
    hull = hull.filter(a => {
        let result = true;
        for (let i = 0; i < nodeCount; i++) {
            const face = [i * 3, i * 3 + 1, i * 3 + 2];
            result = a.some(a => !face.includes(a));
            if (!result) break;
        }
        return result;
    });

    const hullGeometry = new THREE.Geometry();
    const faces = hull.map(arr => new THREE.Face3(arr[0], arr[1], arr[2]));
    hullGeometry.vertices = branchVertices.flat().map(b => b.innerVertex);
    hullGeometry.faces = faces;

    // Branches
    const branchGeometry = new THREE.Geometry();
    let nodeBranchesVertices = [];
    const nodeBranchesFaces = [];
    const doubleSides = segments * 2;

    branchVertices.branchVertices.forEach((b, i) => {
        nodeBranchesVertices = [
            ...nodeBranchesVertices,
            ...b
                .map(v => [v.outerVertex, v.innerVertex])
                .reduce((a, b) => [...a, ...b], []),
        ];
        const l = i * segments * 2;
        for (let j = 0; j < segments * 2; j += 2) {
            const k = l + j;
            console.log('k', k, k + 1, (k + 2) % doubleSides + l);
            console.log('---');
            nodeBranchesFaces.push(
                new THREE.Face3(k, k + 1, (k + 2) % doubleSides + l),
                new THREE.Face3(
                    k + 1,
                    (k + 3) % doubleSides + l,
                    (k + 2) % doubleSides + l
                )
            );
        }
        for (let i = 1; i < segments; i++) {
            // nodeBranchesFaces.push(new THREE.Face3(l, (l + 2) % doubleSides || 1, 0)));
        }
    });
    branchGeometry.vertices = nodeBranchesVertices;
    branchGeometry.faces = nodeBranchesFaces;
    return {
        hullGeometry,
        branchGeometry,
        helpers: group,
    };
}
