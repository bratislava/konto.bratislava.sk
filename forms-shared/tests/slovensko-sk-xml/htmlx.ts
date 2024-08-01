import { FormDefinitionSlovenskoSk } from '../../src/definitions/formDefinitionTypes'

export type Xpayload = {
  formDefinition: FormDefinitionSlovenskoSk
}

export const getHtmlx = ({ formDefinition }: Xpayload) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns="http://www.w3.org/1999/xhtml"
                xmlns:e="http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}">

  <xsl:output method="xml" indent="yes" encoding="UTF-8" doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"/>

  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="sk" lang="sk">
      <head>
        <title><xsl:value-of select="//e:E-form/e:Meta/e:Name"/></title>
        <style type="text/css">
          .mb-4 {
     margin-bottom: 16px;
}
 .mt-4 {
     margin-top: 16px;
}
 .flex {
     display: flex;
}
 .flex-1 {
     flex: 1 1 0%;
}
 .shrink-0 {
     flex-shrink: 0;
}
 .flex-row {
     flex-direction: row;
}
 .flex-col {
     flex-direction: column;
}
 .flex-nowrap {
     flex-wrap: nowrap;
}
 .items-center {
     align-items: center;
}
 .gap-2 {
     gap: 8px;
}
 .gap-4 {
     gap: 16px;
}
 .gap-6 {
     gap: 24px;
}
 .gap-8 {
     gap: 32px;
}
 .whitespace-pre-wrap {
     white-space: pre-wrap;
}
 .rounded-xl {
     border-radius: 12px;
}
 .border {
     border-width: 1px;
}
 .border-b-2 {
     border-bottom-width: 2px;
}
 .border-gray-200 {
     border-color: rgb(229, 231, 235);
}
 .bg-gray-50 {
     background-color: rgb(249, 250, 251);
}
 .p-6 {
     padding: 24px;
}
 .py-2 {
     padding-top: 8px;
     padding-bottom: 8px;
}
 .py-2.5 {
     padding-top: 10px;
     padding-bottom: 10px;
}
 .font-sans {
     font-family: Inter, sans-serif;
}
 .text-2xl {
     font-size: 24px;
     line-height: 32px;
}
 .text-xl {
     font-size: 20px;
     line-height: 28px;
}
 .font-semibold {
     font-weight: 600;
}
 .text-[#333] {
     color: rgb(51, 51, 51);
}
 .text-red-500 {
     color: rgb(239, 68, 68);
}
        </style>
      </head>
      <body class="font-sans text-[#333]">
        <div class="flex flex-col gap-8">
          <div class="flex flex-col gap-8">
            <h1 class="text-2xl font-semibold"><xsl:value-of select="//e:E-form/e:Meta/e:Name"/></h1>
            <xsl:apply-templates select="//e:E-form/e:Body/e:Summary/e:Form/*"/>
          </div>
          <div class="flex flex-col gap-4">
            <h2 class="text-xl font-semibold">Ochrana osobných údajov</h2>
            <div class="rounded-xl bg-gray-50 p-6">
              <p><xsl:value-of select="//e:E-form/e:Body/e:TermsAndConditions"/></p>
            </div>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="e:Step">
    <div class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold"><xsl:value-of select="@title"/></h2>
      <div>
        <xsl:apply-templates/>
      </div>
    </div>
  </xsl:template>

  <xsl:template match="e:Field">
    <div class="flex flex-row flex-nowrap gap-2 border-b-2 py-2.5 border-gray-200">
      <p class="font-semibold flex-1"><xsl:value-of select="@label"/></p>
      <div class="flex flex-1 flex-col gap-2">
        <xsl:apply-templates/>
      </div>
    </div>
  </xsl:template>

  <xsl:template match="e:StringValue">
    <span class="whitespace-pre-wrap"><xsl:value-of select="."/></span>
  </xsl:template>

  <xsl:template match="e:FileValue">
    <div class="flex items-center gap-2">
      <div class="shrink-0">
        <!-- You might want to replace this with an actual file icon -->
        <span>[File Icon]</span>
      </div>
      <span><xsl:value-of select="."/></span>
    </div>
  </xsl:template>

  <xsl:template match="e:NoneValue">
    <span>-</span>
  </xsl:template>

  <xsl:template match="e:InvalidValue">
    <span class="text-red-500">Neznáma hodnota</span>
  </xsl:template>

  <xsl:template match="e:Array">
    <div class="mt-4">
      <div class="mb-4 font-semibold"><xsl:value-of select="@title"/></div>
      <xsl:apply-templates/>
    </div>
  </xsl:template>

  <xsl:template match="e:ArrayItem">
    <div class="flex flex-col mb-4 rounded-xl border border-gray-200 p-6 gap-6">
      <span class="font-semibold"><xsl:value-of select="@title"/></span>
      <div>
        <xsl:apply-templates/>
      </div>
    </div>
  </xsl:template>

</xsl:stylesheet>`
}

export const getXsd = ({ formDefinition }: Xpayload) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
           targetNamespace="http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}"
           xmlns="http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}"
           elementFormDefault="qualified">

  <xs:element name="E-form">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="Meta" type="MetaType"/>
        <xs:element name="Body" type="BodyType"/>
      </xs:sequence>
    </xs:complexType>
  </xs:element>

  <xs:complexType name="MetaType">
    <xs:sequence>
      <xs:element name="ID" type="xs:string"/>
      <xs:element name="Name" type="xs:string"/>
      <xs:element name="Gestor" type="xs:string"/>
      <xs:element name="RecipientId" type="xs:string"/>
      <xs:element name="Version" type="xs:string"/>
      <xs:element name="ZepRequired" type="xs:boolean"/>
      <xs:element name="EformUuid" type="xs:string"/>
      <xs:element name="SenderID" type="xs:string"/>
    </xs:sequence>
  </xs:complexType>

  <xs:complexType name="BodyType">
    <xs:sequence>
      <xs:element name="Json" type="xs:string"/>
      <xs:element name="Summary" type="SummaryType"/>
      <xs:element name="TermsAndConditions" type="xs:string"/>
    </xs:sequence>
  </xs:complexType>

  <xs:complexType name="SummaryType">
    <xs:sequence>
      <xs:element name="Form" type="FormType"/>
    </xs:sequence>
  </xs:complexType>

  <xs:complexType name="FormType">
    <xs:sequence>
      <xs:element name="Step" type="StepType" minOccurs="0" maxOccurs="unbounded"/>
    </xs:sequence>
  </xs:complexType>

  <xs:complexType name="StepType">
    <xs:choice minOccurs="0" maxOccurs="unbounded">
      <xs:element name="Field" type="FieldType"/>
      <xs:element name="Array" type="ArrayType"/>
    </xs:choice>
    <xs:attribute name="id" type="xs:string" use="required"/>
    <xs:attribute name="title" type="xs:string" use="required"/>
  </xs:complexType>

  <xs:complexType name="ArrayType">
    <xs:sequence>
      <xs:element name="ArrayItem" type="ArrayItemType" minOccurs="0" maxOccurs="unbounded"/>
    </xs:sequence>
    <xs:attribute name="id" type="xs:string" use="required"/>
    <xs:attribute name="title" type="xs:string" use="required"/>
  </xs:complexType>

  <xs:complexType name="ArrayItemType">
    <xs:choice minOccurs="0" maxOccurs="unbounded">
      <xs:element name="Field" type="FieldType"/>
      <xs:element name="Array" type="ArrayType"/>
    </xs:choice>
    <xs:attribute name="id" type="xs:string" use="required"/>
    <xs:attribute name="title" type="xs:string" use="required"/>
  </xs:complexType>

  <xs:complexType name="FieldType">
    <xs:choice minOccurs="0" maxOccurs="unbounded">
      <xs:element name="StringValue" type="xs:string"/>
      <xs:element name="FileValue" type="FileValueType"/>
      <xs:element name="NoneValue">
        <xs:complexType/>
      </xs:element>
      <xs:element name="InvalidValue">
        <xs:complexType/>
      </xs:element>
    </xs:choice>
    <xs:attribute name="id" type="xs:string" use="required"/>
    <xs:attribute name="label" type="xs:string" use="required"/>
  </xs:complexType>

  <xs:complexType name="FileValueType">
    <xs:simpleContent>
      <xs:extension base="xs:string">
        <xs:attribute name="id" type="xs:string" use="required"/>
      </xs:extension>
    </xs:simpleContent>
  </xs:complexType>

</xs:schema>`
}
