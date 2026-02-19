import {
  FormDefinition,
  FormDefinitionEmail,
  FormDefinitionSlovenskoSkGeneric,
  FormDefinitionSlovenskoSkTax,
  FormDefinitionType,
  FormDefinitionWebhook,
} from 'forms-shared/definitions/formDefinitionTypes'
import pick from 'lodash/pick'

/**
 * This module provides utilities for transforming full backend FormDefinition objects into minimal, serializable
 * versions suitable for use on the frontend.
 *
 * Why is this needed?
 * - Functions are not serializable in Next.js `getServerSideProps`.
 * - Only a subset of the full form definition is required by the client; sending less data improves performance.
 */

const basePropertiesToPick = [
  'slug',
  'type',
  'jsonVersion',
  'schema',
  'embedded',
  'additionalInfoTemplate',
  'termsAndConditions',
  'feedbackLink',
  'sendPolicy',
] as const satisfies readonly (keyof FormDefinition)[]

const slovenskoSkBasePropertiesToPick = [
  ...basePropertiesToPick,
  'pospID',
  'pospVersion',
  'isSigned',
] as const satisfies readonly (keyof FormDefinitionSlovenskoSkGeneric)[]

const slovenskoSkGenericPropertiesToPick = [
  ...slovenskoSkBasePropertiesToPick,
] as const satisfies readonly (keyof FormDefinitionSlovenskoSkGeneric)[]

const slovenskoSkTaxPropertiesToPick = [
  ...slovenskoSkBasePropertiesToPick,
] as const satisfies readonly (keyof FormDefinitionSlovenskoSkTax)[]

const emailPropertiesToPick = [
  ...basePropertiesToPick,
] as const satisfies readonly (keyof FormDefinitionEmail)[]

const webhookPropertiesToPick = [
  ...basePropertiesToPick,
] as const satisfies readonly (keyof FormDefinitionWebhook)[]

const map = {
  [FormDefinitionType.SlovenskoSkGeneric]: slovenskoSkGenericPropertiesToPick,
  [FormDefinitionType.SlovenskoSkTax]: slovenskoSkTaxPropertiesToPick,
  [FormDefinitionType.Email]: emailPropertiesToPick,
  [FormDefinitionType.Webhook]: webhookPropertiesToPick,
}

export type ClientFormDefinitionSlovenskoSkGeneric = Pick<
  FormDefinitionSlovenskoSkGeneric,
  (typeof slovenskoSkGenericPropertiesToPick)[number]
>

export type ClientFormDefinitionSlovenskoSkTax = Pick<
  FormDefinitionSlovenskoSkTax,
  (typeof slovenskoSkTaxPropertiesToPick)[number]
>

export type ClientFormDefinitionEmail = Pick<
  FormDefinitionEmail,
  (typeof emailPropertiesToPick)[number]
>

export type ClientFormDefinitionWebhook = Pick<
  FormDefinitionWebhook,
  (typeof webhookPropertiesToPick)[number]
>

export type ClientFormDefinitionSlovenskoSk =
  | ClientFormDefinitionSlovenskoSkGeneric
  | ClientFormDefinitionSlovenskoSkTax

export type ClientFormDefinition =
  | ClientFormDefinitionSlovenskoSkGeneric
  | ClientFormDefinitionSlovenskoSkTax
  | ClientFormDefinitionEmail
  | ClientFormDefinitionWebhook

export const makeClientFormDefinition = (formDefinition: FormDefinition): ClientFormDefinition => {
  return pick(formDefinition, map[formDefinition.type]) as ClientFormDefinition
}

export const isClientEmailFormDefinition = (
  formDefinition: ClientFormDefinition,
): formDefinition is ClientFormDefinitionEmail => formDefinition.type === FormDefinitionType.Email

export const isClientWebhookFormDefinition = (
  formDefinition: ClientFormDefinition,
): formDefinition is ClientFormDefinitionWebhook =>
  formDefinition.type === FormDefinitionType.Webhook

export const isClientSlovenskoSkGenericFormDefinition = (
  formDefinition: ClientFormDefinition,
): formDefinition is ClientFormDefinitionSlovenskoSkGeneric =>
  formDefinition.type === FormDefinitionType.SlovenskoSkGeneric

export const isClientSlovenskoSkTaxFormDefinition = (
  formDefinition: ClientFormDefinition,
): formDefinition is ClientFormDefinitionSlovenskoSkTax =>
  formDefinition.type === FormDefinitionType.SlovenskoSkTax

export const isClientSlovenskoSkFormDefinition = (
  formDefinition: ClientFormDefinition,
): formDefinition is ClientFormDefinitionSlovenskoSk =>
  isClientSlovenskoSkGenericFormDefinition(formDefinition) ||
  isClientSlovenskoSkTaxFormDefinition(formDefinition)

const landingPagePropertiesToPick = [
  'title',
  'slug',
] as const satisfies readonly (keyof FormDefinition)[]

export type ClientLandingPageFormDefinition = Pick<
  FormDefinition,
  (typeof landingPagePropertiesToPick)[number]
>

export const makeClientLandingPageFormDefinition = (
  formDefinition: FormDefinition,
): ClientLandingPageFormDefinition => {
  return pick(formDefinition, landingPagePropertiesToPick) as ClientLandingPageFormDefinition
}

const playgroundPropertiesToPick = [
  'title',
  'slug',
  'schema',
] as const satisfies readonly (keyof FormDefinition)[]

export type ClientPlaygroundFormDefinition = Pick<
  FormDefinition,
  (typeof playgroundPropertiesToPick)[number]
>

export const makeClientPlaygroundFormDefinitions = (
  formDefinitions: FormDefinition[],
): ClientPlaygroundFormDefinition[] => {
  return formDefinitions.map(
    (formDefinition) =>
      pick(formDefinition, playgroundPropertiesToPick) as ClientPlaygroundFormDefinition,
  )
}
