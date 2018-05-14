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
    const nodeCount = 3; //randomInt(3);

    for (let i = 0; i < nodeCount; i++) {
        nodes.push(randomVector(3));
    }

    let group = new THREE.Group();
    const boundryVertices = nodes.map(n =>
        verticesAroundAxis(n, centerNode, 3, 0.4),
    );

    boundryVertices.forEach((b, i) => {
        group.add(new THREE.Mesh(disc([nodes[i], ...b])));
    });

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

    console.log('Plane count', planes.length);

    // Vertex boundry generation from node input
    let centralVertices = [];

    boundryVertices.forEach((b, i) => {
        b.forEach(v => {
            //ray from node in direction of centernode
            let rayVector = nodes[i]
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
            centralVertices.push(c);
            var arrowHelper = new THREE.ArrowHelper(rayVector, v, 2, 0xff0000);
            group.add(arrowHelper);
        });
    });

    const maxDistance = nodes.reduce((a, b) => {
        return Math.max(a, b.distanceTo(centerNode));
    }, 0);

    let unique = [];
    centralVertices.forEach(v => {
        let duplicate = false;
        unique.some(v2 => {
            const dist = v.distanceTo(v2);
            if (dist < 0.01) {
                duplicate = true;
                return true;
            }
            return false;
        });
        if (!duplicate) {
            unique.push(v);
        }
    });
    const sphereVertices = centralVertices.map(v => {
        // Translate to outer sphere
        return (
            v
                .clone()
                // .sub(centerNode)
                .normalize()
                .multiplyScalar(maxDistance)
        );
    });

    sphereVertices.forEach(v => {
        group.add(Helpers.marker(v, 0.04, 'teal'));
    });

    const sphere = new THREE.SphereGeometry(maxDistance, 12, 12);
    const sphereMesh = Helpers.wireframe(sphere);
    sphereMesh.position.set(centerNode.x, centerNode.y, centerNode.z);
    group.add(sphereMesh);
    try {
        let hull = qh(sphereVertices.map(v => [v.x, v.y, v.z]));
        console.log('Hull', hull);
        const gHull = new THREE.Geometry();
        gHull.vertices = centralVertices;
        hull = hull.filter(a => {
            return boundryVertices.some(b => {
                const hullFaceString = JSON.stringify(
                    a.map(i => sphereVertices[i]),
                );
                console.log('A', hullFaceString);
                console.log('B', JSON.stringify(b));
                console.log(hullFaceString === JSON.stringify(b));
                return hullFaceString !== JSON.stringify(b);
            });
        });
        gHull.faces = hull.map(arr => new THREE.Face3(arr[0], arr[1], arr[2]));
        group.add(new THREE.Mesh(gHull));
        group.add(Helpers.wireframe(gHull));
    } catch (e) {
        console.log(e);
    }

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
        console.log('Vertices', vertices);
        const seg = new THREE.Geometry();
        const f = [];
        for (let i = 1; i < vertices.length; i++) {
            f.push(new THREE.Face3(i, (i + 1) % vertices.length || 1, 0));
        }
        seg.vertices = vertices;
        seg.faces = f;
        return seg;
    }

    function trunk(node) {
        const { start, end, level, children } = node;
        const startThicknessDelta = 1 - node.parent.level / (maxLevel - 1);
        const endThicknessDelta = 1 - level / (maxLevel - 1);
        const startThickness = maxThickness * startThicknessDelta;
        const endThickness = maxThickness * endThicknessDelta;
        const axis = start
            .clone()
            .sub(end)
            .normalize();
        const cross = axis
            .clone()
            .cross(xAxis)
            .normalize();

        const startCross = cross.clone().multiplyScalar(startThickness);
        const endCross = cross.clone().multiplyScalar(endThickness);
        const gSegment = new THREE.Geometry();
        let v = [],
            f = [];
        const inc = TWO_PI / segments;
        for (let j = 0; j < two_pi; j += inc) {
            const pos = start
                .clone()
                .add(startcross.clone().applyaxisangle(axis, j));
            v.push(pos);
        }
        for (let j = 0; j < TWO_PI; j += inc) {
            const pos = children.length
                ? end.clone().add(endCross.clone().applyAxisAngle(axis, j))
                : end;
            v.push(pos);
        }
        for (let i = 0; i < segments; i++) {
            f.push(
                new THREE.Face3(i, i + segments, (i + 1) % segments),
                new THREE.Face3(
                    i + segments,
                    (i + 1 + segments) % segments + segments,
                    (i + 1) % segments,
                ),
            );
        }
        gSegment.vertices = v;
        gSegment.faces = f;

        let m = new THREE.Mesh(gSegment, Materials.PHONG);
        const wf = Helpers.wireframe(gSegment);
        // group.add(wf);
        group.add(m);

        return new THREE.BoxGeometry(0.2, 0.2, 0.2);

        // let gSegment = new THREE.Geometry();
        // let v = [],
        //         f = [];
        //     let fOrigin = v.length;
        //     for (let j = 0; j < PI; j += QUARTER_PI) {
        //         v.push(start.clone().add(cross.clone().applyAxisAngle(axis, j)));
        //     }
        //     for (let j = 0; j < PI; j += QUARTER_PI) {
        //         v.push(end.clone().add(cross.clone().applyAxisAngle(axis, j)));
        //     }
        //     // f.push(new THREE.Face3(fOrigin, fOrigin + 4, fOrigin + 1));
        //     f.push(new THREE.Face3(fOrigin, fOrigin + 1, fOrigin + 2));
        //     gSegment.vertices = v;
        //     gSegment.faces = f;
        //     // gSegment.computeVertexNormals();
        //     // gSegment.computeFaceNormals();
        //     // gSegment = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        //     // gSegment =
    }

    // for (let i = 0; i < vertices.length; i += 2) {
    //     let start = vertices[i];
    //     let end = vertices[i + 1];
    //     let axis = start
    //         .clone()
    //         .sub(end)
    //         .normalize();
    //     let cross = axis
    //         .clone()
    //         .cross(xAxis)
    //         .normalize()
    //         .multiplyScalar(3);
    //     let gSegment = new THREE.Geometry();
    //     let v = [],
    //         f = [];
    //     let fOrigin = v.length;
    //     for (let j = 0; j < PI; j += QUARTER_PI) {
    //         v.push(start.clone().add(cross.clone().applyAxisAngle(axis, j)));
    //     }
    //     for (let j = 0; j < PI; j += QUARTER_PI) {
    //         v.push(end.clone().add(cross.clone().applyAxisAngle(axis, j)));
    //     }
    //     // f.push(new THREE.Face3(fOrigin, fOrigin + 4, fOrigin + 1));
    //     f.push(new THREE.Face3(fOrigin, fOrigin + 1, fOrigin + 2));
    //     gSegment.vertices = v;
    //     gSegment.faces = f;
    //     // gSegment.computeVertexNormals();
    //     // gSegment.computeFaceNormals();
    //     // gSegment = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    //     // gSegment =

    // let gMesh = new THREE.Mesh(gSegment, Materials.BASIC);
    // gMesh.position.set(p1.x, p1.y, p1.z);
    // group.add(gMesh);

    // spline / div / axis /capped
    // let p1Cross = p1.clone().add(p2).cross(xAxis).normalize();
    // let v1 =
    // }

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
