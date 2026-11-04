import { isString } from 'class-validator'

import { FileStatus } from '../../generated/prisma/client'

export function isValidUid(resource: unknown): boolean {
  if (!isString(resource)) {
    return false
  }

  return resource.length >= 3 && resource.length <= 1000
}

export const isDefined = (a: unknown) => a !== undefined

// function which checks if string is in base64 format
export function isBase64(str: string): boolean {
  const base64regex =
    /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/
  return base64regex.test(str)
}

//check if scan status is valid
export function isValidScanStatus(status: string): boolean {
  return Object.values(FileStatus).includes(status as FileStatus)
}

// statuses after which the file is not scanned again, forms backend is notified about them
export const finalScanStatuses = [
  FileStatus.SAFE,
  FileStatus.INFECTED,
  FileStatus.NOT_FOUND,
  FileStatus.MOVE_ERROR_SAFE,
  FileStatus.MOVE_ERROR_INFECTED,
  FileStatus.SCAN_NOT_SUCCESSFUL,
  FileStatus.REJECTED,
] as const

export type FinalScanStatus = (typeof finalScanStatuses)[number]

export const isFinalScanStatus = (
  status: FileStatus,
): status is FinalScanStatus =>
  (finalScanStatuses as readonly FileStatus[]).includes(status)

// return list of statuses in string
export function listOfStatuses(): string {
  return Object.values(FileStatus).toString()
}

//function which splits array into chunks of size n
export function chunkArray<T>(arr: T[], n: number): T[][] {
  const chunks = []
  for (let i = 0; i < arr.length; i += n) {
    chunks.push(arr.slice(i, i + n))
  }
  return chunks
}

export async function timeout(ms: number): Promise<string> {
  return await new Promise((resolve) => {
    setTimeout(() => {
      resolve(FileStatus.SCAN_TIMEOUT)
    }, ms)
  })
}
