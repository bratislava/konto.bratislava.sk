import { parseDate, parseTime } from '@internationalized/date'
import type { DateValue, TimeValue } from 'react-aria-components'

export const safeParseDate = (value: string): DateValue | null => {
  try {
    return parseDate(value)
  } catch {
    return null
  }
}

export const safeParseTime = (value: string): TimeValue | null => {
  try {
    return parseTime(value)
  } catch {
    return null
  }
}

// V4: Time output strips seconds → HH:MM
export const formatTime = (value: TimeValue): string => value.toString().slice(0, 5)
