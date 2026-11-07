import {
  endOfDay,
  formatDDMMYYYY,
  formatSlovakDate,
  formatYYMMDD,
  isAfter,
  isBefore,
  isWeekend,
  nowInBratislava,
  toBratislavaDateTime,
  toDate,
  toInstant,
} from '../temporal'

describe('toInstant and toDate', () => {
  it('should keep the exact millisecond when converting a Date to an Instant and back', () => {
    const date = new Date('2025-06-15T10:20:30.456Z')

    const instant = toInstant(date)

    expect(instant.toString()).toBe('2025-06-15T10:20:30.456Z')
    expect(toDate(instant)).toEqual(date)
  })

  it('should convert a ZonedDateTime to the Date of the same moment', () => {
    const dateTime = Temporal.ZonedDateTime.from(
      '2025-06-15T12:20:30.456+02:00[Europe/Bratislava]',
    )

    expect(toDate(dateTime)).toEqual(new Date('2025-06-15T10:20:30.456Z'))
  })
})

describe('toBratislavaDateTime', () => {
  it.each([
    {
      case: 'winter time (UTC+1)',
      utc: '2025-01-15T10:00:00.000Z',
      expected: '2025-01-15T11:00:00+01:00[Europe/Bratislava]',
    },
    {
      case: 'summer time (UTC+2)',
      utc: '2025-07-15T10:00:00.000Z',
      expected: '2025-07-15T12:00:00+02:00[Europe/Bratislava]',
    },
    {
      case: 'a moment that is already the next day in Bratislava',
      utc: '2025-03-31T22:30:00.000Z',
      expected: '2025-04-01T00:30:00+02:00[Europe/Bratislava]',
    },
  ])('should show $case', ({ utc, expected }) => {
    expect(toBratislavaDateTime(new Date(utc)).toString()).toBe(expected)
  })
})

describe('nowInBratislava', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return the current moment in Bratislava time', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-12-31T23:30:00.000Z'))

    expect(nowInBratislava().toString()).toBe(
      '2026-01-01T00:30:00+01:00[Europe/Bratislava]',
    )
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
    {
      case: 'a day passed at its own last millisecond',
      dateTime: '2025-06-15T23:59:59.999+02:00[Europe/Bratislava]',
      expected: '2025-06-15T23:59:59.999+02:00[Europe/Bratislava]',
    },
    {
      case: 'a day in another time zone',
      dateTime: '2025-06-15T08:00:00+09:00[Asia/Tokyo]',
      expected: '2025-06-15T23:59:59.999+09:00[Asia/Tokyo]',
    },
  ])(
    'should return the last millisecond of $case',
    ({ dateTime, expected }) => {
      expect(endOfDay(Temporal.ZonedDateTime.from(dateTime)).toString()).toBe(
        expected,
      )
    },
  )
})

describe('date formatters', () => {
  it.each([
    {
      date: '2025-01-24',
      slovak: '24.01.2025',
      ddmmyyyy: '24012025',
      yymmdd: '250124',
    },
    {
      date: '2009-03-05',
      slovak: '05.03.2009',
      ddmmyyyy: '05032009',
      yymmdd: '090305',
    },
    {
      date: '2030-12-31',
      slovak: '31.12.2030',
      ddmmyyyy: '31122030',
      yymmdd: '301231',
    },
  ])(
    'should format $date with zero-padded parts',
    ({ date, slovak, ddmmyyyy, yymmdd }) => {
      const plainDate = Temporal.PlainDate.from(date)

      expect(formatSlovakDate(plainDate)).toBe(slovak)
      expect(formatDDMMYYYY(plainDate)).toBe(ddmmyyyy)
      expect(formatYYMMDD(plainDate)).toBe(yymmdd)
    },
  )
})

describe('isBefore and isAfter', () => {
  const noonInBratislava = Temporal.ZonedDateTime.from(
    '2025-06-15T12:00:00+02:00[Europe/Bratislava]',
  )
  const sameInstantInTokyo = noonInBratislava.withTimeZone('Asia/Tokyo')
  const oneMillisecondLater = noonInBratislava.add({ milliseconds: 1 })

  it.each([
    {
      case: 'an earlier moment',
      a: noonInBratislava,
      b: oneMillisecondLater,
      before: true,
      after: false,
    },
    {
      case: 'a later moment',
      a: oneMillisecondLater,
      b: noonInBratislava,
      before: false,
      after: true,
    },
    {
      case: 'the same instant in another time zone',
      a: noonInBratislava,
      b: sameInstantInTokyo,
      before: false,
      after: false,
    },
    {
      case: 'a Date against a ZonedDateTime',
      a: new Date('2025-06-15T09:59:59.999Z'),
      b: noonInBratislava,
      before: true,
      after: false,
    },
    {
      case: 'an Instant against a Date',
      a: Temporal.Instant.from('2025-06-15T10:00:00.001Z'),
      b: new Date('2025-06-15T10:00:00.000Z'),
      before: false,
      after: true,
    },
  ])('should order $case', ({ a, b, before, after }) => {
    expect(isBefore(a, b)).toBe(before)
    expect(isAfter(a, b)).toBe(after)
  })

  it.each([
    { a: '2025-06-14', b: '2025-06-15', before: true, after: false },
    { a: '2025-06-15', b: '2025-06-15', before: false, after: false },
    { a: '2026-01-01', b: '2025-12-31', before: false, after: true },
  ])('should order calendar date $a against $b', ({ a, b, before, after }) => {
    const dateA = Temporal.PlainDate.from(a)
    const dateB = Temporal.PlainDate.from(b)

    expect(isBefore(dateA, dateB)).toBe(before)
    expect(isAfter(dateA, dateB)).toBe(after)
  })

  it('should refuse to compare a calendar date with a moment', () => {
    const date = Temporal.PlainDate.from('2025-06-15')

    // @ts-expect-error A calendar date has no time or time zone to compare by
    expect(() => isBefore(date, noonInBratislava)).toThrow(TypeError)
    // @ts-expect-error A calendar date has no time or time zone to compare by
    expect(() => isAfter(noonInBratislava, date)).toThrow(TypeError)
  })
})

describe('isWeekend', () => {
  it.each([
    { date: '2025-06-13', day: 'Friday', expected: false },
    { date: '2025-06-14', day: 'Saturday', expected: true },
    { date: '2025-06-15', day: 'Sunday', expected: true },
    { date: '2025-06-16', day: 'Monday', expected: false },
  ])('should return $expected for $day $date', ({ date, expected }) => {
    expect(isWeekend(Temporal.PlainDate.from(date))).toBe(expected)
  })

  it("should use the day in the date-time's own time zone", () => {
    // Friday 23:30 in UTC is already Saturday in Bratislava
    const saturdayInBratislava = toBratislavaDateTime(
      new Date('2025-06-13T23:30:00.000Z'),
    )

    expect(isWeekend(saturdayInBratislava)).toBe(true)
  })
})
