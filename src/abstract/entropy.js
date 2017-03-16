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
        let depthNoise = new FastSimplexNoise({ frequency: 0.04, min: 0, max: size/2, octaves: 8 })
        for (let i = 0; i < size; i++) {

            let slope = 10,
                inc = 0,
                count = 0;

            let noise = depthNoise.scaled([i, 0]);
            let limit = Math.floor(Math.cos((i+offset)/10)*amp + noise);

            for (let j = 0; j < size; j++) {


                if (j === limit) {
                    inc = matrix[i][j]/slope;
                }

                if (count < slope && j > limit) {
                    matrix[i][j] -= count * inc;
                    count++;
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

    erode (matrix, displacement = 0.2) {

        let size = matrix.length;
        let store = [];

        function getLowestNeighbor (x, y) {
            Math.min(
                matrix[x-1][y-1],
                matrix[x][y-1],
                matrix[x+1][y-1],
                matrix[x-1][y],
                matrix[x+1][y],
                matrix[x+1][y-1],
                matrix[x+1][y],
                matrix[x+1][y+1],
            );
        }

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                // matrix[i][j] += Math.sqrt(depth-matrix[i][j]);
                store.push({position: [i,j], value: matrix[i][j] });
            }
        }
        store.sort((a,b) => a.value - b.value).reverse();
        console.log(store[0].value, store[1].value);

        store.forEach(p => {

        });
        // sort by height
        // Erode each (check surrounding if one is lower remove percentage and add to next location and repeat until none are lower)
        // matrix[i][j]
    }
}