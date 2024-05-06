import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsDate,
  IsJSON,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../utils/constants'
import { ToBoolean } from '../../utils/decorators/request.decorator'

class SchemaVersionWithoutSchemaDto {
  @ApiProperty({
    description: 'Id of the schema version.',
    example: 'f69559da-5eca-4ed7-80fd-370d09dc3632',
  })
  @IsUUID()
  id: string

  @ApiProperty({
    description: 'Text representation of the version.',
    example: 'v1.0.1',
  })
  @IsOptional()
  version: string | null

  @ApiProperty({
    description: 'Version of the Posp form.',
    example: '201501.3',
  })
  @IsString()
  pospVersion: string

  @ApiProperty({
    description: 'Description of the schema in current version.',
    example: 'Všeobecná agenda description',
  })
  @IsOptional()
  @IsString()
  formDescription: string | null

  @ApiProperty({
    description: 'Posp ID of Form',
    example: 'esmao.eforms.bratislava.obec_082',
  })
  @IsString()
  pospID: string

  @ApiProperty({
    description: 'Must be signed',
    example: false,
  })
  @IsBoolean()
  isSigned: boolean

  @ApiProperty({
    description: 'Previous version (for downgrade)',
    example: '12345',
    nullable: true,
  })
  @IsBoolean()
  @IsOptional()
  previousSchemaVersionId: string | null

  /* eslint-disable @darraghor/nestjs-typed/validated-non-primitive-property-needs-type-decorator */

  @ApiProperty({
    description: 'data.json',
    example: {},
  })
  @IsJSON()
  @IsOptional()
  data: Prisma.JsonValue

  @ApiProperty({
    description: 'data.xml',
    example: '',
  })
  @IsString()
  @IsOptional()
  dataXml: string | null

  @ApiProperty({
    description: 'form.fo.xslt',
    example: '',
  })
  @IsString()
  formFo: string

  @ApiProperty({
    description: 'schema.json',
    default: {},
  })
  @IsJSON()
  @IsOptional()
  jsonSchema: Prisma.JsonValue

  @ApiProperty({
    description: 'uiSchema.json',
    default: {},
  })
  @IsJSON()
  @IsOptional()
  uiSchema: Prisma.JsonValue

  @ApiProperty({
    description: 'xmlTemplate',
    example: '',
  })
  @IsString()
  xmlTemplate: string

  /* eslint-enable @darraghor/nestjs-typed/validated-non-primitive-property-needs-type-decorator */

  @ApiProperty({
    description: 'Id of the parent schema object.',
    example: 'f69559da-5eca-4ed7-80fd-370d09dc3632',
  })
  @IsUUID()
  schemaId: string

  @Type(() => Date)
  @ApiProperty({
    description: 'Created timestamp',
    default: '2023-02-10T10:31:49.247Z',
  })
  @IsDate()
  createdAt: Date

  @Type(() => Date)
  @ApiProperty({
    description: 'Updated timestamp',
    default: '2023-02-10T10:31:49.247Z',
  })
  @IsDate()
  updatedAt: Date

  @ApiProperty({
    description: 'Subject format of the message',
    example: 'e-ZST ž. {street}”',
  })
  @IsString()
  @IsOptional()
  messageSubjectFormat: string | null

  @ApiProperty({
    description: 'Organization to assign data to Ginis',
    example: 'ESBS',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  ginisOrganizationName: string | null

  @ApiProperty({
    description: 'Person to assign data to Ginis',
    example: 'Person Personovic, ing',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  ginisPersonName: string | null
}

export class SchemaResponseWithoutLatestVersionDto {
  @ApiProperty({
    description: 'Id of the schema.',
    example: 'f69559da-5eca-4ed7-80fd-370d09dc3632',
  })
  @IsUUID()
  id: string

  @ApiProperty({
    description: 'Name of the form',
    example: 'Záštita primátora',
  })
  @IsString()
  formName: string

  @ApiProperty({
    description: 'Form slug',
    example: 'zastita-primatora',
  })
  @IsString()
  slug: string

  @ApiProperty({
    description: 'Category of the form',
    example: 'Dane',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  category: string | null

  @ApiProperty({
    description: 'Subject of the message',
    example: 'Podanie',
  })
  @IsString()
  messageSubject: string

  @Type(() => Date)
  @ApiProperty({
    description: 'Created timestamp',
    default: '2023-02-10T10:31:49.247Z',
  })
  @IsDate()
  createdAt: Date

  @Type(() => Date)
  @ApiProperty({
    description: 'Updated timestamp',
    default: '2023-02-10T10:31:49.247Z',
  })
  @IsDate()
  updatedAt: Date

  @ApiProperty({
    description: 'Id of the latest schema version.',
    example: 'f69559da-5eca-4ed7-80fd-370d09dc3632',
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  latestVersionId: string | null
}

export class SchemaVersionWithSchemaAndDataDto {
  @Type(() => SchemaResponseWithoutLatestVersionDto)
  @ApiPropertyOptional({
    description: 'Parent schema object.',
    type: SchemaResponseWithoutLatestVersionDto,
  })
  @IsOptional()
  schema?: SchemaResponseWithoutLatestVersionDto
}

export class SchemaResponseDto extends SchemaResponseWithoutLatestVersionDto {
  @ApiProperty({
    description: 'Id of the latest schema version.',
    type: SchemaVersionWithoutSchemaDto,
    nullable: true,
  })
  @IsOptional()
  latestVersion: SchemaVersionWithoutSchemaDto | null
}
export class SchemaVersionResponseDto extends SchemaVersionWithoutSchemaDto {
  @Type(() => SchemaResponseWithoutLatestVersionDto)
  @ApiPropertyOptional({
    description: 'Parent schema object.',
    type: SchemaResponseWithoutLatestVersionDto,
  })
  @IsOptional()
  schema?: SchemaResponseWithoutLatestVersionDto
}

export class SchemaVersionsResponseDto {
  @ApiProperty({
    description: 'actual page',
    default: 1,
  })
  currentPage!: number

  @ApiProperty({
    description: 'number of items in one page',
    default: 100,
  })
  pagination!: number

  @ApiProperty({
    description: 'Total number of items',
    default: 100,
  })
  countPages!: number

  @ApiProperty({
    description: 'Items',
    type: [SchemaVersionResponseDto],
  })
  items!: SchemaVersionResponseDto[]
}

export class SchemaAllVersionsRequestDto {
  @ApiPropertyOptional({
    description: 'True if only the latest version of each form is desirable',
    example: false,
  })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  onlyLatest?: boolean

  @ApiPropertyOptional({
    description: 'Schema slug for which the versions should be retrieved',
    example: 'zastita-primatora',
  })
  @IsOptional()
  @IsString()
  slug?: string

  @ApiPropertyOptional({
    description: 'Page number',
    example: DEFAULT_PAGE,
  })
  @IsOptional()
  @IsNumberString()
  currentPage?: string

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: DEFAULT_PAGE_SIZE,
  })
  @IsOptional()
  @IsNumberString()
  pagination?: string
}

export class SchemaVersionRequestDto {
  @ApiPropertyOptional({
    description: 'True if schema should be included, not only schema id',
    example: true,
  })
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  includeSchema?: boolean
}
