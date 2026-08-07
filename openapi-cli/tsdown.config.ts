import { defineConfig } from 'tsdown'

export default defineConfig({
  // One output file per input file. Not for consumers' sake — nothing imports this package's
  // internals — but because the CLI relies on CommonJS semantics that bundling could disturb:
  // `require()` of absolute paths resolved at runtime, `require.cache` inspection, and a
  // `require.extensions` hook. Mirroring the source keeps that behaviour exactly as written.
  unbundle: true,
  entry: ['src/**/*.ts'],
  outDir: 'dist',
  // Must stay CommonJS: the CLI requires the backend's CommonJS output in-process, and
  // `bin/openapi-cli.cjs` requires `dist/bin.js`.
  format: ['cjs'],
  // Backends type their contract against `OpenApiContract` from this package.
  dts: true,
  platform: 'node',
  sourcemap: false,
  // Plain `.js`/`.d.ts`, so the committed `bin/openapi-cli.cjs` launcher and the `exports` map
  // keep pointing at stable filenames. The package has no `"type"`, so `.js` is CommonJS.
  outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
  deps: {
    // `@nestjs/*` and `typescript` are type-only devDependencies, and tsdown treats
    // devDependencies as bundleable — which pulled their declarations (and rxjs's) into dist,
    // 360 files instead of 17. Nothing here should ever be inlined: every runtime module is
    // resolved from the target backend at run time, never imported from this package.
    neverBundle: true,
  },
})
