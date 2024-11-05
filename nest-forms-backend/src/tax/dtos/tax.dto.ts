import { ApiProperty } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { IsBoolean, IsNotEmpty, IsObject, IsString } from 'class-validator'

import { JSON_FORM_EXAMPLE, XML_FORM_EXAMPLE } from '../../utils/constants'

export class TaxJsonToXmlRequestDto {
  @IsObject()
  @ApiProperty({
    description: 'Form values in JSON',
    example: JSON_FORM_EXAMPLE,
  })
  @IsNotEmpty()
  jsonForm!: Prisma.JsonObject
}

export class TaxJsonToXmlResponseDto {
  @ApiProperty({
    description: 'Form values in XML',
    example: XML_FORM_EXAMPLE,
  })
  @IsString()
  xmlForm!: string
}

export class TaxSignerRequestDto {
  @IsObject()
  @ApiProperty({
    description: 'Form values in JSON',
    example: JSON_FORM_EXAMPLE,
  })
  @IsNotEmpty()
  jsonForm!: Prisma.JsonObject
}

export class TaxSignerDataResponseDto {
  @ApiProperty({
    description: 'Name of the xml "file" to be signed',
    example: 'Vseobecna_agenda.xml',
  })
  @IsString()
  objectId!: string

  @ApiProperty({
    description: 'Free text description - we are using name of the form',
    example: 'Všeobecná agenda',
  })
  @IsString()
  objectDescription!: string

  @ApiProperty({
    description:
      'We do not really know the available values - might allow something other than XML to be signed ? If left empty it works with xml.',
    example: '',
  })
  @IsString()
  objectFormatIdentifier!: string

  @ApiProperty({
    description: 'Form values in XML',
    example: XML_FORM_EXAMPLE,
  })
  @IsString()
  xdcXMLData!: string

  @ApiProperty({
    description: 'Same as NASES schema id (pospId)',
    example: 'Doc.GeneralAgenda',
  })
  @IsString()
  xdcIdentifier!: string

  @ApiProperty({
    description: 'Same as NASES schema version (pospVersion)',
    example: '1.2',
  })
  @IsString()
  xdcVersion!: string

  @ApiProperty({
    description: 'XSD validation',
    example: '',
  })
  @IsString()
  xdcUsedXSD!: string

  @ApiProperty({
    description:
      'XSD Reference URI, put together on request from pospId and pospVersion',
    example: 'http://schemas.gov.sk/form/Doc.GeneralAgenda/1.2',
  })
  @IsString()
  xsdReferenceURI!: string

  @ApiProperty({
    description:
      'XSLT text transformation, used to convert xml into what is displayed in signer',
    example: '',
  })
  @IsString()
  xdcUsedXSLT!: string

  @ApiProperty({
    description:
      'XSLT Reference URI, put together on request from pospId and pospVersion',
    example: 'http://schemas.gov.sk/form/Doc.GeneralAgenda/1.2',
  })
  @IsString()
  xslReferenceURI!: string

  @ApiProperty({
    description: 'Type of XSLT transformation - likely always TXT',
    example: 'TXT',
  })
  @IsString()
  xslMediaDestinationTypeDescription!: string

  @ApiProperty({
    description: 'XSLT language',
    example: 'sk',
  })
  @IsString()
  xslXSLTLanguage!: string

  @ApiProperty({
    description: 'TODO find out what is this, empty even on ESBS',
    example: '',
  })
  @IsString()
  xslTargetEnvironment!: string

  @ApiProperty({
    description: '(always true) - TODO find out what is this',
    example: true,
  })
  @IsBoolean()
  xdcIncludeRefs!: boolean

  @ApiProperty({
    description: 'Should always be the value from example',
    example: 'http://data.gov.sk/def/container/xmldatacontainer+xml/1.1',
  })
  @IsString()
  xdcNamespaceURI!: string

  // these we do not know yet if we need - when tested out, should either uncomment or remove

  // @ApiProperty({
  //   description: 'We do not know, empty string works',
  //   example: '',
  // })
  // @IsString()
  // digestAlgUrl!: string

  // @ApiProperty({
  //   description: 'We do not know, empty string works',
  //   example: '',
  // })
  // @IsString()
  // signaturePolicyIdentifier!: string
}
