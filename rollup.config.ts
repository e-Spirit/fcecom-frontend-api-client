import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import ts from 'rollup-plugin-ts';
import svg from 'rollup-plugin-svg-import';
import css from 'rollup-plugin-import-css';
// @ts-ignore JSON is not correctly validated via TSLint
import { dependencies, main, module, peerDependencies } from './package.json';

const extensions = ['.js', '.ts'];

export default [
  {
    input: 'src/index.ts',
    external: [...Object.keys(dependencies || {}), ...Object.keys(peerDependencies || {})],
    output: [
      {
        dir: main,
        format: 'cjs',
      },
      {
        dir: module,
        format: 'esm',
      },
    ],
    plugins: [
      ts(),
      json(),
      commonjs(),
      babel({
        extensions,
        include: ['src/**/*'],
        babelHelpers: 'bundled',
      }),
      terser(),
      svg(),
      css(),
    ],
  },
];
