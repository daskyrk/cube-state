import typescript from 'rollup-plugin-typescript2'
import { sizeSnapshot } from 'rollup-plugin-size-snapshot'
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
    },
    {
      file: pkg.module,
      format: 'es',
      exports: 'named',
    },
  ],
  external: ['immer', 'fast-deep-equal', 'react'],
  plugins: [
    typescript(),
    terser(),
    sizeSnapshot(),
  ],
}
