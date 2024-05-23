import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common'
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Schema } from '@prisma/client'

import { DatabaseErrorDto } from '../utils/global-dtos/errors.dto'
import {
  SchemaAllVersionsRequestDto,
  SchemaResponseDto,
  SchemaVersionRequestDto,
  SchemaVersionResponseDto,
  SchemaVersionsResponseDto,
} from './dtos/schemas.dto'
import {
  SchemaNotFoundDto,
  SchemaVersionNotFoundDto,
} from './schemas.errors.dto'
import SchemasService from './schemas.service'

@Controller('schemas')
@ApiTags('schemas')
export default class SchemasController {
  constructor(private readonly service: SchemasService) {}

  @ApiOperation({
    summary: '',
    description: 'Returns schema versions according to query.',
  })
  @ApiResponse({
    status: 200,
    description: 'Versions of schemas',
    type: SchemaVersionsResponseDto,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal server error.',
    type: DatabaseErrorDto,
  })
  @Get()
  // TODO update dtos and query and things like this
  async getAllSchemas(
    @Query() query: SchemaAllVersionsRequestDto,
  ): Promise<Schema[]> {
    return this.service.getAllSchemas(query)
  }

  @ApiOperation({
    summary: '',
    description: 'Returns schema versions according to query.',
  })
  @ApiResponse({
    status: 200,
    description: 'Versions of schemas',
    type: SchemaVersionsResponseDto,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal server error.',
    type: DatabaseErrorDto,
  })
  @Get('schema-versions')
  async getAllVersions(
    @Query() query: SchemaAllVersionsRequestDto,
  ): Promise<SchemaVersionsResponseDto> {
    return this.service.getAllVersions(query)
  }

  @ApiOperation({
    summary: '',
    description:
      'Returns schema by a unique slug, along with its last version.',
  })
  @ApiResponse({
    status: 200,
    description: 'Schema by slug',
    type: SchemaResponseDto,
  })
  @ApiNotFoundResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Schema with such slug was not found',
    type: SchemaNotFoundDto,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal server error.',
    type: DatabaseErrorDto,
  })
  @Get('schema/:schemaSlug')
  async getSchema(
    @Param('schemaSlug') schemaSlug: string,
  ): Promise<SchemaResponseDto> {
    return this.service.getSchemaBySlug(schemaSlug)
  }

  @ApiOperation({
    summary: '',
    description: 'Returns schema version info by id.',
  })
  @ApiResponse({
    status: 200,
    description: 'Schema version by id',
    type: SchemaVersionResponseDto,
  })
  @ApiNotFoundResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Schema version with such id was not found',
    type: SchemaVersionNotFoundDto,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal server error.',
    type: DatabaseErrorDto,
  })
  @Get('schema-version/:id')
  async getSchemaVersion(
    @Param('id') id: string,
    @Query() query: SchemaVersionRequestDto,
  ): Promise<SchemaVersionResponseDto> {
    return this.service.getVersion(id, query.includeSchema)
  }
}
