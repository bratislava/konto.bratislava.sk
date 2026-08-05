import { dirname, join } from 'node:path'
import type * as ts from 'typescript'

import { CliError } from './cli-error'
import type { SwaggerPluginBefore } from './swagger-plugin'
import { type CompiledSources, normalizePath } from './types'

/**
 * Nothing reaches disk, so every option that would produce a second artifact is off.
 * `incremental` especially — the backends enable it, which would drop a `.tsbuildinfo`.
 */
const OVERRIDES: ts.CompilerOptions = {
  declaration: false,
  declarationMap: false,
  sourceMap: false,
  incremental: false,
  noEmit: false,
}

function parseConfig(
  typescript: typeof ts,
  configPath: string,
): ts.ParsedCommandLine {
  const read = typescript.readConfigFile(configPath, typescript.sys.readFile)
  if (read.error) {
    throw new CliError(
      `${configPath}: ${typescript.flattenDiagnosticMessageText(read.error.messageText, '\n')}`,
    )
  }

  const parsed = typescript.parseJsonConfigFileContent(
    read.config,
    typescript.sys,
    dirname(configPath),
  )
  if (parsed.errors.length > 0) {
    throw new CliError(
      `${configPath}:\n${parsed.errors
        .map((error) =>
          typescript.flattenDiagnosticMessageText(error.messageText, '\n'),
        )
        .join('\n')}`,
    )
  }
  return parsed
}

/**
 * Compiles the backend with the `@nestjs/swagger` plugin registered as a `before`
 * transformer, capturing the emitted JavaScript into `sources` instead of writing it.
 *
 * This is the same transform `nest build` applies. It has to happen at compile time: the
 * plugin rewrites the `@ApiProperty()` decorator arguments, and the runtime alternative
 * (`loadPluginMetadata`) attaches its metadata after the decorators have already run, by
 * which point reflection has erased the types it was supposed to supply.
 *
 * Type errors are reported but never block emit. Unrelated errors elsewhere in a backend
 * must not stop the spec from being generated.
 */
export function compileBackend(options: {
  typescript: typeof ts
  swaggerBefore: SwaggerPluginBefore
  swaggerOptions: Record<string, unknown>
  backendDir: string
  tsconfig: string
  sources: CompiledSources
}): void {
  const {
    typescript,
    swaggerBefore,
    swaggerOptions,
    backendDir,
    tsconfig,
    sources,
  } = options

  const configPath = join(backendDir, tsconfig)
  const { fileNames, options: compilerOptions } = parseConfig(
    typescript,
    configPath,
  )

  const program = typescript.createProgram({
    rootNames: fileNames,
    options: { ...compilerOptions, ...OVERRIDES },
  })

  const writeFile: ts.WriteFileCallback = (
    fileName,
    text,
    _writeByteOrderMark,
    _onError,
    sourceFiles,
  ) => {
    if (!fileName.endsWith('.js') || !sourceFiles?.length) return
    sources.set(normalizePath(sourceFiles[0].fileName), text)
  }

  const emitResult = program.emit(undefined, writeFile, undefined, false, {
    before: [swaggerBefore(swaggerOptions, program)],
  })

  reportDiagnostics(typescript, program, emitResult, backendDir)

  // A skipped emit can still have written some files, so this must be checked separately
  // from an empty result — a document built from a partial emit would look plausible.
  if (emitResult.emitSkipped) {
    throw new CliError(`emit was skipped for ${configPath}`)
  }
  if (sources.size === 0) {
    throw new CliError(`compiling ${configPath} produced no output`)
  }
}

function reportDiagnostics(
  typescript: typeof ts,
  program: ts.Program,
  emitResult: ts.EmitResult,
  backendDir: string,
): void {
  const diagnostics = typescript
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics)
  if (diagnostics.length === 0) return

  process.stderr.write(
    typescript.formatDiagnostics(diagnostics, {
      getCanonicalFileName: (fileName) => fileName,
      // The backend, not process.cwd() — they coincide today, but only by convention.
      getCurrentDirectory: () => backendDir,
      getNewLine: () => typescript.sys.newLine,
    }),
  )
  process.stderr.write(`${diagnostics.length} diagnostic(s); continuing.\n`)
}
