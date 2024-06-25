import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/**/*.ts', 'src/**/*.tsx'],
  format: ['cjs'],
  outDir: 'dist/',
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: true,
  treeshake: true,
})
