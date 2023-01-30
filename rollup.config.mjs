import typescriptPlugin from 'rollup-plugin-typescript2';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.ts',
  plugins: [
    typescriptPlugin(),
    terser()
  ],
  output: [
    {
      file: 'lib/index.js',
      format: 'cjs',
      exports: 'named'
    },
    {
      file: 'lib/index.mjs',
      format: 'esm'
    }
  ]
};