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
