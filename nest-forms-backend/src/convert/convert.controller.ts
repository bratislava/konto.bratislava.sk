import { PassThrough } from 'node:stream'

import {
  Body,
  Controller,
  Param,
  Post,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { HttpStatusCode } from 'axios'
import { Response } from 'express'

import { CognitoGetUserData } from '../auth/dtos/cognito.dto'
import CognitoGuard from '../auth/guards/cognito.guard'
import {
  FormIsOwnedBySomeoneElseErrorDto,
  FormNotFoundErrorDto,
} from '../forms/forms.errors.dto'
import { ResponseGdprDataDto } from '../nases/dtos/responses.dto'
import { SchemaVersionNotFoundDto } from '../schemas/schemas.errors.dto'
import SchemasService from '../schemas/schemas.service'
import { User, UserInfo } from '../utils/decorators/request.decorator'
import { JsonSchema } from '../utils/global-forms'
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'
import ConvertService from './convert.service'
import {
  ConvertToPdfV2RequestDto,
  JsonConvertRequestDto,
  JsonToXmlResponseDto,
  JsonToXmlV2RequestDto,
  PdfPreviewDataRequestDto,
  PdfPreviewDataResponseDto,
  XmlToJsonRequestDto,
  XmlToJsonResponseDto,
} from './dtos/form.dto'
import {
  FormIdMissingErrorDto,
  InvalidJwtTokenErrorDto,
  InvalidUuidErrorDto,
  PuppeteerFormNotFoundErrorDto,
  PuppeteerPageFailedLoadErrorDto,
} from './errors/convert.errors.dto'

@ApiTags('convert')
@ApiBearerAuth()
@Controller('convert')
export default class ConvertController {
  constructor(
    private readonly convertService: ConvertService,
    private readonly schemasService: SchemasService,
    private readonly minioClientSubservice: MinioClientSubservice,
  ) {}

  @ApiOperation({
    summary: '',
    description:
      'Generates XML form from given JSON data and schema version id',
    deprecated: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Return XML form',
    type: JsonToXmlResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Schema version not found',
    type: SchemaVersionNotFoundDto,
  })
  @Post('json-to-xml/:id')
  async convertJsonToXml(
    @Body() data: JsonConvertRequestDto,
    @Param('id') id: string,
  ): Promise<JsonToXmlResponseDto> {
    const schemaVersion = await this.schemasService.getVersion(id)
    return this.convertService.convertJsonToXml(
      data.jsonForm,
      schemaVersion.xmlTemplate,
      schemaVersion.jsonSchema as JsonSchema,
    )
  }

  @ApiOperation({
    summary: '',
    description:
      'Generates XML form from given JSON data and schema version id. At least one of `formId` and `jsonData` must be provided.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return XML form',
    type: JsonToXmlResponseDto,
  })
  @ApiExtraModels(SchemaVersionNotFoundDto, FormNotFoundErrorDto)
  @ApiResponse({
    status: 404,
    description: 'Schema version or form not found',
    schema: {
      oneOf: [
        {
          $ref: getSchemaPath(SchemaVersionNotFoundDto),
        },
        {
          $ref: getSchemaPath(FormNotFoundErrorDto),
        },
      ],
    },
  })
  @ApiBadRequestResponse({
    status: HttpStatusCode.BadRequest,
    description: 'If there is no form data, form id must be provided.',
    type: FormIdMissingErrorDto,
  })
  @ApiForbiddenResponse({
    status: HttpStatusCode.Forbidden,
    description: 'Form is owned by someone else.',
    type: FormIsOwnedBySomeoneElseErrorDto,
  })
  @UseGuards(new CognitoGuard(true))
  @Post('json-to-xml-v2')
  async convertJsonToXmlV2(
    @Body() data: JsonToXmlV2RequestDto,
    @User() user?: CognitoGetUserData,
    @UserInfo() userInfo?: ResponseGdprDataDto,
  ): Promise<JsonToXmlResponseDto> {
    return this.convertService.convertJsonToXmlV2(
      data,
      userInfo?.ico ?? null,
      user,
    )
  }

  @ApiOperation({
    summary: '',
    description:
      'Generates JSON form from given XML data and schema version id',
  })
  @ApiResponse({
    status: 200,
    description: 'Return Json form',
    type: XmlToJsonResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Schema version not found',
    type: SchemaVersionNotFoundDto,
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'There was an error during converting to json.',
  })
  @Post('xml-to-json/:id')
  async convertXmlToJson(
    @Body() data: XmlToJsonRequestDto,
    @Param('id') id: string,
  ): Promise<XmlToJsonResponseDto> {
    const schemaVersion = await this.schemasService.getVersion(id)
    return this.convertService.convertXmlToJson(
      data.xmlForm,
      schemaVersion.jsonSchema as JsonSchema,
    )
  }

  @ApiOperation({
    summary: '',
    description:
      'Generates PDF for a given schema version id and form json data.',
    deprecated: true,
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'Schema version not found',
    type: SchemaVersionNotFoundDto,
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'There was an error during generating pdf.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return pdf file stream.',
    type: StreamableFile,
  })
  @UseGuards(new CognitoGuard(true))
  @Post('pdf/:id')
  async convertToPdf(
    @Param('id') schemaVersionId: string,
    @Res({ passthrough: true }) res: Response,
    @Body() data: JsonConvertRequestDto,
    @User() user?: CognitoGetUserData,
  ): Promise<StreamableFile> {
    const schemaVersion = await this.schemasService.getVersion(
      schemaVersionId,
      true,
    )

    // for eligible tax forms (those of signed-in users) store json before transform and the transformed pdf itself for debug purposes
    let taxDebugBucket = ''
    let directoryName = ''
    let stringifiedData = ''
    let shouldStoreDebugPdfData = false
    const taxFormPospId = process.env.TAX_FORM_POSP_ID

    // common init for both json and pdf debug storage
    if (taxFormPospId && schemaVersion.pospID === taxFormPospId && user) {
      try {
        taxDebugBucket = process.env.TAX_PDF_DEBUG_BUCKET || 'forms-tax-debug'
        directoryName = this.convertService.getTaxDebugBucketDirectoryName(
          data.jsonForm,
        )
        stringifiedData = JSON.stringify(data, null, 2)
        shouldStoreDebugPdfData = true
      } catch (error) {
        console.error(
          `Error "statusCode":500 - failed to init debugDataStorage, will skip creating files in mino`,
        )
        console.error(error)
      }
    }

    // store json before transform
    if (shouldStoreDebugPdfData) {
      this.minioClientSubservice
        .putObject(
          taxDebugBucket,
          `${directoryName}/json.json`,
          stringifiedData,
        )
        .catch((error) => {
          console.error(
            `Error "statusCode":500 - failed to create a copy of pdf form, serialized form data: ${stringifiedData}`,
          )
          console.error(error)
        })
    }

    const file = await this.convertService.generatePdf(
      data.jsonForm,
      schemaVersion,
    )

    // we need two separate streams to read from - reading just from the file stream above would empty it and no data would be left for response
    // reference: https://stackoverflow.com/a/51143558
    const minioStream = new PassThrough()
    const responseStream = new PassThrough()
    file.pipe(minioStream)
    file.pipe(responseStream)

    // store pdf after transform
    if (shouldStoreDebugPdfData) {
      this.minioClientSubservice
        .putObject(taxDebugBucket, `${directoryName}/pdf.pdf`, file)
        .catch((error) => {
          console.error(
            `Error 500 - failed to create a copy of pdf form, serialized form data: ${stringifiedData}`,
          )
          console.error(error)
        })
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Access-Control-Expose-Headers': 'Content-Disposition',
      'Content-Disposition': `attachment; filename="${
        schemaVersion.schema ? schemaVersion.schema.slug : 'form'
      }.pdf"`,
    })

    return new StreamableFile(responseStream)
  }

  @ApiOperation({
    summary: '',
    description:
      'Generates PDF for a given schema version id and form json data.',
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'Schema version not found',
    type: SchemaVersionNotFoundDto,
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'Form not found',
    type: FormNotFoundErrorDto,
  })
  @ApiForbiddenResponse({
    status: HttpStatusCode.Forbidden,
    description: 'Form is owned by someone else, the access is not granted.',
    type: FormIsOwnedBySomeoneElseErrorDto,
  })
  @ApiInternalServerErrorResponse({
    status: HttpStatusCode.InternalServerError,
    description: 'There was an error during generating tax pdf.',
  })
  @ApiExtraModels(
    PuppeteerPageFailedLoadErrorDto,
    PuppeteerFormNotFoundErrorDto,
  )
  @ApiBadRequestResponse({
    status: HttpStatusCode.BadRequest,
    description: 'There was an error during generating pdf.',
    schema: {
      oneOf: [
        {
          $ref: getSchemaPath(PuppeteerPageFailedLoadErrorDto),
        },
        {
          $ref: getSchemaPath(PuppeteerFormNotFoundErrorDto),
        },
      ],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Return pdf file stream.',
    type: StreamableFile,
  })
  @UseGuards(new CognitoGuard(true))
  @Post('pdf-v2')
  async convertToPdfv2(
    @Res({ passthrough: true }) res: Response,
    @Body() data: ConvertToPdfV2RequestDto,
    @User() user?: CognitoGetUserData,
    @UserInfo() userInfo?: ResponseGdprDataDto,
  ): Promise<StreamableFile> {
    return this.convertService.convertToPdfV2(
      data,
      userInfo?.ico ?? null,
      res,
      user,
    )
  }

  @ApiOperation({
    summary: '',
    description: 'Returns necessary data for frontend to generate pdf.',
  })
  @ApiResponse({
    status: 200,
    type: PdfPreviewDataResponseDto,
  })
  @ApiExtraModels(InvalidUuidErrorDto, InvalidJwtTokenErrorDto)
  @ApiUnprocessableEntityResponse({
    status: HttpStatusCode.UnprocessableEntity,
    description: 'There was an error during fetching data for pdf from cache.',
    schema: {
      oneOf: [
        {
          $ref: getSchemaPath(InvalidUuidErrorDto),
        },
        {
          $ref: getSchemaPath(InvalidJwtTokenErrorDto),
        },
      ],
    },
  })
  @Post('pdf-preview-data')
  async getPdfPreviewData(
    @Res({ passthrough: true }) res: Response,
    @Body() data: PdfPreviewDataRequestDto,
  ): Promise<PdfPreviewDataResponseDto> {
    return this.convertService.getPdfPreviewData(data.jwtToken)
  }
}
