import THREE from 'three';
import qh from 'quickhull3d';

import Helpers from '../util/helpers';
import { verticesAroundAxis } from '../util/3dUtil';
import { PI, zAxis, TWO_PI, yAxis, xAxis } from '../util/constants';

export default function BranchGeometry(
    centerNode,
    rawBranches,
    segments,
    radius = 0.4,
    hullSize = 1
) {
    const branches = rawBranches.map(b => {
        const distance = b.position.distanceTo(centerNode);
        if (!b.isTerminal) {
            const vec = b.position
                .clone()
                .sub(centerNode)
                .normalize()
                .multiplyScalar(distance / 2);
            b.position = centerNode.clone().add(vec);
        }
        return b;
    });

    const helpers = new THREE.Group();
    const nodeCount = branches.length;

    // Create planes
    const planes = [];
    for (let i = 0; i < nodeCount; i++) {
        const v1 = branches[i].position;
        for (let j = i + 1; j < nodeCount; j++) {
            const v2 = branches[j].position;

            const pNormal = v1
                .clone()
                .sub(v2)
                .normalize();

            const plane = new THREE.Plane(pNormal, 0);
            // centerNode.distanceTo(new THREE.Vector3())
            var planeHelper = new THREE.PlaneHelper(plane, 1, 0x000000);
            planeHelper.position.set(centerNode.x, centerNode.y, centerNode.z);
            helpers.add(planeHelper);
            planes.push(plane);
        }
    }

    // Branches
    const branchVertices = {
        flat() {
            return this.branchVertices.reduce((a, b) => [...a, ...b], []);
        },
        branchVertices: branches.map((n, i) => {
            return verticesAroundAxis(
                n.position,
                centerNode,
                segments,
                radius
            ).map(v => {
                // return vertices.map(v => {
                //ray from node in direction of centernode
                let rayVector = n.position
                    .clone()
                    .sub(centerNode)
                    .normalize()
                    .negate();
                const vZero = v.clone().sub(centerNode);
                let ray = new THREE.Ray(vZero, rayVector);
                let c = new THREE.Vector3();
                ray.intersectPlane(planes[0], c);
                planes.forEach((p, i) => {
                    if (i) {
                        const d = new THREE.Vector3();
                        ray.intersectPlane(p, d);
                        if (vZero.distanceTo(d) < vZero.distanceTo(c)) {
                            c = d;
                        }
                    }
                });
                var arrowHelper = new THREE.ArrowHelper(
                    rayVector,
                    v,
                    2,
                    0x0000ff,
                    0.05
                );
                helpers.add(arrowHelper);
                helpers.add(Helpers.marker(c.clone().add(centerNode), 0.04));
                return {
                    outerVertex: v,
                    rayVector,
                    ray,
                    innerVertex: c.clone().add(centerNode),
                    // innerVertex: c,
                    // midVertex:
                    isTerminal: n.isTerminal,
                    distance: c.distanceTo(v),
                    center: n.position,
                };
            });
        }),
    };
    console.log('Branch vertices', branchVertices.flat().length);

    const maxDistance = branches.reduce((a, b) => {
        return Math.max(a.position, b.position.distanceTo(centerNode));
    }, 0);

    // Create center hull
    let hull = qh(
        branchVertices.flat().map(({ outerVertex: { x, y, z } }) => [x, y, z])
    );
    console.log(hull.length, hull, nodeCount);
    // This is stupid and  too simplisticf
    // Vertice groups for each connecting node
    //eg.  [0,1,2]
    // for each face check if all vertices are in node group

    const nodeFaces = [];
    for (let i = 0; i < nodeCount; i++) {
        let face = [];
        for (let j = 0; j < segments; j++) {
            face.push(i * segments + j);
        }
        nodeFaces.push(face);
    }

    function filter(hull) {
        return hull.filter(a => {
            return !nodeFaces.some(f => {
                return !a.some(a => !f.includes(a));
            });
            // for (let i = 0; i < nodeCount; i++) {
            // const face = [i * 3, i * 3 + 1, i * 3 + 2];
            // result = a.some(a => !face.includes(a));
            // if (!result) break;
            // }
            // return result;
        });
    }

    hull = filter(hull);

    const outerHull = new THREE.Geometry();
    const hullGeometry = new THREE.Geometry();
    const faces = hull.map(arr => new THREE.Face3(arr[0], arr[1], arr[2]));
    outerHull.vertices = branchVertices.flat().map(b => b.outerVertex);
    outerHull.faces = faces;
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
                .map(v => [
                    v.isTerminal ? v.center : v.outerVertex,
                    v.innerVertex,
                ])
                .reduce((a, b) => [...a, ...b], []),
        ];
        const l = i * segments * 2;
        for (let j = 0; j < segments * 2; j += 2) {
            const k = l + j;
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
    helpers.add(Helpers.wireframe(hullGeometry));
    const hullMesh = new THREE.Mesh(hullGeometry);
    helpers.add(new THREE.VertexNormalsHelper(hullMesh, 2, 0x000000, 1));
    return {
        hullGeometry,
        outerHull,
        branchGeometry,
        helpers,
    };
}
