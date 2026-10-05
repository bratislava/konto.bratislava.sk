import { defineConfig } from 'tsdown'

export default defineConfig({
  // Every source file is an entry and the output mirrors `src`, so the `./*` subpath exports keep
  // working.
  entry: ['src/**/*.{ts,tsx}'],
  unbundle: true,
  // `.js` and `.d.ts` (the package is `"type": "module"`), as the `exports` map expects.
  fixedExtension: false,
  tsconfig: 'tsconfig.build.json',
  // Declarations only; this doesn't type-check, so the `build` script runs `tsc --noEmit` first.
  dts: true,
  deps: {
    // Consumers install the dependencies, so package imports stay external.
    neverBundle: true,
    // Imports like `lodash/isEqual` would fail in Node: the package has no `exports` map, so
    // Node looks for a file named exactly `isEqual`, which doesn't exist (the file is
    // `isEqual.js`). This adds the missing `.js` in the build output.
    resolveDepSubpath: true,
  },
})
