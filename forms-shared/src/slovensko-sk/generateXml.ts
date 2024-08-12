import { FormDefinitionSlovenskoSk } from '../definitions/formDefinitionTypes'
import { GenericObjectType } from '@rjsf/utils'
import { renderSlovenskoXmlSummary } from './renderXmlSummary'
import removeMarkdown from 'remove-markdown'
import { FormsBackendFile } from '../form-files/serverFilesTypes'
import { getSlovenskoSkXmlns } from './urls'
import { slovenskoSkXmlBuilder, slovenskoSkXmlBuilderHeadless } from './xmlBuilder'

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
  headless = false,
) {
  const xml = getSlovenskoSkXmlBase(formDefinition, {
    Json: JSON.stringify(formData),
    Summary: await renderSlovenskoXmlSummary(formDefinition, formData, serverFiles),
    TermsAndConditions: removeMarkdown(formDefinition.termsAndConditions),
  })

  const builder = headless ? slovenskoSkXmlBuilderHeadless : slovenskoSkXmlBuilder
  return builder.buildObject(xml)
}
