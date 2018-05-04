import THREE from 'three';
import Helpers from '../util/helpers';

import Materials from '../util/materials';
import Util from '../util/util';
import LSystem from 'lindenmayer';
import FastSimplexNoise from 'fast-simplex-noise';

const { randomFloat, randomInt } = Util;

const xAxis = new THREE.Vector3(1, 0, 0);
const zAxis = new THREE.Vector3(0, 0, 1);

const { PI } = Math;
const HALF_PI = PI / 2;
const QUARTER_PI = PI / 4;
const theta = HALF_PI / 2;

function Tree() {
    const vertices = [];

    let currentVector;
    let segmentLength = 0.2;
    let currentSegment = new THREE.Vector3();
    let angle = 0;
    let stack = [];

    var system = new LSystem({
        axiom: '0',
        productions: { 0: '1[0]0', 1: '11' },
        finals: {
            '[': () => {
                angle = -theta;
                stack.push(currentSegment.clone());
            },
            ']': () => {
                angle = theta;
                currentSegment = stack.pop();
            },
            0: () => {
                segmentLength *= 0.98;
                const v = new THREE.Vector3(0, 1, 0);
                v
                    .applyAxisAngle(xAxis, angle)
                    // .applyAxisAngle(zAxis, QUARTER_PI)
                    .normalize()
                    .multiplyScalar(segmentLength);
                const end = currentSegment.clone().add(v);
                vertices.push(currentSegment, end);
                currentSegment = end;
            },
            1: () => {
                segmentLength *= 0.98;
                const v = new THREE.Vector3(0, 1, 0)
                    .applyAxisAngle(xAxis, angle)
                    // .applyAxisAngle(zAxis, QUARTER_PI)
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
    system.iterate(2);
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

    // geometry.vertices = vertices.map(v => new THREE.Vector3(v[0], v[1], v[2]));
    // geometry.computeFaceNormals();
    // geometry.mergeVertices();

    let mesh = new THREE.LineSegments(
        geometry,
        new THREE.LineBasicMaterial({
            color: 0xff0000,
            linewidth: 4,
        }),
    );

    // mesh.add( Helpers.wireframe(geometry) );

    return mesh;
}

export default Tree;
