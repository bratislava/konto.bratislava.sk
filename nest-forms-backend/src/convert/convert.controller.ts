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
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { Response } from 'express'

import {
  UserInfo,
  UserInfoResponse,
} from '../auth/decorators/user-info.decorator'
import { CognitoGetUserData } from '../auth/dtos/cognito.dto'
import CognitoGuard from '../auth/guards/cognito.guard'
import {
  EmptyFormDataErrorDto,
  FormDefinitionNotFoundErrorDto,
  FormDefinitionNotSupportedTypeErrorDto,
  FormIsOwnedBySomeoneElseErrorDto,
  FormNotFoundErrorDto,
} from '../forms/forms.errors.dto'
import { User } from '../utils/decorators/request.decorator'
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
  @ApiOkResponse({
    description: 'Return XML form',
    type: String,
  })
  @ApiExtraModels(FormNotFoundErrorDto)
  @ApiExtraModels(FormDefinitionNotFoundErrorDto)
  @ApiExtraModels(EmptyFormDataErrorDto)
  @ApiNotFoundResponse({
    description: 'Form or form definition was not found',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(FormNotFoundErrorDto) },
        { $ref: getSchemaPath(FormDefinitionNotFoundErrorDto) },
      ],
    },
  })
  @ApiForbiddenResponse({
    description: 'Form is owned by someone else.',
    type: FormIsOwnedBySomeoneElseErrorDto,
  })
  @ApiUnprocessableEntityResponse({
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
    @User() user: CognitoGetUserData | undefined,
    @UserInfo() userInfo: UserInfoResponse,
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
  @ApiOkResponse({
    description: 'Return Json form',
    type: XmlToJsonResponseDto,
  })
  @ApiExtraModels(InvalidXmlErrorDto)
  @ApiExtraModels(XmlDoesntMatchSchemaErrorDto)
  @ApiExtraModels(WrongPospIdErrorDto)
  @ApiExtraModels(InvalidJsonErrorDto)
  @ApiExtraModels(IncompatibleJsonVersionErrorDto)
  @ApiBadRequestResponse({
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
    description: 'Form or form definition was not found',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(FormNotFoundErrorDto) },
        { $ref: getSchemaPath(FormDefinitionNotFoundErrorDto) },
      ],
    },
  })
  @ApiForbiddenResponse({
    description: 'Form is owned by someone else.',
    type: FormIsOwnedBySomeoneElseErrorDto,
  })
  @UseGuards(new CognitoGuard(true))
  @Post('xml-to-json')
  async convertXmlToJson(
    @Body() data: XmlToJsonRequestDto,
    @User() user: CognitoGetUserData | undefined,
    @UserInfo() userInfo: UserInfoResponse,
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
    description: 'Form or form definition not found',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(FormNotFoundErrorDto) },
        { $ref: getSchemaPath(FormDefinitionNotFoundErrorDto) },
      ],
    },
  })
  @ApiForbiddenResponse({
    description: 'Form is owned by someone else, the access is not granted.',
    type: FormIsOwnedBySomeoneElseErrorDto,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Empty form data.',
    type: EmptyFormDataErrorDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'There was an error during generating tax pdf.',
  })
  @ApiInternalServerErrorResponse({
    description: 'There was an error during generating pdf.',
    type: PdfGenerationFailedErrorDto,
  })
  @ApiOkResponse({
    description: 'Return pdf file stream.',
    type: StreamableFile,
  })
  @UseGuards(new CognitoGuard(true))
  @Post('pdf')
  async convertToPdf(
    @Res({ passthrough: true }) res: Response,
    @Body() data: ConvertToPdfRequestDto,
    @User() user: CognitoGetUserData | undefined,
    @UserInfo() userInfo: UserInfoResponse,
  ): Promise<StreamableFile> {
    return this.convertService.convertToPdf(
      data,
      userInfo?.ico ?? null,
      res,
      user,
    )
  }
}
