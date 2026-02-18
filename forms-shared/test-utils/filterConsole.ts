import { vi } from 'vitest'

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
export function filterConsole(
  method: 'log' | 'warn' | 'error',
  matchFn: (...args: any[]) => boolean,
) {
  const original = console[method].bind(console)

  const spy = vi.spyOn(console, method).mockImplementation((...args) => {
    if (!matchFn(...args)) {
      original(...args)
    }
  })

  return () => spy.mockRestore()
}
