import { BRATISLAVA_TIME_ZONE, endOfDay, nowInBratislava, toDate } from '../temporal'

describe('toDate', () => {
  it('should convert an Instant to the Date of the same millisecond', () => {
    const instant = Temporal.Instant.from('2025-06-15T10:20:30.456Z')

    expect(toDate(instant)).toEqual(new Date('2025-06-15T10:20:30.456Z'))
  })

  it.each([
    {
      case: 'winter time (UTC+1)',
      wallClock: { year: 2025, month: 1, day: 15, hour: 11 },
      utc: '2025-01-15T10:00:00.000Z',
    },
    {
      case: 'summer time (UTC+2)',
      wallClock: { year: 2025, month: 7, day: 15, hour: 12 },
      utc: '2025-07-15T10:00:00.000Z',
    },
  ])('should convert Bratislava $case to the same moment in UTC', ({ wallClock, utc }) => {
    const dateTime = Temporal.ZonedDateTime.from({
      ...wallClock,
      timeZone: BRATISLAVA_TIME_ZONE,
    })

    expect(toDate(dateTime)).toEqual(new Date(utc))
  })
})

describe('nowInBratislava', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return the current moment in Bratislava time', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-12-31T23:30:00.000Z'))

    expect(nowInBratislava().toString()).toBe('2026-01-01T00:30:00+01:00[Europe/Bratislava]')
  })
})

describe('endOfDay', () => {
  it.each([
    {
      case: 'a regular day',
      dateTime: '2025-06-15T08:00:00+02:00[Europe/Bratislava]',
      expected: '2025-06-15T23:59:59.999+02:00[Europe/Bratislava]',
    },
    {
      case: 'the day clocks move forward (23 hours)',
      dateTime: '2025-03-30T08:00:00+02:00[Europe/Bratislava]',
      expected: '2025-03-30T23:59:59.999+02:00[Europe/Bratislava]',
    },
    {
      case: 'the day clocks move back (25 hours)',
      dateTime: '2025-10-26T08:00:00+01:00[Europe/Bratislava]',
      expected: '2025-10-26T23:59:59.999+01:00[Europe/Bratislava]',
    },
  ])('should return the last millisecond of $case', ({ dateTime, expected }) => {
    expect(endOfDay(Temporal.ZonedDateTime.from(dateTime)).toString()).toBe(expected)
  })
})
