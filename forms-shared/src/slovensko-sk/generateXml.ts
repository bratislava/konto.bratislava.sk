import { FormDefinitionSlovenskoSk } from '../definitions/formDefinitionTypes'
import { GenericObjectType } from '@rjsf/utils'
import { renderSlovenskoXmlSummary } from './renderXmlSummary'
import removeMarkdown from 'remove-markdown'
import { FormsBackendFile } from '../form-files/serverFilesTypes'
import { getSlovenskoSkXmlns } from './urls'
import { slovenskoSkXmlBuilder } from './xmlBuilder'

function getSlovenskoSkXmlBase(formDefinition: FormDefinitionSlovenskoSk, body: GenericObjectType) {
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

export function getEmptySlovenskoSkXml(formDefinition: FormDefinitionSlovenskoSk) {
  const xml = getSlovenskoSkXmlBase(formDefinition, {
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

  return slovenskoSkXmlBuilder.buildObject(xml)
}

export async function generateSlovenskoSkXml(
  formDefinition: FormDefinitionSlovenskoSk,
  formData: GenericObjectType,
  serverFiles?: FormsBackendFile[],
) {
  const xml = getSlovenskoSkXmlBase(formDefinition, {
    Json: JSON.stringify(formData),
    Summary: await renderSlovenskoXmlSummary(formDefinition, formData, serverFiles),
    TermsAndConditions: removeMarkdown(formDefinition.termsAndConditions),
  })

  return slovenskoSkXmlBuilder.buildObject(xml)
}
