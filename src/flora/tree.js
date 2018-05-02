const THREE = require('three');
const Helpers = require('../util/helpers');

const Materials = require('../util/materials');
const Util = require('../util/util');
const { randomFloat, randomInt } = Util;

const xAxis = new THREE.Vector3(1, 0, 0);
const zAxis = new THREE.Vector3(0, 0, 1);

const { PI } = Math;
const HALF_PI = PI / 2;

function Tree() {
    const height = 3;
    const increment = 0.2;
    const limit = 10;
    const branchLimit = 20;
    let iteration = 0;

    const vertices = [];

    let branchLength;
    const oddsOfSplit = 8;
    const oddsOfBranch = 6;
    const branchVariationLimit = PI;
    const firstTarget = new THREE.Vector3();
    let segmentLength = 0.4;

    function branch(origin, target, iterations) {
        // vertices.push(start, end);
        iterations--;
        if (iterations === 0) return;
        let start = origin;
        let distance = origin.distanceTo(target);
        let segmentMaxLength = iterations * segmentLength + randomFloat();
        let branchActive = true;
        while (distance > 0 && branchActive) {
            const branch = randomInt(0, oddsOfBranch) === 0;
            const split = randomInt(0, oddsOfSplit) === 0;
            if (branch) {
                const newTarget = start.clone().add(new THREE.Vector3(0,1,0);
                branch(start, newTarget, iterations);
            }
            if (split) {
                // const branchCount = randomInt(1, 4);
                // branch();
                // branch();
                branchActive = false;
                return;
            } else {
                const vector = start
                    .clone()
                    .add(target)
                    .normalize()
                    .multiplyScalar(segmentLength);
                end = start.clone().add(vector);
                vertices.push(start, end);
                start = end;
                segmentLength *= 0.94;
                distance = start.distanceTo(target);
            }
        }
        // for (let i = 0; i < branchCount; i++) {
        // const vector = new THREE.Vector3(0, 1, 0)
        // .applyAxisAngle(xAxis, randomFloat(0, PI) - HALF_PI)
        // .applyAxisAngle(zAxis, randomFloat(0, PI) - HALF_PI);
        // vector.normalize().multiplyScalar(Math.random());
        // if (randomInt(0, 1)) {
        // const newEnd = end.clone().add(vector);
        // branch(end, newEnd, iterations);
        // } else {
        // const dist = start.distanceTo(end);
        // const midVector = start
        // .clone()
        // .add(end)
        // .normalize()
        // .multiplyScalar(randomFloat(0, dist));
        // const mid = start.clone().add(midVector);
        // const newEnd = mid.clone().add(vector);
        // branch(mid, newEnd, iterations);
        // }
        // }

        // Will split?
        // let split = Math.random() > 0.8;
        // if (split) {
        // points.push(branch([Math.random(), i, Math.random()]))
        // } else {
        // points.push([Math.random(), i, Math.random()]);
        // }
    }
    console.log('V', vertices);

    branch(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, randomFloat(4, 10)),
        4,
    );

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

module.exports = Tree;
