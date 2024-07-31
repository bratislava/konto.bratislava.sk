export const pdfFop = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:fo="http://www.w3.org/1999/XSL/Format"
                xmlns:e="http://schemas.gov.sk/form/esmao.eforms.bratislava.obec_024/201501.2">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <fo:root>
      <fo:layout-master-set>
        <fo:simple-page-master master-name="A4" page-height="29.7cm" page-width="21cm" margin="2cm">
          <fo:region-body/>
        </fo:simple-page-master>
      </fo:layout-master-set>
      <fo:page-sequence master-reference="A4">
        <fo:flow flow-name="xsl-region-body">
          <xsl:apply-templates select="//e:E-form/e:Body/e:Summary/e:Form/*"/>
          
          <!-- Add the "Ochrana osobných údajov" section -->
          <fo:block font-size="16pt" font-weight="bold" space-before="20pt" space-after="10pt">
            Ochrana osobných údajov
          </fo:block>
          <fo:block>
            <xsl:value-of select="//e:E-form/e:Body/e:TermsAndConditions"/>
          </fo:block>
        </fo:flow>
      </fo:page-sequence>
    </fo:root>
  </xsl:template>

  <xsl:template match="e:Step">
    <fo:block font-size="16pt" font-weight="bold" space-before="12pt" space-after="6pt">
      <xsl:value-of select="@title"/>
    </fo:block>
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="e:Field">
    <fo:table width="100%" space-before="3pt" space-after="3pt" border-bottom="1pt solid #CCCCCC">
      <fo:table-column column-width="50%"/>
      <fo:table-column column-width="50%"/>
      <fo:table-body>
        <fo:table-row>
          <fo:table-cell padding-top="3pt" padding-bottom="3pt" start-indent="0pt">
            <fo:block><xsl:value-of select="@label"/></fo:block>
          </fo:table-cell>
          <fo:table-cell padding-top="3pt" padding-bottom="3pt">
            <fo:block>
              <xsl:apply-templates/>
            </fo:block>
          </fo:table-cell>
        </fo:table-row>
      </fo:table-body>
    </fo:table>
  </xsl:template>

  <xsl:template match="e:Array">
    <fo:block space-after="3pt" border-bottom="1pt solid #CCCCCC" padding-bottom="3pt">
      <fo:block padding-top="3pt" padding-bottom="3pt">
        <xsl:value-of select="@title"/>
      </fo:block>
      <xsl:apply-templates/>
    </fo:block>
  </xsl:template>

  <xsl:template match="e:ArrayItem">
    <fo:block border-left="1pt solid black" margin-left="3pt" padding-left="6pt" space-before="6pt" space-after="6pt">
      <fo:block font-weight="bold" margin-bottom="3pt">
        <xsl:value-of select="@title"/>
      </fo:block>
      <fo:block margin-left="0pt">
        <xsl:apply-templates/>
      </fo:block>
    </fo:block>
  </xsl:template>

  <xsl:template match="e:StringValue">
    <fo:block space-after="3pt"><xsl:value-of select="."/></fo:block>
  </xsl:template>

  <xsl:template match="e:NoneValue">
    <fo:block space-after="3pt">-</fo:block>
  </xsl:template>

</xsl:stylesheet>`
