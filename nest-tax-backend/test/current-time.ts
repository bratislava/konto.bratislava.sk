import { toDate } from '../src/utils/functions/temporal'

/**
 * Sets the current time of the app (`new Date()` and `Temporal.Now`), the clock keeps running from it. Timers stay
 * real, so the app, its HTTP clients and the database connections keep working. Database defaults like `now()` keep
 * the real time.
 *
 * `TestingApp.afterEach()` restores the real time, so call it in `beforeEach` or in the test.
 */
export function setCurrentTime(time: Temporal.ZonedDateTime): void {
  vi.useFakeTimers({ toFake: ['Date', 'Temporal'], shouldAdvanceTime: true })
  vi.setSystemTime(toDate(time))
}
