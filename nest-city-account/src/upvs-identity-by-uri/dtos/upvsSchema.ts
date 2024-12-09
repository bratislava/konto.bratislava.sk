// generated using quicktype.io from a few example JSONs - if a new format appears in the API please update accordingly
import * as z from 'zod'

export const UpvsSchema = z.object({
  edesk_number: z.union([z.null(), z.string()]).optional(),
  edesk_status: z.union([z.null(), z.string()]).optional(),
  edesk_remote_uri: z.union([z.null(), z.string()]).optional(),
  edesk_cuet_delivery_enabled: z.union([z.boolean(), z.null()]).optional(),
  edesk_delivery_limited: z.union([z.boolean(), z.null()]).optional(),
  enotify_preferred_channel: z.union([z.null(), z.string()]).optional(),
  enotify_preferred_calendar: z.union([z.null(), z.string()]).optional(),
  enotify_emergency_allowed: z.union([z.null(), z.string()]).optional(),
  enotify_email_allowed: z.union([z.null(), z.string()]).optional(),
  enotify_sms_allowed: z.union([z.null(), z.string()]).optional(),
  preferred_language: z.union([z.null(), z.string()]).optional(),
  re_iam_identity_id: z.union([z.null(), z.string()]).optional(),
})
export type Upvs = z.infer<typeof UpvsSchema>

export const IdNameDescriptionSchema = z.object({
  id: z.union([z.null(), z.string()]).optional(),
  name: z.union([z.null(), z.string()]).optional(),
  description: z.union([z.null(), z.string()]).optional(),
})
export type IdNameDescription = z.infer<typeof IdNameDescriptionSchema>

export const PhoneSchema = z.object({
  type: z.union([IdNameDescriptionSchema, z.null()]).optional(),
  number: z.union([z.null(), z.string()]).optional(),
  international_country_code: z.union([z.null(), z.string()]).optional(),
  national_number: z.union([z.null(), z.string()]).optional(),
  area_city_code: z.union([z.null(), z.string()]).optional(),
  subscriber_number: z.union([z.null(), z.string()]).optional(),
  extension: z.union([z.null(), z.string()]).optional(),
})
export type Phone = z.infer<typeof PhoneSchema>

export const FamilyNameSchema = z.object({
  primary: z.union([z.null(), z.string()]).optional(),
  prefix: z.union([z.null(), z.string()]).optional(),
  value: z.union([z.null(), z.string()]).optional(),
})
export type FamilyName = z.infer<typeof FamilyNameSchema>

export const BirthSchema = z.object({
  date: z.union([z.null(), z.string()]).optional(),
  country: z.union([IdNameDescriptionSchema, z.null()]).optional(),
  district: z.union([IdNameDescriptionSchema, z.null()]).optional(),
  municipality: z.union([IdNameDescriptionSchema, z.null()]).optional(),
  part: z.union([z.null(), z.string()]).optional(),
})
export type Birth = z.infer<typeof BirthSchema>

export const NaturalPersonSchema = z.object({
  type: z.union([IdNameDescriptionSchema, z.null()]).optional(),
  name: z.union([z.null(), z.string()]).optional(),
  given_names: z.union([z.array(z.string()), z.null()]).optional(),
  preferred_given_name: z.union([z.null(), z.string()]).optional(),
  given_family_names: z.union([z.array(FamilyNameSchema), z.null()]).optional(),
  family_names: z.union([z.array(FamilyNameSchema), z.null()]).optional(),
  legal_name: z.union([z.null(), z.string()]).optional(),
  other_name: z.union([z.null(), z.string()]).optional(),
  prefixes: z.union([z.array(z.string()), z.null()]).optional(),
  suffixes: z.union([z.array(z.string()), z.null()]).optional(),
  alternative_names: z.union([z.array(z.string()), z.null()]).optional(),
  gender: z.union([IdNameDescriptionSchema, z.null()]).optional(),
  marital_status: z.union([z.null(), z.string()]).optional(),
  vital_status: z.union([z.null(), z.string()]).optional(),
  nationality: z.union([IdNameDescriptionSchema, z.null()]).optional(),
  occupation: z.union([z.null(), z.string()]).optional(),
  birth: z.union([BirthSchema, z.null()]).optional(),
  death: z.union([z.null(), z.string()]).optional(),
  updated_on: z.union([z.null(), z.string()]).optional(),
})
export type NaturalPerson = z.infer<typeof NaturalPersonSchema>

export const IdSchema = z.object({
  type: z.union([z.null(), z.string()]).optional(),
  value: z.union([z.null(), z.string()]).optional(),
})
export type Id = z.infer<typeof IdSchema>

export const EmailSchema = z.object({
  address: z.union([z.null(), z.string()]).optional(),
  dsig_key_info: z.null().optional(),
})
export type Email = z.infer<typeof EmailSchema>

export const DeliveryAddressSchema = z.object({
  postal_code: z.union([z.null(), z.string()]).optional(),
  post_office_box: z.union([z.null(), z.string()]).optional(),
  recipient: z.union([z.null(), z.string()]).optional(),
})
export type DeliveryAddress = z.infer<typeof DeliveryAddressSchema>

export const AddressSchema = z.object({
  type: z.union([z.null(), z.string()]).optional(),
  inline: z.union([z.null(), z.string()]).optional(),
  country: z.union([IdNameDescriptionSchema, z.null()]).optional(),
  region: z.union([z.null(), z.string()]).optional(),
  district: z.union([IdNameDescriptionSchema, z.null()]).optional(),
  municipality: z.union([IdNameDescriptionSchema, z.null()]).optional(),
  part: z.union([z.null(), z.string()]).optional(),
  street: z.union([z.null(), z.string()]).optional(),
  building_number: z.union([z.null(), z.string()]).optional(),
  registration_number: z.union([z.number(), z.null()]).optional(),
  unit: z.union([z.null(), z.string()]).optional(),
  building_index: z.union([z.null(), z.string()]).optional(),
  delivery_address: z.union([DeliveryAddressSchema, z.null()]).optional(),
  ra_entry: z.union([z.null(), z.string()]).optional(),
  specified: z.union([z.boolean(), z.null()]).optional(),
})
export type Address = z.infer<typeof AddressSchema>

export const UpvsIdentitySchema = z.object({
  ids: z.union([z.array(IdSchema), z.null()]).optional(),
  uri: z.union([z.null(), z.string()]).optional(),
  en: z.union([z.null(), z.string()]).optional(),
  type: z.union([z.null(), z.string()]).optional(),
  status: z.union([z.null(), z.string()]).optional(),
  name: z.union([z.null(), z.string()]).optional(),
  suffix: z.union([z.null(), z.string()]).optional(),
  various_ids: z.union([z.array(z.string()), z.null()]).optional(),
  upvs: z.union([UpvsSchema, z.null()]).optional(),
  natural_person: z.union([NaturalPersonSchema, z.null()]).optional(),
  addresses: z.union([z.array(AddressSchema), z.null()]).optional(),
  emails: z.union([z.array(EmailSchema), z.null()]).optional(),
  phones: z.union([z.array(PhoneSchema), z.null()]).optional(),
})
export type UpvsIdentity = z.infer<typeof UpvsIdentitySchema>
