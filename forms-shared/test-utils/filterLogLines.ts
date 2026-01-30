import { vi } from 'vitest'

export type SharedLoggerSeverity = 'LOG' | 'WARN' | 'ERROR' | 'DEBUG' | 'VERBOSE' | 'FATAL'

type SharedLoggerMatch = {
  severity?: SharedLoggerSeverity
  messageIncludes?: string
  context?: string
}

/**
 * Creates a console filter for Vitest that suppresses selected `console.*` calls.
 *
 * The filter intercepts calls to the given console `method` and runs `matchFn`:
 * - `matchFn(...args) === true`  → the call is suppressed (ignored)
 * - `matchFn(...args) === false` → the call is forwarded to the original console method
 *
 * Returns a restore function that removes the spy and restores the original console method.
 *
 * @example
 * ```typescript
 * const restore = filterConsole('log', (message) => String(message).includes('ignore'))
 *
 * console.log('This will be logged')
 * console.log('This will be ignored')
 *
 * restore()
 * ```
 */
function filterConsole(method: 'log' | 'warn' | 'error', matchFn: (...args: any[]) => boolean) {
  const original = console[method].bind(console)

  const spy = vi.spyOn(console, method).mockImplementation((...args) => {
    if (!matchFn(...args)) {
      original(...args)
    }
  })

  return () => spy.mockRestore()
}

/**
 * Returns `true` if `arg` looks like a SharedLogger output line and matches the optional constraints.
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

/**
 * Filters out noisy log lines in tests.
 *
 * Suppresses:
 * - SharedLogger lines that match `severity`, `context`, and/or `messageIncludes`
 * - exact string logs equal to `match.messageIncludes` (useful for non-SharedLogger noise)
 *
 * Returns a restore function that should be called to undo the filter.
 *
 * @example
 * ```typescript
 * const restore = filterLogLines({
 *   severity: 'WARN',
 *   messageIncludes: 'could not merge subschemas in allOf',
 * })
 *
 * // ... run test ...
 *
 * restore()
 * ```
 */
export function filterLogLines(match: SharedLoggerMatch) {
  return filterConsole(
    'log',
    (firstArg) => isSharedLoggerLine(firstArg, match) || firstArg === match.messageIncludes,
  )
}
