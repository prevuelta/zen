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
    function getPlanes(nodes, node) {
        const planes = [];
        nodes.forEach(n => {
            if (n !== node) {
                const v1 = node.position;
                const v2 = n.position;

                const pNormal = v1
                    .clone()
                    .sub(v2)
                    .normalize();

                const plane = new THREE.Plane(pNormal, 0);
                var planeHelper = new THREE.PlaneHelper(plane, 1, 0x000000);
                planeHelper.position.set(
                    centerNode.x,
                    centerNode.y,
                    centerNode.z
                );
                helpers.add(planeHelper);
                planes.push(plane);
            }
        });
        return planes;
    }

    // Branches
    const branchVertices = {
        flat() {
            return this.branchVertices.reduce((a, b) => [...a, ...b], []);
        },
        maximumHullSize: branches.reduce((a, b) => {
            return Math.min(a, b.position.distanceTo(centerNode));
        }, 0),
        branchVertices: branches.map((n, i) => {
            return verticesAroundAxis(
                n.position,
                centerNode,
                segments,
                radius
            ).map(v => {
                const planes = getPlanes(branches, n);

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
                    adjustedHullVertex(hullSize = 0) {
                        return new THREE.Vector3();
                    },
                    isTerminal: n.isTerminal,
                    distance: c.distanceTo(v),
                    center: n.position,
                };
            });
        }),
    };

    // Create center hull
    let hull = qh(
        branchVertices.flat().map(({ outerVertex: { x, y, z } }) => [x, y, z])
    );

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
        });
    }

    hull = filter(hull);

    const outerHull = new THREE.Geometry();
    const hullGeometry = new THREE.Geometry();
    const faces = hull.map(arr => new THREE.Face3(arr[0], arr[1], arr[2]));
    outerHull.vertices = branchVertices.flat().map(b => b.outerVertex);
    outerHull.faces = faces;
    hullGeometry.vertices = branchVertices
        .flat()
        .map(b => b.adjustedHullVertice(0.5));
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
