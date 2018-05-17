import THREE from 'three';
import Helpers from '../util/helpers';

import Materials from '../util/materials';
import Util from '../util/util';
import LSystem from 'lindenmayer';
import FastSimplexNoise from 'fast-simplex-noise';

import { lathe, randomVector, verticesAroundAxis } from '../util/3dUtil';
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
    let segmentLength = 0.5;
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
    let maxLevel = 0;
    const segments = 4;
    const iterations = 2;
    const thickness = 0.1;

    const xRule = '';
    const fRule = 'F[-F]F[+F]F';

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
                angle += theta;
                yAngle += randomFloat(0, yTheta);
            },
            '-': () => {
                angle -= theta;
                yAngle -= randomFloat(0, yTheta);
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
                const node = {
                    parent: currentParent,
                    start: currentSegment,
                    end,
                    level,
                    children: [],
                };
                currentParent.children.push(node);
                currentParent = node;
                currentSegment = end;
                level++;
            },
        },
    });
    system.iterate(iterations);
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
            if (node.isBranch && node.children.length > 1) {
                const gBranch = branchGeometry(
                    node.position,
                    [
                        {
                            position: node.parent.position || node.parent.start,
                            isTerminal: false,
                        },
                        ...node.children.map(c => ({
                            position: c.position || c.end,
                            isTerminal: !c.children.length,
                        })),
                    ],
                    segments,
                    thickness,
                );
                // group.add(new THREE.Mesh(gBranch.hullGeometry));
                group.add(gBranch.helpers);
                group.add(new THREE.Mesh(gBranch.branchGeometry));
            } else if (
                !node.children.length &&
                !node.isBranch &&
                !node.parent.isBranch
            ) {
                console.log('TERMINAL BRANCH');
                const terminalBranch = branchGeometry(
                    node.start,
                    [
                        {
                            position: node.parent.start,
                            isTerminal: false,
                        },
                        {
                            position: node.end,
                            isTerminal: true,
                        },
                    ],
                    segments,
                    thickness,
                );
                group.add(terminalBranch.helpers);
            }
        }
        if (node.children.length) {
            node.children.forEach(renderTree);
        }
    }
    const group = new THREE.Group();

    renderTree(tree);

    function endGeometry(node) {
        const { start, end } = node;
        const dist = start.distanceTo(end);
        const vector = start
            .clone()
            .sub(end)
            .normalize()
            .negate()
            .multiplyScalar(dist / 2);
        const midPoint = start.clone().add(vector);
        const startVertices = verticesAroundAxis(
            midPoint,
            end,
            segments,
            thickness,
        );
        const geometry = new THREE.Geometry();
        geometry.vertices = [end, ...startVertices];
        const faces = [];
        for (let i = 0; i < segments; i++) {
            faces.push(new THREE.Face3(0, (i + 1) % segments, i));
        }
        geometry.faces = faces;
        return geometry;
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
                node.parent.end || node.parent.position,
            );
        }
        node.children.forEach(c => {
            parseLinesFromTree(c);
        });
    }

    parseLinesFromTree(tree);

    geometry.vertices = lineVertices;

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
