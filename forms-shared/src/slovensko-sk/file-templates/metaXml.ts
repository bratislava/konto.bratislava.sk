import { FormDefinitionSlovenskoSk } from '../../definitions/formDefinitionTypes'

import { Builder } from 'xml2js'

export const getMetaXml = (
  formDefinition: FormDefinitionSlovenskoSk,
  validFrom: string,
): string => {
  const builder = new Builder({
    xmldec: { version: '1.0', encoding: 'utf-8' },
    renderOpts: { pretty: true },
  })

  // TODO publisher
  const metaData = {
    'meta:metadata': {
      $: {
        'xmlns:attachment': 'urn:attachment:1.0',
        'xmlns:manifest': 'urn:manifest:1.0',
        'xmlns:attachmentfile': 'urn:attachmentfile:1.0',
        'xmlns:xs': 'http://www.w3.org/2001/XMLSchema',
        'xmlns:setting': 'urn:setting:1.0',
        'xmlns:content': 'urn:content:1.0',
        'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
        'xmlns:presentation': 'urn:presentation:1.0',
        'xmlns:data': 'urn:data:1.0',
        'xmlns:meta': 'urn:meta:1.0',
      },
      'dc:title': formDefinition.title,
      'dc:identifier': `http://data.gov.sk/doc/eform/${formDefinition.pospID}/${formDefinition.pospVersion}`,
      'dc:description': formDefinition.title,
      'dc:creator': formDefinition.gestor,
      'dc:publisher': 'ico://sk/00603481',
      'meta:version': formDefinition.pospVersion,
      'meta:language': 'sk',
      'meta:validDateFrom': validFrom,
      'meta:inForceFrom': validFrom,
    },
  }

  return builder.buildObject(metaData)
}
