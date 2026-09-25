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
  // Consumers install the dependencies, so package imports stay external. Subpaths of packages
  // without an `exports` map (`lodash/isEqual`, `dayjs/plugin/utc`) get the file extension that
  // Node's ESM loader requires.
  deps: { neverBundle: true, resolveDepSubpath: true },
})
