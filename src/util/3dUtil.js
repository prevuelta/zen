import { Vector3, Geometry, BufferGeometry, BufferAttribute } from 'three';
import Util from './util';
const { randomTwoPi } = Util;
const TWO_PI = Math.PI * 2;

const xAxis = new Vector3(1, 0, 0);
const zAxis = new Vector3(0, 0, 1);
const yAxis = new Vector3(0, 1, 0);

function move(v, x, y) {
    moveAcross(v, x);
    moveUp(v, y);
}

function moveAcross(v, x) {
    v.add(new Vector3(1, 0, 0).multiplyScalar(x));
}

function moveUp(v, y) {
    v.add(new Vector3(0, 0, 1).multiplyScalar(y));
}

export function randomVector(length = 1) {
    const v = new Vector3(0, length, 0);
    v.applyAxisAngle(xAxis, randomTwoPi()).applyAxisAngle(zAxis, randomTwoPi());
    return v;
}

export function splineToVectorArray(splineArray) {
    let currentPoint = new Vector3(0, 0, 0);
    let splineVec = [];

    splineArray.forEach(p => {
        move(currentPoint, p[0], p[1]);
        splineVec.push(currentPoint.clone());
    });

    return splineVec;
}

export function verticesAroundAxis(start, end, segments, distance) {
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
            cross.clone().applyAxisAngle(zAxis, j)
        );
        pos.applyAxisAngle(xAxis, rx);
        pos.applyAxisAngle(yAxis, ry);
        pos.add(start);
        v.push(pos);
    }

    return v;
}

export function disc(vertices) {
    const seg = new THREE.Geometry();
    const f = [];
    for (let i = 1; i < vertices.length; i++) {
        f.push(new THREE.Face3(i, (i + 1) % vertices.length || 1, 0));
    }
    seg.vertices = vertices;
    seg.faces = f;
    return seg;
}

export function fanShape(
    shape,
    count,
    axist,
    radius,
    rotateZ = false,
    offset = 0
) {
    let buffer = new BufferGeometry({ flat: true });
    const TWO_PI = Math.PI * 2;
    for (let theta = offset; theta < TWO_PI + offset; theta += TWO_PI / count) {
        let x = Math.sin(theta) * radius;
        let y = Math.cos(theta) * radius;
    }
}

export function lathe(
    spline,
    divisions,
    axis,
    capped,
    shapeFill = 0xff0000,
    capFill = 0x00ff00
) {
    let newSpline;
    console.log(spline);

    if (capped) {
        newSpline = spline.slice(0);
        let lastVertice = spline[spline.length - 1];
        newSpline.unshift(new Vector3(0, 0, spline[0].z));
        newSpline.push(new Vector3(0, 0, lastVertice.z));
    } else {
        newSpline = spline;
    }

    let splines = [newSpline];
    let rotationInc = Math.PI * 2 / divisions;

    for (let i = 1; i < divisions; i++) {
        splines[i] = [];
        for (let j = 0; j < newSpline.length; j++) {
            splines[i][j] = splines[i - 1][j]
                .clone()
                .applyAxisAngle(axis, rotationInc);
        }
    }

    let geometry = new BufferGeometry({ flat: true });

    let vertices = splines
        .reduce((a, b) => a.concat(b))
        .reduce((a, b) => a.concat(b.toArray()), []);

    let indices = [];
    let x = newSpline.length;

    for (let i = 0; i < vertices.length / 3; i++) {
        if (!i || (i + 1) % x > 0) {
            if (i < x * divisions - x) {
                indices.push(i, i + x, i + 1, i + x, i + x + 1, i + 1);
            } else if (i > x * divisions - x - 1) {
                indices.push(i, i % x, i + 1, i % x, i % x + 1, i + 1);
            }
        }
    }

    geometry.addAttribute(
        'position',
        new BufferAttribute(new Float32Array(vertices), 3)
    );
    geometry.setIndex(new BufferAttribute(new Uint8Array(indices), 1));

    return geometry;
}

export function latheRepeat(
    splines,
    repeats,
    axis,
    capped,
    shapeFill1,
    shapeFill2,
    capFill
) {
    let splineCount = splines.length;
    let divisions = repeats * splineCount;

    let repeatedSplines = [];
    let rotationDelta = Math.PI * 2 / (divisions / 2);

    let geometry = new BufferGeometry({ flat: true });

    if (divisions % splineCount != 0 || divisions < splineCount) {
        throw new Error('Divisions must be multiple of splines');
    }

    let newSplines;

    if (capped) {
        newSplines = splines.slice();
        for (let spline of newSplines) {
            let lastVertice = spline[spline.length - 1];
            spline.unshift(new Vector3(0, 0, spline[0].z));
            spline.push(new Vector3(0, 0, lastVertice.z));
        }
    } else {
        newSplines = splines;
    }

    let currentRot = rotationDelta;

    for (let i = 0; i < divisions; i++) {
        repeatedSplines[i] = newSplines[i % splineCount]
            .slice()
            .map(v => v.clone());
        if (i) {
            for (let j = 0; j < repeatedSplines[i].length; j++) {
                repeatedSplines[i][j].applyAxisAngle(axis, currentRot);
            }
            if (i % 2 == 0) {
                currentRot += rotationDelta;
            }
        }
    }

    let vertices = repeatedSplines
        .reduce((a, b) => a.concat(b))
        .map(v => v.toArray())
        .reduce((a, b) => a.concat(b));

    let indices = [];
    let x = splines[0].length;

    for (let i = 0; i < vertices.length / 3; i++) {
        if (!i || (i + 1) % x > 0) {
            if (i < x * divisions - x) {
                indices.push(i + 1, i + x, i, i + 1, i + x + 1, i + x);
            } else if (i > divisions - x - 1) {
                indices.push(i + 1, i % x, i, i + 1, i % x + 1, i % x);
            }
        }
    }

    geometry.addAttribute(
        'position',
        new BufferAttribute(new Float32Array(vertices), 3)
    );
    geometry.setIndex(new BufferAttribute(new Uint16Array(indices), 1));

    // body.beginShape(QUADS);
    // body.fill(shapeFill);
    // for (let l = 0; l < newSplines[0].length; l++) {
    //     // float colorInterval = (float)l / (float)newSplines[0].length;
    // body.fill(lerpColor(shapeFill1, shapeFill2, colorInterval ));
    // if (l != 0) {
    //     for (let m = 1; m <= divisions; m++) {
    //         let = m == divisions ? 0 : m;
    //         d.sVert(body, newSplines[n][l]);
    //         d.sVert(body, newSplines[n][l-1]);
    //         d.sVert(body, newSplines[m-1][l-1]);
    //         d.sVert(body, newSplines[m-1][l]);
    //     }
    // }
    // }

    // if (capped) {

    // PShape bottom = createShape();
    // PShape top = createShape();

    // top.beginShape();
    //     top.fill(capFill);
    //     for (int n = 0; n < divisions; n++) {
    //         d.sVert(top, newSplines[n][0]);
    //     }
    // top.endShape();
    // bottom.beginShape();
    //     bottom.fill(capFill);
    //     for (int o = 0; o < divisions; o++) {
    //         d.sVert(bottom, newSplines[o][newSplines[0].length-1]);
    //     }
    // bottom.endShape();
    // s.addChild(top);
    // s.addChild(bottom);
    // }

    // s.addChild(body);
    return geometry;
}
