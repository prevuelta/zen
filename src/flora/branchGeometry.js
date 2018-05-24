import THREE from 'three';
import qh from 'quickhull3d';
import SubdivisionModifier from 'three-subdivision-modifier';

import Helpers from '../util/helpers';
import Util from '../util/util';
import { verticesAroundAxis } from '../util/3dUtil';
import { PI, zAxis, TWO_PI, yAxis, xAxis } from '../util/constants';

const { randomFloat } = Util;

export default function BranchGeometry(
    centerNode,
    rawBranches,
    segments,
    radius = 0.4,
    hullSize = 0.3,
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

    const modifier = new SubdivisionModifier(1);

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
                var planeHelper = new THREE.PlaneHelper(plane, 0.4);
                planeHelper.position.set(
                    centerNode.x,
                    centerNode.y,
                    centerNode.z,
                );
                helpers.add(planeHelper);
                planes.push(plane);
            }
        });
        return planes;
    }

    // Branches
    const branchVertices = {
        get count() {
            return branches.length * segments;
        },
        flat() {
            return this.branchVertices.reduce((a, b) => [...a, ...b], []);
        },
        maxHullSize: branches.reduce((a, b) => {
            return Math.min(a, b.position.distanceTo(centerNode));
        }, Infinity),
        branchVertices: branches.map((n, i) => {
            return verticesAroundAxis(
                n.position,
                centerNode,
                segments,
                randomFloat(0.1, radius),
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
                    0.2,
                    0xff0000,
                );
                helpers.add(arrowHelper);
                helpers.add(Helpers.marker(c.clone().add(centerNode), 0.04));
                return {
                    outerVertex: v,
                    rayVector,
                    ray,
                    innerVertex: c.clone().add(centerNode),
                    adjustedHullVertex(hullSize = 0) {
                        const vector = this.rayVector
                            .clone()
                            .negate()
                            .multiplyScalar(
                                branchVertices.maxHullSize * hullSize,
                            );
                        return this.innerVertex.clone().add(vector);
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
        branchVertices.flat().map(({ outerVertex: { x, y, z } }) => [x, y, z]),
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
    // const hullFaces = hull.map(arr => new THREE.Face3(arr[0], arr[1], arr[2]));
    // outerHull.vertices = branchVertices.flat().map(b => b.outerVertex);
    // outerHull.faces = faces;
    // hullGeometry.vertices = branchVertices
    let vertices = branchVertices
        .flat()
        .map(b => b.adjustedHullVertex(hullSize));
    const faces = hull;

    console.log('Verticecount', branchVertices.count);

    const { count } = branchVertices;

    branchVertices.branchVertices.forEach((b, i) => {
        vertices.push(
            ...b.map(c => (c.isTerminal ? c.outerVertex : c.outerVertex)),
        );
        const l = i * segments;
        for (let j = 0; j < segments; j++) {
            const k = l + j;
            // [0, 9, 1]
            // [(1, 10, 2)],
            // [2, 11, 0],
            // [3, 12, 4],
            // [4, 13, 5],
            // [5, 14, 0];

            // [9, 1, 10][(10, 2, 11)][(11, 0, 9)];

            const f1 = [(k + 1) % segments + l, k + count, k];
            const f2 = [
                (k + 1) % segments + l + count,
                k + count,
                (k + 1) % segments + l,
            ];
            // const f2 = [
            // k + count,
            // (k + 2) % doubleSides + l,
            // (k + count + 1) % doubleSides + l + count,
            // ];
            console.log(f1, f2);
            // [k, k + 1, (k + 2) % doubleSides + l],
            // [k + 1, (k + 3) % doubleSides + l, (k + 2) % doubleSides + l]
            faces.push(f1, f2);
        }
        for (let i = 1; i < segments; i++) {
            // nodeBranchesFaces.push(new THREE.Face3(l, (l + 2) % doubleSides || 1, 0)));
        }
    });

    console.log('Vertices length', vertices.length, branchVertices.count);

    helpers.add(Helpers.wireframe(hullGeometry));
    helpers.add(Helpers.wireframe(hullGeometry));

    const mergedGeometry = new THREE.Geometry();

    // mergedGeometry.vertices = [...hullVertices, ...nodeBranchesVertices];
    console.log(faces);

    mergedGeometry.vertices = vertices;
    mergedGeometry.faces = faces.map(bf => new THREE.Face3(...bf));

    // TODO: remove duplicate vertices where hull and branch intersect

    // branchMesh.updateMatrix();
    // hullMesh.updateMatrix();

    // mergedGeometry.merge(branchMesh.geometry, branchMesh.matrix);
    // mergedGeometry.merge(hullMesh.geometry, hullMesh.matrix);

    // mergedGeometry.updateMatrix();

    // modifier.modify(mergedGeometry);

    return {
        geometry: mergedGeometry,
        // hullGeometry,
        // outerHull,
        // branchGeometry,
        helpers,
    };
}
