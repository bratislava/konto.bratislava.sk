import * as z from 'zod'

import { BloomreachCommandName, ConsentEnum } from '../generated/prisma/client'
import { UserOfficialCorrespondenceChannelEnum } from '../user/dtos/gdpr.user.dto'
import { CognitoUserAccountTypesEnum } from '../utils/global-dtos/cognito.dto'

/**
 * A single consent state Bloomreach consent events are built from.
 * `timestamp` is set when this reflects a state read back from Bloomreach's
 * export (a restore) - it must carry the time that state was actually true,
 * not the time the command is built, or a restore can incorrectly outrank a
 * genuinely newer local change. Omit it for a consent change happening now.
 */
export interface Consent {
  consentType: ConsentEnum
  isGranted: boolean
  timestamp?: number
}

// ─── Bloomreach Batch API types ─────────────────────────────────────────────

/**
 * Bloomreach's batch API requires these exact lowercase/slash strings in the
 * wire payload - unrelated to and not derivable from `BloomreachCommandName`
 * (Prisma's generated enum uses the TS member names as its JS-facing values,
 * e.g. `'CUSTOMERS'`, regardless of the `@map`'d DB storage string).
 */
export enum BloomreachCommandNameEnum {
  CUSTOMERS = 'customers',
  CUSTOMERS_EVENTS = 'customers/events',
}

/**
 * Translates a `BloomreachOutbox.commandName` (Prisma enum) into the string
 * Bloomreach's batch API actually expects in the wire payload's `name` field.
 * Never send `entry.commandName` to Bloomreach directly - the two enums'
 * values do not match.
 */
export const BLOOMREACH_WIRE_COMMAND_NAME: Record<
  BloomreachCommandName,
  BloomreachCommandNameEnum
> = {
  [BloomreachCommandName.CUSTOMERS]: BloomreachCommandNameEnum.CUSTOMERS,
  [BloomreachCommandName.CUSTOMERS_EVENTS]: BloomreachCommandNameEnum.CUSTOMERS_EVENTS,
}

export interface BloomreachCustomerIds {
  city_account_id: string
  contact_id?: string
}

export interface BloomreachCustomerProperties {
  first_name?: string
  last_name?: string
  name?: string
  person_type?: CognitoUserAccountTypesEnum | string
  registration_date?: string
  email?: string
  phone?: string
  is_identity_verified?: boolean
  oauth_origin_client_name?: string
  current_tax_correspondence_channel?: UserOfficialCorrespondenceChannelEnum | string
}

export interface BloomreachCustomerCommandData {
  customer_ids: BloomreachCustomerIds
  properties: BloomreachCustomerProperties
  update_timestamp: number
}

export interface BloomreachConsentEventProperties {
  action: BloomreachConsentActionEnum
  category: string
  valid_until: string
}

export interface BloomreachEventCommandData {
  customer_ids: BloomreachCustomerIds
  properties: BloomreachConsentEventProperties
  event_type: BloomreachEventNameEnum
  timestamp: number
}

/** Narrows `BloomreachOutbox.commandData` by its actual shape, not by trusting `commandName`. */
export function isBloomreachCustomerData(
  data: BloomreachCustomerCommandData | BloomreachEventCommandData
): data is BloomreachCustomerCommandData {
  return 'update_timestamp' in data
}

export interface BloomreachCustomerCommand {
  commandName: BloomreachCommandNameEnum.CUSTOMERS
  commandData: BloomreachCustomerCommandData
}

/** Narrows `BloomreachOutbox.commandData` by its actual shape, not by trusting `commandName`. */
export function isBloomreachEventCommandData(
  data: BloomreachCustomerCommandData | BloomreachEventCommandData
): data is BloomreachEventCommandData {
  return 'timestamp' in data
}

export interface BloomreachEventCommand {
  commandName: BloomreachCommandNameEnum.CUSTOMERS_EVENTS
  commandData: BloomreachEventCommandData
}

export interface BloomreachBatchCommand {
  name: BloomreachCommandNameEnum
  data: BloomreachCustomerCommandData | BloomreachEventCommandData
  command_id?: string
}

export interface BloomreachBatchResultItem {
  success: boolean
  time: number
  command_id?: string
}

export interface BloomreachBatchResponse {
  success: boolean
  results: BloomreachBatchResultItem[]
  start_time: number
  end_time: number
}

// ─── Bloomreach Export API types ────────────────────────────────────────────

/** IDs to look up a customer by — at least one is required. */
export type BloomreachCustomerIdsQuery =
  | { city_account_id: string; contact_id?: string }
  | { city_account_id?: string; contact_id: string }

/** An ID can hold a single value or an array (a merged customer keeps all values of an ID). */
const BloomreachIdValueSchema = z.union([z.string(), z.array(z.string())]).nullish()

/**
 * Customer returned by the export-one endpoint. Only the fields we read are
 * validated, Bloomreach may send more. `ids` holds the IDs we work with
 * explicitly, but can contain any other ID name too.
 */
export const BloomreachExportedCustomerSchema = z.object({
  ids: z
    .object({
      city_account_id: BloomreachIdValueSchema,
      contact_id: BloomreachIdValueSchema,
    })
    .catchall(BloomreachIdValueSchema),
  properties: z.record(z.string(), z.unknown()),
})
export type BloomreachExportedCustomer = z.infer<typeof BloomreachExportedCustomerSchema>

export const BloomreachExportCustomerResponseSchema = z.object({
  success: z.boolean(),
  value: BloomreachExportedCustomerSchema.optional(),
})

export const BloomreachExportedEventSchema = z.object({
  type: z.string(),
  timestamp: z.number(),
  properties: z.record(z.string(), z.unknown()),
})
export type BloomreachExportedEvent = z.infer<typeof BloomreachExportedEventSchema>

export const BloomreachExportEventsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(BloomreachExportedEventSchema).optional(),
})

// ─── Bloomreach enums ───────────────────────────────────────────────────────

export enum BloomreachEventNameEnum {
  CONSENT = 'consent',
}

export enum BloomreachConsentActionEnum {
  ACCEPT = 'accept',
  REJECT = 'reject',
}
