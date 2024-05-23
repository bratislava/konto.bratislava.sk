import { IncomingHttpHeaders } from 'node:http'

import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import {
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger'

import AdminGuard from '../auth/guards/admin.guard'
import NasesUtilsService from '../nases/utils-services/tokens.nases.service'
import { SchemaVersionNotFoundDto } from '../schemas/schemas.errors.dto'
import { UnauthorizedErrorDto } from '../utils/global-dtos/errors.dto'
import { ErrorsEnum } from '../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import {
  ADMIN_REQUEST_CREATE_SCHEMA_DATA_EXAMPLE,
  ADMIN_REQUEST_UPDATE_SCHEMA_VERSION_DATA_EXAMPLE,
  ADMIN_REQUEST_UPGRADE_SCHEMA_DATA_EXAMPLE,
} from './admin.constants'
import AdminService from './admin.service'
import {
  AdminRequestSchemaDataCreateDto,
  AdminRequestSchemaVersionDataUpdateDto,
  AdminSchemaDataCreateDto,
  AdminSchemaDataUpgradeDto,
  AdminSchemaVersionUpdateDto,
} from './dtos/request.admin.dto'

@ApiTags('ADMIN')
@Controller('admin')
@ApiSecurity('apiKey')
export default class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly nasesUtilsService: NasesUtilsService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {}

  // Endpoints only for testing

  @ApiOperation({
    summary: '',
    description: 'Return technical account JWT token',
  })
  @ApiResponse({
    status: 200,
    description: 'Generated JWT token',
    type: 'string',
  })
  @UseGuards(AdminGuard)
  @Get('technical-jwt')
  getTechnicalJwt(): string {
    return this.nasesUtilsService.createTechnicalAccountJwtToken()
  }

  @ApiOperation({
    summary: '',
    description: 'Return administration account JWT token',
  })
  @ApiResponse({
    status: 200,
    description: 'Generated JWT token',
    type: 'string',
  })
  @UseGuards(AdminGuard)
  @Get('administration-jwt')
  getAdministrationJwt(): string {
    return this.nasesUtilsService.createAdministrationJwtToken()
  }

  @ApiOperation({
    summary: '',
    description: 'Return eid user JWT token',
  })
  @ApiResponse({
    status: 200,
    description: 'Generated JWT token',
    type: 'string',
  })
  @ApiExtraModels(UnauthorizedErrorDto)
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(UnauthorizedErrorDto),
        },
      ],
    },
  })
  @UseGuards(AdminGuard)
  @Get('eid-jwt')
  getEidJwt(@Headers() head: IncomingHttpHeaders): string {
    if (!head.authorization) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        'Authorization not provided',
      )
    }
    return this.nasesUtilsService.createUserJwtToken(head.authorization)
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Create new schema',
    description: 'Create schema with all files',
  })
  @ApiResponse({
    status: 200,
    description: 'Schema was created',
  })
  @UseGuards(AdminGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          example: ADMIN_REQUEST_CREATE_SCHEMA_DATA_EXAMPLE,
        },
        files: {
          type: 'array',
          description:
            'Required files: data.json, form.fo.xslt, schema.json, uiSchema.json, xmlTemplate.xml \n Optional files: data.xml',
          items: {
            type: 'file',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files'))
  @Post('schema/create')
  async createSchema(
    @Body() data: AdminRequestSchemaDataCreateDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<string> {
    const dataResult = JSON.parse(data.data) as AdminSchemaDataCreateDto
    // TODO validate dataResult
    // TODO validate files (names and formats, and if we have all files)
    // console.log('tuuu', dataResult, files);
    const result = await this.adminService.createSchema(dataResult, files)
    return result
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Upgrade version of schema',
    description:
      'Upgrade version of schema, which create new schema version and can be rollbacked with downgrade schema',
  })
  @ApiResponse({
    status: 200,
    description: 'New schema verion was created',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          example: ADMIN_REQUEST_UPGRADE_SCHEMA_DATA_EXAMPLE,
        },
        files: {
          type: 'array',
          description:
            'Optional files: data.json, data.xml, form.fo.xslt, schema.json, uiSchema.json, xmlTemplate.xml',
          items: {
            type: 'file',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files'))
  @UseGuards(AdminGuard)
  @Post('schema/upgrade/:slug')
  async upgradeSchemaVersion(
    @Param('slug') slug: string,
    @Body() data: AdminRequestSchemaDataCreateDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<string> {
    const dataResult = JSON.parse(data.data) as AdminSchemaDataUpgradeDto
    const result = await this.adminService.upgradeSchemaVersion(
      slug,
      dataResult,
      files,
    )
    return result
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Downgrade version of schema',
    description: 'Downgrade schema to previous',
  })
  @ApiResponse({
    status: 200,
    description: 'Schema was downgraded',
  })
  @UseGuards(AdminGuard)
  @Post('schema/downgrade/:slug')
  async downgradeSchemaVersion(@Param('slug') slug: string): Promise<string> {
    const result = await this.adminService.downgradeSchemaVersion(slug)
    return result
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Update version of schema',
    description:
      'Update version of schema, without creating nie version, it is not downgradable',
  })
  @ApiResponse({
    status: 200,
    description: 'Schema version was updated',
  })
  @ApiNotFoundResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Schema version with such id was not found',
    type: SchemaVersionNotFoundDto,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          example: ADMIN_REQUEST_UPDATE_SCHEMA_VERSION_DATA_EXAMPLE,
        },
        files: {
          type: 'array',
          description:
            'Updateable files: data.json, uiSchema.json, data.xml, schema.json',
          items: {
            type: 'file',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files'))
  @UseGuards(AdminGuard)
  @Patch('schema-version/:id')
  async updateSchemaVersion(
    @Body() data: AdminRequestSchemaVersionDataUpdateDto,
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<string> {
    const jsonData = JSON.parse(data.data) as AdminSchemaVersionUpdateDto
    const result = await this.adminService.updateSchemaVersion(
      id,
      jsonData,
      files,
    )
    return result
  }
}
