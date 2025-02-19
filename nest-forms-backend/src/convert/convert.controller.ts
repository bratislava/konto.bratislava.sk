import {
  Body,
  Controller,
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
  EmptyFormDataErrorDto,
  FormDefinitionNotFoundErrorDto,
  FormDefinitionNotSupportedTypeErrorDto,
  FormIsOwnedBySomeoneElseErrorDto,
  FormNotFoundErrorDto,
} from '../forms/forms.errors.dto'
import { ResponseGdprDataDto } from '../nases/dtos/responses.dto'
import { User, UserInfo } from '../utils/decorators/request.decorator'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import ConvertService from './convert.service'
import {
  ConvertToPdfRequestDto,
  JsonToXmlV2RequestDto,
  XmlToJsonRequestDto,
  XmlToJsonResponseDto,
} from './dtos/form.dto'
import {
  IncompatibleJsonVersionErrorDto,
  InvalidJsonErrorDto,
  InvalidXmlErrorDto,
  PdfGenerationFailedErrorDto,
  WrongPospIdErrorDto,
  XmlDoesntMatchSchemaErrorDto,
} from './errors/convert.errors.dto'

@ApiTags('convert')
@ApiBearerAuth()
@Controller('convert')
export default class ConvertController {
  private readonly logger: LineLoggerSubservice

  constructor(private readonly convertService: ConvertService) {
    this.logger = new LineLoggerSubservice('ConvertController')
  }

  @ApiOperation({
    summary: 'Convert JSON to XML',
    description:
      'Generates XML form from given JSON data or form data stored in the database. If jsonData is not provided, the form data from the database will be used.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return XML form',
    type: String,
  })
  @ApiExtraModels(FormNotFoundErrorDto)
  @ApiExtraModels(FormDefinitionNotFoundErrorDto)
  @ApiExtraModels(EmptyFormDataErrorDto)
  @ApiNotFoundResponse({
    status: HttpStatusCode.NotFound,
    description: 'Form or form definition was not found',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(FormNotFoundErrorDto) },
        { $ref: getSchemaPath(FormDefinitionNotFoundErrorDto) },
      ],
    },
  })
  @ApiForbiddenResponse({
    status: HttpStatusCode.Forbidden,
    description: 'Form is owned by someone else.',
    type: FormIsOwnedBySomeoneElseErrorDto,
  })
  @ApiUnprocessableEntityResponse({
    status: HttpStatusCode.UnprocessableEntity,
    description:
      'Got wrong type of form definition for its slug or empty form data.',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(FormDefinitionNotSupportedTypeErrorDto) },
        { $ref: getSchemaPath(EmptyFormDataErrorDto) },
      ],
    },
  })
  @UseGuards(new CognitoGuard(true))
  @Post('json-to-xml-v2')
  async convertJsonToXmlV2(
    @Body() data: JsonToXmlV2RequestDto,
    @User() user?: CognitoGetUserData,
    @UserInfo() userInfo?: ResponseGdprDataDto,
  ): Promise<string> {
    // TODO remove try-catch & extra logging once we start logging requests
    try {
      return await this.convertService.convertJsonToXmlV2(
        data,
        userInfo?.ico ?? null,
        user,
      )
    } catch (error) {
      this.logger.log(
        `Error during convertJsonToXmlV2, userId: ${user?.sub}, email: ${user?.email}, formId: ${data.formId}, data: ${JSON.stringify(data.jsonData)}`,
      )
      throw error
    }
  }

  @ApiOperation({
    summary: 'Convert XML to JSON',
    description: 'Generates JSON form from given XML data and form ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Return Json form',
    type: XmlToJsonResponseDto,
  })
  @ApiExtraModels(InvalidXmlErrorDto)
  @ApiExtraModels(XmlDoesntMatchSchemaErrorDto)
  @ApiExtraModels(WrongPospIdErrorDto)
  @ApiExtraModels(InvalidJsonErrorDto)
  @ApiExtraModels(IncompatibleJsonVersionErrorDto)
  @ApiBadRequestResponse({
    status: 400,
    description: 'There was an error during converting to json.',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(InvalidXmlErrorDto) },
        { $ref: getSchemaPath(XmlDoesntMatchSchemaErrorDto) },
        { $ref: getSchemaPath(WrongPospIdErrorDto) },
        { $ref: getSchemaPath(InvalidJsonErrorDto) },
      ],
    },
  })
  @ApiUnprocessableEntityResponse({
    status: HttpStatusCode.UnprocessableEntity,
    description:
      'Form definition type is wrong or JSON version is incompatible',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(FormDefinitionNotSupportedTypeErrorDto) },
        { $ref: getSchemaPath(IncompatibleJsonVersionErrorDto) },
      ],
    },
  })
  @ApiNotFoundResponse({
    status: HttpStatusCode.NotFound,
    description: 'Form or form definition was not found',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(FormNotFoundErrorDto) },
        { $ref: getSchemaPath(FormDefinitionNotFoundErrorDto) },
      ],
    },
  })
  @ApiForbiddenResponse({
    status: HttpStatusCode.Forbidden,
    description: 'Form is owned by someone else.',
    type: FormIsOwnedBySomeoneElseErrorDto,
  })
  @UseGuards(new CognitoGuard(true))
  @Post('xml-to-json')
  async convertXmlToJson(
    @Body() data: XmlToJsonRequestDto,
    @User() user?: CognitoGetUserData,
    @UserInfo() userInfo?: ResponseGdprDataDto,
  ): Promise<XmlToJsonResponseDto> {
    return this.convertService.convertXmlToJson(
      data,
      userInfo?.ico ?? null,
      user,
    )
  }

  @ApiOperation({
    summary: '',
    description: 'Generates PDF for given form data.',
  })
  @ApiExtraModels(EmptyFormDataErrorDto)
  @ApiNotFoundResponse({
    status: 404,
    description: 'Form or form definition not found',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(FormNotFoundErrorDto) },
        { $ref: getSchemaPath(FormDefinitionNotFoundErrorDto) },
      ],
    },
  })
  @ApiForbiddenResponse({
    status: HttpStatusCode.Forbidden,
    description: 'Form is owned by someone else, the access is not granted.',
    type: FormIsOwnedBySomeoneElseErrorDto,
  })
  @ApiUnprocessableEntityResponse({
    status: HttpStatusCode.UnprocessableEntity,
    description: 'Empty form data.',
    type: EmptyFormDataErrorDto,
  })
  @ApiInternalServerErrorResponse({
    status: HttpStatusCode.InternalServerError,
    description: 'There was an error during generating tax pdf.',
  })
  @ApiInternalServerErrorResponse({
    status: HttpStatusCode.InternalServerError,
    description: 'There was an error during generating pdf.',
    type: PdfGenerationFailedErrorDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Return pdf file stream.',
    type: StreamableFile,
  })
  @UseGuards(new CognitoGuard(true))
  @Post('pdf')
  async convertToPdf(
    @Res({ passthrough: true }) res: Response,
    @Body() data: ConvertToPdfRequestDto,
    @User() user?: CognitoGetUserData,
    @UserInfo() userInfo?: ResponseGdprDataDto,
  ): Promise<StreamableFile> {
    return this.convertService.convertToPdf(
      data,
      userInfo?.ico ?? null,
      res,
      user,
    )
  }
}
