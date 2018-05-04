import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
// import includePaths from 'rollup-plugin-includepaths';
import commonjs from 'rollup-plugin-commonjs';
import string from 'rollup-plugin-string';
import uglify from 'rollup-plugin-uglify';

var includePathOptions = {
    paths: ['myES6', 'node_modules'],
};

export default {
    external: ['three'],
    globals: {
        three: 'THREE',
        // quickhull3d: 'qh',
        // 'three-subdivision-modifier': 'SubdivisionModifier',
    },
    input: 'src/main.js',
    output: {
        format: 'iife',
        name: 'main',
        file: 'dist/scripts/main.min.js',
    },
    plugins: [
        resolve({
            jsnext: true,
            main: true,
            browser: true,
        }),
        string({
            // Required to be specified
            include: ['**/*.json', '**/*.frag', '**/*.vert', '**/*.shader'],
        }),
        commonjs(),
        babel({
            exclude: 'node_modules/**',
        }),
        // uglify(),
    ],
};
