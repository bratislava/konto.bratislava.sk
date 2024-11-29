"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFoXslt = void 0;
const urls_1 = require("../urls");
const getFoXslt = (formDefinition, 
/* Test environment uses Unix which doesn't have Arial font, Liberation Sans is an open-source alternative */
testEnvironment = false) => `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
  version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:fo="http://www.w3.org/1999/XSL/Format"
  xmlns:e="${(0, urls_1.getSlovenskoSkXmlns)(formDefinition)}"
>
  <xsl:output method="xml" indent="yes" />

  <xsl:template match="/">
    <fo:root>
      <fo:layout-master-set>
        <fo:simple-page-master master-name="A4" page-height="29.7cm" page-width="21cm" margin="2cm">
          <fo:region-body margin-bottom="1.5cm" />
          <fo:region-after extent="1.5cm" />
        </fo:simple-page-master>
      </fo:layout-master-set>
      <fo:page-sequence master-reference="A4" font-family="${testEnvironment ? 'Liberation Sans' : 'Arial'}">
        <fo:static-content flow-name="xsl-region-after">
          <fo:block text-align="center" padding-top="1cm">
            Strana <fo:page-number /> z <fo:page-number-citation ref-id="last-page" />
          </fo:block>
        </fo:static-content>
        <fo:flow flow-name="xsl-region-body">
          <fo:block font-size="24pt" font-weight="bold" space-after="20pt">
            <xsl:value-of select="//e:eform/e:Summary/e:Form/@title" />
          </fo:block>
          <xsl:apply-templates select="//e:eform/e:Summary/e:Form/*" />
          <fo:block font-size="16pt" font-weight="bold" space-before="20pt" space-after="10pt">
            Ochrana osobných údajov
          </fo:block>
          <fo:block>
            <xsl:value-of select="//e:eform/e:TermsAndConditions" />
          </fo:block>
          <fo:block id="last-page" />
        </fo:flow>
      </fo:page-sequence>
    </fo:root>
  </xsl:template>

  <xsl:template match="e:Step">
    <fo:block font-size="16pt" font-weight="bold" space-before="12pt" space-after="6pt">
      <xsl:value-of select="@title" />
    </fo:block>
    <xsl:apply-templates />
  </xsl:template>

  <xsl:template match="e:Field">
    <fo:table width="100%" space-before="3pt" space-after="3pt" border-bottom="1pt solid #CCCCCC">
      <fo:table-column column-width="48%" />
      <fo:table-column column-width="4%" />
      <fo:table-column column-width="48%" />
      <fo:table-body>
        <fo:table-row>
          <fo:table-cell padding-top="3pt" padding-bottom="3pt" start-indent="0pt">
            <fo:block font-weight="bold"><xsl:value-of select="@label" /></fo:block>
          </fo:table-cell>
          <fo:table-cell>
            <fo:block></fo:block>
          </fo:table-cell>
          <fo:table-cell padding-top="3pt" padding-bottom="3pt">
            <fo:block>
              <xsl:apply-templates />
            </fo:block>
          </fo:table-cell>
        </fo:table-row>
      </fo:table-body>
    </fo:table>
  </xsl:template>

  <xsl:template match="e:Array">
    <fo:block space-after="3pt" border-bottom="1pt solid #CCCCCC" padding-bottom="3pt">
      <fo:block font-weight="bold" padding-top="3pt" padding-bottom="3pt">
        <xsl:value-of select="@title" />
      </fo:block>
      <xsl:apply-templates />
    </fo:block>
  </xsl:template>

  <xsl:template match="e:ArrayItem">
    <fo:block border-left="1pt solid black" margin-left="3pt" padding-left="6pt" space-before="6pt" space-after="6pt">
      <fo:block font-weight="bold" margin-bottom="3pt">
        <xsl:value-of select="@title" />
      </fo:block>
      <fo:block margin-left="0pt">
        <xsl:apply-templates />
      </fo:block>
    </fo:block>
  </xsl:template>

  <xsl:template match="e:StringValue">
    <fo:block space-after="3pt"><xsl:value-of select="." /></fo:block>
  </xsl:template>

  <xsl:template match="e:FileValue">
    <fo:block space-after="3pt"><xsl:value-of select="." /></fo:block>
  </xsl:template>

  <xsl:template match="e:InvalidValue">
    <fo:block space-after="3pt">Neznáma hodnota</fo:block>
  </xsl:template>

  <xsl:template match="e:NoneValue">
    <fo:block space-after="3pt">-</fo:block>
  </xsl:template>
</xsl:stylesheet>
`;
exports.getFoXslt = getFoXslt;
