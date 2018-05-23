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
const theta = HALF_PI / 2.3;
const yTheta = HALF_PI / randomInt(1, 5);

function Tree() {
    const vertices = [];

    let currentVector;
    let segmentLength = 0.5;
    let currentPosition = new THREE.Vector3();
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
    let nodeStack = [currentParent];
    let maxLevel = 0;
    const segments = 3;
    const iterations = 1;
    const radius = 0.1;

    const xRule = 'FF';
    // let fRule = '-F[+F][---X]+F-F[++++X]-X';
    const fRule = '+F[+F][-F]-';

    function updatePosition() {
        const v = new THREE.Vector3(0, 1, 0)
            .applyAxisAngle(xAxis, angle)
            .applyAxisAngle(yAxis, yAngle)
            .normalize()
            .multiplyScalar(segmentLength);
        return currentPosition.clone().add(v);
    }

    var system = new LSystem({
        axiom: 'F',
        productions: { X: xRule, F: fRule },
        finals: {
            '[': () => {
                // Split
                // currentPosition = updatePosition();
                // If currentBranch is Branch then push ref to currentBranchh
                console.log('Currentparent', currentParent.isBranch);
                const branchNode = currentParent.isBranch
                    ? currentParent
                    : {
                          parent: currentParent,
                          isBranch: true,
                          position: currentPosition,
                          level,
                          children: [],
                      };
                if (!currentParent.isBranch) {
                    currentParent.children.push(branchNode);
                    currentParent = branchNode;
                }

                stack.push({
                    node: branchNode,
                    angle,
                    yAngle,
                });

                level++;
                maxLevel = Math.max(level, maxLevel);
                yAngle = randomTwoPi();
            },
            ']': () => {
                const prevBranch = stack.pop();
                const {
                    angle: prevAngle,
                    yAngle: prevYAngle,
                    node,
                } = prevBranch;

                angle = prevAngle;
                yAngle = prevYAngle;

                currentParent = node;
                currentPosition = node.position;
                level = node.level;
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
                const end = updatePosition();
                vertices.push(currentPosition, end);
                const node = {
                    parent: currentParent,
                    start: currentPosition,
                    end,
                    level,
                    children: [],
                    isBranch: false,
                };
                currentParent.children.push(node);
                currentParent = node;
                currentPosition = end;
                level++;
            },
        },
    });
    system.iterate(iterations);
    console.log(system.getString());
    system.final();
    console.log(tree);

    function fixTree(node) {
        if (node.isBranch) {
            node.children.forEach(c => {
                if (c.isBranch) {
                    node.children = [...node.children, ...c.children];
                }
            });
        }
        node.children.forEach(fixTree);
    }

    // const nodes = [];
    // const nodeCount = randomInt(2, 5);
    const sides = 8;

    // for (let i = 0; i < nodeCount; i++) {
    // nodes.push(randomVector(3));
    // }

    function renderTree(node) {
        let centerNode, nodes;
        if (!node.isRoot) {
            if (node.isBranch && node.children.length > 0) {
                centerNode = node.position;
                nodes = [
                    {
                        position: node.parent.position || node.parent.start,
                        isTerminal: false,
                    },
                    ...node.children.map(c => ({
                        position: c.position || c.end,
                        isTerminal: !c.children.length,
                    })),
                ];
            } else if (
                !node.children.length &&
                !node.isBranch &&
                !node.parent.isBranch
            ) {
                const centerNode = node.start;
                nodes = [
                    {
                        position: node.parent.start,
                        isTerminal: false,
                    },
                    {
                        position: node.end,
                        isTerminal: true,
                    },
                ];
            } else if (!node.isBranch) {
                // centerNode = node.start;
                // nodes = [
                // {
                // position: node.end,
                // },
                // {
                // position: node.parent.position || node.parent.start,
                // },
                // ];
            }
        }
        if (centerNode && nodes) {
            const branch = branchGeometry(centerNode, nodes, segments, radius);
            group.add(new THREE.Mesh(branch.hullGeometry));
            // group.add(new THREE.Mesh(branch.outerHull));
            group.add(branch.helpers);
            // group.add(new THREE.Mesh(branch.branchGeometry));
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
            radius,
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
        if (node.isBranch) {
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
