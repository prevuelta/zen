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
        let slopeNoise = new FastSimplexNoise({ frequency: 0.04, min: 0, max: 10, octaves: 8 })

        for (let i = 0; i < size; i++) {

            let slope = Math.floor(slopeNoise.scaled([i, 0])),
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
                    matrix[i][j] = 0;
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

    erode (matrix, iterations) {

        let size = matrix.length;
        let store = matrixToLinkedObject(matrix)
        let highestToLowest = Object.keys(store).sort((a,b) => {
            a.value - b.value
        });

        while (iterations) {
            console.log("Iteration----", iterations)
            highestToLowest.forEach(v => {
                erode(store[v], 0);
            });
            iterations--;
        }

        Object.keys(store).forEach(k => {
            let o = store[k];
            let [x, y] = k.split('-');
            matrix[+x][+y] = o.value;
        });

// console.log(highestToLowest);
        // store.sort((a,b) => a.value - b.value).reverse();
        // console.log(store[0].value, store[1].value);

        // store.forEach(p => {
        //     erode(p);
        // });
        // erode(store[0])

        function erode (p, carry) {

            let lowestNeighbor = p.neighbors.reduce((a, b) => a.value < b.value ? a : b);
            // console.log(p, lowestNeighbor)
            if (p !== lowestNeighbor) {
                // p.value
                // if (carry) {
                    // p.value += carry * 0.2;
                    // carry -= carry * 0.2;
                    // erode(lowestNeighbor, carry);
                // } else {
                    // p.value -= 0.8;
                    lowestNeighbor.value -= 0.01;
                    carry += 0.01;
                    erode(lowestNeighbor, carry)
                // }
                // p.value += deposit;
                // carry -= deposit;
                // erode(lowestNeighbor, carry, deposit);
            } else {
                // console.log("P is lowest neightbor")
                p.value += carry;
                // p.value += add;
            }

            // let neighbors = [
            //         matrix[x-1] && matrix[x-1][y-1],
            //         matrix[x] && matrix[x][y-1],
            //         matrix[x+1] && matrix[x+1][y-1],
            //         matrix[x-1] && matrix[x-1][y],
            //         matrix[x][y],
            //         matrix[x+1] && matrix[x+1][y],
            //         matrix[x+1] && matrix[x+1][y-1],
            //         matrix[x+1] && matrix[x+1][y],
            //         matrix[x+1] && matrix[x+1][y+1]
            //     ].filter(v => v != undefined;

            // console.log(neighbors);

            // neighbors = matrixToArray(neighbors);

            // console.log(neighbors);

            // let minNeighbor = neighbors.reduce((a,b) => Math.min(a.value, b.value));
            // console.log(minNeightbor)
        }

        function matrixToLinkedObject (matrix) {
            let linked = {

            };
            for (let i = 0; i < matrix.length; i++) {
                for (let j = 0; j < matrix[i].length; j++) {
                    linked[`${i}-${j}`] = { value: matrix[i][j], neighbors: [] };
                }
            }
            Object.keys(linked).forEach(k => {
                linked[k].neighbors = getNeighbors(linked, k.split('-'))
            });
            return linked;
        }

        function getNeighbors (linked, xy) {

            let neighbors = [];

            let [x, y] = xy;

            let positions = [
                [-1,-1],
                [0, -1],
                [1, -1],
                [-1, 0],
                [0, 0],
                [1, 0],
                [-1, 1],
                [0, 1],
                [1, 1]
            ];

            positions.forEach(pos => {
                let key = `${+x+pos[0]}-${+y+pos[1]}`;
                neighbors.push(linked[key]);
            });

            return neighbors.filter(v => v != undefined);
        }

        // sort by height
        // Erode each (check surrounding if one is lower remove percentage and add to next location and repeat until none are lower)
        // matrix[i][j]
    }
}