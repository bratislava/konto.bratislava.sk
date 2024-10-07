import { FileStatus } from '@prisma/client'
import { isString } from 'class-validator'

export const processingScanStatuses = [
  FileStatus.UPLOADED,
  FileStatus.ACCEPTED,
  FileStatus.QUEUED,
  FileStatus.SCANNING,
  FileStatus.SCAN_ERROR,
  FileStatus.SCAN_TIMEOUT,
]

export const finalErrorScanStatuses = [
  FileStatus.NOT_FOUND,
  FileStatus.MOVE_ERROR_SAFE,
  FileStatus.MOVE_ERROR_INFECTED,
  FileStatus.SCAN_NOT_SUCCESSFUL,
]

export const infectedScanStatuses = [
  FileStatus.INFECTED,
  FileStatus.MOVE_ERROR_INFECTED,
]

export function isValid(resource: unknown): boolean {
  return isString(resource) && resource.length >= 3 && resource.length <= 100
}

export const isDefined = (a: unknown): boolean => a !== undefined

// function which checks if string is in base64 format
export function isBase64(str: string): boolean {
  const base64regex =
    // eslint-disable-next-line security/detect-unsafe-regex
    /^([\d+/A-Za-z]{4})*(([\d+/A-Za-z]{2}==)|([\d+/A-Za-z]{3}=))?$/
  return base64regex.test(str)
}

// check if scan status is valid
export function isValidScanStatus(status: string): boolean {
  return Object.values(FileStatus).includes(status as FileStatus)
}

// check if scan status is processing
export function isProcessingScanStatus(status: string): boolean {
  return Object.values(processingScanStatuses as string[]).includes(status)
}

// return list of statuses in string
export function listOfStatuses(): string {
  return Object.values(FileStatus).toString()
}

export function removeXMLWhitespace(xml: string): string {
  return xml.replaceAll(/>\s+</g, '><')
}
