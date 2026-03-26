import { CognitoUserAccountTypesEnum } from '../utils/global-dtos/cognito.dto'
import { UserOfficialCorrespondenceChannelEnum } from '../user/dtos/gdpr.user.dto'

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
}

export interface BloomreachConsentEventProperties {
  action: BloomreachConsentActionEnum
  category: BloomreachConsentCategoryEnum | string
  valid_until: string
}

export interface BloomreachEventCommandData {
  customer_ids: BloomreachCustomerIds
  properties: BloomreachConsentEventProperties
  event_type: BloomreachEventNameEnum
}

export type BloomreachCustomerCommand = {
  commandName: BloomreachCommandNameEnum.CUSTOMERS
  commandData: BloomreachCustomerCommandData
}

export type BloomreachEventCommand = {
  commandName: BloomreachCommandNameEnum.CUSTOMERS_EVENTS
  commandData: BloomreachEventCommandData
}

export interface BloomreachBatchCommand {
  name: BloomreachCommandNameEnum
  data: BloomreachCustomerCommandData | BloomreachEventCommandData
}

// ─── Bloomreach enums ───────────────────────────────────────────────────────

export enum BloomreachEventNameEnum {
  CONSENT = 'consent',
}

export enum BloomreachConsentActionEnum {
  ACCEPT = 'accept',
  REJECT = 'reject',
}

export enum BloomreachConsentCategoryEnum {
  ESBS_MARKETING = 'ESBS-MARKETING',
  TAX_COMMUNICATION = 'TAX-COMMUNICATION',
  OTHER = 'Other',
}
