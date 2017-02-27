'use strict';

function Matrix (size) {
    let matrix = [];
    for (let i = 0; i < size; i++) for (let j = 0; j < size; j++) {
        if (!j)
            matrix[i] = [];
        matrix[i][j] = 1;
    }
    return matrix;
}

module.exports = Matrix;