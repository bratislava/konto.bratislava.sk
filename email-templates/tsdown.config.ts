import { defineConfig } from 'tsdown'

export default defineConfig({
  // Every source file is an entry and the output mirrors `src`, so the paths in the `exports` map
  // stay stable. Examples, the registry and internal emails only serve tests and the preview, so
  // they stay out.
  entry: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.examples.{ts,tsx}',
    '!src/registry.ts',
    '!src/emails/_internal/**',
  ],
  unbundle: true,
  // `.js` and `.d.ts` (the package is `"type": "module"`), as the `exports` map expects.
  fixedExtension: false,
  tsconfig: 'tsconfig.build.json',
  // Declarations only; this doesn't type-check, so the `build` script runs `tsc --noEmit` first.
  dts: true,
  deps: {
    // Consumers install the dependencies, so package imports stay external.
    neverBundle: true,
  },
})
