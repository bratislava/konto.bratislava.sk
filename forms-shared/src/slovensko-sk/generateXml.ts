import { FormDefinitionSlovenskoSk } from '../definitions/formDefinitionTypes'
import { GenericObjectType } from '@rjsf/utils'
import { renderSlovenskoXmlSummary } from './renderXmlSummary'
import removeMarkdown from 'remove-markdown'
import { FormsBackendFile } from '../form-files/serverFilesTypes'
import { getSlovenskoSkXmlns } from './urls'
import { FormSummary } from '../summary/summary'

function getSlovenskoSkXmlObjectBase(
  formDefinition: FormDefinitionSlovenskoSk,
  body: GenericObjectType,
) {
  return {
    eform: {
      $: {
        xmlns: getSlovenskoSkXmlns(formDefinition),
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      },
      ...body,
    },
  }
}

/**
 * Generates an empty Slovensko SK XML object that can be built with "xml2js" to create a valid XML.
 */
export function getEmptySlovenskoSkXmlObject(formDefinition: FormDefinitionSlovenskoSk) {
  return getSlovenskoSkXmlObjectBase(formDefinition, {
    FormId: '',
    JsonVersion: '',
    Json: JSON.stringify({}),
    Summary: {
      Form: {
        $: {
          title: formDefinition.title,
        },
      },
    },
    TermsAndConditions: '',
  })
}

type GenerateSlovenskoSkXmlObjectParams = {
  formDefinition: FormDefinitionSlovenskoSk
  formId: string
  formSummary: FormSummary
  formData: GenericObjectType
  jsonVersion: string
  serverFiles?: FormsBackendFile[]
}

/**
 * Generates a Slovensko SK XML object that can be built with "xml2js" to create a valid XML.
 */
export async function generateSlovenskoSkXmlObject({
  formDefinition,
  formSummary,
  formId,
  formData,
  jsonVersion,
  serverFiles,
}: GenerateSlovenskoSkXmlObjectParams) {
  return getSlovenskoSkXmlObjectBase(formDefinition, {
    FormId: formId,
    JsonVersion: jsonVersion,
    Json: JSON.stringify(formData),
    Summary: await renderSlovenskoXmlSummary({
      formSummary,
      serverFiles,
    }),
    TermsAndConditions: removeMarkdown(formSummary.termsAndConditions),
  })
}
