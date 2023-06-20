export default `<?xml version="1.0" encoding="utf-8"?>
<xs:schema elementFormDefault="qualified" xmlns="http://schemas.gov.sk/doc/eform/00603481.ziadostOUzemnoplanovaciuInformaciu.sk/0.1" xmlns:xs="http://www.w3.org/2001/XMLSchema" targetNamespace="http://schemas.gov.sk/doc/eform/00603481.ziadostOUzemnoplanovaciuInformaciu.sk/0.1">
  <xs:element name="E-form">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="Meta" type="E-formMetaType"/>
        <xs:element name="Body" type="E-formBodyType">
          
        </xs:element>
      </xs:sequence>
    </xs:complexType>
  </xs:element>

  <xs:complexType name="E-formMetaType">
    <xs:annotation>
      <xs:documentation>Metaúdaje elektronického formulára</xs:documentation>
    </xs:annotation>
    <xs:sequence>
      <xs:element name="ID" type="xs:string"/>
      <xs:element name="Name" type="xs:string"/>
      <xs:element name="Description" type="xs:string" minOccurs="0"/>
      <xs:element name="Gestor" type="xs:string"/>
      <xs:element name="RecipientId" type="xs:string"/>
      <xs:element name="Version" type="xs:string"/>
      <xs:element name="ZepRequired" type="xs:boolean"/>
      <xs:element name="EformUuid" type="xs:string"/>
      <xs:element name="SenderID" type="xs:string" default="mailto:"/>
    </xs:sequence>
  </xs:complexType>

  <xs:complexType name="EnumerationType">
    <xs:annotation>
      <xs:documentation>Položka číselníka</xs:documentation>
    </xs:annotation>
    <xs:sequence>
      <xs:element name="Code" type="xs:string">
        <xs:annotation>
          <xs:documentation>Kód</xs:documentation>
        </xs:annotation>
      </xs:element>
      <xs:element name="Name" type="xs:string">
        <xs:annotation>
          <xs:documentation>Názov</xs:documentation>
        </xs:annotation>
      </xs:element>
      <xs:element name="WsEnumCode" type="xs:string">
        <xs:annotation>
          <xs:documentation>Kod ciselnika WS sluzby</xs:documentation>
        </xs:annotation>
      </xs:element>
    </xs:sequence>
  </xs:complexType>

  <xs:complexType name="PrilohaType">
    <xs:annotation>
      <xs:documentation>Priložená príloha</xs:documentation>
    </xs:annotation>
    <xs:sequence>
      <xs:element name="Nazov" type="xs:string">
        <xs:annotation>
          <xs:documentation>Názov</xs:documentation>
        </xs:annotation>
      </xs:element>
      <xs:element name="Prilozena" type="xs:boolean">
        <xs:annotation>
          <xs:documentation>Indikátor či bola príloha priložená</xs:documentation>
        </xs:annotation>
      </xs:element>
    </xs:sequence>
  </xs:complexType>

<xs:complexType name="PrilohyType"><xs:sequence><xs:element name="ArchitektonickaStudia" type="PrilohaType" minOccurs="1" maxOccurs="unbounded"/></xs:sequence></xs:complexType><xs:simpleType name="ZiatetelTypType"><xs:restriction base="xs:string"><xs:enumeration value="Fyzická osoba"/><xs:enumeration value="Fyzická osoba - podnikateľ"/><xs:enumeration value="Právnicka osoba"/></xs:restriction></xs:simpleType><xs:simpleType name="ZiadatelMenoPriezviskoType"><xs:restriction base="xs:string"><xs:pattern value=".*[ ].*"/></xs:restriction></xs:simpleType><xs:complexType name="ZiadatelMestoPscType"><xs:sequence><xs:element name="ZiadatelMesto" type="EnumerationType" minOccurs="1" maxOccurs="1"/><xs:element name="ZiadatelPsc" type="xs:string" minOccurs="1" maxOccurs="1"/></xs:sequence></xs:complexType><xs:simpleType name="ZiadatelTelefonType"><xs:restriction base="xs:string"><xs:pattern value="((([+][1-9])|([+][1-9][0-9]{1,12}))|((00[1-9])|(00[1-9][0-9]{1,11})))"/></xs:restriction></xs:simpleType><xs:complexType name="ZiadatelType"><xs:sequence><xs:element name="ZiatetelTyp" type="ZiatetelTypType" minOccurs="1" maxOccurs="1"/><xs:element name="ZiadatelMenoPriezvisko" type="ZiadatelMenoPriezviskoType" minOccurs="0" maxOccurs="1"/><xs:element name="ZiadatelObchodneMeno" type="xs:string" minOccurs="0" maxOccurs="1"/><xs:element name="ZiadatelIco" type="xs:integer" minOccurs="0" maxOccurs="1"/><xs:element name="ZiadatelAdresaPobytu" type="xs:string" minOccurs="0" maxOccurs="1"/><xs:element name="ZiadatelMiestoPodnikania" type="xs:string" minOccurs="0" maxOccurs="1"/><xs:element name="ZiadatelAdresaSidla" type="xs:string" minOccurs="0" maxOccurs="1"/><xs:element name="ZiadatelMestoPsc" type="ZiadatelMestoPscType" minOccurs="0" maxOccurs="1"/><xs:element name="ZiadatelKontaktnaOsoba" type="xs:string" minOccurs="0" maxOccurs="1"/><xs:element name="ZiadatelEmail" type="xs:string" minOccurs="1" maxOccurs="1"/><xs:element name="ZiadatelTelefon" type="ZiadatelTelefonType" minOccurs="1" maxOccurs="1"/></xs:sequence></xs:complexType><xs:simpleType name="StavbaDovodType"><xs:restriction base="xs:string"><xs:enumeration value="Stavba objektu"/><xs:enumeration value="Informatívne zisťovanie"/><xs:enumeration value="Vyňatie pozemku z pozemkového fondu"/><xs:enumeration value="Súdnoznalecký posudok"/><xs:enumeration value="Iné"/></xs:restriction></xs:simpleType><xs:complexType name="StavbaType"><xs:sequence><xs:element name="StavbaDovod" type="StavbaDovodType" minOccurs="1" maxOccurs="1"/><xs:element name="StavbaUlica" type="xs:string" minOccurs="1" maxOccurs="1"/><xs:element name="StavbaParcela" type="xs:string" minOccurs="1" maxOccurs="1"/><xs:element name="StavbaKataster" type="xs:string" minOccurs="1" maxOccurs="unbounded"/></xs:sequence></xs:complexType><xs:complexType name="E-formBodyType"><xs:sequence><xs:element name="Prilohy" type="PrilohyType" minOccurs="1" maxOccurs="1"/><xs:element name="Ziadatel" type="ZiadatelType" minOccurs="1" maxOccurs="1"/><xs:element name="Stavba" type="StavbaType" minOccurs="1" maxOccurs="1"/></xs:sequence></xs:complexType></xs:schema>`
