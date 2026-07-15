import * as z from 'zod'

import { ConsentEnum } from '../generated/prisma/client'
import { UserOfficialCorrespondenceChannelEnum } from '../user/dtos/gdpr.user.dto'
import { CognitoUserAccountTypesEnum } from '../utils/global-dtos/cognito.dto'

/** A single consent state Bloomreach consent events are built from. */
export interface Consent {
  consentType: ConsentEnum
  isGranted: boolean
}

// ─── Bloomreach Batch API types ─────────────────────────────────────────────

export enum BloomreachCommandNameEnum {
  CUSTOMERS = 'customers',
  CUSTOMERS_EVENTS = 'customers/events',
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

export interface BloomreachCustomerCommand {
  commandName: BloomreachCommandNameEnum.CUSTOMERS
  commandData: BloomreachCustomerCommandData
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
