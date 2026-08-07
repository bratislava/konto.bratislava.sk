import { defineConfig } from 'tsdown'

export default defineConfig({
  // One output file per input file, mirroring generated/. Consumers import a single client
  // (`openapi-clients/forms`), so bundling every client into one chunk would make each
  // import pull in all of them.
  unbundle: true,
  entry: ['generated/**/*.ts'],
  outDir: 'dist',
  format: ['cjs'],
  dts: true,
  platform: 'neutral',
  // Generated code; the generator's own output is the source of truth.
  sourcemap: false,
})
