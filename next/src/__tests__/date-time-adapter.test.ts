import { parseDate, parseTime, Time } from '@internationalized/date'
import { describe, expect, it } from '@jest/globals'

import {
  formatTime,
  safeParseDate,
  safeParseTime,
} from '@/src/components/widget-wrappers/dateTimeParse'

// V2: string↔RAC conversion lives in RJSF adapter.
// V3: malformed → null, no throw.
// V4: Time output strips seconds.

describe('safeParseDate', () => {
  it('parses valid ISO date', () => {
    const result = safeParseDate('2024-03-15')
    expect(result?.toString()).toBe(parseDate('2024-03-15').toString())
  })

  it('returns null on malformed input', () => {
    expect(safeParseDate('not-a-date')).toBeNull()
    expect(safeParseDate('2024-13-45')).toBeNull()
    expect(safeParseDate('')).toBeNull()
  })

  it('roundtrips via toString', () => {
    const parsed = safeParseDate('2024-03-15')
    expect(parsed?.toString()).toBe('2024-03-15')
  })
})

describe('safeParseTime', () => {
  it('parses valid time', () => {
    const result = safeParseTime('14:30')
    expect(result?.toString()).toBe(parseTime('14:30').toString())
  })

  it('returns null on malformed input', () => {
    expect(safeParseTime('not-a-time')).toBeNull()
    expect(safeParseTime('25:00')).toBeNull()
    expect(safeParseTime('')).toBeNull()
  })
})

describe('formatTime', () => {
  it('strips seconds from HH:MM:SS', () => {
    expect(formatTime(new Time(14, 30, 45))).toBe('14:30')
  })

  it('keeps HH:MM if seconds not present', () => {
    expect(formatTime(new Time(9, 5))).toBe('09:05')
  })

  it('pads single digits', () => {
    expect(formatTime(new Time(1, 2))).toBe('01:02')
  })
})
