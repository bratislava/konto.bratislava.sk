import { GenericObjectType } from '@rjsf/utils'
import { safeArray, safeBoolean, safeNumber, safeString } from '../form-utils/safeData'
import { Eta } from 'eta'
import { FormDefinition } from '../definitions/formDefinitionTypes'
import { SharedLogger } from '../utils/sharedLogger'

const eta = new Eta()

export const renderFormTemplate = (
  formData: GenericObjectType,
  templateString: string,
  logError = false,
) => {
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
    const logger = new SharedLogger('renderTemplate.ts')
    if (logError) {
      logger.error('Error rendering template', error)
    }
    return null
  }
}

export const renderFormAdditionalInfo = (
  formDefinition: Pick<FormDefinition, 'additionalInfoTemplate'>,
  formDataJson: GenericObjectType,
  logError = false,
) => {
  if (!formDefinition.additionalInfoTemplate) {
    return null
  }

  return renderFormTemplate(formDataJson, formDefinition.additionalInfoTemplate, logError)
}
