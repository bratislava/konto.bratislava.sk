import { Injectable, Logger } from '@nestjs/common'
import { Prisma, Schema } from '@prisma/client'

import PrismaService from '../prisma/prisma.service'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../utils/constants'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import {
  SchemaAllVersionsRequestDto,
  SchemaResponseDto,
  SchemaVersionResponseDto,
  SchemaVersionsResponseDto,
} from './dtos/schemas.dto'
import {
  SchemasErrorsEnum,
  SchemasErrorsResponseEnum,
} from './schemas.errors.enum'

@Injectable()
export default class SchemasService {
  private readonly logger: Logger

  constructor(
    private readonly prisma: PrismaService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {
    this.logger = new Logger('SchemasService')
  }

  async getAllSchemas(query: SchemaAllVersionsRequestDto): Promise<Schema[]> {
    const { currentPage, pagination } = query
    const take = +(pagination ?? DEFAULT_PAGE_SIZE)
    const skip = (+(currentPage ?? DEFAULT_PAGE) - 1) * take

    const schemas = await this.prisma.schema.findMany({
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
      // select: {
      //   id: true,
      //   createdAt: true,
      //   updatedAt: true,
      //   category: true,
      //   slug: true,
      //   formName: true,
      //   messageSubject: true,
      //   latestVersionId: true,
      // },
      take,
      skip,
    })

    return schemas
  }

  async getAllVersions(
    query: SchemaAllVersionsRequestDto,
  ): Promise<SchemaVersionsResponseDto> {
    const { currentPage, pagination, slug, onlyLatest } = query
    const take = +(pagination ?? DEFAULT_PAGE_SIZE)
    const skip = (+(currentPage ?? DEFAULT_PAGE) - 1) * take

    const where: Prisma.SchemaVersionWhereInput = {
      NOT: onlyLatest
        ? {
            latestSchemaFor: null,
          }
        : undefined,
      schema: {
        slug,
      },
    }

    const versions = await this.prisma.schemaVersion.findMany({
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
      include: {
        schema: true,
        Forms: false,
      },
      where,
      take,
      skip,
    })

    const total = await this.prisma.schemaVersion.count({
      where,
    })
    return {
      items: versions,
      currentPage: +(currentPage ?? DEFAULT_PAGE),
      pagination: take,
      countPages: Math.ceil(total / take),
    }
  }

  async getSchemaBySlug(formSlug: string): Promise<SchemaResponseDto> {
    const schema = await this.prisma.schema.findUnique({
      where: {
        slug: formSlug,
      },
      include: {
        latestVersion: true,
      },
    })

    if (schema === null) {
      throw this.throwerErrorGuard.NotFoundException(
        SchemasErrorsEnum.SCHEMA_NOT_FOUND,
        SchemasErrorsResponseEnum.SCHEMA_NOT_FOUND,
      )
    }

    return schema
  }

  async getVersion(
    id: string,
    includeSchema = true,
  ): Promise<SchemaVersionResponseDto> {
    const version = await this.prisma.schemaVersion.findUnique({
      where: {
        id,
      },
      include: {
        schema: includeSchema,
      },
    })

    if (version === null) {
      throw this.throwerErrorGuard.NotFoundException(
        SchemasErrorsEnum.SCHEMA_VERSION_NOT_FOUND,
        SchemasErrorsResponseEnum.SCHEMA_VERSION_NOT_FOUND,
      )
    }

    return version
  }
}
