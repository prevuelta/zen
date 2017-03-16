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
    crack (matrix, width = 10) {
        let size = matrix.length;
        const noiseGenerator = new FastSimplexNoise({ frequency: 0.03, min: 0, max: size/4, octaves: 8 })
        const noiseGenerator2 = new FastSimplexNoise({ frequency: 0.03, min: size/2, max: size, octaves: 8 })

        for (let i = 0; i < size; i++) {
            let n1 = Math.floor(noiseGenerator.scaled([i, 0]));
            let n2 = Math.floor(noiseGenerator2.scaled([i, 0]));
            let diff = n2 - n1;
            const depthNoise = new FastSimplexNoise({ frequency: 0.02, min: 0, max: 1, octaves: 8 })
            console.log("Noise", n1, n2, diff);

            for (let j = 0; j < size; j++) {
                // 3 9
                // diff 6
                // 7 - 3
                // Math.cos(4/6);
                if (j >= n1 && j <= n2) {
                    let norm = ((j - n1) / diff) || 0;
                    let normCos = Math.cos(norm*(Math.PI*2))/2-0.5;
                    // console.log("Norm", norm, "Normcos", normCos)
                    let amount = normCos * depthNoise.scaled([i,j]);
                    // matrix[i][j] -= 1;//amount;
                    matrix[i][j] += amount;
                    // if (j === Math.floor(n2))
                    // if (j === Math.floor(n1))
                }
            }
        }
    },
    break (geo, min, max) {

    },
    edge (matrix, depth = 2) {
        let size = matrix.length;
        let offset = Math.random()*size;
        let amp = Math.random() * 10;
        let depthNoise = new FastSimplexNoise({ frequency: 0.04, min: 0, max: 20, octaves: 8 })
        for (let i = 0; i < size; i++) {

            let slope = 10;
            for (let j = 0; j < size; j++) {
                let noise = depthNoise.scaled([i, 0]);
                let limit = Math.cos((i+offset)/10)*amp + noise + size/3;
                if (slope && j > limit) {

                    // console.log(1-1/slope, matrix[i][j])
                    matrix[i][j] -= matrix[i][j] - 1/slope;
                    // matrix[i][j] = 0.4;//height/slope;
                    slope--;
                } else if (j > limit) {
                    matrix[i][j] = 0;// depth;
                }
            }
        }
    },
    normalize (matrix, depth) {
        let size = matrix.length;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                matrix[i][j] += Math.sqrt(depth-matrix[i][j]);
            }
        }
    },

    // (2) 4-2 = 2 2+ 1.414
    // (3) 4-3 = 1 3 + 
    // (0) 4-0 = 4 0 + 2
    // (10) 4-10 = -6 10+(Math.sqrt(-6))

    erode () {
        geo.vertices.forEach(v => {
            let dist = geo.centroid.distanceTo(v);
            let dir = v.clone();
            dir.normalize();
            dir.multiplyScalar(dist/(2*(1+Math.random())));
            v.sub(dir);
        });
    }
}