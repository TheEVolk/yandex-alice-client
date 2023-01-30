import typescriptPlugin from 'rollup-plugin-typescript2';

export default {
  input: 'src/index.ts',
  plugins: [
    typescriptPlugin()
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