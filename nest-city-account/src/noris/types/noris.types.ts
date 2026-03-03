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
  uri_generated: z.string(),

  // TODO - these fields are not necessary now, but can be in the future for generating uris.
  /*
  edesk_status: z.enum(EdeskStatus).nullable(),
  edesk_number: z.string().nullable(),

  priezvisko: z.string(),
  meno: z.string(),

  rc: z.string(),
  ICO: z.string(),
  obchodne_meno: z.string(),

  uri_edesk: z.string().nullable(),
  uri_ginis: z.string().nullable(),
  
  last_check: z.date(),
  */
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

export type UpdateEdeskChecks = {
  idNoris: string
  lastCheck: Date

  edeskStatus: EdeskStatus

  /** Must be null when status is NONEXISTENT. */
  edeskNumber: string | null
  /** Must be null when status is NONEXISTENT. */
  uri: string | null
}
