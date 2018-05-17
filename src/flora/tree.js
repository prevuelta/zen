import THREE from 'three';
import Helpers from '../util/helpers';

import Materials from '../util/materials';
import Util from '../util/util';
import LSystem from 'lindenmayer';
import FastSimplexNoise from 'fast-simplex-noise';

import { lathe, randomVector } from '../util/3dUtil';
import branchGeometry from './branchGeometry';

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
    let segmentLength = 1;
    let currentSegment = new THREE.Vector3();
    let angle = 0;
    let stack = [];
    let linkedTree = [];
    let yAngle = randomTwoPi();
    let level = 0;
    let currentParent = {
        isRoot: true,
        children: [],
        level,
        position: new THREE.Vector3(),
    };
    let tree = currentParent;
    let nodeStack = [];
    const segments = 16;
    let maxLevel = 0;

    const xRule = 'F[-F][+F]';
    const fRule = 'F[-F][+F]';

    var system = new LSystem({
        axiom: 'F',
        productions: { X: xRule, F: fRule },
        finals: {
            '[': () => {
                // Split
                // if (!currentParent.isBranch) {
                stack.push({ seg: currentSegment.clone(), angle, yAngle });
                const branchNode = {
                    parent: currentParent,
                    isBranch: true,
                    position: currentSegment,
                    level,
                    children: [],
                };
                currentParent.children.push(branchNode);
                currentParent = branchNode;
                // linkedTree.push(currentParent);
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
                yAngle += randomFloat(0, yTheta);
            },
            '-': () => {
                angle -= theta;
                yAngle -= randomFloat(0, yTheta);
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
                // linkedTree.push(node);
                currentSegment = end;
                level++;
                // segmentLength *= 0.98;
            },
        },
    });
    system.iterate(1);
    system.final();
    console.log(system.getString());

    // const nodes = [];
    // const nodeCount = randomInt(2, 5);
    const sides = 8;

    // for (let i = 0; i < nodeCount; i++) {
    // nodes.push(randomVector(3));
    // }

    function renderTree(node) {
        if (!node.isRoot) {
            console.log(node.parent.isBranch, node.children.length);
            if (!node.parent.isBranch && !node.children.length) {
                console.log('End');
                // trunk(node);
            } else if (node.isBranch && node.children.length > 1) {
                console.log(node);
                const gBranch = branchGeometry(
                    node.position,
                    [
                        node.parent.position || node.parent.start,
                        ...node.children.map(c => c.position || c.end),
                    ],
                    4
                );
                // console.log(gBranch);
                // group.add(new THREE.Mesh(gBranch.hullGeometry));
                group.add(gBranch.helpers);
                group.add(new THREE.Mesh(gBranch.branchGeometry));
            } else if (
                !node.isBranch &&
                !node.parent.isBranch &&
                !node.children.some(c => c.isBranch)
            ) {
                // const gBranch = branchGeometry(
                // node.start,
                // [ node.end, node.parent.start || node.parent.position
                // );
                // const gTrunk = trunk(node);
                // group.add(new THREE.Mesh(gTrunk));
            }
        }
        if (node.children.length) {
            node.children.forEach(renderTree);
        }
    }
    const group = new THREE.Group();

    renderTree(tree);

    function trunk(node) {
        const { start, end, level, children } = node;
        // const startThicknessDelta = 1 - node.parent.level / (maxLevel - 1);
        // const endThicknessDelta = 1 - level / (maxLevel - 1);
        // const startThickness = maxThickness * startThicknessDelta;
        // const endThickness = maxThickness * endThicknessDelta;
        const thickness = 0.1;
        const axis = start
            .clone()
            .sub(end)
            .normalize();
        const cross = axis
            .clone()
            .cross(xAxis)
            .normalize();

        const startCross = cross.clone().multiplyScalar(thickness);
        const endCross = cross.clone().multiplyScalar(thickness);
        const gSegment = new THREE.Geometry();
        let v = [],
            f = [];

        const inc = TWO_PI / segments;
        for (let j = 0; j < TWO_PI; j += inc) {
            const pos = start
                .clone()
                .add(startCross.clone().applyAxisAngle(axis, j));
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
        // const wf = Helpers.wireframe(gSegment);
        // group.add(wf);
        group.add(m);

        return new THREE.BoxGeometry(0.2, 0.2, 0.2);
    }

    // const branch = branchGeometry(centerNode, nodes, 8);

    // group.add(new THREE.Mesh(branch.hullGeometry));
    // group.add(Helpers.wireframe(gHull));
    // group.add(new THREE.Mesh(branch.branchGeometry, Materials.BASIC));

    const geometry = new THREE.Geometry();
    const lineVertices = [];

    function parseLinesFromTree(node) {
        if (!node.isBranch && !node.isRoot) {
            lineVertices.push(node.start, node.end);
        }
        if (node.isBranch && !node.children.length) {
            lineVertices.push(
                node.position,
                node.parent.end || node.parent.position
            );
        }
        node.children.forEach(c => {
            parseLinesFromTree(c);
        });
    }

    parseLinesFromTree(tree);
    console.log('Line', lineVertices);

    geometry.vertices = lineVertices;

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
