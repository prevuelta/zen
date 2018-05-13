import THREE from 'three';
import qh from 'quickhull3d';
import Helpers from '../util/helpers';

import Materials from '../util/materials';
import Util from '../util/util';
import LSystem from 'lindenmayer';
import FastSimplexNoise from 'fast-simplex-noise';

import { lathe } from '../util/3dUtil';

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
    const centerNode = new THREE.Vector3(0, 0.2, 0);

    const n1 = new THREE.Vector3(0, 1, 2);
    const n2 = new THREE.Vector3(3, 2, 0);

    const bV1 = verticesAroundAxis(n1, centerNode, 4, 0.4);
    const bV2 = verticesAroundAxis(n2, centerNode, 4, 0.4);

    let group = new THREE.Group();
    group.add(new THREE.Mesh(disc([n1, ...bV1])));
    group.add(new THREE.Mesh(disc([n2, ...bV2])));

    const n1PlusN2 = n1.clone().sub(n2);
    const p1Normal = n1
        .clone()
        .sub(n2)
        .normalize();

    const plane = new THREE.Plane(
        p1Normal,
        0
        // centerNode.distanceTo(new THREE.Vector3())
    );
    var planeHelper = new THREE.PlaneHelper(plane, 2, 0x000000);
    planeHelper.position.set(centerNode.x, centerNode.y, centerNode.z);
    group.add(planeHelper);

    // Vertex boundry generation from node input
    let centralVertices = [];

    [bV1, bV2].forEach((b, i) => {
        b.forEach(v => {
            //ray from node in direction of centernode
            let rayVector = (i ? n2 : n1)
                .clone()
                .sub(centerNode)
                .normalize()
                .negate();
            let ray = new THREE.Ray(v, rayVector);
            let c = new THREE.Vector3();
            ray.intersectPlane(plane, c);
            console.log('c', c);
            centralVertices.push(c);
            var arrowHelper = new THREE.ArrowHelper(rayVector, v, 1, 0xff0000);
            group.add(arrowHelper);
            // if (distance from v cjj >< distance v, intersect(ray, p)jk
        });
    });

    const maxDistance = centralVertices.reduce((a, b) => {
        return Math.max(a, b.distanceTo(centerNode));
    }, 0);

    centralVertices = centralVertices.map(v => {
        // Translate to outer sphere
        return v
            .sub(centerNode)
            .normalize()
            .multiplyScalar(maxDistance);
    });
    console.log('Central vertices', centralVertices);
    centralVertices.forEach(v => {
        var arrowHelper = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0.2, 0),
            v,
            1,
            0x00ff00
        );
        group.add(arrowHelper);
    });
    try {
        const hull = qh(centralVertices);
        console.log('Hull', hull);
    } catch (e) {
        console.log(e);
    }
    // const hull = new THREE.QuickHull();
    // hull.setFromPoints(centralVertices);
    // console.log('Hull', hull);
    // const hullMesh = new THREE.Mesh(hull);

    // .cross(centerNode);
    // const p2Normal = n2
    // .clone()
    // .add(centerNode)
    // .cross(xAxis);

    const geometry = new THREE.Geometry();
    geometry.vertices = [n1, centerNode, n2, centerNode];
    const planes = new THREE.Geometry();
    planes.vertices = [centerNode, p1Normal];
    // geometry.vertices = vertices;

    // let maxThickness = 0.5;

    // linkedTree.forEach(n => {
    //     if (n.start) {
    //         n.plane = verticesAroundAxis(n.start, n.end, segments, 0.4);
    //     }
    // });

    // linkedTree.forEach(n => {
    //     if (n.branch) {
    //         // let thicknessDelta = 1 - n.parent.level / (maxLevel - 1);
    //         // let thickness = maxThickness * thicknessDelta;
    //         // let g = new THREE.SphereGeometry(0.2, 32, 32);
    //         // let m = new THREE.Mesh(g, Materials.BASIC);
    //         // m.position.set(n.position.x, n.position.y, n.position.z);
    //         // group.add(m);
    //     } else if (n.start) {
    //         // let g = trunk(n); //new THREE.BoxGeometry(0.1, 0.1, 0.1);
    //         const g = plane(n.plane);
    //         let m = new THREE.Mesh(g, Materials.BLUE);
    //         m.position.set(n.start.x, n.start.y, n.start.z);
    //         group.add(m);
    //     }
    // });

    function verticesAroundAxis(start, end, segments, distance) {
        const v = [];
        const inc = TWO_PI / segments;
        const axis = start
            .clone()
            .sub(end)
            .normalize();
        const cross = axis
            .clone()
            .cross(xAxis)
            .normalize()
            .multiplyScalar(distance);
        for (let j = 0; j < TWO_PI; j += inc) {
            const pos = start
                .clone()
                .add(cross.clone().applyAxisAngle(axis, j));
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
                    (i + 1) % segments
                )
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
        })
    );

    let planeMesh = new THREE.LineSegments(
        planes,
        new THREE.LineBasicMaterial({
            color: 0xff0000,
        })
    );

    // mesh.add(hullMesh);
    mesh.add(planeMesh);
    mesh.add(group);

    // mesh.add( Helpers.wireframe(geometry) );

    return mesh;
}

export default Tree;
