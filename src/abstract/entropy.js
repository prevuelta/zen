'use strict';

let THREE = require('three');
const FastSimplexNoise = require('fast-simplex-noise').default;

function curve () {

}

module.exports = {
    pit (geo, testVertice) {

        let v = geo.vertices[testVertice];
        let dist = geo.centroid.distanceTo(v);
        let dir = v.clone();
        dir.normalize();
        // dir.multiplyScalar(dist/(5*(1+Math.random())));
        dir.multiplyScalar(0.1);//dist/(5*(1+Math.random())));
        v.sub(dir);


    },
    crack (matrix, width = 10, depth = 1) {
        let size = matrix.length;
        const noiseGenerator = new FastSimplexNoise({ frequency: 0.01, min: 0, max: size, octaves: 8 })
        const noiseGenerator2 = new FastSimplexNoise({ frequency: 0.01, min: 0, max: size, octaves: 8 })
        const depthNoise = new FastSimplexNoise({ frequency: 0.01, min: 0, max: depth, octaves: 8 })
        for (let i = 0; i < size; i++) for (let j = 0; j < size; j++) {
            let n1 = noiseGenerator.scaled([i, j]);
            let n2 = noiseGenerator2.scaled([i, j]);
            let dif = n1 - n2;
            if (j >= Math.floor(n1) && j <= Math.floor(n2)) {
                matrix[i][j] -= Math.cos((j-n1) / dif);//depthNoise.scaled([i,j]);
                // if (j === Math.floor(n2))
                // if (j === Math.floor(n1))
            }
        }
    },
    break (geo, min, max) {

    },
    erode (geo) {
        geo.vertices.forEach(v => {
            let dist = geo.centroid.distanceTo(v);
            let dir = v.clone();
            dir.normalize();
            dir.multiplyScalar(dist/(2*(1+Math.random())));
            v.sub(dir);
        });
    }
}