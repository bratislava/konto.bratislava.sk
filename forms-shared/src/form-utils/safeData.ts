export function safeArray<T>(array: T[] | undefined): T[]
export function safeArray(array: any): []
export function safeArray<T>(array: T[] | any): T[] {
  if (Array.isArray(array)) {
    return array
  }

  return []
}

export function safeString<T extends string>(string: T | undefined): T | undefined
export function safeString(string: string | undefined): string | undefined
export function safeString(string: unknown): string | undefined {
  if (typeof string === 'string') {
    return string
  }
  return undefined
}

export function safeNumber(number: number | any): number | undefined {
  if (typeof number === 'number') {
    return number
  }
}

export function safeBoolean(boolean: boolean | any, undefinedFalse = true): boolean | undefined {
  if (typeof boolean === 'boolean') {
    return boolean
  }
  if (undefinedFalse && boolean === undefined) {
    return false
  }
}
