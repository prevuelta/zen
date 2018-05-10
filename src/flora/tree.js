import THREE from 'three';
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

function Tree() {
    const vertices = [];

    let currentVector;
    let segmentLength = 0.2;
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
        position: new THREE.Vector3(0, 0.1, 0),
    };
    linkedTree.push(currentParent);
    let nodeStack = [];
    const segments = 16;
    let maxLevel = 0;
    let theta = HALF_PI / 2;
    let yTheta = HALF_PI / 2; // randomInt(1, 5);

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
            '+': () => {
                // angle += randomFloat(0, theta);
                angle += theta;
                theta *= 0.98;
                yTheta *= 0.7;
                yAngle += randomFloat(0, yTheta);
            },
            '-': () => {
                angle -= theta;
                theta *= 0.98;
                yAngle -= randomFloat(0, yTheta);
                yTheta *= 0.7;
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
    system.iterate(4);
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

    const geometry = new THREE.Geometry();
    geometry.vertices = vertices;

    let group = new THREE.Group();
    let maxThickness = 1;
    let currentThickness = 1.2;

    linkedTree.forEach(n => {
        if (n.start) {
            n.plane = verticesAroundAxis(
                n.end,
                n.start,
                segments,
                n.children.length ? currentThickness : 0
            );
        }
        const delta = 1 - n.level / maxLevel;
        console.log(delta);
        currentThickness = maxThickness * delta;
        currentThickness += randomFloat(-0.02, 0.02);
        if (n.branch) {
            // currentThickness -= 0.02;
        }
        // console.log(currentThickness);
        // }
    });

    linkedTree.forEach(n => {
        // if (n.branch) {
        // let thicknessDelta = 1 - n.parent.level / (maxLevel - 1);
        // let thickness = maxThickness * thicknessDelta;
        // let g = new THREE.SphereGeometry(0.2, 32, 32);
        // let m = new THREE.Mesh(g, Materials.BASIC);
        // m.position.set(n.position.x, n.position.y, n.position.z);
        // group.add(m);
        // } else if (n.start && n.parent.start) {
        // let g = trunk(n); //new THREE.BoxGeometry(0.1, 0.1, 0.1);
        // const g = plane(n.start, n.plane);
        function closestSegment(n) {
            return !n.parent.branch ? n.parent : closestSegment(n.parent);
        }

        if (!n.branch && !n.root) {
            const parent = closestSegment(n);

            //thisplane
            const p1 = n.plane;
            // verticesAroundAxis(
            //     n.position,
            //     n.parent.position || n.parent.end,
            //     segments,
            //     0.1
            // );
            // parent plane
            const p2 =
                parent.plane ||
                verticesAroundAxis(
                    parent.position,
                    n.start,
                    segments,
                    parent.root ? 1 : 0.2
                );

            // verticesAroundAxis(
            //     n.parent.position,
            //     n.end || n.position,
            //     segments,
            //     0.1
            // );

            const g = tube(p1, p2);
            let m = new THREE.Mesh(g);
            // m.position.set(n.start.x, n.start.y, n.start.z);
            group.add(m);
        }
        // }
    });

    function verticesAroundAxis(start, end, segments, distance) {
        // const v = [start];
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

    function tube(v1, v2) {
        const v = [...v1, ...v2];
        const tube = new THREE.Geometry();
        const f = [];
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
        tube.vertices = v;
        tube.faces = f;
        return tube;
    }

    function plane(center, vertices) {
        const seg = new THREE.Geometry();
        const f = [];
        for (let i = 1; i < vertices.length; i++) {
            f.push(new THREE.Face3(0, i, (i + 1) % vertices.length || 1));
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

    mesh.add(group);

    // mesh.add( Helpers.wireframe(geometry) );

    return mesh;
}

export default Tree;
