'use strict';

const FastSimplexNoise = require('fast-simplex-noise').default;
const noiseGenerator = new FastSimplexNoise({ frequency: 0.01, max: 1, min: 0, octaves: 8 })

module.exports = {
    noise (matrix) {
        let max = matrix.length
        for (let i = 0; i < max; i++) for (let j = 0; j < max; j++) {
            matrix[i][j] *= noiseGenerator.scaled([i, j]);
        }
    },
    multiply (matrix, scalar) {
        for (let i = 0; i < max; i++) for (let j = 0; j < max; j++) {
            matrix[i][j] *= scalar;
        }
        return matrix;
    }
}