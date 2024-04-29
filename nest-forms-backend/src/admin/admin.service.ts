import { Injectable } from '@nestjs/common'

import PrismaService from '../prisma/prisma.service'
import SchemasService from '../schemas/schemas.service'
import { ErrorsEnum } from '../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { ADMIN_SCHEMA_FILES } from './admin.constants'
import checkFiles from './admin.helpers'
import {
  AdminSchemaFilesNamesEnum,
  AdminSchemaTableColumnNamesEnum,
} from './dtos/enums.admin.dto'
import {
  AdminSchemaDataCreateDto,
  AdminSchemaDataUpgradeDto,
  AdminSchemaFilesCreateDto,
  AdminSchemaVersionUpdateDto,
} from './dtos/request.admin.dto'

@Injectable()
export default class AdminService {
  constructor(
    private prismaService: PrismaService,
    private throwerErrorGuard: ThrowerErrorGuard,
    private schemasService: SchemasService,
  ) {}

  async createSchema(
    data: AdminSchemaDataCreateDto,
    files: Express.Multer.File[],
  ): Promise<string> {
    const schemaAlreadyExist = await this.prismaService.schema.findFirst({
      where: {
        slug: data.slug,
      },
    })
    if (schemaAlreadyExist) {
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        `Schema with this slug already exists.`,
      )
    }
    const schemaVersionAlreadyExist =
      await this.prismaService.schemaVersion.findFirst({
        where: {
          pospID: data.pospID,
        },
      })
    if (schemaVersionAlreadyExist) {
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        `Schema and schema version with this pospId already exists, please use upgrade or update`,
      )
    }
    checkFiles(files)
    const schemaVersionFilesData: AdminSchemaFilesCreateDto =
      new AdminSchemaFilesCreateDto()
    files.forEach((file) => {
      const fileName = file.originalname as AdminSchemaFilesNamesEnum
      const databaseColumnName = ADMIN_SCHEMA_FILES[fileName]
        .databaseFieldName as AdminSchemaTableColumnNamesEnum
      schemaVersionFilesData[databaseColumnName] =
        ADMIN_SCHEMA_FILES[fileName].type === 'application/json'
          ? (JSON.parse(file.buffer.toString()) as string)
          : file.buffer.toString()
    })
    await this.prismaService.$transaction(async (tx) => {
      const schemaVersion = await tx.schemaVersion.create({
        data: {
          version: data.version,
          pospID: data.pospID,
          pospVersion: data.pospVersion,
          formDescription: data.formDescription,
          isSigned: data.isSigned,
          messageSubjectFormat: data.messageSubjectFormat,
          ...schemaVersionFilesData,
          schema: {
            create: {
              formName: data.name,
              messageSubject: data.messageSubject,
              slug: data.slug,
              category: data.category,
            },
          },
        },
      })
      await tx.schema.update({
        where: { id: schemaVersion.schemaId },
        data: { latestVersionId: schemaVersion.id },
      })
    })

    return 'Schema was created'
  }

  // TODO this eslint
  // eslint-disable-next-line sonarjs/cognitive-complexity
  async upgradeSchemaVersion(
    slug: string,
    data: AdminSchemaDataUpgradeDto,
    files: Express.Multer.File[],
  ): Promise<string> {
    const schema = await this.prismaService.schema.findUnique({
      where: { slug },
      include: { latestVersion: true },
    })
    if (!schema) {
      throw this.throwerErrorGuard.NotFoundException(
        ErrorsEnum.NOT_FOUND_ERROR,
        `Schema by slug not found`,
      )
    }
    if (!schema.latestVersion) {
      throw this.throwerErrorGuard.NotFoundException(
        ErrorsEnum.NOT_FOUND_ERROR,
        `Schema has no latest version`,
      )
    }

    const schemaVersionFilesData: AdminSchemaFilesCreateDto =
      new AdminSchemaFilesCreateDto()
    files.forEach((file) => {
      const fileName = file.originalname as AdminSchemaFilesNamesEnum
      const databaseColumnName = ADMIN_SCHEMA_FILES[fileName]
        .databaseFieldName as AdminSchemaTableColumnNamesEnum
      schemaVersionFilesData[databaseColumnName] =
        ADMIN_SCHEMA_FILES[fileName].type === 'application/json'
          ? (JSON.parse(file.buffer.toString()) as string)
          : file.buffer.toString()
    })
    // TODO do this transaction more sufficient and readable
    await this.prismaService.$transaction(async (tx) => {
      await tx.schemaVersion.findUnique({
        where: { id: schema.latestVersionId! },
      })
      const schemaVersion = await tx.schemaVersion.create({
        data: {
          data: schemaVersionFilesData.data || schema.latestVersion!.data!,
          formFo: schemaVersionFilesData.formFo || schema.latestVersion!.formFo,
          jsonSchema:
            schemaVersionFilesData.jsonSchema ||
            schema.latestVersion!.jsonSchema!,
          pospID: schema.latestVersion!.pospID,
          pospVersion: data.pospVersion || schema.latestVersion!.pospVersion,
          uiSchema:
            schemaVersionFilesData.uiSchema || schema.latestVersion!.uiSchema!,
          xmlTemplate:
            schemaVersionFilesData.xmlTemplate ||
            schema.latestVersion!.xmlTemplate,
          dataXml:
            schemaVersionFilesData.dataXml || schema.latestVersion!.dataXml,
          formDescription: schema.latestVersion!.formDescription,
          isSigned: data.isSigned || schema.latestVersion!.isSigned,
          version: data.version || schema.latestVersion!.version,
          schemaId: schema.id,
          previousSchemaVersionId: schema.latestVersionId,
          messageSubjectFormat:
            data.messageSubjectFormat ||
            schema.latestVersion!.messageSubjectFormat,
          ginisOrganizationName:
            data.ginisOrganizationName ||
            schema.latestVersion?.ginisOrganizationName,
          ginisPersonName:
            data.ginisPersonName || schema.latestVersion?.ginisPersonName,
        },
      })
      await tx.schema.update({
        where: { slug },
        data: { latestVersionId: schemaVersion.id },
      })
      return schemaVersion
    })

    return 'Schema was upgraded'
  }

  async downgradeSchemaVersion(slug: string): Promise<string> {
    const schema = await this.prismaService.schema.findUnique({
      where: { slug },
      include: { latestVersion: true },
    })
    if (!schema?.latestVersionId) {
      throw this.throwerErrorGuard.NotFoundException(
        ErrorsEnum.NOT_FOUND_ERROR,
        `This is first version, it can not be downgraded`,
      )
    }
    await this.prismaService.$transaction(async (tx) => {
      await tx.schema.update({
        where: { slug },
        data: {
          latestVersionId: schema?.latestVersion?.previousSchemaVersionId,
        },
      })
      await tx.schemaVersion.delete({
        where: { id: schema.latestVersionId! },
      })
    })

    return 'Schema was downgraded'
  }

  async updateSchemaVersion(
    id: string,
    data: AdminSchemaVersionUpdateDto,
    files: Express.Multer.File[],
  ): Promise<string> {
    const schemaVersionFilesData: AdminSchemaFilesCreateDto =
      new AdminSchemaFilesCreateDto()
    files.forEach((file) => {
      const fileName = file.originalname as AdminSchemaFilesNamesEnum
      const databaseColumnName = ADMIN_SCHEMA_FILES[fileName]
        .databaseFieldName as AdminSchemaTableColumnNamesEnum
      schemaVersionFilesData[databaseColumnName] =
        ADMIN_SCHEMA_FILES[fileName].type === 'application/json'
          ? (JSON.parse(file.buffer.toString()) as string)
          : file.buffer.toString()
    })

    await this.schemasService.getVersion(id, false) // Check if exists

    const schemaVersion = await this.prismaService.schemaVersion.update({
      where: {
        id,
      },
      data: {
        messageSubjectFormat: data.messageSubjectFormat,
        formDescription: data.formDescription,
        uiSchema: schemaVersionFilesData.uiSchema,
        data: schemaVersionFilesData.data,
        dataXml: schemaVersionFilesData.dataXml,
        jsonSchema: schemaVersionFilesData.jsonSchema,
        ginisOrganizationName: data.ginisOrganizationName,
        ginisPersonName: data.ginisPersonName,
      },
    })

    if (
      data.schema &&
      !Object.values(data.schema).every((val) => val === undefined)
    ) {
      await this.prismaService.schema.update({
        where: {
          id: schemaVersion.schemaId,
        },
        data: {
          messageSubject: data.schema.messageSubject,
          category: data.schema.category,
          formName: data.schema.name,
        },
      })
    }

    return 'Schema version was updated'
  }
}
