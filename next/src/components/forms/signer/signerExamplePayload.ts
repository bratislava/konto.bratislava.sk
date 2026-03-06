import { v4 } from 'uuid'

const xdcXMLData = `<?xml version="1.0" encoding="UTF-8"?>
<GeneralAgenda xmlns="http://schemas.gov.sk/form/App.GeneralAgenda/1.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
   <subject xsi:nil="true" />
   <text xsi:nil="true" />
</GeneralAgenda>`

const xdcUsedXSD = `<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns="http://schemas.gov.sk/form/App.GeneralAgenda/1.9" elementFormDefault="qualified" attributeFormDefault="unqualified" targetNamespace="http://schemas.gov.sk/form/App.GeneralAgenda/1.9">
   <xs:simpleType name="textArea">
      <xs:restriction base="xs:string" />
   </xs:simpleType>
   <xs:simpleType name="meno">
      <xs:restriction base="xs:string" />
   </xs:simpleType>
   <xs:element name="GeneralAgenda">
      <xs:complexType>
         <xs:sequence>
            <xs:element name="subject" type="meno" minOccurs="0" nillable="true" />
            <xs:element name="text" type="textArea" minOccurs="0" nillable="true" />
         </xs:sequence>
      </xs:complexType>
   </xs:element>
</xs:schema>`

const xdcUsedXSLT = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:egonp="http://schemas.gov.sk/form/App.GeneralAgenda/1.9" version="1.0">
   <xsl:output method="text" indent="yes" omit-xml-declaration="yes" />
   <xsl:strip-space elements="*" />
   <xsl:template match="egonp:GeneralAgenda">
      <xsl:text>Všeobecná agenda</xsl:text>
      <xsl:apply-templates />
   </xsl:template>
   <xsl:template match="egonp:GeneralAgenda/egonp:subject">
      <xsl:if test="./text()">
         <xsl:text />
         <xsl:text />
         <xsl:text>Predmet:</xsl:text>
         <xsl:call-template name="string-replace-all">
            <xsl:with-param name="text" select="." />
            <xsl:with-param name="replace" select="'&#xA;'" />
            <xsl:with-param name="by" select="'&#xD;&#xA;&#x9;'" />
         </xsl:call-template>
      </xsl:if>
   </xsl:template>
   <xsl:template match="egonp:GeneralAgenda/egonp:text">
      <xsl:if test="./text()">
         <xsl:text />
         <xsl:text />
         <xsl:text>Text:</xsl:text>
         <xsl:call-template name="string-replace-all">
            <xsl:with-param name="text" select="." />
            <xsl:with-param name="replace" select="'&#xA;'" />
            <xsl:with-param name="by" select="'&#xD;&#xA;&#x9;'" />
         </xsl:call-template>
      </xsl:if>
   </xsl:template>
   <xsl:template name="formatToSkDate">
      <xsl:param name="date" />
      <xsl:variable name="dateString" select="string($date)" />
      <xsl:choose>
         <xsl:when test="$dateString != '' and string-length($dateString)=10 and string(number(substring($dateString, 1, 4))) != 'NaN' ">
            <xsl:value-of select="concat(substring($dateString, 9, 2), '.', substring($dateString, 6, 2), '.', substring($dateString, 1, 4))" />
         </xsl:when>
         <xsl:otherwise>
            <xsl:value-of select="$dateString" />
         </xsl:otherwise>
      </xsl:choose>
   </xsl:template>
   <xsl:template name="booleanCheckboxToString">
      <xsl:param name="boolValue" />
      <xsl:variable name="boolValueString" select="string($boolValue)" />
      <xsl:choose>
         <xsl:when test="$boolValueString = 'true' ">
            <xsl:text>Áno</xsl:text>
         </xsl:when>
         <xsl:when test="$boolValueString = 'false' ">
            <xsl:text>Nie</xsl:text>
         </xsl:when>
         <xsl:when test="$boolValueString = '1' ">
            <xsl:text>Áno</xsl:text>
         </xsl:when>
         <xsl:when test="$boolValueString = '0' ">
            <xsl:text>Nie</xsl:text>
         </xsl:when>
         <xsl:otherwise>
            <xsl:value-of select="$boolValueString" />
         </xsl:otherwise>
      </xsl:choose>
   </xsl:template>
   <xsl:template name="formatTimeTrimSeconds">
      <xsl:param name="time" />
      <xsl:variable name="timeString" select="string($time)" />
      <xsl:if test="$timeString != ''">
         <xsl:value-of select="substring($timeString, 1, 5)" />
      </xsl:if>
   </xsl:template>
   <xsl:template name="formatTime">
      <xsl:param name="time" />
      <xsl:variable name="timeString" select="string($time)" />
      <xsl:if test="$timeString != ''">
         <xsl:value-of select="substring($timeString, 1, 8)" />
      </xsl:if>
   </xsl:template>
   <xsl:template name="string-replace-all">
      <xsl:param name="text" />
      <xsl:param name="replace" />
      <xsl:param name="by" />
      <xsl:choose>
         <xsl:when test="contains($text, $replace)">
            <xsl:value-of select="substring-before($text,$replace)" />
            <xsl:value-of select="$by" />
            <xsl:call-template name="string-replace-all">
               <xsl:with-param name="text" select="substring-after($text,$replace)" />
               <xsl:with-param name="replace" select="$replace" />
               <xsl:with-param name="by" select="$by" />
            </xsl:call-template>
         </xsl:when>
         <xsl:otherwise>
            <xsl:value-of select="$text" />
         </xsl:otherwise>
      </xsl:choose>
   </xsl:template>
   <xsl:template name="formatToSkDateTime">
      <xsl:param name="dateTime" />
      <xsl:variable name="dateTimeString" select="string($dateTime)" />
      <xsl:choose>
         <xsl:when test="$dateTimeString!= '' and string-length($dateTimeString)&gt;18 and string(number(substring($dateTimeString, 1, 4))) != 'NaN' ">
            <xsl:value-of select="concat(substring($dateTimeString, 9, 2), '.', substring($dateTimeString, 6, 2), '.', substring($dateTimeString, 1, 4),' ', substring($dateTimeString, 12, 2),':', substring($dateTimeString, 15, 2))" />
         </xsl:when>
         <xsl:otherwise>
            <xsl:value-of select="$dateTimeString" />
         </xsl:otherwise>
      </xsl:choose>
   </xsl:template>
   <xsl:template name="formatToSkDateTimeSecond">
      <xsl:param name="dateTime" />
      <xsl:variable name="dateTimeString" select="string($dateTime)" />
      <xsl:choose>
         <xsl:when test="$dateTimeString!= '' and string-length($dateTimeString)&gt;18 and string(number(substring($dateTimeString, 1, 4))) != 'NaN' ">
            <xsl:value-of select="concat(substring($dateTimeString, 9, 2), '.', substring($dateTimeString, 6, 2), '.', substring($dateTimeString, 1, 4),' ', substring($dateTimeString, 12, 2),':', substring($dateTimeString, 15, 2),':', substring($dateTimeString, 18, 2))" />
         </xsl:when>
         <xsl:otherwise>
            <xsl:value-of select="$dateTimeString" />
         </xsl:otherwise>
      </xsl:choose>
   </xsl:template>
</xsl:stylesheet>`

/**
 * This is just an example payload for the signer until we have a proper implementation.
 */
export const signerExamplePayload = {
  objectId: 'Vseobecna_agenda.xml',
  objectDescription: 'Všeobecná agenda',
  objectFormatIdentifier: 'http://schemas.gov.sk/form/App.GeneralAgenda/1.9',
  xdcXMLData,
  xdcIdentifier: 'http://data.gov.sk/doc/eform/App.GeneralAgenda/1.9',
  xdcVersion: '1.9',
  xdcUsedXSD,
  xsdReferenceURI: 'http://schemas.gov.sk/form/App.GeneralAgenda/1.9/form.xsd',
  xdcUsedXSLT,
  xslReferenceURI: 'http://schemas.gov.sk/form/App.GeneralAgenda/1.9/form.xslt',
  xslMediaDestinationTypeDescription: 'TXT',
  xslXSLTLanguage: 'sk',
  xslTargetEnvironment: '',
  xdcIncludeRefs: true,
  xdcNamespaceURI: 'http://data.gov.sk/def/container/xmldatacontainer+xml/1.1',
  signatureId: `id_${v4()}_${new Date()
    .toISOString()
    .replaceAll(/[^\dT]/g, '')
    .replaceAll('T', '-')}`,
  digestAlgUrl: '',
  signaturePolicyIdentifier: '',
}
