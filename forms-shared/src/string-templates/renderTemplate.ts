import { GenericObjectType } from '@rjsf/utils'
import { safeArray, safeBoolean, safeNumber, safeString } from '../form-utils/safeData'
import { Eta } from 'eta'
import { FormDefinition } from '../definitions/formDefinitionTypes'

const eta = new Eta()

export const renderFormTemplate = (formData: GenericObjectType, templateString: string) => {
  try {
    const renderedString = eta.renderString(templateString, {
      formData,
      helpers: {
        safeArray,
        safeString,
        safeNumber,
        safeBoolean,
      },
    })
    if (renderedString.trim() === '') {
      return null
    }

    return renderedString
  } catch (error) {
    console.error('Error rendering template', error)
    return null
  }
}

export const renderFormAdditionalInfo = (
  formDefinition: FormDefinition,
  formDataJson: GenericObjectType,
) => {
  if (!formDefinition.additionalInfoTemplate) {
    return null
  }

  return renderFormTemplate(formDataJson, formDefinition.additionalInfoTemplate)
}
