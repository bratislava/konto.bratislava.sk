/*
 * The @nestjs/swagger CLI plugin does `require('typescript')` from its own package dir.
 * That package has no typescript of its own, so resolution escapes to pnpm's hidden
 * hoist dir (node_modules/.pnpm/node_modules), which holds TypeScript 7.0.2 — pulled in
 * by scripts/package.json. TS 7 is the native port: it has no `ts.factory`, so the
 * plugin dies with "Cannot read properties of undefined (reading
 * 'createImportEqualsDeclaration')".
 *
 * Preload this to force every `require('typescript')` in the process onto this
 * package's own TypeScript 6.
 */
const Module = require('node:module')
const { join } = require('node:path')

const pinned = require.resolve('typescript', { paths: [join(__dirname, '..')] })
const originalResolve = Module._resolveFilename

Module._resolveFilename = function patchedResolve(request, ...rest) {
  if (request === 'typescript') {
    return pinned
  }
  return originalResolve.call(this, request, ...rest)
}
