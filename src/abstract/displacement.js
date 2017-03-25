'use strict';

const FastSimplexNoise = require('fast-simplex-noise').default;
const WorleyNoise = require('worley-noise');

const Util = require('../util/util');
const Field = require('../abstract/field');

module.exports = {
    cellNoise (matrix, depth = 0.2, points = 20) {
        let noise = new WorleyNoise(points, Math.random() * 1000);
        let size = matrix.length;
        let map = noise.getNormalizedMap(size);

        for (let i = 0; i < size; i++) for (let j = 0; j < size; j++) {
            matrix[i][j] *= map[i * size + j];
        }

    },
    noise (matrix, depth) {
        const noiseGenerator = new FastSimplexNoise({ frequency: 0.01, min: 0, max: 1, octaves: 8 })
        let max = matrix.length
        for (let i = 0; i < max; i++) for (let j = 0; j < max; j++) {
            matrix[i][j] += noiseGenerator.scaled([i, j]) * depth;
        }
    },
    multiply (matrix, scalar = 1) {
        for (let i = 0; i < max; i++) for (let j = 0; j < max; j++) {
            matrix[i][j] *= scalar;
        }
        return matrix;
    },
    limit (matrix, lower, upper) {
        let max = matrix.length
        for (let i = 0; i < max; i++) for (let j = 0; j < max; j++) {
            matrix[i][j] = Math.min(upper, Math.max(lower, matrix[i][j]));
        }
    },
    softLimit (matrix, lower, upper) {
        let max = matrix.length
        for (let i = 0; i < max; i++) for (let j = 0; j < max; j++) {
            // matrix[i][j] = 
        }
    },
    turbulence (vertices, size, fieldCount = 2, min = -4, max = 4) {
        let fields = [];
        for (let i = 0; i < fieldCount;i ++)  {
            fields[i] = Field({
                x: Util.randomInt(0, size),
                y: 0,
                z: Util.randomInt(0, size)
            },
            Util.randomInt(min, max));
        }

        vertices.forEach(v => {
            fields.forEach(f => f.affect(v));
        });

        return vertices;
    },
    step () {

    // geometry.vertice.foreach(v => { console.log(v);Math.floor(v.y);console.log(v);return v;});

    }
}
