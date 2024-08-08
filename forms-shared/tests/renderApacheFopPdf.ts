import { renderApacheFopPdf } from '../test-utils/apache-fop/renderApacheFopPdf'
import { expectPdfToMatchSnapshot } from '../test-utils/expectPdfToMatchSnapshot'

describe('renderApacheFopPdf', () => {
  // Temporary XML/XSL until we start to use it for forms
  const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <title>Sample Document</title>
  <content>This is a test paragraph for Apache FOP 1.1.</content>
</root>
`

  const xslString = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.1" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <xsl:template match="root">
    <fo:root>
      <fo:layout-master-set>
        <fo:simple-page-master master-name="A4" page-height="29.7cm" page-width="21cm" margin-top="1cm" margin-bottom="1cm" margin-left="2cm" margin-right="2cm">
          <fo:region-body/>
        </fo:simple-page-master>
      </fo:layout-master-set>
      <fo:page-sequence master-reference="A4">
        <fo:flow flow-name="xsl-region-body">
          <fo:block font-size="16pt" font-weight="bold" space-after="5mm">
            <xsl:value-of select="title"/>
          </fo:block>
          <fo:block font-size="12pt">
            <xsl:value-of select="content"/>
          </fo:block>
        </fo:flow>
      </fo:page-sequence>
    </fo:root>
  </xsl:template>
</xsl:stylesheet>
`

  it('should render a PDF using Apache FOP that matches the snapshot', async () => {
    const result = await renderApacheFopPdf(xmlString, xslString)

    await expectPdfToMatchSnapshot(result)
  }, 10000)
})
