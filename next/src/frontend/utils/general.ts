import { environment } from '@/src/environment'

const isServer = () => typeof window === 'undefined'

export const isBrowser = () => !isServer()

export const isProductionDeployment = () => !environment.isStaging

export const getLanguageKey = (currentLanguage?: string) => {
  return currentLanguage === 'sk' ? 'sk' : 'en'
}

export const base64ToArrayBuffer = (base64: string) => {
  const binaryString = window.atob(base64)
  const binaryLen = binaryString.length
  const bytes = new Uint8Array(binaryLen)

  for (let i = 0; i < binaryLen; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  return bytes
}

export const downloadBlob = (blob: Blob, fileName: string) => {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = fileName
  link.click()
  URL.revokeObjectURL(link.href)
}

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null
}

export function convertYearToNumber(input: string | undefined) {
  if (input === undefined || !/^(20\d{2})$/.test(input)) {
    return null
  }

  return parseInt(input, 10)
}
