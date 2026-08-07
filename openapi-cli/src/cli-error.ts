/**
 * An expected failure with a message worth showing on its own. `bin.ts` prints these as a
 * single line and exits non-zero; anything else keeps its stack trace, because an unexpected
 * throw is a bug worth seeing in full.
 */
export class CliError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CliError'
  }
}
