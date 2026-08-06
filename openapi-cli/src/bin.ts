import { Command } from 'commander'

import { registerActions } from './actions/register'
import { resolveBackend } from './backend'
import { buildDocument } from './build-document'
import { CliError } from './cli-error'

function createProgram(): Command {
  const program = new Command()
    .name('openapi-cli')
    .description(
      "Builds the OpenAPI document of the backend in the current directory, then runs an action over it.\n" +
        'Run it from a backend package, normally through that package\'s own script.',
    )
    .showHelpAfterError()

  // Lazily invoked, so `--help` and argument errors never trigger a compile.
  registerActions(program, async () => {
    const backend = resolveBackend(process.cwd())
    return { backendDir: backend.directory, ...(await buildDocument(backend)) }
  })

  return program
}

createProgram()
  .parseAsync()
  .catch((error: unknown) => {
    // Expected failures get a message; anything else keeps its stack, because it is a bug.
    process.stderr.write(
      error instanceof CliError
        ? `${error.message}\n`
        : `${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`,
    )
    process.exitCode = 1
  })
