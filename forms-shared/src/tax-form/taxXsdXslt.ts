// MedzinarodneVolacieCislo and email validation different than in the original $SCHEMA_URI xsd
// the original has incorrect regex format, we've removed the validation here
import { FormDefinitionSlovenskoSkTax } from '../definitions/formDefinitionTypes'

const TAX_XSD = `<?xml version="1.0" encoding="utf-8"?>
<xs:schema elementFormDefault="qualified"
	xmlns:xs="http://www.w3.org/2001/XMLSchema"
	xmlns="$SCHEMA_URI"
	xmlns:tns="$SCHEMA_URI"
	xmlns:base="http://schemas.gov.sk/form/esmao/base/1.0" targetNamespace="$SCHEMA_URI">
	<xs:complexType name="AdresaType">
		<xs:sequence>
			<xs:element name="Meno" type="xs:string" minOccurs="0" maxOccurs="1" />
			<xs:element name="Priezvisko" type="xs:string" minOccurs="0" maxOccurs="1" />
			<xs:element name="ObchodneMenoNazov" type="xs:string" minOccurs="0" maxOccurs="1" />
			<xs:element name="UlicaACislo" type="UlicaACisloType" minOccurs="0" maxOccurs="1" />
			<xs:element name="POBOX" type="xs:string" minOccurs="0" maxOccurs="1" />
			<xs:element name="PoschodieACisloBytu" type="xs:string" minOccurs="0" maxOccurs="1" />
			<xs:element name="PSC" type="xs:string" minOccurs="0" maxOccurs="1" />
			<xs:element name="Obec" type="EnumerationValueType" />
			<xs:element name="CastObce" type="xs:string" minOccurs="0" maxOccurs="1" />
			<xs:element name="Stat" type="StatType" minOccurs="0" maxOccurs="1" />
		</xs:sequence>
	</xs:complexType>
	<xs:simpleType name="AdresatPodaniaEnumType">
		<xs:restriction base="xs:string">
			<xs:enumeration value="Mesto" />
			<xs:enumeration value="Mestská časť" />
		</xs:restriction>
	</xs:simpleType>
	<xs:complexType name="AdresatPodaniaType">
		<xs:sequence>
			<xs:element name="AdresatPodania" type="AdresatPodaniaEnumType" />
			<xs:element name="MestskaCast" type="EnumerationValueType" minOccurs="0" maxOccurs="1" />
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="CheckboxType">
		<xs:sequence>
			<xs:element name="Notifikacia" type="xs:boolean" minOccurs="0" />
		</xs:sequence>
	</xs:complexType>
	<xs:simpleType name="DesatinneCisloPresnostNaDveDesatinneMiesta">
		<xs:restriction base="xs:decimal">
			<xs:fractionDigits value="2" />
			<xs:minInclusive value="0" />
		</xs:restriction>
	</xs:simpleType>
	<xs:complexType name="DorucenieType">
		<xs:sequence>
			<xs:element name="AdresatPodania" type="AdresatPodaniaType" />
			<xs:element name="Checkbox" type="CheckboxType" minOccurs="0" />
			<xs:element name="FormaOdoslaniaZiadosti" type="FormaOdoslaniaZiadostiEnumType" />
			<xs:element name="FormaDoruceniaRozhodnutia" type="FormaDoruceniaRozhodnutiaType" minOccurs="0" maxOccurs="1" />
		</xs:sequence>
	</xs:complexType>
    <xs:complexType name="E-formMetaType">
    <xs:annotation>
      <xs:documentation>Metaúdaje elektronického formulára</xs:documentation>
    </xs:annotation>
    <xs:sequence>
      <xs:element name="ID" type="xs:string" />
      <xs:element name="Name" type="xs:string" />
      <xs:element name="Description" type="xs:string" minOccurs="0" />
      <xs:element name="Gestor" type="xs:string" />
      <xs:element name="RecipientId" type="xs:string" />
      <xs:element name="Version" type="xs:string" />
      <xs:element name="ZepRequired" type="xs:boolean" />
    </xs:sequence>
  </xs:complexType>
	<xs:simpleType name="EMailType">
		<xs:restriction base="xs:string">
		</xs:restriction>
	</xs:simpleType>
	<xs:complexType name="EnumerationType" abstract="true">
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
			<xs:element name="WsEnumCode" type="xs:string" minOccurs="0">
				<xs:annotation>
					<xs:documentation>Kod ciselnika WS sluzby</xs:documentation>
				</xs:annotation>
			</xs:element>
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="EnumerationValueType">
		<xs:sequence>
			<xs:element name="Code" type="xs:string" minOccurs="0" />
			<xs:element name="Name" type="xs:string" />
			<xs:element name="WsEnumCode" type="xs:string" minOccurs="0" />
		</xs:sequence>
	</xs:complexType>
	<xs:simpleType name="FormaDoruceniaRozhodnutiaEnumType">
		<xs:restriction base="xs:string">
			<xs:enumeration value="Pošta" />
			<xs:enumeration value="Elektronická schránka" />
			<xs:enumeration value="Osobne" />
			<xs:enumeration value="Fax" />
			<xs:enumeration value="Telefonicky" />
			<xs:enumeration value="E-mail" />
			<xs:enumeration value="Bez odpovede" />
		</xs:restriction>
	</xs:simpleType>
	<xs:complexType name="FormaDoruceniaRozhodnutiaType">
		<xs:sequence>
			<xs:element name="TypSposobuDorucenia" type="FormaDoruceniaRozhodnutiaEnumType" />
			<xs:element name="AdresaDoruceniaRozhodnutia" type="AdresaType" minOccurs="0" maxOccurs="1" />
			<xs:element name="AdresatPodania" type="AdresatPodaniaEnumType" minOccurs="0" maxOccurs="1" />
			<xs:element name="MestskaCast" type="EnumerationValueType" minOccurs="0" maxOccurs="1" />
			<xs:element name="FaxPreDorucenie" type="TelefonneCisloType" minOccurs="0" maxOccurs="1" />
			<xs:element name="TelefonPreDorucenie" type="TelefonneCisloType" minOccurs="0" maxOccurs="1" />
			<xs:element name="EmailPreDorucenie" type="EMailType" minOccurs="0" maxOccurs="1" />
		</xs:sequence>
	</xs:complexType>
	<xs:simpleType name="FormaOdoslaniaZiadostiEnumType">
		<xs:restriction base="xs:string">
			<xs:enumeration value="Elektronicky" />
			<xs:enumeration value="Listinne" />
		</xs:restriction>
	</xs:simpleType>
	<xs:complexType name="IdentifikaciaOsobyType">
		<xs:sequence>
			<xs:element name="TitulyPredMenom" type="TitulyPredMenomType" minOccurs="0" maxOccurs="1" />
			<xs:element name="Meno" type="xs:string" minOccurs="0" maxOccurs="1" />
			<xs:element name="Priezvisko" type="xs:string" minOccurs="0" maxOccurs="1" />
			<xs:element name="RodnePriezvisko" type="xs:string" minOccurs="0" maxOccurs="1" />
			<xs:element name="MestskaCast" type="EnumerationValueType" minOccurs="0" maxOccurs="1" />
			<xs:element name="TitulyZaMenom" type="TitulyZaMenomType" minOccurs="0" maxOccurs="1" />
			<xs:element name="DatumNarodenia" type="xs:date" minOccurs="0" maxOccurs="1" />
			<xs:element name="RodneCislo" type="RodneCisloType" minOccurs="0" maxOccurs="1" />
			<xs:element name="CisloObcianskehoPreukazu" type="xs:string" minOccurs="0" maxOccurs="1" />
			<xs:element name="ObchodneMenoNazov" type="xs:string" minOccurs="0" maxOccurs="1" />
			<xs:element name="MenoZastupcu" type="xs:string" minOccurs="0" maxOccurs="1" />
			<xs:element name="PriezviskoZastupcu" type="xs:string" minOccurs="0" maxOccurs="1" />
			<xs:element name="ICO" minOccurs="0" maxOccurs="1">
				<xs:simpleType>
					<xs:restriction base="xs:string">
						<xs:pattern value="[0-9]{6,8}" />
					</xs:restriction>
				</xs:simpleType>
			</xs:element>
			<xs:element name="DIC" minOccurs="0" maxOccurs="1">
				<xs:simpleType>
					<xs:restriction base="xs:string">
						<xs:pattern value="[0-9]{10}" />
					</xs:restriction>
				</xs:simpleType>
			</xs:element>
			<xs:element name="PravnaForma" type="EnumerationValueType" minOccurs="0" maxOccurs="1" />
		</xs:sequence>
	</xs:complexType>
	<xs:simpleType name="KodKrajinyType">
		<xs:restriction base="xs:string">
			<xs:pattern value="[0-9]{3}" />
		</xs:restriction>
	</xs:simpleType>
	<xs:complexType name="KontaktnaOsobaType">
		<xs:sequence>
			<xs:element name="Meno" type="xs:string" />
			<xs:element name="Priezvisko" type="xs:string" />
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="KontaktneUdajeType">
		<xs:sequence>
			<xs:element name="TelefonneCislo" type="TelefonneCisloType" minOccurs="0" maxOccurs="1" />
			<xs:element name="TelefonneCisloCele" type="xs:string" minOccurs="0" maxOccurs="1" />
			<xs:element name="Email" type="EMailType" minOccurs="0" maxOccurs="1" />
			<xs:element name="KontaktnaOsoba" type="KontaktnaOsobaType" minOccurs="0" maxOccurs="1" />
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="OpravnenaOsobaType">
		<xs:sequence>
			<xs:element name="PravnyVztah" type="EnumerationValueType" minOccurs="0" maxOccurs="1" />
			<xs:element name="Meno" type="xs:string" minOccurs="0" maxOccurs="1" />
			<xs:element name="Priezvisko" type="xs:string" minOccurs="0" maxOccurs="1" />
			<xs:element name="TitulyPredMenom" type="TitulyPredMenomType" minOccurs="0" maxOccurs="1" />
			<xs:element name="TitulyZaMenom" type="TitulyZaMenomType" minOccurs="0" maxOccurs="1" />
			<xs:element name="ObchodneMenoNazov" type="xs:string" minOccurs="0" maxOccurs="1" />
			<xs:element name="AdresaOpravnenejOsoby" type="AdresaType" minOccurs="0" maxOccurs="1" />
			<xs:element name="KontaktneUdajeOpravnenejOsoby" type="KontaktneUdajeType" minOccurs="0" maxOccurs="1" />
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="OsobneUdajeType">
		<xs:sequence>
			<xs:element name="TypOsoby" type="EnumerationValueType" />
			<xs:element name="IdentifikaciaOsoby" type="IdentifikaciaOsobyType" />
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="PrilohyType">
		<xs:sequence>
			<xs:element name="Priloha" type="xs:string" minOccurs="0" maxOccurs="unbounded" />
		</xs:sequence>
	</xs:complexType>
	<xs:simpleType name="RodneCisloType">
		<xs:restriction base="xs:string">
			<xs:pattern value="[0-9]{9,10}" />
		</xs:restriction>
	</xs:simpleType>
	<xs:complexType name="StatType">
		<xs:complexContent>
			<xs:restriction base="EnumerationType">
				<xs:sequence>
					<xs:element name="Code" type="KodKrajinyType" />
					<xs:element name="Name" type="xs:string" />
					<xs:element name="WsEnumCode" type="xs:string" minOccurs="0" />
				</xs:sequence>
			</xs:restriction>
		</xs:complexContent>
	</xs:complexType>
	<xs:complexType name="TelefonneCisloType">
		<xs:sequence>
			<xs:element name="MedzinarodneVolacieCislo">
				<xs:simpleType>
					<xs:restriction base="xs:string">
					</xs:restriction>
				</xs:simpleType>
			</xs:element>
			<xs:element name="Predvolba">
				<xs:simpleType>
					<xs:restriction base="xs:string">
						<xs:pattern value="[1-9][0-9]*" />
					</xs:restriction>
				</xs:simpleType>
			</xs:element>
			<xs:element name="Cislo">
				<xs:simpleType>
					<xs:restriction base="xs:string">
						<xs:pattern value="[0-9]*" />
					</xs:restriction>
				</xs:simpleType>
			</xs:element>
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="TitulyPredMenomType">
		<xs:sequence>
			<xs:element name="TitulPredMenom" type="EnumerationValueType" minOccurs="0" maxOccurs="unbounded" />
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="TitulyZaMenomType">
		<xs:sequence>
			<xs:element name="TitulZaMenom" type="EnumerationValueType" minOccurs="0" maxOccurs="unbounded" />
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="UlicaACisloType">
		<xs:sequence>
			<xs:element name="Ulica" type="xs:string" />
			<xs:element name="SupisneCislo" type="xs:integer" minOccurs="0" maxOccurs="1" />
			<xs:element name="OrientacneCislo" type="xs:string" minOccurs="0" maxOccurs="1" />
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="ZakladneVyhlasenieType">
		<xs:sequence>
			<xs:element name="SpravnostUdajovText" type="xs:string" />
			<xs:element name="SuhlasSoSpracovanimText" type="xs:string" />
			<xs:element name="PoskytujemSuhlas" type="xs:boolean" default="false" />
			<xs:element name="PoskytujemSuhlasText" type="xs:string" />
			<xs:element name="NeposkytujemSuhlas" type="xs:boolean" default="false" />
			<xs:element name="NeposkytujemSuhlasText" type="xs:string" />
		</xs:sequence>
	</xs:complexType>
	<xs:element name="E-form">
		<xs:complexType>
			<xs:sequence>
                <xs:element name="Meta" type="E-formMetaType" />
				<xs:element name="Body">
					<xs:complexType>
						<xs:sequence>
							<xs:element name="InstanceID" type="xs:string" minOccurs="0" />
							<xs:element name="DruhPriznania" type="EnumerationValueType" />
							<xs:element name="NaRok" type="xs:nonNegativeInteger" />
							<xs:element name="Danovnik" type="OsobneUdajeType" />
							<xs:element name="AdresaDanovnika" type="AdresaType" />
							<xs:element name="OpravnenaOsoba" type="OpravnenaOsobaType" minOccurs="0" maxOccurs="1" />
							<xs:element name="KontaktneUdajeDanovnika" type="KontaktneUdajeType" minOccurs="0" />
							<xs:element name="DanZPozemkov" type="DanZPozemkovType" minOccurs="0" maxOccurs="1" />
							<xs:element name="DanZoStaviebJedenUcel" type="DanZoStaviebJedenUcelType" minOccurs="0" maxOccurs="1" />
							<xs:element name="DanZoStaviebViacereUcely" type="DanZoStaviebViacereUcelyType" minOccurs="0" maxOccurs="1" />
							<xs:element name="DanZBytovANebytovychPriestorov" type="DanZBytovANebytovychPriestorovType" minOccurs="0" maxOccurs="1" />
							<xs:element name="Priloha" type="PrilohaType" minOccurs="0" maxOccurs="1" />
							<xs:element name="SuhrnPriloh" type="SuhrnPrilohType" minOccurs="0" maxOccurs="1" />
							<xs:element name="DatumZadaniaPodania" type="xs:dateTime" minOccurs="0" maxOccurs="1" />
							<xs:element name="ZakladneVyhlasenie" type="ZakladneVyhlasenieType" />
							<xs:element name="Prilohy" type="PrilohyType" minOccurs="0" maxOccurs="1" />
							<xs:element name="Dorucenie" type="DorucenieType" />
						</xs:sequence>
					</xs:complexType>
				</xs:element>
			</xs:sequence>
		</xs:complexType>
	</xs:element>
	<xs:complexType name="DanZPozemkovType">
		<xs:sequence>
			<xs:element name="DanZPozemkovZaznam" type="DanZPozemkovZaznamType" minOccurs="1" maxOccurs="unbounded" />
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="DanZPozemkovZaznamType">
		<xs:sequence>
			<xs:element name="PoradoveCislo" type="xs:nonNegativeInteger" />
			<xs:element name="ICO" minOccurs="0" maxOccurs="1">
				<xs:simpleType>
					<xs:restriction base="xs:string">
						<xs:pattern value="[0-9]{6,8}" />
					</xs:restriction>
				</xs:simpleType>
			</xs:element>
			<xs:element name="RodneCislo" type="xs:string" minOccurs="0" maxOccurs="1" />
			<xs:element name="Obec" type="xs:string" />
			<xs:element name="DruhyZmien" type="DruhyZmienType" />
			<xs:element name="HodnotaPozemkuUrcenaZnalcom" type="xs:boolean" />
			<xs:element name="PravnyVztah" type="EnumerationValueType" />
			<xs:element name="Spoluvlastnictvo" type="EnumerationValueType" minOccurs="0" maxOccurs="1" />
			<xs:element name="RodneCisloManzelaAleboManzelky" type="RodneCisloType" minOccurs="0" maxOccurs="1" />
			<xs:element name="PocetSpoluvlastnikov" type="xs:nonNegativeInteger" minOccurs="0" maxOccurs="1" />
			<xs:element name="SpoluvlastnikUrcenyDohodou" type="xs:boolean" minOccurs="0" maxOccurs="1" />
			<xs:element name="Pozemky" type="PozemkyType" />
			<xs:element name="Poznamka" type="xs:string" minOccurs="0" maxOccurs="1" />
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="DruhyZmienType">
		<xs:sequence>
			<xs:element name="DruhZmeny" type="EnumerationValueType" minOccurs="1" maxOccurs="unbounded" />
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="PozemkyType">
		<xs:sequence>
			<xs:element name="Pozemok" type="PozemokType" minOccurs="1" maxOccurs="unbounded" />
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="PozemokType">
		<xs:sequence>
			<xs:element name="PoradoveCislo" type="xs:nonNegativeInteger" />
			<xs:element name="NazovKatastralnehoUzemia" type="EnumerationValueType" />
			<xs:element name="CisloParcely" type="xs:string" />
			<xs:element name="Vymera" type="DesatinneCisloPresnostNaDveDesatinneMiesta" />
			<xs:element name="DruhPozemku" type="EnumerationValueType" />
			<xs:element name="VyuzitiePozemku" type="xs:string" minOccurs="0" />
			<xs:element name="DatumVznikuDanovejPovinnosti" type="xs:date" minOccurs="0" />
			<xs:element name="DatumZanikuDanovejPovinnosti" type="xs:date" minOccurs="0" />
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="DanZoStaviebJedenUcelType">
		<xs:sequence>
			<xs:element name="DanZoStaviebJedenUcelZaznam" type="DanZoStaviebJedenUcelZaznamType" minOccurs="1" maxOccurs="unbounded" />
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="DanZoStaviebJedenUcelZaznamType">
		<xs:sequence>
			<xs:element name="PoradoveCislo" type="xs:integer" />
			<xs:element name="ICO" minOccurs="0" maxOccurs="1">
				<xs:simpleType>
					<xs:restriction base="xs:string">
						<xs:pattern value="[0-9]{6,8}" />
					</xs:restriction>
				</xs:simpleType>
			</xs:element>
			<xs:element name="RodneCislo" type="xs:string" minOccurs="0" maxOccurs="1" />
			<xs:element name="AdresaStavby" type="AdresaType" />
			<xs:element name="NazovKatastralnehoUzemia" type="EnumerationValueType" />
			<xs:element name="CisloParcely" type="xs:string" />
			<xs:element name="PravnyVztah" type="EnumerationValueType" />
			<xs:element name="Spoluvlastnictvo" type="EnumerationValueType" minOccurs="0" maxOccurs="1" />
			<xs:element name="RodneCisloManzelaAleboManzelky" type="RodneCisloType" minOccurs="0" maxOccurs="1" />
			<xs:element name="PocetSpoluvlastnikov" type="xs:nonNegativeInteger" minOccurs="0" maxOccurs="1" />
			<xs:element name="SpoluvlastnikUrcenyDohodou" type="xs:boolean" minOccurs="0" maxOccurs="1" />
			<xs:element name="DatumVznikuDanovejPovinnosti" type="xs:date" minOccurs="0" />
			<xs:element name="DatumZanikuDanovejPovinnosti" type="xs:date" minOccurs="0" />
			<xs:element name="PredmetDane" type="EnumerationValueType" />
			<xs:element name="ZakladDane" type="xs:nonNegativeInteger" />
			<xs:element name="PocetPodlazi" type="xs:nonNegativeInteger" />
			<xs:element name="CelkovaVymeraPodlahovychPloch" type="xs:nonNegativeInteger" minOccurs="0" />
			<xs:element name="VymeraPlochOslobodenychOdDane" type="xs:nonNegativeInteger" minOccurs="0" />
			<xs:element name="Poznamka" type="xs:string" minOccurs="0" maxOccurs="1" />
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="DanZoStaviebViacereUcelyType">
		<xs:sequence>
			<xs:element name="DanZoStaviebViacereUcelyZaznam" type="DanZoStaviebViacereUcelyZaznamType" minOccurs="1" maxOccurs="unbounded" />
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="DanZoStaviebViacereUcelyZaznamType">
		<xs:sequence>
			<xs:element name="PoradoveCislo" type="xs:integer" />
			<xs:element name="ICO" minOccurs="0" maxOccurs="1">
				<xs:simpleType>
					<xs:restriction base="xs:string">
						<xs:pattern value="[0-9]{6,8}" />
					</xs:restriction>
				</xs:simpleType>
			</xs:element>
			<xs:element name="RodneCislo" type="xs:string" minOccurs="0" maxOccurs="1" />
			<xs:element name="AdresaStavby" type="AdresaType" />
			<xs:element name="NazovKatastralnehoUzemia" type="EnumerationValueType" />
			<xs:element name="CisloParcely" type="xs:string" />
			<xs:element name="PravnyVztah" type="EnumerationValueType" />
			<xs:element name="Spoluvlastnictvo" type="EnumerationValueType" minOccurs="0" maxOccurs="1" />
			<xs:element name="RodneCisloManzelaAleboManzelky" type="RodneCisloType" minOccurs="0" maxOccurs="1" />
			<xs:element name="PocetSpoluvlastnikov" type="xs:nonNegativeInteger" minOccurs="0" maxOccurs="1" />
			<xs:element name="SpoluvlastnikUrcenyDohodou" type="xs:boolean" minOccurs="0" maxOccurs="1" />
			<xs:element name="PopisStavby" type="xs:string" />
			<xs:element name="DatumVznikuDanovejPovinnosti" type="xs:date" minOccurs="0" />
			<xs:element name="DatumZanikuDanovejPovinnosti" type="xs:date" minOccurs="0" />
			<xs:element name="ZakladDane" type="xs:nonNegativeInteger" />
			<xs:element name="CelkovaVymeraPodlahovychPloch" type="xs:nonNegativeInteger" />
			<xs:element name="VymeraPlochOslobodenychOdDane" type="xs:nonNegativeInteger" minOccurs="0" />
			<xs:element name="VymeraPlochNaJednotliveUcely" type="VymeraPlochNaJednotliveUcelyType" />
			<xs:element name="PocetPodlazi" type="xs:nonNegativeInteger" />
			<xs:element name="Poznamka" type="xs:string" minOccurs="0" maxOccurs="1" />
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="VymeraPlochNaJednotliveUcelyType">
		<xs:sequence>
			<xs:element name="VymeraPlochNaJednotlivyUcel" type="VymeraPlochNaJednotlivyUcelType" minOccurs="9" maxOccurs="9" />
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="VymeraPlochNaJednotlivyUcelType">
		<xs:sequence>
			<xs:element name="Ucel" type="EnumerationValueType" />
			<xs:element name="Vymera" type="DesatinneCisloPresnostNaDveDesatinneMiesta" />
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="DanZBytovANebytovychPriestorovType">
		<xs:sequence>
			<xs:element name="DanZBytovANebytovychPriestorovZaznam" type="DanZBytovANebytovychPriestorovZaznamType" minOccurs="0" maxOccurs="unbounded" />
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="DanZBytovANebytovychPriestorovZaznamType">
		<xs:sequence>
			<xs:element name="PoradoveCislo" type="xs:integer" />
			<xs:element name="ICO" minOccurs="0" maxOccurs="1">
				<xs:simpleType>
					<xs:restriction base="xs:string">
						<xs:pattern value="[0-9]{6,8}" />
					</xs:restriction>
				</xs:simpleType>
			</xs:element>
			<xs:element name="RodneCislo" type="xs:string" minOccurs="0" maxOccurs="1" />
			<xs:element name="AdresaBytu" type="AdresaType" />
			<xs:element name="NazovKatastralnehoUzemia" type="EnumerationValueType" minOccurs="0" />
			<xs:element name="CisloParcely" type="xs:string" />
			<xs:element name="CisloBytu" type="xs:string" />
			<xs:element name="PravnyVztah" type="EnumerationValueType" />
			<xs:element name="Spoluvlastnictvo" type="EnumerationValueType" minOccurs="0" maxOccurs="1" />
			<xs:element name="RodneCisloManzelaAleboManzelky" type="RodneCisloType" minOccurs="0" maxOccurs="1" />
			<xs:element name="PocetSpoluvlastnikov" type="xs:nonNegativeInteger" minOccurs="0" maxOccurs="1" />
			<xs:element name="SpoluvlastnikUrcenyDohodou" type="xs:boolean" minOccurs="0" maxOccurs="1" />
			<xs:element name="PopisBytu" type="xs:string" minOccurs="0" maxOccurs="1" />
			<xs:element name="DatumVznikuDanovejPovinnosti" type="xs:date" minOccurs="0" />
			<xs:element name="DatumZanikuDanovejPovinnosti" type="xs:date" minOccurs="0" />
			<xs:element name="NebytovePriestory" type="NebytovePriestoryType" minOccurs="0" maxOccurs="1" />
			<xs:element name="ZakladDane" type="ZakladDaneType" />
			<xs:element name="VymeraPodlahovejPlochyVyuzivanejNaIneUcely" type="xs:nonNegativeInteger" minOccurs="0" />
			<xs:element name="VymeraPlochOslobodenychOdDane" type="VymeraPlochOslobodenychOdDaneType" minOccurs="0" />
			<xs:element name="Poznamka" type="xs:string" minOccurs="0" maxOccurs="1" />
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="ZakladDaneType">
		<xs:sequence>
			<xs:element name="Byt" type="xs:nonNegativeInteger" />
			<xs:element name="NebytovyPriestor" type="xs:nonNegativeInteger" minOccurs="0" />
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="VymeraPlochOslobodenychOdDaneType">
		<xs:sequence>
			<xs:element name="Byt" type="xs:nonNegativeInteger" minOccurs="0" />
			<xs:element name="NebytovyPriestor" type="xs:nonNegativeInteger" minOccurs="0" />
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="NebytovePriestoryType">
		<xs:sequence>
			<xs:element name="NebytovyPriestor" type="NebytovyPriestorType" minOccurs="0" maxOccurs="unbounded" />
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="NebytovyPriestorType">
		<xs:sequence>
			<xs:element name="PoradoveCislo" type="xs:nonNegativeInteger" />
			<xs:element name="CisloVBytovomDome" type="xs:string" />
			<xs:element name="UcelVyuzitiaVBytovomDome" type="xs:string" />
			<xs:element name="VymeraPodlahovychPloch" type="xs:nonNegativeInteger" />
			<xs:element name="DatumVznikuDanovejPovinnosti" type="xs:date" minOccurs="0" />
			<xs:element name="DatumZanikuDanovejPovinnosti" type="xs:date" minOccurs="0" />
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="SuhrnPrilohType">
		<xs:sequence>
			<xs:element name="PocetOddielovII" type="xs:integer" />
			<xs:element name="PocetOddielovIII" type="xs:integer" />
			<xs:element name="PocetOddielovIV" type="xs:integer" />
			<xs:element name="PocetOddielovV" type="xs:integer" />
			<xs:element name="PocetOddielovVI" type="xs:integer" />
			<xs:element name="PocetOddielovVII" type="xs:integer" />
			<xs:element name="PocetInych" type="xs:integer" />
			<xs:element name="Poznamka" type="xs:string" minOccurs="0" />
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="PrilohaType">
		<xs:sequence>
			<xs:element name="Obec" type="xs:string" />
			<xs:element name="ICO" minOccurs="0" maxOccurs="1">
				<xs:simpleType>
					<xs:restriction base="xs:string">
						<xs:pattern value="[0-9]{6,8}" />
					</xs:restriction>
				</xs:simpleType>
			</xs:element>
			<xs:element name="RodneCislo" type="xs:string" minOccurs="0" maxOccurs="1" />
			<xs:element name="PozemkyA" type="xs:boolean" default="false" minOccurs="0" />
			<xs:element name="PozemkyB" type="xs:boolean" default="false" minOccurs="0" />
			<xs:element name="PozemkyC" type="xs:boolean" default="false" minOccurs="0" />
			<xs:element name="PozemkyD" type="xs:boolean" default="false" minOccurs="0" />
			<xs:element name="PozemkyE" type="xs:boolean" default="false" minOccurs="0" />
			<xs:element name="PozemkyF" type="xs:boolean" default="false" minOccurs="0" />
			<xs:element name="PozemkyG" type="xs:boolean" default="false" minOccurs="0" />
			<xs:element name="PozemkyH" type="xs:boolean" default="false" minOccurs="0" />
			<xs:element name="PozemkyI" type="xs:boolean" default="false" minOccurs="0" />
			<xs:element name="PozemkyJ" type="xs:boolean" default="false" minOccurs="0" />
			<xs:element name="PozemkyK" type="xs:boolean" default="false" minOccurs="0" />
			<xs:element name="PozemkyL" type="xs:boolean" default="false" minOccurs="0" />
			<xs:element name="StavbyA" type="xs:boolean" default="false" minOccurs="0" />
			<xs:element name="StavbyB" type="xs:boolean" default="false" minOccurs="0" />
			<xs:element name="StavbyC" type="xs:boolean" default="false" minOccurs="0" />
			<xs:element name="StavbyD" type="xs:boolean" default="false" minOccurs="0" />
			<xs:element name="StavbyE" type="xs:boolean" default="false" minOccurs="0" />
			<xs:element name="StavbyF" type="xs:boolean" default="false" minOccurs="0" />
			<xs:element name="BytyA" type="xs:boolean" default="false" minOccurs="0" />
			<xs:element name="BytyB" type="xs:boolean" default="false" minOccurs="0" />
			<xs:element name="BytyC" type="xs:boolean" default="false" minOccurs="0" />
			<xs:element name="BytyD" type="xs:boolean" default="false" minOccurs="0" />
			<xs:element name="BytyE" type="xs:boolean" default="false" minOccurs="0" />
			<xs:element name="PsyA" type="xs:boolean" default="false" minOccurs="0" />
			<xs:element name="PsyB" type="xs:boolean" default="false" minOccurs="0" />
			<xs:element name="PsyC" type="xs:boolean" default="false" minOccurs="0" />
			<xs:element name="PsyD" type="xs:boolean" default="false" minOccurs="0" />
			<xs:element name="PsyE" type="xs:boolean" default="false" minOccurs="0" />
			<xs:element name="Poznamka" type="xs:string" minOccurs="0" />
		</xs:sequence>
	</xs:complexType>
</xs:schema>`

const TAX_XSLT = `<?xml version="1.0" encoding="utf-8" standalone="yes"?>

<xsl:stylesheet version="2.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:z="$SCHEMA_URI"
    xmlns:fn="http://www.w3.org/2005/xpath-functions">

    <xsl:output method="text" encoding="utf-8" indent="no" />
    <xsl:preserve-space elements="*" />

    <xsl:template name="base_adresa">
        <xsl:param name="id_prefix" select="'Adresa '" />
        <xsl:param name="values" />
        <xsl:param name="odsadenie" />
        <xsl:param name="showPoschodie" />
        <xsl:param name="typOsoby" />
        
        
        
        <xsl:if test="$id_prefix = 'FO'">
            <xsl:value-of select="concat($odsadenie, 'Adresa trvalého bydliska &#10;')" />
        </xsl:if>
        <xsl:if test="$id_prefix = 'FOP'">
            <xsl:value-of select="concat($odsadenie, 'Adresa miesta podnikania / sídlo &#10;')" />
        </xsl:if>
        <xsl:if test="$id_prefix = 'PO'">
            <xsl:value-of select="concat($odsadenie, 'Adresa sídla spoločnosti &#10;')" />
        </xsl:if>
        <xsl:if test="$id_prefix = 'MC'">
            <xsl:value-of select="concat($odsadenie, 'Adresa sídla &#10;')" />
        </xsl:if>
<!--         Ked neni dany typ osoby tak bude brat preddefinovanu hodnotu -->
        <xsl:if test="($id_prefix != 'FO') and ($id_prefix != 'PO') and ($id_prefix != 'FOP') and ($id_prefix != 'MC')">
            <xsl:value-of select="concat($odsadenie, $id_prefix, '&#10;')" />
        </xsl:if>
        
            
        
        <xsl:for-each select="$values" >
            <xsl:if test="./*[local-name() = 'Meno']">
                <xsl:value-of select="concat($odsadenie, '&#09;', 'Meno: ', ./*[local-name() = 'Meno'], '&#10;')"/>
            </xsl:if>
            
            <xsl:if test="./*[local-name() = 'Priezvisko']">
                <xsl:value-of select="concat($odsadenie, '&#09;', 'Priezvisko: ', ./*[local-name() = 'Priezvisko'], '&#10;')"/>
            </xsl:if>
            
            <xsl:if test="./*[local-name() = 'ObchodneMenoNazov']">
                <xsl:value-of select="concat($odsadenie, '&#09;', 'Obchodné meno / názov: ', ./*[local-name() = 'ObchodneMenoNazov'], '&#10;')"/>
            </xsl:if>
            
            <xsl:for-each select="./*[local-name() = 'UlicaACislo']">
                <xsl:value-of select="concat($odsadenie, '&#09;', 'Ulica: ', ./*[local-name() = 'Ulica'], '&#10;')"/>
                <xsl:value-of select="concat($odsadenie, '&#09;', 'Číslo: ', ./*[local-name() = 'SupisneCislo'], '/', ./*[local-name() = 'OrientacneCislo'], '&#10;')"/>
            </xsl:for-each>
            
            <xsl:if test="$showPoschodie = 'true'">
                <xsl:value-of select="concat($odsadenie, '&#09;', 'Poschodie a číslo bytu: ', ./*[local-name() = 'PoschodieACisloBytu'], '&#10;')"/>
            </xsl:if>
            
            <xsl:if test="./*[local-name() = 'POBOX']">
                <xsl:value-of select="concat($odsadenie, '&#09;', 'P.O.Box: ', ./*[local-name() = 'POBOX'], '&#10;')"/>
            </xsl:if>
            
            <xsl:value-of select="concat($odsadenie, '&#09;', 'PSČ: ', ./*[local-name() = 'PSC'], '&#10;')"/>
            
            <xsl:value-of select="concat($odsadenie, '&#09;', 'Obec: ', ./*[local-name() = 'Obec']/*[local-name() = 'Name'], '&#10;')"/>
            
            <xsl:value-of select="concat($odsadenie, '&#09;', 'Časť obce: ', ./*[local-name() = 'CastObce'], '&#10;')"/>
            
            <xsl:value-of select="concat($odsadenie, '&#09;', 'Štát: ', ./*[local-name() = 'Stat']/*[local-name() = 'Name'], '&#10;')"/>
        </xsl:for-each>
    </xsl:template>

    <xsl:template name="base_adresat_podania">
        <xsl:param name="id_prefix" />
        <xsl:param name="values" />
        <xsl:param name="odsadenie" />
        <xsl:param name="adresatPodaniaMestoText" select="'Mesto'" />
        <xsl:param name="adresatPodaniaMCInyText" select="''" />

        <xsl:value-of select="concat($odsadenie, $id_prefix, '&#10;')" />
        <xsl:value-of select="concat($odsadenie, '&#09;', $id_prefix, ': ')"/>

        <xsl:if test="$values/*[local-name() = 'AdresatPodania'] = 'Mesto'">
            <xsl:value-of select="concat($adresatPodaniaMestoText, '&#10;')" />
        </xsl:if>
        <xsl:if test="$values/*[local-name() = 'AdresatPodania'] = 'Mestská časť'">
            <xsl:text>Mestská časť&#10;</xsl:text>
            <xsl:value-of select="concat($odsadenie, '&#09;', 'Mestská časť: ', $values/*[local-name() = 'MestskaCast']/*[local-name() = 'Name'], '&#10;')"/>
        </xsl:if>
        <xsl:if test="$values/*[local-name() = 'AdresatPodania'] = 'Mesto a iný subjekt'">
            <xsl:value-of select="concat($adresatPodaniaMestoText, '&#10;')" />
        </xsl:if>
        <xsl:if test="$values/*[local-name() = 'AdresatPodania'] = 'Mestská časť a iný subjekt'">
            <xsl:text>Mestská časť&#10;</xsl:text>
            <xsl:value-of select="concat($odsadenie, '&#09;', 'Mestská časť: ', $values/*[local-name() = 'MestskaCast']/*[local-name() = 'Name'], $adresatPodaniaMCInyText, '&#10;')"/>
        </xsl:if>
    </xsl:template>

    <xsl:template name="base_array_to_string">
        <xsl:param name="id_prefix" />
        <xsl:param name="value" />
        <xsl:param name="arrayName" />
        <xsl:param name="odsadenie" />
        <xsl:value-of select="concat($odsadenie, $id_prefix, ': ')" />
        
        <xsl:variable name="arraylengthPred" select="count($value/*[local-name() = $arrayName])" />
        
        <xsl:for-each select="$value/*[local-name() = $arrayName]">
            <xsl:variable name="i" select="position()" />
            <xsl:value-of select="./*[local-name() = 'Name']" />
            <xsl:if test="$i &lt; $arraylengthPred">
                <xsl:text>, </xsl:text>
            </xsl:if>
        </xsl:for-each>
        <xsl:text>&#10;</xsl:text>
    </xsl:template>

    <xsl:template name="base_date_with_name">
        <xsl:param name="title" />
        <xsl:param name="value" />
        <xsl:param name="odsadenie" />

        <xsl:if test="$value != ''">
            <xsl:value-of select="concat($odsadenie, $title, ': ')"/>
            <xsl:call-template name="format_date">
                <xsl:with-param name="instr" select="$value"/>
            </xsl:call-template>
            <xsl:value-of select="'&#10;'" />
        </xsl:if>
    </xsl:template>

    <xsl:template name="base_dorucenie">
        <xsl:param name="id_prefix" select="'Doručenie'" />
        <xsl:param name="doruceniePodania" select="'Doručenie podania'" />
        <xsl:param name="dorucenieOdpovede" select="'Doručenie odpovede'" />
        <xsl:param name="formaOdoslania" select="'Forma odoslania podania'" />
        <xsl:param name="formaDorucenia" select="'Forma doručenia odpovede'" />
        <xsl:param name="adresaDorucenia" select="'Adresa doručenia odpovede'" />
        <xsl:param name="miestoOsobnehoVyzdvihnutia" select="'Miesto osobného vyzdvihnutia odpovede'" />
        <xsl:param name="adresatPodaniaMestoText" select="'Mesto'" />
        <xsl:param name="adresatPodaniaMCInyText" select="''" />
        <xsl:param name="osobneNaInySubjektText" />
        <xsl:param name="osobneVyzdvihnutieInySubjektText" />
        <xsl:param name="values" />
        <xsl:value-of select="concat($id_prefix, '&#10;')" />
        
        <xsl:for-each select="$values">
            <xsl:value-of select="concat('&#09;',$doruceniePodania, '&#10;')" />
            
            <xsl:call-template name="base_adresat_podania">
                <xsl:with-param name="id_prefix" select="'Adresát podania'" />
                <xsl:with-param name="values" select="./*[local-name() = 'AdresatPodania']" />
                <xsl:with-param name="odsadenie" select="'&#09;&#09;'" />
                <xsl:with-param name="adresatPodaniaMestoText" select="$adresatPodaniaMestoText" />
                <xsl:with-param name="adresatPodaniaMCInyText" select="$adresatPodaniaMCInyText" />
            </xsl:call-template>
            <xsl:value-of select="concat('&#09;&#09;', $formaOdoslania,': ' , ./*[local-name() = 'FormaOdoslaniaZiadosti'], '&#10;')" />
            
            <xsl:text>&#09;Notifikácia&#10;</xsl:text>
            
            <xsl:value-of select="concat('&#09;&#09;', 'Žiadam o zasielanie notifikácii zo spracovania podania: ')" />
            <xsl:choose>
                <xsl:when test="./*[local-name() = 'Checkbox']/*[local-name() = 'Notifikacia'] = 'true'">
                    <xsl:text>Áno&#10;</xsl:text>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:text>Nie&#10;</xsl:text>
                </xsl:otherwise>
            </xsl:choose>
            
            <xsl:if test="./*[local-name() = 'FormaDoruceniaRozhodnutia']">
                <xsl:value-of select="concat('&#09;',$dorucenieOdpovede, '&#10;')" />
                <xsl:if test="./*[local-name() = 'FormaDoruceniaRozhodnutia']/*[local-name() = 'TypSposobuDorucenia'] = 'Pošta'">
                    <xsl:value-of select="concat('&#09;&#09;',$formaDorucenia, ': Pošta','&#10;')" />
                    <xsl:call-template name="base_adresa">
                        <xsl:with-param name="id_prefix" select="$adresaDorucenia" />
                        <xsl:with-param name="values" select="./*[local-name() = 'FormaDoruceniaRozhodnutia']/*[local-name() = 'AdresaDoruceniaRozhodnutia']" />
                        <xsl:with-param name="odsadenie" select="'&#09;&#09;'" />
                    </xsl:call-template>
                </xsl:if>
                <xsl:if test="./*[local-name() = 'FormaDoruceniaRozhodnutia']/*[local-name() = 'TypSposobuDorucenia'] = 'Elektronická schránka'">
                    <xsl:value-of select="concat('&#09;&#09;',$formaDorucenia, ': Elektronická schránka (eDesk)','&#10;')" />
                </xsl:if>
                <xsl:if test="./*[local-name() = 'FormaDoruceniaRozhodnutia']/*[local-name() = 'TypSposobuDorucenia'] = 'Osobne na iný subjekt'">
                    <xsl:value-of select="concat('&#09;&#09;',$formaDorucenia, ': ', $osobneNaInySubjektText,'&#10;')" />
                    <xsl:value-of select="concat('&#09;&#09;&#09;', $miestoOsobnehoVyzdvihnutia, ': ', $osobneVyzdvihnutieInySubjektText, '&#10;')" />
                </xsl:if>
                <xsl:if test="./*[local-name() = 'FormaDoruceniaRozhodnutia']/*[local-name() = 'TypSposobuDorucenia'] = 'Osobne'">
                    <xsl:value-of select="concat('&#09;&#09;',$formaDorucenia, ': Osobne','&#10;')" />
                    <xsl:value-of select="concat('&#09;&#09;&#09;', $miestoOsobnehoVyzdvihnutia, ': ', ./*[local-name() = 'FormaDoruceniaRozhodnutia']/*[local-name() = 'AdresatPodania'], '&#10;')" />
                    <xsl:if test="./*[local-name() = 'FormaDoruceniaRozhodnutia']/*[local-name() = 'AdresatPodania'] = 'Mestská časť'">
                        <xsl:value-of select="concat('&#09;&#09;&#09;', 'Mestská časť: ', ./*[local-name() = 'FormaDoruceniaRozhodnutia']/*[local-name() = 'MestskaCast']/*[local-name() = 'Name'], '&#10;')" />
                    </xsl:if>
                </xsl:if>
                <xsl:if test="./*[local-name() = 'FormaDoruceniaRozhodnutia']/*[local-name() = 'TypSposobuDorucenia'] = 'Fax'">
                    <xsl:value-of select="concat('&#09;&#09;',$formaDorucenia, ': Fax','&#10;')" />
                    <xsl:call-template name="base_telefon">
                        <xsl:with-param name="id_prefix" select="'Fax: '" />
                        <xsl:with-param name="values" select="./*[local-name() = 'FormaDoruceniaRozhodnutia']/*[local-name() = 'FaxPreDorucenie']" />
                        <xsl:with-param name="odsadenie" select="'&#09;&#09;'"/>
                    </xsl:call-template>
                </xsl:if>
                <xsl:if test="./*[local-name() = 'FormaDoruceniaRozhodnutia']/*[local-name() = 'TypSposobuDorucenia'] = 'Telefonicky'">
                    <xsl:value-of select="concat('&#09;&#09;',$formaDorucenia, ': Telefonicky','&#10;')" />
                    <xsl:call-template name="base_telefon">
                        <xsl:with-param name="id_prefix" select="'Telefónne číslo / mobil: '" />
                        <xsl:with-param name="values" select="./*[local-name() = 'FormaDoruceniaRozhodnutia']/*[local-name() = 'TelefonPreDorucenie']" />
                        <xsl:with-param name="odsadenie" select="'&#09;&#09;'"/>
                    </xsl:call-template>
                </xsl:if>
                <xsl:if test="./*[local-name() = 'FormaDoruceniaRozhodnutia']/*[local-name() = 'TypSposobuDorucenia'] = 'E-mail'">
                    <xsl:value-of select="concat('&#09;&#09;',$formaDorucenia, ': E-mail','&#10;')" />
                    <xsl:value-of select="concat('&#09;&#09;', 'E-mail: ', ./*[local-name() = 'FormaDoruceniaRozhodnutia']/*[local-name() = 'EmailPreDorucenie'],'&#10;')" />
                </xsl:if>
                <xsl:if test="./*[local-name() = 'FormaDoruceniaRozhodnutia']/*[local-name() = 'TypSposobuDorucenia'] = 'Bez odpovede'">
                    <xsl:value-of select="concat('&#09;&#09;',$formaDorucenia, ': Bez odpovede','&#10;')" />
                </xsl:if>
            </xsl:if>
        </xsl:for-each>
    </xsl:template>

    <xsl:template name="base_kontaktne_udaje">
        <xsl:param name="id_prefix" />
        <xsl:param name="values" />
        <xsl:param name="odsadenie" />
        
        <xsl:value-of select="concat($odsadenie, $id_prefix, '&#10;')" />
        
        <xsl:for-each select="$values">
            <xsl:value-of select="concat($odsadenie,'&#09;', 'E-mail: ', ./*[local-name() = 'Email'], '&#10;')"/>
            
            <xsl:if test="$values/*[local-name() = 'TelefonneCisloCele']">
                <xsl:value-of select="concat($odsadenie,'&#09;', 'Telefónne číslo: ', ./*[local-name() = 'TelefonneCisloCele'], '&#10;')"/>                
            </xsl:if>
            <xsl:if test="$values/*[local-name() = 'TelefonneCislo']">
                <xsl:for-each select="./*[local-name() = 'TelefonneCislo']">
                    <xsl:value-of select="concat($odsadenie,'&#09;', 'Telefónne číslo: ', ./*[local-name() = 'MedzinarodneVolacieCislo'], ' ', ./*[local-name() = 'Predvolba'], ' ', ./*[local-name() = 'Cislo'], '&#10;')"/>
                </xsl:for-each>
            </xsl:if>
            
            <xsl:if test="./*[local-name() = 'KontaktnaOsoba']">
                <xsl:value-of select="concat($odsadenie, '&#09;', 'Kontaktná osoba', '&#10;')" />
                <xsl:for-each select="./*[local-name() = 'KontaktnaOsoba']">
                    <xsl:value-of select="concat($odsadenie, '&#09;&#09;', 'Meno: ', ./*[local-name() = 'Meno'], '&#10;')"/>
                    <xsl:value-of select="concat($odsadenie, '&#09;&#09;', 'Priezvisko: ', ./*[local-name() = 'Priezvisko'], '&#10;')"/>
                </xsl:for-each>
            </xsl:if>
        </xsl:for-each>
    </xsl:template>

    <xsl:template name="base_telefon">
        <xsl:param name="id_prefix" />
        <xsl:param name="values" />
        <xsl:param name="odsadenie" />

        <xsl:value-of select="concat($odsadenie, $id_prefix)" />
        <xsl:value-of select="concat($values/*[local-name() = 'MedzinarodneVolacieCislo'], ' ')" />
        <xsl:value-of select="concat($values/*[local-name() = 'Predvolba'], ' ')" />
        <xsl:value-of select="concat($values/*[local-name() = 'Cislo'], '&#10;')" />
    </xsl:template>

    <xsl:template name="base_ziadatel">
        <xsl:param name="id_prefix" />
        <xsl:param name="values" />
        <xsl:param name="odsadenie" />
        <xsl:param name="menoZastupcuText" select="'Meno zástupcu'" />
        <xsl:param name="priezviskoZastupcuText" select="'Priezvisko zástupcu'" />
        
        <xsl:value-of select="concat($odsadenie, $id_prefix, '&#10;')" />
        
        <xsl:for-each select="$values">
            <xsl:value-of select="concat($odsadenie, '&#09;', 'Typ osoby: ', ./*[local-name() = 'TypOsoby']/*[local-name() = 'Name'], '&#10;')" />
            <xsl:for-each select="./*[local-name() = 'IdentifikaciaOsoby']">
                <xsl:if test="(../*[local-name() = 'TypOsoby']/*[local-name() = 'Code'] = 'FO') or (../*[local-name() = 'TypOsoby']/*[local-name() = 'Code'] = 'FOP')">
                    <xsl:value-of select="concat($odsadenie, '&#09;', 'Meno: ', ./*[local-name() = 'Meno'], '&#10;')" />
                    <xsl:value-of select="concat($odsadenie, '&#09;', 'Priezvisko: ', ./*[local-name() = 'Priezvisko'], '&#10;')" />
                    <xsl:value-of select="concat($odsadenie, '&#09;', 'Rodné priezvisko: ', ./*[local-name() = 'RodnePriezvisko'], '&#10;')" />
                    <xsl:call-template name="base_array_to_string">
                        <xsl:with-param name="id_prefix" select="'Titul pred menom'" />
                        <xsl:with-param name="value" select="./*[local-name() = 'TitulyPredMenom']" />
                        <xsl:with-param name="odsadenie" select="concat($odsadenie, '&#09;')" />
                        <xsl:with-param name="arrayName" select="'TitulPredMenom'" />
                    </xsl:call-template>
                    <xsl:call-template name="base_array_to_string">
                        <xsl:with-param name="id_prefix" select="'Titul za menom'" />
                        <xsl:with-param name="value" select="./*[local-name() = 'TitulyZaMenom']" />
                        <xsl:with-param name="odsadenie" select="concat($odsadenie, '&#09;')" />
                        <xsl:with-param name="arrayName" select="'TitulZaMenom'" />
                    </xsl:call-template>
                    <xsl:if test="./*[local-name() = 'RodneCislo']">
                        <xsl:value-of select="concat($odsadenie, '&#09;', 'Rodné číslo: ', ./*[local-name() = 'RodneCislo'], '&#10;')"/>
                    </xsl:if>
                    <xsl:if test="./*[local-name() = 'DatumNarodenia']">
                        <xsl:call-template name="base_date_with_name">
                            <xsl:with-param name="title" select="'Dátum narodenia'" />
                            <xsl:with-param name="value" select="./*[local-name() = 'DatumNarodenia']" />
                            <xsl:with-param name="odsadenie" select="concat($odsadenie, '&#09;')" />
                        </xsl:call-template>
                    </xsl:if>
                    <xsl:if test="./*[local-name() = 'CisloObcianskehoPreukazu']">
                        <xsl:value-of select="concat($odsadenie, '&#09;', 'Číslo občianského preukazu: ', ./*[local-name() = 'CisloObcianskehoPreukazu'], '&#10;')"/>
                    </xsl:if>
                </xsl:if>
                
                <xsl:if test="(../*[local-name() = 'TypOsoby']/*[local-name() = 'Code'] = 'PO') or (../*[local-name() = 'TypOsoby']/*[local-name() = 'Code'] = 'FOP')">
                    <xsl:value-of select="concat($odsadenie, '&#09;', 'Obchodné meno / názov: ', ./*[local-name() = 'ObchodneMenoNazov'], '&#10;')" />
                    <xsl:value-of select="concat($odsadenie, '&#09;', 'Právna forma: ', ./*[local-name() = 'PravnaForma']/*[local-name() = 'Name'], '&#10;')" />
                    <xsl:if test="./*[local-name() = 'MenoZastupcu']">
                        <xsl:value-of select="concat($odsadenie, '&#09;', $menoZastupcuText, ': ', ./*[local-name() = 'MenoZastupcu'], '&#10;')" />
                    </xsl:if>
                    <xsl:if test="./*[local-name() = 'PriezviskoZastupcu']">
                        <xsl:value-of select="concat($odsadenie, '&#09;', $priezviskoZastupcuText, ': ', ./*[local-name() = 'PriezviskoZastupcu'], '&#10;')" />
                    </xsl:if>
                    <xsl:value-of select="concat($odsadenie, '&#09;', 'IČO: ', ./*[local-name() = 'ICO'], '&#10;')" />
                    <xsl:value-of select="concat($odsadenie, '&#09;', 'DIČ: ', ./*[local-name() = 'DIC'], '&#10;')" />
                </xsl:if>
                
                <xsl:if test="(../*[local-name() = 'TypOsoby']/*[local-name() = 'Code'] = 'FO')">                
                    <xsl:if test="./*[local-name() = 'DIC']">
                        <xsl:value-of select="concat($odsadenie, '&#09;', 'DIČ: ', ./*[local-name() = 'DIC'], '&#10;')" />
                    </xsl:if>
                </xsl:if>

                <xsl:if test="(../*[local-name() = 'TypOsoby']/*[local-name() = 'Code'] = 'MC')">
                    <xsl:value-of select="concat($odsadenie, '&#09;', 'Mestská časť: ', ./*[local-name() = 'MestskaCast']/*[local-name() = 'Name'], '&#10;')" />
                    <xsl:if test="./*[local-name() = 'MenoZastupcu']">
                        <xsl:value-of select="concat($odsadenie, '&#09;', 'Meno zástupcu: ', ./*[local-name() = 'MenoZastupcu'], '&#10;')" />
                    </xsl:if>
                    <xsl:if test="./*[local-name() = 'PriezviskoZastupcu']">
                        <xsl:value-of select="concat($odsadenie, '&#09;', 'Priezvisko zástupcu: ', ./*[local-name() = 'PriezviskoZastupcu'], '&#10;')" />
                    </xsl:if>
                    <xsl:value-of select="concat($odsadenie, '&#09;', 'IČO: ', ./*[local-name() = 'ICO'], '&#10;')" />
                    <xsl:value-of select="concat($odsadenie, '&#09;', 'DIČ: ', ./*[local-name() = 'DIC'], '&#10;')" />
                </xsl:if>
            </xsl:for-each>
        </xsl:for-each>
    </xsl:template>

    <xsl:template name="format_date">
        <xsl:param name="instr"/>
        <!-- YYYY-MM-DD -->
        <xsl:variable name="yyyy">
            <xsl:value-of select="substring($instr,1,4)"/>
        </xsl:variable>
        <xsl:variable name="mm">
            <xsl:value-of select="substring($instr,6,2)"/>
        </xsl:variable>
        <xsl:variable name="dd">
            <xsl:value-of select="substring($instr,9,2)"/>
        </xsl:variable>

        <xsl:value-of select="concat($dd,'.',$mm,'.',$yyyy)"/>
    </xsl:template>

    <xsl:template name="zakladne_vyhlasenie">
        <xsl:param name="value" />

        <xsl:text>Vyhlásenie&#10;</xsl:text>
        <xsl:for-each select="$value" >
            <xsl:value-of select="concat('&#09;', ./*[local-name() = 'SpravnostUdajovText'], '&#10;')" />
            <xsl:value-of select="concat('&#09;', ./*[local-name() = 'SuhlasSoSpracovanimText'], '&#10;')" />
            <xsl:text>&#10;</xsl:text>
            <xsl:value-of select="concat('&#09;', ./*[local-name() = 'PoskytujemSuhlasText'], ': ')" />
            <xsl:choose>
                <xsl:when test="./*[local-name() = 'PoskytujemSuhlas'] = 'true'">
                    <xsl:text>Áno&#10;</xsl:text>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:text>Nie&#10;</xsl:text>
                </xsl:otherwise>
            </xsl:choose>
            <xsl:value-of select="concat('&#09;', ./*[local-name() = 'NeposkytujemSuhlasText'], ': ')" />
            <xsl:choose>
                <xsl:when test="./*[local-name() = 'NeposkytujemSuhlas'] = 'true'">
                    <xsl:text>Áno&#10;</xsl:text>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:text>Nie&#10;</xsl:text>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:for-each>
    </xsl:template>


    <xsl:template match="/z:E-form">
        <xsl:value-of select="concat(z:Meta/z:Name, '&#10;')" />

        <xsl:text>Priznanie&#10;</xsl:text>
        <xsl:value-of
            select="concat('&#09;', 'Druh priznania: ', z:Body/z:DruhPriznania/z:Name, '&#10;')" />
        <xsl:value-of select="concat('&#09;', 'Na rok: ', z:Body/z:NaRok, '&#10;')" />

        <xsl:call-template name="base_ziadatel">
            <xsl:with-param name="id_prefix" select="'Identifikačné údaje daňovníka'" />
            <xsl:with-param name="values" select="z:Body/z:Danovnik" />
            <xsl:with-param name="odsadenie" select="''" />
        </xsl:call-template>

        <xsl:call-template name="base_adresa">
            <xsl:with-param name="id_prefix" select="z:Body/z:Danovnik/z:TypOsoby/z:Code"/>
            <xsl:with-param name="values" select="z:Body/z:AdresaDanovnika" />
            <xsl:with-param name="odsadenie" select="''" />
        </xsl:call-template>

        <xsl:call-template name="base_kontaktne_udaje">
            <xsl:with-param name="id_prefix" select="'Kontaktné údaje'" />
            <xsl:with-param name="values"
                select="z:Body/z:KontaktneUdajeDanovnika" />
            <xsl:with-param name="odsadenie" select="''" />
        </xsl:call-template>

        <xsl:text>Oprávnená osoba&#10;</xsl:text>
        <xsl:text>&#09;Identifikačné údaje oprávnenej osoby&#10;</xsl:text>
        <xsl:value-of
            select="concat('&#09;&#09;', 'Právny vzťah: ', z:Body/z:OpravnenaOsoba/z:PravnyVztah/z:Name, '&#10;')" />
        <xsl:value-of
            select="concat('&#09;&#09;', 'Meno: ', z:Body/z:OpravnenaOsoba/z:Meno, '&#10;')" />
        <xsl:value-of
            select="concat('&#09;&#09;', 'Priezvisko: ', z:Body/z:OpravnenaOsoba/z:Priezvisko, '&#10;')" />
        <xsl:call-template name="base_array_to_string">
            <xsl:with-param name="id_prefix" select="'Titul pred menom'" />
            <xsl:with-param name="value" select="z:Body/z:OpravnenaOsoba/*[local-name() = 'TitulyPredMenom']" />
            <xsl:with-param name="odsadenie" select="'&#09;&#09;'" />
            <xsl:with-param name="arrayName" select="'TitulPredMenom'" />
        </xsl:call-template>
        <xsl:call-template name="base_array_to_string">
            <xsl:with-param name="id_prefix" select="'Titul za menom'" />
            <xsl:with-param name="value" select="z:Body/z:OpravnenaOsoba/*[local-name() = 'TitulyZaMenom']" />
            <xsl:with-param name="odsadenie" select="'&#09;&#09;'" />
            <xsl:with-param name="arrayName" select="'TitulZaMenom'" />
        </xsl:call-template>
        <xsl:value-of
            select="concat('&#09;&#09;', 'Obchodné meno / názov: ', z:Body/z:OpravnenaOsoba/z:ObchodneMenoNazov, '&#10;')" />
        <xsl:call-template name="base_adresa">
            <xsl:with-param name="id_prefix"
                select="'Adresa trvalého bydliska / Adresa sídla spoločnosti'" />
            <xsl:with-param name="values"
                select="z:Body/z:OpravnenaOsoba/z:AdresaOpravnenejOsoby" />
            <xsl:with-param name="odsadenie" select="'&#09;'" />
        </xsl:call-template>
        <xsl:call-template name="base_kontaktne_udaje">
            <xsl:with-param name="id_prefix" select="'Kontaktné údaje'" />
            <xsl:with-param name="values"
                select="z:Body/z:OpravnenaOsoba/z:KontaktneUdajeOpravnenejOsoby" />
            <xsl:with-param name="odsadenie" select="'&#09;'" />
        </xsl:call-template>

        <xsl:if test="z:Body/*[local-name() = 'DanZPozemkov']">
            <xsl:text>II. Oddiel - Daň z pozemkov&#10;</xsl:text>
            <xsl:for-each select="z:Body/z:DanZPozemkov/z:DanZPozemkovZaznam">
            <xsl:value-of select="concat('&#09;', 'Záznam číslo ', position(), '&#10;')" />
                        
            <xsl:value-of
                select="concat('&#09;&#09;', 'Obec, kde sa pozemok nachádza: ', z:Obec, '&#10;')" />
            <xsl:choose>
                <xsl:when
                    test="z:HodnotaPozemkuUrcenaZnalcom = 'true'">
                    <xsl:value-of
                        select="concat('&#09;&#09;', 'Hodnota pozemku určená znaleckým posudkom: ', 'Áno', '&#10;')" />
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of
                        select="concat('&#09;&#09;', 'Hodnota pozemku určená znaleckým posudkom: ', 'Nie', '&#10;')" />
                </xsl:otherwise>
            </xsl:choose>
            <xsl:value-of
                select="concat('&#09;&#09;', 'Právny vzťah: ', z:PravnyVztah/z:Name, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Spoluvlastníctvo: ', z:Spoluvlastnictvo/z:Name, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Počet spoluvlastníkov: ', z:PocetSpoluvlastnikov, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Rodné číslo manžela/manželky: ', z:RodneCisloManzelaAleboManzelky, '&#10;')" />
            <xsl:choose>
                <xsl:when
                    test="z:SpoluvlastnikUrcenyDohodou = 'true'">
                    <xsl:value-of
                        select="concat('&#09;&#09;', 'Spoluvlastník určený dohodou: ', 'Áno', '&#10;')" />
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of
                        select="concat('&#09;&#09;', 'Spoluvlastník určený dohodou: ', 'Nie', '&#10;')" />
                </xsl:otherwise>
            </xsl:choose>
            <xsl:text>&#09;&#09;Pozemky&#10;</xsl:text>
            <xsl:for-each
                select="z:Pozemky/*[local-name() = 'Pozemok']">
                <xsl:value-of
                    select="concat('&#09;&#09;&#09;', 'Poradové číslo záznamu ', ./z:PoradoveCislo, ':', '&#10;')" />
                <xsl:value-of
                    select="concat('&#09;&#09;&#09;&#09;', 'Názov katastrálneho územia: ', ./z:NazovKatastralnehoUzemia/z:Name, '&#10;')" />
                <xsl:value-of
                    select="concat('&#09;&#09;&#09;&#09;', 'Číslo parcely: ', ./z:CisloParcely, '&#10;')" />
                <xsl:value-of
                    select="concat('&#09;&#09;&#09;&#09;', 'Výmera pozemku: ', ./z:Vymera, '&#10;')" />
                <xsl:value-of
                    select="concat('&#09;&#09;&#09;&#09;', 'Druh pozemku: ', ./z:DruhPozemku/z:Name, '&#10;')" />
                <xsl:value-of
                    select="concat('&#09;&#09;&#09;&#09;', 'Využitie pozemku: ', ./z:VyuzitiePozemku, '&#10;')" />
                <xsl:value-of
                    select="concat('&#09;&#09;&#09;&#09;', 'Dátum vzniku daňovej povinosti: ')" />
                <xsl:call-template name="format_date">
                    <xsl:with-param name="instr"
                        select="./z:DatumVznikuDanovejPovinnosti" />
                </xsl:call-template>
                <xsl:value-of select="'&#10;'" />
                <xsl:value-of
                    select="concat('&#09;&#09;&#09;&#09;', 'Dátum zániku daňovej povinosti: ')" />
                <xsl:call-template name="format_date">
                    <xsl:with-param name="instr"
                        select="./z:DatumZanikuDanovejPovinnosti" />
                </xsl:call-template>
                <xsl:value-of select="'&#10;'" />
            </xsl:for-each>
            <xsl:value-of
                select="concat('&#09;&#09;', 'Poznámka: ', z:Poznamka, '&#10;')" />
            </xsl:for-each>
        </xsl:if>

        <xsl:if test="z:Body/*[local-name() = 'DanZoStaviebJedenUcel']">
            <xsl:text>III. Oddiel - Daň zo stavieb - stavba slúžiaca na jeden účel&#10;</xsl:text>
            <xsl:for-each select="z:Body/z:DanZoStaviebJedenUcel/z:DanZoStaviebJedenUcelZaznam">
            
            <xsl:value-of select="concat('&#09;', 'Záznam číslo ', position(), '&#10;')" />
            <xsl:call-template name="base_adresa">
                <xsl:with-param name="id_prefix" select="'Adresa stavby'" />
                <xsl:with-param name="values"
                    select="z:AdresaStavby" />
                <xsl:with-param name="odsadenie" select="'&#09;&#09;'" />
            </xsl:call-template>
            <xsl:value-of
                select="concat('&#09;&#09;', 'Názov katastrálneho územia: ', z:NazovKatastralnehoUzemia/z:Name, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Číslo parcely: ', z:CisloParcely, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Právny vzťah: ', z:PravnyVztah/z:Name, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Spoluvlastníctvo: ', z:Spoluvlastnictvo/z:Name, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Počet spoluvlastníkov: ', z:PocetSpoluvlastnikov, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Rodné číslo manžela/manželky: ', z:RodneCisloManzelaAleboManzelky, '&#10;')" />
            <xsl:choose>
                <xsl:when
                    test="z:SpoluvlastnikUrcenyDohodou = 'true'">
                    <xsl:value-of
                        select="concat('&#09;&#09;', 'Spoluvlastník určený dohodou: ', 'Áno', '&#10;')" />
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of
                        select="concat('&#09;&#09;', 'Spoluvlastník určený dohodou: ', 'Nie', '&#10;')" />
                </xsl:otherwise>
            </xsl:choose>
            <xsl:value-of select="concat('&#09;&#09;', 'Dátum vzniku daňovej povinosti: ')" />
            <xsl:call-template name="format_date">
                <xsl:with-param name="instr"
                    select="z:DatumVznikuDanovejPovinnosti" />
            </xsl:call-template>
            <xsl:value-of select="'&#10;'" />
            <xsl:value-of select="concat('&#09;&#09;', 'Dátum zániku daňovej povinosti: ')" />
            <xsl:call-template name="format_date">
                <xsl:with-param name="instr"
                    select="z:DatumZanikuDanovejPovinnosti" />
            </xsl:call-template>
            <xsl:value-of select="'&#10;'" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Predmet dane: ', z:PredmetDane/z:Name, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Základ dane (výmera zastavanej plochy stavby, u spoluvlastníkov vo výške ich spoluvlastníckeho podielu): ', z:ZakladDane, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Počet nadzemných a podzemných podlaží okrem prvého nadzemného podlažia: ', z:PocetPodlazi, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Celková výmera podlahových plôch všetkých podlaží stavby (u spoluvlastníkov vo výške ich spoluvlastníckeho podielu): ', z:CelkovaVymeraPodlahovychPloch, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Výmera podlahových plôch časti stavby, ktorá je oslobodená od dane zo stavieb (u spoluvlastníkov vo výške ich spoluvlastníckeho podielu): ', z:VymeraPlochOslobodenychOdDane, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Poznámka: ', z:Poznamka, '&#10;')" />
            </xsl:for-each>
        </xsl:if>

        <xsl:if test="z:Body/*[local-name() = 'DanZoStaviebViacereUcely']">
            <xsl:text>III. Oddiel - Daň zo stavieb - stavba slúžiaca na viaceré účely&#10;</xsl:text>
            <xsl:for-each select="z:Body/z:DanZoStaviebViacereUcely/z:DanZoStaviebViacereUcelyZaznam">
            <xsl:value-of select="concat('&#09;', 'Záznam číslo ', position(), '&#10;')" />
            <xsl:call-template name="base_adresa">
                <xsl:with-param name="id_prefix" select="'Adresa stavby'" />
                <xsl:with-param name="values"
                    select="z:AdresaStavby" />
                <xsl:with-param name="odsadenie" select="'&#09;&#09;'" />
            </xsl:call-template>
            <xsl:value-of
                select="concat('&#09;&#09;', 'Názov katastrálneho územia: ', z:NazovKatastralnehoUzemia/z:Name, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Číslo parcely: ', z:CisloParcely, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Právny vzťah: ', z:PravnyVztah/z:Name, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Spoluvlastníctvo: ', z:Spoluvlastnictvo/z:Name, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Počet spoluvlastníkov: ', z:PocetSpoluvlastnikov, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Rodné číslo manžela/manželky: ', z:RodneCisloManzelaAleboManzelky, '&#10;')" />
            <xsl:choose>
                <xsl:when
                    test="z:SpoluvlastnikUrcenyDohodou = 'true'">
                    <xsl:value-of
                        select="concat('&#09;&#09;', 'Spoluvlastník určený dohodou: ', 'Áno', '&#10;')" />
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of
                        select="concat('&#09;&#09;', 'Spoluvlastník určený dohodou: ', 'Nie', '&#10;')" />
                </xsl:otherwise>
            </xsl:choose>
            <xsl:value-of
                select="concat('&#09;&#09;', 'Popis stavby: ', z:PopisStavby, '&#10;')" />
            <xsl:value-of select="concat('&#09;&#09;', 'Dátum vzniku daňovej povinosti: ')" />
            <xsl:call-template name="format_date">
                <xsl:with-param name="instr"
                    select="z:DatumVznikuDanovejPovinnosti" />
            </xsl:call-template>
            <xsl:value-of select="'&#10;'" />
            <xsl:value-of select="concat('&#09;&#09;', 'Dátum zániku daňovej povinosti: ')" />
            <xsl:call-template name="format_date">
                <xsl:with-param name="instr"
                    select="z:DatumZanikuDanovejPovinnosti" />
            </xsl:call-template>
            <xsl:value-of select="'&#10;'" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Základ dane (výmera zastavanej plochy stavby, u spoluvlastníkov vo výške ich spoluvlastníckeho podielu): ', z:ZakladDane, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Celková výmera podlahových plôch všetkých podlaží stavby (u spoluvlastníkov vo výške ich spoluvlastníckeho podielu): ', z:CelkovaVymeraPodlahovychPloch, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Výmera podlahových plôch časti stavby, ktorá je oslobodená od dane zo stavieb (u spoluvlastníkov vo výške ich spoluvlastníckeho podielu): ', z:VymeraPlochOslobodenychOdDane, '&#10;')" />
            <xsl:text>&#09;&#09;Výmera podlahových plôch časti stavby využívanej na jednotlivý účel (u spoluvlastníkov vo výške ich spoluvlastníckeho podielu)&#10;</xsl:text>
            <xsl:for-each
                select="z:VymeraPlochNaJednotliveUcely/*[local-name() = 'VymeraPlochNaJednotlivyUcel']">
                <xsl:value-of
                    select="concat('&#09;&#09;&#09;', ./z:Ucel/z:Name, ': ', ./z:Vymera, '&#10;')" />
            </xsl:for-each>
            <xsl:value-of
                select="concat('&#09;&#09;', 'Počet nadzemných a podzemných podlaží okrem prvého nadzemného podlažia: ', z:PocetPodlazi, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Poznámka: ', z:Poznamka, '&#10;')" />
        </xsl:for-each>
        </xsl:if>

        <xsl:if test="z:Body/*[local-name() = 'DanZBytovANebytovychPriestorov']">
            <xsl:text>IV. Oddiel - Daň z bytov a z nebytových priestorov v bytovom dome&#10;</xsl:text>
            <xsl:for-each select="z:Body/z:DanZBytovANebytovychPriestorov/z:DanZBytovANebytovychPriestorovZaznam">
            <xsl:value-of select="concat('&#09;', 'Záznam číslo ', position(), '&#10;')" />
            <xsl:call-template name="base_adresa">
                <xsl:with-param name="id_prefix" select="'Adresa bytu'" />
                <xsl:with-param name="values"
                    select="z:AdresaBytu" />
                <xsl:with-param name="odsadenie" select="'&#09;&#09;'" />
            </xsl:call-template>
            <xsl:value-of
                select="concat('&#09;&#09;', 'Názov katastrálneho územia: ', z:NazovKatastralnehoUzemia/z:Name, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Číslo parcely: ', z:CisloParcely, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Číslo bytu: ', z:CisloBytu, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Právny vzťah: ', z:PravnyVztah/z:Name, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Spoluvlastníctvo: ', z:Spoluvlastnictvo/z:Name, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Počet spoluvlastníkov: ', z:PocetSpoluvlastnikov, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Rodné číslo manžela/manželky: ', z:RodneCisloManzelaAleboManzelky, '&#10;')" />
            <xsl:choose>
                <xsl:when
                    test="z:SpoluvlastnikUrcenyDohodou = 'true'">
                    <xsl:value-of
                        select="concat('&#09;&#09;', 'Spoluvlastník určený dohodou: ', 'Áno', '&#10;')" />
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of
                        select="concat('&#09;&#09;', 'Spoluvlastník určený dohodou: ', 'Nie', '&#10;')" />
                </xsl:otherwise>
            </xsl:choose>
            <xsl:value-of
                select="concat('&#09;&#09;', 'Popis bytu: ', z:PopisBytu, '&#10;')" />
            <xsl:value-of select="concat('&#09;&#09;', 'Dátum vzniku daňovej povinosti: ')" />
            <xsl:call-template name="format_date">
                <xsl:with-param name="instr"
                    select="z:DatumVznikuDanovejPovinnosti" />
            </xsl:call-template>
            <xsl:value-of select="'&#10;'" />
            <xsl:value-of select="concat('&#09;&#09;', 'Dátum zániku daňovej povinosti: ')" />
            <xsl:call-template name="format_date">
                <xsl:with-param name="instr"
                    select="z:DatumZanikuDanovejPovinnosti" />
            </xsl:call-template>
            <xsl:value-of select="'&#10;'" />
            <xsl:text>&#09;&#09;Základ dane (výmera podlahovej plochy u spoluvlastníkov vo výške ich spoluvlastníckeho podielu)&#10;</xsl:text>
            <xsl:value-of
                select="concat('&#09;&#09;&#09;', 'a) Bytu: ', z:ZakladDane/z:Byt, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;&#09;', 'b) Nebytového priestoru v bytovom dome: ', z:ZakladDane/z:NebytovyPriestor, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;', 'Výmera podlahovej plochy bytu alebo časti bytu v bytovom dome, ktorý sa využíva na iný účel ako na bývanie: ', z:VymeraPodlahovejPlochyVyuzivanejNaIneUcely, '&#10;')" />
            <xsl:text>&#09;&#09;Byt alebo nebytový priestor v bytovom dome alebo ich časti oslobodené od dane z bytov&#10;</xsl:text>
            <xsl:value-of
                select="concat('&#09;&#09;&#09;', 'a) Výmera podlahovej plochy bytu alebo jeho časti: ', z:VymeraPlochOslobodenychOdDane/z:Byt, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;&#09;&#09;', 'b) Výmera podlahovej plochy nebytového priestoru v bytovom dome alebo jeho časti: ', z:VymeraPlochOslobodenychOdDane/z:NebytovyPriestor, '&#10;')" />
            <xsl:text>&#09;&#09;Nebytové priestory&#10;</xsl:text>
            <xsl:for-each
                select="z:NebytovePriestory/*[local-name() = 'NebytovyPriestor']">
                <xsl:value-of
                    select="concat('&#09;&#09;&#09;', 'Nebytový priestor č.', ./z:PoradoveCislo, ':', '&#10;')" />
                <xsl:value-of
                    select="concat('&#09;&#09;&#09;&#09;', 'Číslo nebytového priestoru v bytovom dome: ', ./z:CisloVBytovomDome, '&#10;')" />
                <xsl:value-of
                    select="concat('&#09;&#09;&#09;&#09;', 'Účel využitia nebytového priestoru v bytovom dome: ', ./z:UcelVyuzitiaVBytovomDome, '&#10;')" />
                <xsl:value-of
                    select="concat('&#09;&#09;&#09;&#09;', 'Výmera podlahových plôch nebytového priestoru v bytovom dome: ', ./z:VymeraPodlahovychPloch, '&#10;')" />
                <xsl:value-of
                    select="concat('&#09;&#09;&#09;&#09;', 'Dátum vzniku daňovej povinosti: ')" />
                <xsl:call-template name="format_date">
                    <xsl:with-param name="instr"
                        select="./z:DatumVznikuDanovejPovinnosti" />
                </xsl:call-template>
                <xsl:value-of select="'&#10;'" />
                <xsl:value-of
                    select="concat('&#09;&#09;&#09;&#09;', 'Dátum zániku daňovej povinosti: ')" />
                <xsl:call-template name="format_date">
                    <xsl:with-param name="instr"
                        select="./z:DatumZanikuDanovejPovinnosti" />
                </xsl:call-template>
                <xsl:value-of select="'&#10;'" />
            </xsl:for-each>
            <xsl:value-of
                select="concat('&#09;&#09;', 'Poznámka: ', z:Poznamka, '&#10;')" />
        </xsl:for-each>
        </xsl:if>

        <xsl:if test="z:Body/*[local-name() = 'Priloha']">
            <xsl:text>Príloha – Zníženie alebo oslobodenie od dane&#10;</xsl:text>
            <xsl:value-of
                select="concat('&#09;', 'Obec: ', z:Body/z:Priloha/z:Obec, '&#10;')" />
            <xsl:text>&#09;K oddielu II. Pozemky&#10;</xsl:text>
            <xsl:text>&#09;&#09;a) Pozemky vo vlastníctve právnických osôb, ktoré nie sú založené alebo zriadené na podnikanie: </xsl:text>
            <xsl:choose>
                <xsl:when test="z:Body/z:Priloha/z:PozemkyA = 'true'">Áno&#10;</xsl:when>
                <xsl:otherwise>Nie&#10;</xsl:otherwise>
            </xsl:choose>
            <xsl:text>&#09;&#09;b) Pozemky, na ktorých sú cintoríny, kolumbáriá, urnové háje a rozptylové lúky: </xsl:text>
            <xsl:choose>
                <xsl:when test="z:Body/z:Priloha/z:PozemkyB = 'true'">Áno&#10;</xsl:when>
                <xsl:otherwise>Nie&#10;</xsl:otherwise>
            </xsl:choose>
            <xsl:text>&#09;&#09;c) Močiare, plochy slatín a slancov, rašeliniská, remízky, háje vetrolamy a pásma hygienickej ochrany vodných zdrojov I. a II. stupňa, pásma ochrany prírodných liečivých zdrojov I. a II. stupňa a zdrojov prírodných minerálnych vôd stolových I. a II. stupňa: </xsl:text>
            <xsl:choose>
                <xsl:when test="z:Body/z:Priloha/z:PozemkyC = 'true'">Áno&#10;</xsl:when>
                <xsl:otherwise>Nie&#10;</xsl:otherwise>
            </xsl:choose>
            <xsl:text>&#09;&#09;d) Časti pozemkov, na ktorých sú zriadené meračské značky, signály a iné zariadenia bodov, geodetických základov, stožiare rozvodu elektrickej energie, stĺpy telekomunikačného vedenia a televízne prevádzače, nadzemné časti zariadení na rozvod vykurovacích plynov a pásy pozemkov v lesoch vyčlenené na rozvod elektrickej energie a vykurovacích plynov: </xsl:text>
            <xsl:choose>
                <xsl:when test="z:Body/z:Priloha/z:PozemkyD = 'true'">Áno&#10;</xsl:when>
                <xsl:otherwise>Nie&#10;</xsl:otherwise>
            </xsl:choose>
            <xsl:text>&#09;&#09;e) Pozemky verejne prístupných parkov, priestorov a športovísk: </xsl:text>
            <xsl:choose>
                <xsl:when test="z:Body/z:Priloha/z:PozemkyE = 'true'">Áno&#10;</xsl:when>
                <xsl:otherwise>Nie&#10;</xsl:otherwise>
            </xsl:choose>
            <xsl:text>&#09;&#09;f) Pozemky v národných parkoch, chránených krajinných oblastiach, chránených areáloch, prírodných rezerváciách, národných prírodných rezerváciách, prírodných pamiatkach, národných prírodných pamiatkach, chránených krajinných prvkoch, vo vyhlásených ochranných pásmach s III. a IV. stupňom ochrany a územiach medzinárodného významu: </xsl:text>
            <xsl:choose>
                <xsl:when test="z:Body/z:Priloha/z:PozemkyF = 'true'">Áno&#10;</xsl:when>
                <xsl:otherwise>Nie&#10;</xsl:otherwise>
            </xsl:choose>
            <xsl:text>&#09;&#09;g) Pozemky funkčne spojené so stavbami slúžiacimi verejnej doprave: </xsl:text>
            <xsl:choose>
                <xsl:when test="z:Body/z:Priloha/z:PozemkyG = 'true'">Áno&#10;</xsl:when>
                <xsl:otherwise>Nie&#10;</xsl:otherwise>
            </xsl:choose>
            <xsl:text>&#09;&#09;h) Pozemky užívané školami a školskými zariadeniami: </xsl:text>
            <xsl:choose>
                <xsl:when test="z:Body/z:Priloha/z:PozemkyH = 'true'">Áno&#10;</xsl:when>
                <xsl:otherwise>Nie&#10;</xsl:otherwise>
            </xsl:choose>
            <xsl:text>&#09;&#09;i) Lesné pozemky od nasledujúceho roka po vzniku holiny do roku plánovaného začatia výchovnej ťažby (prvej prebierky): </xsl:text>
            <xsl:choose>
                <xsl:when test="z:Body/z:Priloha/z:PozemkyI = 'true'">Áno&#10;</xsl:when>
                <xsl:otherwise>Nie&#10;</xsl:otherwise>
            </xsl:choose>
            <xsl:text>&#09;&#09;j) Pozemky, ktorých hospodárske využívanie je obmedzené vzhľadom na podkopanie, ich umiestnenie v oblasti dobývacích priestorov alebo pásiem hygienickej ochrany vody II. a III. stupňa, ochranu a tvorbu životného prostredia, ich postihnutie ekologickým katastrofami, nadmerným imisným zaťažením, na pozemky rekultivované investičným zúrodňovaním okrem rekultivácii plne financovaných zo štátneho rozpočtu, na rokliny, výmole, vymedzené s kroviskami alebo kamením, pásma ochrany prírodných liečivých zdrojov II. a III. stupňa a zdrojov prírodných minerálnych vôd stolových II. a III. stupňa, na genofondové plochy, brehové porasty a iné plochy stromovej a krovinatej vegetácie na nelesných pozemkoch s pôdoochranou, ekologickou alebo krajinotvornou funkciou: </xsl:text>
            <xsl:choose>
                <xsl:when test="z:Body/z:Priloha/z:PozemkyJ = 'true'">Áno&#10;</xsl:when>
                <xsl:otherwise>Nie&#10;</xsl:otherwise>
            </xsl:choose>
            <xsl:text>&#09;&#09;k) Pozemky, ktorých vlastníkmi sú fyzické osoby v hmotnej núdzi alebo fyzické osoby staršie ako 62 rokov, ak tieto pozemky slúžia výhradne na ich osobnú potrebu: </xsl:text>
            <xsl:choose>
                <xsl:when test="z:Body/z:Priloha/z:PozemkyK = 'true'">Áno&#10;</xsl:when>
                <xsl:otherwise>Nie&#10;</xsl:otherwise>
            </xsl:choose>
            <xsl:text>&#09;&#09;l) pozemky okrem pozemkov v zastavanej časti obce, na ktorých vykonávajú samostatne hospodáriaci roľníci poľnohospodársku výrobu ako svoju hlavnú činnosť: </xsl:text>
            <xsl:choose>
                <xsl:when test="z:Body/z:Priloha/z:PozemkyL = 'true'">Áno&#10;</xsl:when>
                <xsl:otherwise>Nie&#10;</xsl:otherwise>
            </xsl:choose>
    
            <xsl:text>&#09;K oddielu III. - Stavby&#10;</xsl:text>
            <xsl:text>&#09;&#09;a) stavby vo vlastníctve právnických osôb, ktoré nie sú založené alebo zriadené na podnikanie: </xsl:text>
            <xsl:choose>
                <xsl:when test="z:Body/z:Priloha/z:StavbyA = 'true'">Áno&#10;</xsl:when>
                <xsl:otherwise>Nie&#10;</xsl:otherwise>
            </xsl:choose>
            <xsl:text>&#09;&#09;b) stavby slúžiace školám, školským zariadeniam a zdravotníckym zariadeniam, zariadeniam na pracovnú rehabilitáciu a rekvalifikáciu občanov so zmenenou pracovnou schopnosťou, stavby užívané na účely sociálnej pomoci a múzeá, galérie, knižnice, divadlá, kiná, amfiteátre, výstavné siene, osvetové zariadenia: </xsl:text>
            <xsl:choose>
                <xsl:when test="z:Body/z:Priloha/z:StavbyB = 'true'">Áno&#10;</xsl:when>
                <xsl:otherwise>Nie&#10;</xsl:otherwise>
            </xsl:choose>
            <xsl:text>&#09;&#09;c) stavby, ktorých využitie je obmedzené z dôvodu rozsiahlej rekonštrukcie, stavebnej uzávery alebo umiestnenia na podkopanom pozemku: </xsl:text>
            <xsl:choose>
                <xsl:when test="z:Body/z:Priloha/z:StavbyC = 'true'">Áno&#10;</xsl:when>
                <xsl:otherwise>Nie&#10;</xsl:otherwise>
            </xsl:choose>
            <xsl:text>&#09;&#09;d) stavby na bývanie vo vlastníctve fyzických osôb v hmotnej núdzi, fyzických osôb starších ako 62 rokov, držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím alebo držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím so sprievodcom, ako aj prevažne alebo úplne bezvládnych fyzických osôb, ktoré slúžia na ich trvalé bývanie: </xsl:text>
            <xsl:choose>
                <xsl:when test="z:Body/z:Priloha/z:StavbyD = 'true'">Áno&#10;</xsl:when>
                <xsl:otherwise>Nie&#10;</xsl:otherwise>
            </xsl:choose>
            <xsl:text>&#09;&#09;e) garáže vo vlastníctve fyzických osôb starších ako 62 rokov, držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím alebo držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím so sprievodcom, ktoré slúžia pre motorové vozidlo používané na ich dopravu: </xsl:text>
            <xsl:choose>
                <xsl:when test="z:Body/z:Priloha/z:StavbyE = 'true'">Áno&#10;</xsl:when>
                <xsl:otherwise>Nie&#10;</xsl:otherwise>
            </xsl:choose>
            <xsl:text>&#09;&#09;f) stavby na pôdohospodársku produkciu, skleníky, stavby využívané na skladovanie vlastnej pôdohospodárskej produkcie, stavby pre vodné hospodárstvo okrem stavieb na skladovanie inej ako vlastnej pôdohospodárskej produkcie a stavieb na administratívu: </xsl:text>
            <xsl:choose>
                <xsl:when test="z:Body/z:Priloha/z:StavbyF = 'true'">Áno&#10;</xsl:when>
                <xsl:otherwise>Nie&#10;</xsl:otherwise>
            </xsl:choose>
    
            <xsl:text>&#09;K oddielu IV. - Byty&#10;</xsl:text>
            <xsl:text>&#09;&#09;a) byty vo vlastníctve právnických osôb, ktoré nie sú založené alebo zriadené na podnikanie: </xsl:text>
            <xsl:choose>
                <xsl:when test="z:Body/z:Priloha/z:BytyA = 'true'">Áno&#10;</xsl:when>
                <xsl:otherwise>Nie&#10;</xsl:otherwise>
            </xsl:choose>
            <xsl:text>&#09;&#09;b) byty slúžiace školám, školským zariadeniam a zdravotníckym zariadeniam, zariadeniam na pracovnú rehabilitáciu a rekvalifikáciu občanov so zmenenou pracovnou schopnosťou: </xsl:text>
            <xsl:choose>
                <xsl:when test="z:Body/z:Priloha/z:BytyB = 'true'">Áno&#10;</xsl:when>
                <xsl:otherwise>Nie&#10;</xsl:otherwise>
            </xsl:choose>
            <xsl:text>&#09;&#09;c) byty, ktorých využitie je obmedzené z dôvodu rozsiahlej rekonštrukcie, stavebnej uzávery alebo umiestnenia na podkopanom pozemku: </xsl:text>
            <xsl:choose>
                <xsl:when test="z:Body/z:Priloha/z:BytyC = 'true'">Áno&#10;</xsl:when>
                <xsl:otherwise>Nie&#10;</xsl:otherwise>
            </xsl:choose>
            <xsl:text>&#09;&#09;d) byty vo vlastníctve fyzických osôb v hmotnej núdzi, fyzických osôb starších ako 62 rokov, držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím alebo držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím so sprievodcom, ako aj prevažne alebo úplne bezvládnych fyzických osôb, ktoré slúžia na ich trvalé bývanie: </xsl:text>
            <xsl:choose>
                <xsl:when test="z:Body/z:Priloha/z:BytyD = 'true'">Áno&#10;</xsl:when>
                <xsl:otherwise>Nie&#10;</xsl:otherwise>
            </xsl:choose>
            <xsl:text>&#09;&#09;e) nebytové priestory v bytových domoch slúžiace ako garáž vo vlastníctve fyzických osôb starších ako 62 rokov, držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím alebo držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím so sprievodcom, ktoré slúžia pre motorové vozidlo používané na ich dopravu: </xsl:text>
            <xsl:choose>
                <xsl:when test="z:Body/z:Priloha/z:BytyE = 'true'">Áno&#10;</xsl:when>
                <xsl:otherwise>Nie&#10;</xsl:otherwise>
            </xsl:choose>
            <xsl:value-of
                select="concat('&#09;', 'Poznámka: ', z:Body/z:Priloha/z:Poznamka, '&#10;')" />
        </xsl:if>
        
            <xsl:text>Súhrn príloh &#10;</xsl:text>
            <xsl:value-of
                select="concat('&#09;', 'Počet príloh II. oddielu: ', z:Body/z:SuhrnPriloh/z:PocetOddielovII, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;', 'Počet príloh III. oddielu: ', z:Body/z:SuhrnPriloh/z:PocetOddielovIII, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;', 'Počet príloh IV. oddielu: ', z:Body/z:SuhrnPriloh/z:PocetOddielovIV, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;', 'Počet príloh V. oddielu: ', z:Body/z:SuhrnPriloh/z:PocetOddielovV, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;', 'Počet príloh VI. oddielu: ', z:Body/z:SuhrnPriloh/z:PocetOddielovVI, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;', 'Počet príloh VII. oddielu: ', z:Body/z:SuhrnPriloh/z:PocetOddielovVII, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;', 'Počet iných príloh: ', z:Body/z:SuhrnPriloh/z:PocetInych, '&#10;')" />
            <xsl:value-of
                select="concat('&#09;', 'Poznámka: ', z:Body/z:SuhrnPriloh/z:Poznamka, '&#10;')" />
        
        <xsl:call-template name="base_dorucenie">
            <xsl:with-param name="values" select="z:Body/z:Dorucenie" />
        </xsl:call-template>
        
        <xsl:call-template name="zakladne_vyhlasenie">
            <xsl:with-param name="value" select="z:Body/z:ZakladneVyhlasenie" />
        </xsl:call-template>

    </xsl:template>
</xsl:stylesheet>
`

export const getTaxXsd = (formDefinition: FormDefinitionSlovenskoSkTax) =>
  TAX_XSD.replaceAll(
    '$SCHEMA_URI',
    `http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}`,
  )

export const getTaxXslt = (formDefinition: FormDefinitionSlovenskoSkTax) =>
  TAX_XSLT.replaceAll(
    '$SCHEMA_URI',
    `http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}`,
  )
