import { BRATISLAVA_TIME_ZONE, toDate } from '../temporal'

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
