import { FormDefinitionSlovenskoSk } from '../definitions/formDefinitionTypes'
import { GenericObjectType } from '@rjsf/utils'
import { renderSlovenskoXmlSummary } from './renderXmlSummary'
import removeMarkdown from 'remove-markdown'
import { FormsBackendFile } from '../form-files/serverFilesTypes'
import { getSlovenskoSkXmlns } from './urls'

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

export function getEmptySlovenskoSkXmlObject(formDefinition: FormDefinitionSlovenskoSk) {
  return getSlovenskoSkXmlObjectBase(formDefinition, {
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

export async function generateSlovenskoSkXmlObject(
  formDefinition: FormDefinitionSlovenskoSk,
  formData: GenericObjectType,
  serverFiles?: FormsBackendFile[],
) {
  return getSlovenskoSkXmlObjectBase(formDefinition, {
    Json: JSON.stringify(formData),
    Summary: await renderSlovenskoXmlSummary(formDefinition, formData, serverFiles),
    TermsAndConditions: removeMarkdown(formDefinition.termsAndConditions),
  })
}
