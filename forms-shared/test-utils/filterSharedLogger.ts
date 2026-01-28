import { vi } from 'vitest'

export type SharedLoggerSeverity = 'LOG' | 'WARN' | 'ERROR' | 'DEBUG' | 'VERBOSE' | 'FATAL'

type SharedLoggerMatch = {
  severity?: SharedLoggerSeverity
  messageIncludes?: string
  context?: string
}

/**
 * Filters console method calls based on a matching function in Vitest tests.
 *
 * - If matchFn returns true => the console call is filtered out (ignored).
 * - If matchFn returns false => the console call is passed through to the original console method.
 *
 * @example
 * ```typescript
 * filterConsole('log', (message) => String(message).includes('ignore'));
 * console.log('This will be logged');
 * console.log('This will be ignored');
 * ```
 */
function filterConsole(
  method: 'log' | 'warn' | 'error',
  matchFn: (...args: any[]) => boolean,
): void {
  const original = console[method].bind(console)

  vi.spyOn(console, method).mockImplementation((...args) => {
    if (!matchFn(...args)) {
      original(...args)
    }
  })
}

/**
 * Returns true if the arg looks like a SharedLogger output line, optionally matching severity/context/message.
 *
 * SharedLogger writes to console.log, so tests usually combine this with filterConsole('log', ...).
 */
function isSharedLoggerLine(arg: unknown, match: SharedLoggerMatch = {}): boolean {
  if (typeof arg !== 'string') return false
  if (!arg.includes('process="[SharedLogger]"')) return false

  const severity = /severity="([^"]+)"/.exec(arg)?.[1]
  const context = /context="([^"]+)"/.exec(arg)?.[1]

  if (match.severity && severity !== match.severity) return false
  if (match.context && context !== match.context) return false
  if (match.messageIncludes && !arg.includes(match.messageIncludes)) return false

  return true
}

export function filterSharedLogger(match: SharedLoggerMatch): void {
  filterConsole('log', (firstArg) => isSharedLoggerLine(firstArg, match))
}
