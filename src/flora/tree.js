import THREE from 'three';
import qh from 'quickhull3d';
import Helpers from '../util/helpers';

import Materials from '../util/materials';
import Util from '../util/util';
import LSystem from 'lindenmayer';
import FastSimplexNoise from 'fast-simplex-noise';

import { lathe, randomVector } from '../util/3dUtil';

const { randomFloat, randomInt, randomTwoPi } = Util;

const xAxis = new THREE.Vector3(1, 0, 0);
const zAxis = new THREE.Vector3(0, 0, 1);
const yAxis = new THREE.Vector3(0, 1, 0);

const { PI } = Math;
const HALF_PI = PI / 2;
const QUARTER_PI = PI / 4;
const TWO_PI = PI * 2;
const theta = HALF_PI / 3;
const yTheta = HALF_PI / randomInt(1, 5);

function Tree() {
    const vertices = [];

    let currentVector;
    let segmentLength = 0.5;
    let currentSegment = new THREE.Vector3();
    let angle = 0;
    let stack = [];
    let linkedTree = [];
    let yAngle = randomTwoPi();
    let level = 0;
    let currentParent = {
        root: true,
        children: [],
        level,
    };
    linkedTree.push(currentParent);
    let nodeStack = [];
    const segments = 16;
    let maxLevel = 0;

    // [ { start, end, parent},

    var system = new LSystem({
        axiom: 'X',
        productions: { X: 'F+[[X]-X]-F[-FX]+X', F: 'FF' },
        finals: {
            '[': () => {
                // Split
                stack.push({ seg: currentSegment.clone(), angle, yAngle });
                const branchNode = {
                    parent: currentParent,
                    branch: true,
                    position: currentSegment,
                    level,
                    children: [],
                };
                currentParent.children.push(branchNode);
                currentParent = branchNode;
                linkedTree.push(currentParent);
                nodeStack.push(currentParent);
                level++;
                maxLevel = Math.max(level, maxLevel);
                yAngle = randomTwoPi();
            },
            '+': () => {
                angle += randomFloat(0, theta);
                yAngle += randomFloat(0, yTheta);
            },
            ']': () => {
                const {
                    angle: prevAngle,
                    seg,
                    yAngle: prevYAngle,
                } = stack.pop();
                angle = prevAngle;
                yAngle = prevYAngle;
                currentSegment = seg;
                currentParent = nodeStack.pop();
                level = currentParent.level;
            },
            '-': () => {
                angle -= theta;
                // angle -= randomFloat(0, theta);
            },
            X: () => {},
            F: () => {
                const v = new THREE.Vector3(0, 1, 0)
                    .applyAxisAngle(xAxis, angle)
                    .applyAxisAngle(yAxis, yAngle)
                    .normalize()
                    .multiplyScalar(segmentLength);
                const end = currentSegment.clone().add(v);
                vertices.push(currentSegment, end);
                // const v = new THREE.Vector3();
                // vertices.push(v_);
                // currentStart = v;
                const node = {
                    parent: currentParent,
                    start: currentSegment,
                    end,
                    level,
                    children: [],
                };
                currentParent.children.push(node);
                currentParent = node;
                linkedTree.push(node);
                currentSegment = end;
                level++;
                // segmentLength *= 0.98;
            },
        },
    });
    system.iterate(1);
    system.final();

    // branch(new THREE.Vector3(), getRandomTarget(new THREE.Vector3()), 4);

    // Example of simple tree:
    // [ [000, 020], [020,040], [020, 020]

    // for (let i = increment; i < height; i+=increment) {
    //     // Will split?
    //     vertices.push([Math.random(), i, Math.random()]);
    // }
    function renderBranch() {}

    // renderModel(tree);
    const centerNode = new THREE.Vector3(0, 0, 0);

    const nodes = [];
    const nodeCount = randomInt(2, 5);
    const sides = 8;

    for (let i = 0; i < nodeCount; i++) {
        nodes.push(randomVector(3));
    }

    let group = new THREE.Group();

    const planes = [];

    for (let i = 0; i < nodeCount; i++) {
        const v1 = nodes[i];
        for (let j = i + 1; j < nodeCount; j++) {
            const v2 = nodes[j];

            const pNormal = v1
                .clone()
                .sub(v2)
                .normalize();

            const plane = new THREE.Plane(pNormal, 0);
            // centerNode.distanceTo(new THREE.Vector3())
            var planeHelper = new THREE.PlaneHelper(plane, 1, 0x000000);
            planeHelper.position.set(centerNode.x, centerNode.y, centerNode.z);
            // group.add(planeHelper);
            planes.push(plane);
        }
    }

    const branchVertices = {
        flat() {
            return this.nodeVertices.reduce((a, b) => [...a, ...b], []);
        },
        nodeVertices: nodes.map(n =>
            verticesAroundAxis(n, centerNode, sides, 0.4).map(v => {
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
                    0xff0000,
                );
                group.add(arrowHelper);
                return {
                    outerVertex: v,
                    rayVector,
                    ray,
                    innerVertex: c,
                    distance: c.distanceTo(v),
                };
            }),
        ),
    };

    // branchVertices.nodeVertices.forEach((b, i) => {
    // const arr = b.map(b => b.outerVertex);
    // group.add(new THREE.Mesh(disc([nodes[i], ...arr])));
    // });

    const maxDistance = nodes.reduce((a, b) => {
        return Math.max(a, b.distanceTo(centerNode));
    }, 0);

    const sphere = new THREE.SphereGeometry(maxDistance, 12, 12);
    const sphereMesh = Helpers.wireframe(sphere);
    sphereMesh.position.set(centerNode.x, centerNode.y, centerNode.z);
    group.add(sphereMesh);

    branchVertices.flat().forEach(b => {
        const vector = b.rayVector
            .clone()
            .normalize()
            .multiplyScalar(b.distance)
            .negate();
        b.expanded = b.innerVertex.clone().add(vector);
    });

    let hull = qh(
        branchVertices.flat().map(({ expanded: { x, y, z } }) => [x, y, z]),
    );
    hull = hull.filter(a => {
        let result = true;
        for (let i = 0; i < nodes.length; i++) {
            const face = [i * 3, i * 3 + 1, i * 3 + 2];
            result = a.some(a => !face.includes(a));
            if (!result) break;
        }
        return result;
    });

    const gHull = new THREE.Geometry();
    const faces = hull.map(arr => new THREE.Face3(arr[0], arr[1], arr[2]));
    gHull.vertices = branchVertices.flat().map(b => b.innerVertex);
    gHull.faces = faces;

    group.add(new THREE.Mesh(gHull, Materials.PHONG));
    group.add(Helpers.wireframe(gHull));

    const nodeBranches = new THREE.Geometry();
    let nodeBranchesVertices = [];
    const nodeBranchesFaces = [];
    const doubleSides = sides * 2;

    branchVertices.nodeVertices.forEach((b, i) => {
        nodeBranchesVertices = [
            ...nodeBranchesVertices,
            ...b
                .map(v => [v.outerVertex, v.innerVertex])
                .reduce((a, b) => [...a, ...b], []),
        ];
        const l = i * sides * 2;
        for (let j = 0; j < sides * 2; j += 2) {
            const k = l + j;
            console.log('k', k, k + 1, (k + 2) % doubleSides + l);
            console.log('---');
            nodeBranchesFaces.push(
                new THREE.Face3(k, k + 1, (k + 2) % doubleSides + l),
                new THREE.Face3(
                    k + 1,
                    (k + 3) % doubleSides + l,
                    (k + 2) % doubleSides + l,
                ),
            );
        }
        // nodeBranchesFaces.push(new THREE.Face3(l, l + 2, l + 4));
        for (let i = 1; i < sides; i++) {
            // nodeBranchesFaces.push(new THREE.Face3(l, (l + 2) % doubleSides || 1, 0)));
        }
    });

    nodeBranches.vertices = nodeBranchesVertices;
    nodeBranches.faces = nodeBranchesFaces;

    group.add(new THREE.Mesh(nodeBranches));

    const geometry = new THREE.Geometry();
    geometry.vertices = nodes.reduce((a, b) => [...a, b, centerNode], []);

    function verticesAroundAxis(start, end, segments, distance) {
        const v = [];
        const inc = TWO_PI / segments;
        const vec = start
            .clone()
            .sub(end)
            .normalize();
        const rx = Math.asin(-vec.y);
        const ry = Math.atan2(vec.x, vec.z);
        const cross = xAxis.clone().multiplyScalar(distance);
        for (let j = 0; j < TWO_PI; j += inc) {
            const pos = new THREE.Vector3().add(
                cross.clone().applyAxisAngle(zAxis, j),
            );
            pos.applyAxisAngle(xAxis, rx);
            pos.applyAxisAngle(yAxis, ry);
            pos.add(start);

            // group.add(Helpers.marker(pos, 0.04, 0x000000));
            v.push(pos);
        }

        return v;
    }

    function disc(vertices) {
        const seg = new THREE.Geometry();
        const f = [];
        for (let i = 1; i < vertices.length; i++) {
            f.push(new THREE.Face3(i, (i + 1) % vertices.length || 1, 0));
        }
        seg.vertices = vertices;
        seg.faces = f;
        return seg;
    }

    let mesh = new THREE.LineSegments(
        geometry,
        new THREE.LineBasicMaterial({
            color: 0x0000ff,
            linewidth: 4,
        }),
    );

    mesh.add(group);

    // mesh.add( Helpers.wireframe(geometry) );

    return mesh;
}

export default Tree;
