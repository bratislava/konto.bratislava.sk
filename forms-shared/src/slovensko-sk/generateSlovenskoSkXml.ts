import { FormDefinitionSlovenskoSk } from '../definitions/formDefinitionTypes'
import { GenericObjectType } from '@rjsf/utils'
import { renderSlovenskoXmlSummary } from './renderSlovenskoXmlSummary'
import { Builder } from 'xml2js'
import removeMarkdown from 'remove-markdown'
import { FormsBackendFile } from '../form-files/serverFilesTypes'

const builder = new Builder({
  xmldec: {
    version: '1.0',
    encoding: 'UTF-8',
  },
  renderOpts: {
    pretty: true,
  },
})

export async function generateSlovenskoSkXml(
  formDefinition: FormDefinitionSlovenskoSk,
  formData: GenericObjectType,
  serverFiles?: FormsBackendFile[],
) {
  const xml = {
    'E-form': {
      $: {
        xmlns: `http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}`,
        'xsi:schemaLocation': `http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion} schema.xsd`,
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      },
      Meta: {
        ID: formDefinition.pospID,
        Name: formDefinition.title,
        Gestor: formDefinition.gestor,
        RecipientId: '',
        Version: formDefinition.pospVersion,
        ZepRequired: '0',
        EformUuid: 'string',
        SenderID: 'mailto:',
      },
      Body: {
        Json: JSON.stringify(formData),
        Summary: await renderSlovenskoXmlSummary(formDefinition, formData, serverFiles),
        TermsAndConditions: removeMarkdown(formDefinition.termsAndConditions),
      },
    },
  }

  return builder.buildObject(xml)
}
