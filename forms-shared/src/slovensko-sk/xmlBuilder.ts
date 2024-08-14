import { Builder } from 'xml2js'

const builderOptionsBase = {
  xmldec: {
    version: '1.0',
    encoding: 'UTF-8',
  },
  renderOpts: {
    pretty: true,
  },
}

export const slovenskoSkXmlBuilder = new Builder(builderOptionsBase)

export const slovenskoSkXmlBuilderHeadless = new Builder({ ...builderOptionsBase, headless: true })
