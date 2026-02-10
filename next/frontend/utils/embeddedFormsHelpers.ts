import { FormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import { GetServerSidePropsContext } from 'next/types'

import { environment } from '@/environment'
import { isDefined } from '@/frontend/utils/general'

const map = {
  olo: environment.embeddedFormsOloOrigins,
}

export const EMBEDDED_FORM_QUERY_PARAM = 'externa-sluzba'
export const EMBEDDED_FORM_QUERY_PARAM_TRUE_VALUE = 'true'

const getEmbeddedFormsAllowedOrigins = (formDefinition: FormDefinition) => {
  if (!formDefinition.embedded) {
    return null
  }

  return [
    ...map[formDefinition.embedded],
    environment.featureToggles.developmentForms ? environment.selfUrl : null,
  ].filter(isDefined)
}

export const handleEmbeddedFormRequest = (
  formDefinition: FormDefinition,
  context: GetServerSidePropsContext,
): { success: false; isEmbedded: undefined } | { success: true; isEmbedded: boolean } => {
  const isEmbeddedQueryParam =
    context.query[EMBEDDED_FORM_QUERY_PARAM] === EMBEDDED_FORM_QUERY_PARAM_TRUE_VALUE

  if (!isEmbeddedQueryParam) {
    return {
      success: true,
      isEmbedded: false,
    }
  }

  const allowedOrigins = getEmbeddedFormsAllowedOrigins(formDefinition)
  // Form is not meant to be embedded.
  if (!allowedOrigins || allowedOrigins.length === 0) {
    return { success: false, isEmbedded: undefined }
  }

  // This only allows embedding from the specified origins, we don't want it to be embedded in any other site.
  context.res.setHeader('Content-Security-Policy', `frame-ancestors ${allowedOrigins.join(' ')}`)

  return {
    success: true,
    isEmbedded: true,
  }
}
