'use strict';

const FastSimplexNoise = require('fast-simplex-noise').default;

const Util = require('./util');
const Field = require('../abstract/field');

module.exports = {
    noise (matrix) {
        const noiseGenerator = new FastSimplexNoise({ frequency: 0.01, max: 1, min: 0, octaves: 8 })
        let max = matrix.length
        for (let i = 0; i < max; i++) for (let j = 0; j < max; j++) {
            matrix[i][j] *= noiseGenerator.scaled([i, j]);
        }
    },
    multiply (matrix, scalar = 1) {
        for (let i = 0; i < max; i++) for (let j = 0; j < max; j++) {
            matrix[i][j] *= scalar;
        }
        return matrix;
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