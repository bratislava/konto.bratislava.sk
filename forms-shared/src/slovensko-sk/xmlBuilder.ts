import { Builder } from 'xml2js'

export const slovenskoSkXmlBuilder = new Builder({
  xmldec: {
    version: '1.0',
    encoding: 'UTF-8',
  },
  renderOpts: {
    pretty: true,
  },
})
