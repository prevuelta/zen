import THREE from 'three';

export default function BranchGeometry(
    centerNode,
    branches,
    segments,
    hullSize = 1,
) {
    const group = new THREE.Group();

    // Create planes
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
            var planeHelper = new THREE.PlaneHelper(plane, 3, 0x000000);
            planeHelper.position.set(centerNode.x, centerNode.y, centerNode.z);
            group.add(planeHelper);
            planes.push(plane);
        }
    }

    // Branches
    const branchVertices = {
        flat() {
            return this.nodeVertices.reduce((a, b) => [...a, ...b], []);
        },
        branchVertices: nodes.map(n =>
            verticesAroundAxis(n, centerNode, sides, 0.4).map(v => {
                //ray from node in direction of centernode
                let rayVector = n
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
                var arrowHelper = new THREE.ArrowHelper(
                    rayVector,
                    v,
                    2,
                    0xff0000,
                );
                group.add(arrowHelper);
                return {
                    outerVertex: v,
                    rayVector,
                    ray,
                    innerVertex: c,
                    distance: c.distanceTo(v),
                };
            }),
        ),
    };

    const maxDistance = branches.reduce((a, b) => {
        return Math.max(a, b.distanceTo(centerNode));
    }, 0);

    // Create center hull
    let hull = qh(
        branchVertices.flat().map(({ outerVertex: { x, y, z } }) => [x, y, z]),
    );
    hull = hull.filter(a => {
        let result = true;
        for (let i = 0; i < nodes.length; i++) {
            const face = [i * 3, i * 3 + 1, i * 3 + 2];
            result = a.some(a => !face.includes(a));
            if (!result) break;
        }
        return result;
    });

    const gHull = new THREE.Geometry();
    const faces = hull.map(arr => new THREE.Face3(arr[0], arr[1], arr[2]));
    gHull.vertices = branchVertices.flat().map(b => b.innerVertex);
    gHull.faces = faces;
}
