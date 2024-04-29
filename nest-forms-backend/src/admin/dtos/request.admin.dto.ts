import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Json } from 'aws-sdk/clients/robomaker'
import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator'

import { AdminSchemaFilesNamesEnum } from './enums.admin.dto'

export class AdminRequestSchemaDataCreateDto {
  @ApiProperty({
    description: 'String name of schema',
    example: 'Záväzné stanovisko k investičnej činnosti',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  data: string
}

export class AdminSchemaDataCreateDto {
  @ApiProperty({
    description: 'String name of schema',
    example: 'Záväzné stanovisko k investičnej činnosti',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({
    description: 'Slug name of schema, naming with -',
    example: 'zavazne-stanovisko-k-investicnej-cinnosti',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  slug: string

  @ApiPropertyOptional({
    description: 'Category name of schema',
    example: 'ZavazneStanovisko',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  category?: string

  @ApiProperty({
    description: 'Message subject to send NASES',
    example: 'Podanie',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  messageSubject: string

  @ApiProperty({
    description: 'Version of schema',
    example: 'zavazne-stanovisko-k-investicnej-cinnosti',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  version: string

  @ApiProperty({
    description: 'ID of schema from NASES',
    example: 'zavazne.stanovisko.1234',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  pospID: string

  @ApiProperty({
    description: 'Version of schema from NASES',
    example: 'zavazne.stanovisko.1234.V1',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  pospVersion: string

  @ApiPropertyOptional({
    description: 'Description of schema',
    example: 'This is description',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  formDescription?: string

  @ApiPropertyOptional({
    description: 'Do you need to have signed form to send form to NASES?',
    example: false,
    default: false,
    nullable: false,
  })
  @IsBoolean()
  @IsOptional()
  isSigned?: boolean

  @ApiPropertyOptional({
    description: 'Message subject format to send NASES',
    example: 'e-ZST ž. {street}',
  })
  @IsString()
  @IsOptional()
  messageSubjectFormat?: string
}

export class AdminSchemaDataUpgradeDto {
  @ApiProperty({
    description: 'Version of schema',
    example: 'zavazne-stanovisko-k-investicnej-cinnosti',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  version: string

  @ApiPropertyOptional({
    description: 'Version of schema from NASES',
    example: 'zavazne.stanovisko.1234.V1',
    nullable: false,
  })
  @IsString()
  @IsOptional()
  pospVersion?: string

  @ApiPropertyOptional({
    description: 'Do you need to have signed form to send form to NASES?',
    example: false,
    default: false,
    nullable: false,
  })
  @IsBoolean()
  @IsOptional()
  isSigned?: boolean

  @ApiPropertyOptional({
    description: 'Message subject format to send NASES',
    example: 'e-ZST ž. {street}',
  })
  @IsString()
  @IsOptional()
  messageSubjectFormat?: string | null

  @ApiPropertyOptional({
    description: 'Name of organization in Ginis to assign',
    example: 'ESBS',
  })
  @IsString()
  @IsOptional()
  ginisOrganizationName?: string | null

  @ApiPropertyOptional({
    description: 'Name of person in Ginis to assign',
    example: 'Tester Testovac',
  })
  @IsString()
  @IsOptional()
  ginisPersonName?: string | null
}

export class AdminRequestSchemaVersionDataUpdateDto {
  @ApiProperty({
    description: 'Stringified JSON data',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  data: string
}

class AdminSchemaUpdateDto {
  @ApiPropertyOptional({
    description: 'String name of schema',
    example: 'Záväzné stanovisko k investičnej činnosti',
    nullable: false,
  })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({
    description: 'Category name of schema',
    example: 'ZavazneStanovisko',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  category?: string

  @ApiPropertyOptional({
    description: 'Message subject to send NASES',
    example: 'Podanie',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  messageSubject?: string
}

export class AdminSchemaVersionUpdateDto {
  @ApiPropertyOptional({
    description: 'Data to update schema',
    type: AdminSchemaUpdateDto,
  })
  @IsOptional()
  @IsObject()
  schema?: AdminSchemaUpdateDto

  @ApiPropertyOptional({
    description: 'Description of schema',
    example: 'This is description',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  formDescription?: string

  @ApiPropertyOptional({
    description: 'Message subject format to send NASES',
    example: 'e-ZST ž. {street}',
  })
  @IsString()
  @IsOptional()
  messageSubjectFormat?: string

  @ApiPropertyOptional({
    description: 'Name of organization in Ginis to assign',
    example: 'ESBS',
  })
  @IsString()
  @IsOptional()
  ginisOrganizationName?: string | null

  @ApiPropertyOptional({
    description: 'Name of person in Ginis to assign',
    example: 'Tester Testovac',
  })
  @IsString()
  @IsOptional()
  ginisPersonName?: string | null
}

export class AdminSchemaFilesCreateDto {
  formFo: string

  dataXml: string

  xmlTemplate: string

  data: Json

  jsonSchema: Json

  uiSchema: string

  ginisOrganizationName: string

  ginisPersonName: string
}

export class AdminSchemaFileDto {
  fieldname: string

  originalname: AdminSchemaFilesNamesEnum

  encoding: string

  mimetype: string

  buffer: Buffer

  size: number
}
