import THREE from 'three';
import Helpers from '../util/helpers';

import Materials from '../util/materials';
import Util from '../util/util';
import LSystem from 'lindenmayer';
import FastSimplexNoise from 'fast-simplex-noise';

import { lathe } from '../util/3dUtil';

const { randomFloat, randomInt, randomPi } = Util;

const xAxis = new THREE.Vector3(1, 0, 0);
const zAxis = new THREE.Vector3(0, 0, 1);
const yAxis = new THREE.Vector3(0, 1, 0);

const { PI } = Math;
const HALF_PI = PI / 2;
const QUARTER_PI = PI / 4;
const theta = HALF_PI / 2;
const yTheta = HALF_PI / randomInt(1, 5);

function Tree() {
    const vertices = [];

    let currentVector;
    let segmentLength = 0.1;
    let currentSegment = new THREE.Vector3();
    let angle = 0;
    let stack = [];
    let yAngle = randomPi();

    var system = new LSystem({
        axiom: 'X',
        productions: { X: 'F+[[X]-X]-F[-FX]+X', F: 'FF' },
        finals: {
            '[': () => {
                stack.push({ seg: currentSegment.clone(), angle, yAngle });
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
            },
            '-': () => {
                // angle = prevAngle;
                // angle -= theta;
                angle -= randomFloat(0, theta);
            },
            X: () => {
                // segmentLength *= 0.98;
                // const v = new THREE.Vector3(0, 1, 0);
                // v
                // .applyAxisAngle(xAxis, angle)
                // // .applyAxisAngle(yAxis, randomPi())
                // .normalize()
                // .multiplyScalar(segmentLength);
                // const end = currentSegment.clone().add(v);
                // vertices.push(currentSegment, end);
                // currentSegment = end;
            },
            F: () => {
                // segmentLength *= 0.98;
                const v = new THREE.Vector3(0, 1, 0)
                    .applyAxisAngle(xAxis, angle)
                    .applyAxisAngle(yAxis, yAngle)
                    .normalize()
                    .multiplyScalar(segmentLength);
                const end = currentSegment.clone().add(v);
                vertices.push(currentSegment, end);
                currentSegment = end;
                // const v = new THREE.Vector3();
                // vertices.push(v_);
                // currentStart = v;
            },
        },
    });
    system.iterate(4);
    console.log(system.getString());
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
    // console.log(treeModel.map(c => new THREE.Vector3(c[0], c[1], c[2])));

    const geometry = new THREE.Geometry();
    geometry.vertices = vertices;

    let group = new THREE.Group();

    for (let i = 0; i < vertices.length; i += 2) {
        let start = vertices[i];
        let end = vertices[i + 1];
        let axis = p1
            .clone()
            .sub(p2)
            .normalize();
        let cross = axis
            .clone()
            .cross(xAxis)
            .normalize()
            .multiplyScalar(3);
        let gSegment = new THREE.Geometry();
        let v = [],
            f = [];
        let fOrigin = v.length;
        for (let j = 0; j < PI; j += QUARTER_PI) {
            v.push(p1.clone().add(cross.clone().applyAxisAngle(axis, j)));
        }
        for (let j = 0; j < PI; j += QUARTER_PI) {
            v.push(p2.clone().add(cross.clone().applyAxisAngle(axis, j)));
        }
        // f.push(new THREE.Face3(fOrigin, fOrigin + 4, fOrigin + 1));
        f.push(new THREE.Face3(fOrigin, fOrigin + 1, fOrigin + 2));
        gSegment.vertices = v;
        gSegment.faces = f;
        // gSegment.computeVertexNormals();
        // gSegment.computeFaceNormals();
        // gSegment = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        gSegment = 

        let gMesh = new THREE.Mesh(gSegment, Materials.BASIC);
        // gMesh.position.set(p1.x, p1.y, p1.z);
        group.add(gMesh);

        // spline / div / axis /capped
        // let p1Cross = p1.clone().add(p2).cross(xAxis).normalize();
        // let v1 =
    }

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
