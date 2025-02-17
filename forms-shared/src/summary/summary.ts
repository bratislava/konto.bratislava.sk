import { GenericObjectType } from '@rjsf/utils'
import { FormDefinition } from '../definitions/formDefinitionTypes'
import { BaRjsfValidatorRegistry } from '../form-utils/validatorRegistry'
import { renderFormAdditionalInfo } from '../string-templates/renderTemplate'
import { getSummaryJsonNode } from '../summary-json/getSummaryJsonNode'
import { SummaryJsonForm } from '../summary-json/summaryJsonTypes'

export interface FormSummary {
  summaryJson: SummaryJsonForm
  additionalInfo: string | null
  termsAndConditions: string
}

type GetFormSummaryParams = {
  formDefinition: FormDefinition
  formDataJson: GenericObjectType
  validatorRegistry: BaRjsfValidatorRegistry
}

export const getFormSummary = ({
  formDefinition,
  formDataJson,
  validatorRegistry,
}: GetFormSummaryParams): FormSummary => {
  const summaryJson = getSummaryJsonNode({
    schema: formDefinition.schema,
    formData: formDataJson,
    validatorRegistry,
  })
  const additionalInfo = renderFormAdditionalInfo(formDefinition, formDataJson)
  const termsAndConditions = formDefinition.termsAndConditions

  return {
    summaryJson,
    additionalInfo,
    termsAndConditions,
  }
}
