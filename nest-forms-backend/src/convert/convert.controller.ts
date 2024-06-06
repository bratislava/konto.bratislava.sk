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
  FormDefinitionNotFoundErrorDto,
  FormIsOwnedBySomeoneElseErrorDto,
  FormNotFoundErrorDto,
} from '../forms/forms.errors.dto'
import { ResponseGdprDataDto } from '../nases/dtos/responses.dto'
import { User, UserInfo } from '../utils/decorators/request.decorator'
import ConvertService from './convert.service'
import {
  ConvertToPdfV2RequestDto,
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
  ) {}

  @ApiOperation({
    summary: '',
    description:
      'Generates XML form from given JSON data and schema version id. At least one of `formId` and `jsonData` must be provided.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return XML form',
    type: String,
  })
  @ApiNotFoundResponse({
    status: HttpStatusCode.NotFound,
    description: 'Form definition was not found',
    type: FormDefinitionNotFoundErrorDto
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
  ): Promise<string> {
    return this.convertService.convertJsonToXmlV2(
      data,
      userInfo?.ico ?? null,
      user,
    )
  }

  @ApiOperation({
    summary: '',
    description:
      'Generates JSON form from given XML data and form definition slug',
  })
  @ApiResponse({
    status: 200,
    description: 'Return Json form',
    type: XmlToJsonResponseDto,
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'There was an error during converting to json.',
  })
  @ApiNotFoundResponse({
    status: HttpStatusCode.NotFound,
    description: 'Form definition was not found',
    type: FormDefinitionNotFoundErrorDto
  })
  @Post('xml-to-json/:slug')
  async convertXmlToJson(
    @Body() data: XmlToJsonRequestDto,
    @Param('slug') slug: string,
  ): Promise<XmlToJsonResponseDto> {
    return this.convertService.convertXmlToJson(
      data.xmlForm,
      slug,
    )
  }

  @ApiOperation({
    summary: '',
    description:
      'Generates PDF for a given schema version id and form json data.',
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'Form or form description not found',
    schema: {
      oneOf: [
        {
          $ref: getSchemaPath(FormNotFoundErrorDto)
        },
        {
          $ref: getSchemaPath(FormDefinitionNotFoundErrorDto)
        }
      ]
    }
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
