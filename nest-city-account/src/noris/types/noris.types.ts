import { z } from 'zod'

export enum EdeskStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
  DELIVERABLE = 'DELIVERABLE',
  CREATED = 'CREATED',
  NONEXISTENT = 'NONEXISTENT',
}

export const EdeskRecordSchema = z.object({
  id_noris: z.string(),
  edesk_status: z.enum(EdeskStatus).nullable(),
  edesk_number: z.string().nullable(),

  priezvisko: z.string(),
  meno: z.string(),

  rc: z.string(),
  ICO: z.string(),
  obchodne_meno: z.string(),

  uri_edesk: z.string().nullable(),
  uri_ginis: z.string().nullable(),
  uri_generated: z.string(),

  last_check: z.date(),
})

export type EdeskRecord = z.infer<typeof EdeskRecordSchema>

/**
 * Parameters for lcs.usp21_ino_edesk_update.
 * Procedure raises an exception with error description on validation failure.
 *
 * Conditional rules:
 * - When edesk_status !== 'NONEXISTENT': edesk_number and uri are required;
 * - When edesk_status === 'NONEXISTENT': edesk_number and uri must be null.
 *
 */

type UpdateEdeskChecksBase = {
  idNoris: number
  /** Must be null when status is NONEXISTENT. */
  uri: null
  /** Not validated; legacy ESBS field, usually ICO or IFO. */
  edeskPCO: string | null
  lastCheck: Date
}

export type UpdateEdeskChecks = UpdateEdeskChecksBase &
  (
    | {
        edeskStatus: EdeskStatus.NONEXISTENT
        /** Must be null when status is NONEXISTENT. */
        edeskNumber: null
      }
    | {
        edeskStatus: Exclude<EdeskStatus, EdeskStatus.NONEXISTENT>
        /** Required when status !== NONEXISTENT; format E + 10 digits (e.g. E1234567890). */
        edeskNumber: string
      }
  )
