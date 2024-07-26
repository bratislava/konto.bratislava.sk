import { transformXml } from '../test-utils/transformXml'

describe('transformXml', () => {
  const xmlString = `<?xml version="1.0" encoding="ISO-8859-1"?>
<catalog xmlns:foo="http://www.foo.org/" xmlns:bar="http://www.bar.org">
  <foo:cd>
    <title>Empire Burlesque</title>
    <artist>Bob Dylan</artist>
    <country>USA</country>
    <company>Columbia</company>
    <price>10.90</price>
    <bar:year>1985</bar:year>
  </foo:cd>
  <foo:cd>
    <title>Hide your heart</title>
    <artist>Bonnie Tyler</artist>
    <country>UK</country>
    <company>CBS Records</company>
    <price>9.90</price>
    <bar:year>1988</bar:year>
  </foo:cd>
  <foo:cd>
    <title>Greatest Hits</title>
    <artist>Dolly Parton</artist>
    <country>USA</country>
    <company>RCA</company>
    <price>9.90</price>
    <bar:year>1982</bar:year>
  </foo:cd>
</catalog>`

  const xsltString = `<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:foo="http://www.foo.org/" xmlns:bar="http://www.bar.org">
  <xsl:template match="/">
    <html>
      <body>
        <h2>My CD Collection</h2>
        <table border="1">
          <tr bgcolor="#9acd32">
            <th>Title</th>
            <th>Artist</th>
            <th>Country</th>
            <th>Company</th>
            <th>Price</th>
            <th>Year</th>
          </tr>
          <xsl:for-each select="catalog/foo:cd">
            <tr>
              <td><xsl:value-of select="title"/></td>
              <td><xsl:value-of select="artist"/></td>
              <td><xsl:value-of select="country"/></td>
              <td><xsl:value-of select="company"/></td>
              <td><xsl:value-of select="price"/></td>
              <td><xsl:value-of select="bar:year"/></td>
            </tr>
          </xsl:for-each>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`

  it('transforms XML using XSLT', async () => {
    const result = await transformXml(xmlString, xsltString)
    console.log(result)
  })
})
