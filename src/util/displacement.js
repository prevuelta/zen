'use strict';

const FastSimplexNoise = require('fast-simplex-noise').default;
const noiseGenerator = new FastSimplexNoise({ frequency: 0.01, max: 1, min: 0, octaves: 8 })

module.exports = {
    noiseMatrix (size) {
        let heights = [];
        for (let i = 0; i < size; i++) for (let j = 0; j < size; j++) {
            if (!j)
                heights[i] = [];
            heights[i][j] = noiseGenerator.scaled([i, j]);
        }
        return heights;
    }
}