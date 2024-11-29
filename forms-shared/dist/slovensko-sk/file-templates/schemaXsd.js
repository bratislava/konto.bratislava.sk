"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSchemaXsd = void 0;
const urls_1 = require("../urls");
const getSchemaXsd = (formDefinition) => `<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns="${(0, urls_1.getSlovenskoSkXmlns)(formDefinition)}"
           xmlns:xs="http://www.w3.org/2001/XMLSchema"
           targetNamespace="${(0, urls_1.getSlovenskoSkXmlns)(formDefinition)}" 
           elementFormDefault="qualified" 
           attributeFormDefault="unqualified">

  <xs:element name="eform">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="JsonVersion" type="xs:string"/>
        <xs:element name="Json" type="xs:string"/>
        <xs:element name="Summary" type="SummaryType"/>
        <xs:element name="TermsAndConditions" type="xs:string"/>
      </xs:sequence>
    </xs:complexType>
  </xs:element>

  <xs:complexType name="SummaryType">
    <xs:sequence>
      <xs:element name="Form" type="FormType"/>
    </xs:sequence>
  </xs:complexType>

  <xs:complexType name="FormType">
    <xs:sequence>
      <xs:element name="Step" type="StepType" minOccurs="0" maxOccurs="unbounded"/>
    </xs:sequence>
    <xs:attribute name="title" type="xs:string" use="required"/>
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

</xs:schema>`;
exports.getSchemaXsd = getSchemaXsd;
