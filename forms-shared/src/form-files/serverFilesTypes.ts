/* These are types of the files copied from `nest-forms-backend` client, until shared client is created:
 * https://github.com/bratislava/konto.bratislava.sk/issues/1071
 *
 * If there is a mismatch between these types, the compiler will throw an error.
 *
 * List of types:
 * - `const FormsBackendFileStatusEnum` is `const GetFileResponseDtoStatusEnum`
 * - `type FormsBackendFileStatusEnum` is `type GetFileResponseDtoStatusEnum`
 * - `FormsBackendFile` is minified version of `GetFileResponseReducedDto` with only needed fields
 * */

export const FormsBackendFileStatusEnum = {
  Uploaded: 'UPLOADED',
  Accepted: 'ACCEPTED',
  Queued: 'QUEUED',
  Scanning: 'SCANNING',
  Safe: 'SAFE',
  Infected: 'INFECTED',
  NotFound: 'NOT_FOUND',
  MoveErrorSafe: 'MOVE_ERROR_SAFE',
  MoveErrorInfected: 'MOVE_ERROR_INFECTED',
  ScanError: 'SCAN_ERROR',
  ScanTimeout: 'SCAN_TIMEOUT',
  ScanNotSuccessful: 'SCAN_NOT_SUCCESSFUL',
  FormIdNotFound: 'FORM_ID_NOT_FOUND',
} as const

export type FormsBackendFileStatusEnum =
  (typeof FormsBackendFileStatusEnum)[keyof typeof FormsBackendFileStatusEnum]

export interface FormsBackendFile {
  id: string
  fileName: string
  fileSize: number
  status: FormsBackendFileStatusEnum
}
