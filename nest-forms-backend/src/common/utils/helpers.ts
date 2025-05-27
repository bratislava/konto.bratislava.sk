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
