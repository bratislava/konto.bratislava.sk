// ANSI color escape codes for console output
const ANSI_RESET = '\u001B[0m'
const ANSI_GREEN = '\u001B[32m'
const ANSI_BOLD = '\u001B[1m'
const ANSI_RED = '\u001B[31m'
const ANSI_YELLOW = '\u001B[33m'
const ANSI_MAGENTA = '\u001B[35m'

/**
 * Escapes occurrences of `"` and `\` for logfmt compatibility.
 * Replaces newline symbols with `\n` to ensure logs remain on a single line.
 */
export function escapeForLogfmt(value: string): string {
  return value.replace(/["\\]/g, String.raw`\$&`).replace(/\n/g, String.raw`\n`)
}

/**
 * Converts an object into a flat, one-line logfmt-compatible string.
 */
export function objToLogfmt(obj: Record<string, unknown>): string {
  return Object.entries(obj)
    .map(([key, value]) => {
      let formattedValue = value

      if (typeof formattedValue === 'object' && formattedValue !== null) {
        formattedValue = JSON.stringify(value)
      }

      if (typeof formattedValue === 'string') {
        formattedValue = escapeForLogfmt(formattedValue)
      }

      return `${key}="${formattedValue}"`
    })
    .join(' ')
}

export class SharedLogger {
  private context?: string
  private color: boolean

  constructor(context?: string, color = true) {
    this.context = context
    this.color = color
  }

  private getCurrentDateTime(): string {
    return new Date().toISOString()
  }

  private formatStringMessage(messages: string): string {
    if (messages.length === 0) return ''
    return `message="${escapeForLogfmt(messages)}"`
  }

  private formatLog(
    severity: string,
    message: unknown,
    optionalParams: unknown[],
    colorCode: string,
  ): void {
    // Combine all input arguments into a single array
    const completeArray = [message, ...optionalParams]

    // Split the complete array into strings (non-object args) and objects
    const stringMessages = completeArray
      .filter((item): item is string => typeof item === 'string')
      .join('\n') // Join non-object strings with a newline

    const objectParams = completeArray.filter((item) => typeof item === 'object' && item !== null)

    // Format message field with all combined strings
    const formattedStringMessages = this.formatStringMessage(stringMessages)

    // Format object arguments to logfmt
    const formattedObjectParams = objectParams
      .map((item) => objToLogfmt(item as Record<string, unknown>))
      .join(' ')

    const formattedContext = this.context ? `context="${this.context}"` : ''

    const colorStart = this.color ? colorCode : ''
    const colorEnd = this.color ? ANSI_RESET : ''

    const pid =
      typeof (globalThis as any).process !== 'undefined'
        ? (globalThis as any).process.pid
        : undefined

    // Combine all parts into the log line
    const logLine = [
      colorStart,
      [
        `process="[SharedLogger]"`,
        pid ? `processPID="${pid}"` : undefined,
        `datetime="${this.getCurrentDateTime()}"`,
        `severity="${severity}"`,
        formattedContext,
        formattedStringMessages,
        formattedObjectParams,
      ]
        .filter(Boolean)
        .join(' '),
      colorEnd,
    ]
      .filter(Boolean)
      .join('')

    console.log(logLine) // Output to the console
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    this.formatLog('LOG', message, optionalParams, ANSI_GREEN)
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    this.formatLog('ERROR', message, optionalParams, ANSI_RED)
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.formatLog('WARN', message, optionalParams, ANSI_YELLOW)
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    this.formatLog('DEBUG', message, optionalParams, ANSI_MAGENTA)
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    this.formatLog('VERBOSE', message, optionalParams, '')
  }

  fatal(message: unknown, ...optionalParams: unknown[]): void {
    this.formatLog('FATAL', message, optionalParams, ANSI_BOLD)
  }
}
