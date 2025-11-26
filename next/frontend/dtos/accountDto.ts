import { LoginClientEnum } from '@clients/city-account'
import { FetchUserAttributesOutput } from 'aws-amplify/auth'

export enum Tier {
  NEW = 'NEW',
  QUEUE_IDENTITY_CARD = 'QUEUE_IDENTITY_CARD',
  NOT_VERIFIED_IDENTITY_CARD = 'NOT_VERIFIED_IDENTITY_CARD',
  IDENTITY_CARD = 'IDENTITY_CARD',
  EID = 'EID',
}

export interface Address {
  formatted?: string
  street_address?: string
  locality?: string
  region?: string
  postal_code?: string
  country?: string
  phone_number?: string
}

export enum AccountType {
  FyzickaOsoba = 'fo',
  PravnickaOsoba = 'po',
  FyzickaOsobaPodnikatel = 'fo-p',
}

export type UserAttributes = FetchUserAttributesOutput & {
  'custom:ifo'?: string
  'custom:tier'?: Tier
  'custom:account_type'?: AccountType
  'custom:turnstile_token'?: string
  'custom:2024_tax_form_beta'?: string
  'custom:hide_phone_modal'?: string
  'custom:origin_client_id'?: string
  'custom:origin_client_name': LoginClientEnum
}
