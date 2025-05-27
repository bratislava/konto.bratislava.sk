import { vi } from 'vitest'

/**
 * Filters console method calls based on a matching function in Vitest tests.
 *
 * @example
 * ```typescript
 * filterConsole('log', (message) => message.includes('ignore'));
 * console.log('This will be logged');
 * console.log('This will be ignored');
 * ```
 */
export function filterConsole(
  method: 'log' | 'warn' | 'error',
  matchFn: (...args: any[]) => boolean,
): void {
  vi.spyOn(console, method).mockImplementation((...args) => {
    if (!matchFn(...args)) {
      return console[method](...args)
    }
  })
}
