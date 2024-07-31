import { FormDefinition } from 'forms-shared/definitions/formDefinitionTypes'

import { environment } from '../../environment'

const map = {
  olo: environment.embeddedFormsOloOrigins,
}

export const getEmbeddedFormsAllowedOrigins = (formDefinition: FormDefinition) => {
  if (!formDefinition.embedded) {
    return null
  }

  return map[formDefinition.embedded]
}
