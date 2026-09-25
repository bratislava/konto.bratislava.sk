import { defineConfig } from 'tsdown'

export default defineConfig({
  // The generated client folders; the output mirrors them (`dist/<client>/index.js`), as the
  // `exports` map expects.
  entry: ['*/*.ts', '!scripts/**'],
  unbundle: true,
  // `.js` and `.d.ts` (the package is `"type": "module"`), as the `exports` map expects.
  fixedExtension: false,
  tsconfig: 'tsconfig.build.json',
  // Declarations only; this doesn't type-check, so the `build` script runs `tsc --noEmit` first.
  dts: true,
  // Consumers install the dependencies, so package imports stay as written.
  deps: { neverBundle: true },
})
