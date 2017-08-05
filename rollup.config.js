import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import builtins from 'rollup-plugin-node-builtins'
import filesize from 'rollup-plugin-filesize'
const pkg = require('./package.json')
const camelCase = require('lodash.camelcase')

const libraryName = 'slowItDown'

export default {
  entry: `compiled/index.js`,
  targets: [
    { dest: pkg.main, moduleName: camelCase(libraryName), format: 'umd' },
    { dest: pkg.module, format: 'es' },
  ],
  sourceMap: true,
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [],
  exports: 'named',
  plugins: [
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Add in builtin node libraries
    builtins(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),

    // Resolve source maps to the original source
    sourceMaps(),
    filesize(),
  ],
}
