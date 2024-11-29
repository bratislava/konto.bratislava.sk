"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHtmlSbXslt = void 0;
const urls_1 = require("../urls");
const getHtmlSbXslt = (formDefinition) => `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
  version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:e="${(0, urls_1.getSlovenskoSkXmlns)(formDefinition)}"
>
  <xsl:output
    method="xml"
    indent="yes"
    encoding="UTF-8"
    omit-xml-declaration="yes"
  />
  <xsl:template match="/">
    <xsl:text disable-output-escaping="yes">&lt;!DOCTYPE html&gt;
</xsl:text>
    <html lang="sk">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title><xsl:value-of select="//e:eform/e:Summary/e:Form/@title"/></title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #333;
          }
          .container {
            margin-bottom: 32px;
          }
          .container:last-child {
            margin-bottom: 0;
          }
          h1 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 32px;
          }
          h2 {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 16px;
          }
          .box {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
          }
          .box-text {
            margin: 0;
            white-space: pre-wrap;
          }
          .field {
            border-bottom: 2px solid #e5e5e5;
            padding: 10px 0;
            overflow: hidden;
          }
          .field-label {
            font-weight: bold;
            float: left;
            width: 50%;
            padding-right: 4px;
            box-sizing: border-box;
          }
          .field-value {
            float: right;
            width: 50%;
          }
          .field-value-item {
            margin-bottom: 8px;
            margin-left: 4px;
          }
          .field-value-item:last-child {
            margin-bottom: 0;
          }
          .field-value-string {
            white-space: pre-wrap;
          }
          .array {
            margin-top: 16px;
          }
          .array-title {
            font-weight: bold;
            margin-bottom: 16px;
          }
          .array-item {
            border-left: 4px solid #e5e5e5;
            padding: 0 0 0 12px;
            margin-bottom: 16px;
          }
          .array-item:last-child {
            margin-bottom: 0;
          }
          .array-item-title {
            font-weight: bold;
            margin-bottom: 12px;
          }

          @media (max-width: 767px) {
            .field-label,
            .field-value {
              float: none;
              width: 100%;
            }
            .field-label {
              margin-bottom: 8px;
              padding-right: 0;
            }
            .field-value-item {
              margin-left: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1><xsl:value-of select="//e:eform/e:Summary/e:Form/@title" /></h1>
          <xsl:apply-templates select="//e:eform/e:Summary/e:Form/*" />
        </div>
        <div class="container">
          <h2>Ochrana osobných údajov</h2>
          <div class="box">
            <p class="box-text"><xsl:value-of select="//e:eform/e:TermsAndConditions" /></p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="e:Step">
    <div class="container">
      <h2><xsl:value-of select="@title" /></h2>
      <div>
        <xsl:apply-templates />
      </div>
    </div>
  </xsl:template>

  <xsl:template match="e:Field">
    <div class="field">
      <div class="field-label"><xsl:value-of select="@label" /></div>
      <div class="field-value">
        <xsl:apply-templates />
      </div>
    </div>
  </xsl:template>

  <xsl:template match="e:StringValue">
    <div class="field-value-item">
      <span class="field-value-string"><xsl:value-of select="." /></span>
    </div>
  </xsl:template>

  <xsl:template match="e:FileValue">
    <div class="field-value-item">
      <span><xsl:value-of select="." /></span>
    </div>
  </xsl:template>

  <xsl:template match="e:NoneValue">
    <div class="field-value-item">
      <span>-</span>
    </div>
  </xsl:template>

  <xsl:template match="e:InvalidValue">
    <div class="field-value-item">
      <span class="field-value-error">Neznáma hodnota</span>
    </div>
  </xsl:template>

  <xsl:template match="e:Array">
    <div class="array">
      <div class="array-title"><xsl:value-of select="@title" /></div>
      <xsl:apply-templates />
    </div>
  </xsl:template>

  <xsl:template match="e:ArrayItem">
    <div class="array-item">
      <div class="array-item-title"><xsl:value-of select="@title" /></div>
      <div>
        <xsl:apply-templates />
      </div>
    </div>
  </xsl:template>
</xsl:stylesheet>
`;
exports.getHtmlSbXslt = getHtmlSbXslt;
