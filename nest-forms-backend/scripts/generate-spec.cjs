/*
 * Generates the OpenAPI spec with the @nestjs/swagger CLI plugin applied, writing
 * nothing to disk except the spec itself.
 *
 * The plugin is a plain TypeScript `before` transformer, so we compile the project
 * through the compiler API, capture the emitted JavaScript in memory via a custom
 * writeFile callback, and serve it to Node through a `require.extensions['.ts']` hook.
 * No @nestjs/cli, no dist/, no metadata.ts, no loadPluginMetadata.
 */
require('./pin-typescript.cjs')
require('dotenv/config')

const ts = require('typescript')
const { before } = require('@nestjs/swagger/plugin')
const Module = require('node:module')
const { dirname, join } = require('node:path')

const PROJECT_ROOT = join(__dirname, '..')

// The project's own build config already has what we need: rootDir, `src/**/*.ts`, and
// tests excluded via `**/*spec.ts`. Nothing spec-specific required.
const CONFIG_PATH = join(PROJECT_ROOT, 'tsconfig.build.json')

// Output never reaches disk, so anything that would write a second artifact is off.
// `incremental` especially — the base config enables it and would drop a .tsbuildinfo.
const OVERRIDES = {
  declaration: false,
  declarationMap: false,
  sourceMap: false,
  incremental: false,
  noEmit: false,
}

const ENTRY = join(PROJECT_ROOT, 'src', 'generate-spec-plugin.ts')

// Mirrors nest-cli.json's plugin options.
const PLUGIN_OPTIONS = { introspectComments: true }

const normalize = (p) => p.replace(/\\/g, '/')

function parseConfig() {
  const read = ts.readConfigFile(CONFIG_PATH, ts.sys.readFile)
  if (read.error) {
    throw new Error(ts.flattenDiagnosticMessageText(read.error.messageText, '\n'))
  }
  const parsed = ts.parseJsonConfigFileContent(
    read.config,
    ts.sys,
    dirname(CONFIG_PATH),
  )
  if (parsed.errors.length > 0) {
    throw new Error(
      parsed.errors
        .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'))
        .join('\n'),
    )
  }
  return parsed
}

/** Compiles the project and returns a map of source .ts path -> emitted JS. */
function compileToMemory() {
  const { fileNames, options } = parseConfig()
  const program = ts.createProgram({
    rootNames: fileNames,
    options: { ...options, ...OVERRIDES },
  })

  const output = new Map()
  const writeFile = (fileName, text, _bom, _onError, sourceFiles) => {
    if (!fileName.endsWith('.js') || !sourceFiles?.length) return
    output.set(normalize(sourceFiles[0].fileName), text)
  }

  const emitResult = program.emit(undefined, writeFile, undefined, false, {
    before: [before(PLUGIN_OPTIONS, program)],
  })

  // Report type errors without blocking — the goal is a runnable program.
  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics)
  if (diagnostics.length > 0) {
    console.warn(
      ts.formatDiagnostics(diagnostics, {
        getCanonicalFileName: (p) => p,
        getCurrentDirectory: ts.sys.getCurrentDirectory,
        getNewLine: () => ts.sys.newLine,
      }),
    )
    console.warn(`${diagnostics.length} diagnostic(s); continuing.`)
  }
  if (emitResult.emitSkipped && output.size === 0) {
    throw new Error('emit produced no output')
  }
  return output
}

function registerRequireHook(output) {
  // Windows paths are case-insensitive; keep a lowercase index as a fallback.
  const lowercased = new Map(
    [...output].map(([key, value]) => [key.toLowerCase(), value]),
  )

  Module._extensions['.ts'] = function compileFromMemory(module, filename) {
    const key = normalize(filename)
    const js = output.get(key) ?? lowercased.get(key.toLowerCase())
    if (js === undefined) {
      throw new Error(
        `${filename} was required but is not part of ${CONFIG_PATH}'s file list`,
      )
    }
    module._compile(js, filename)
  }
}

registerRequireHook(compileToMemory())
require(ENTRY)
