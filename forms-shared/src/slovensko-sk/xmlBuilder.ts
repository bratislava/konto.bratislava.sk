import { Builder } from 'xml2js'
import { GenericObjectType } from '@rjsf/utils'

export const buildSlovenskoSkXml = (
  xmlObject: GenericObjectType,
  {
    headless,
    pretty,
  }: {
    headless: boolean
    pretty: boolean
  },
) => {
  const builder = new Builder({
    xmldec: {
      version: '1.0',
      encoding: 'UTF-8',
    },
    renderOpts: {
      pretty,
    },
    headless,
  })

  return builder.buildObject(xmlObject)
}
