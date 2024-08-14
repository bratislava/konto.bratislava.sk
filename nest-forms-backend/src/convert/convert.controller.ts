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
  FormDefinitionNotSupportedTypeErrorDto,
  FormIsOwnedBySomeoneElseErrorDto,
  FormNotFoundErrorDto,
} from '../forms/forms.errors.dto'
import { ResponseGdprDataDto } from '../nases/dtos/responses.dto'
import { User, UserInfo } from '../utils/decorators/request.decorator'
import ConvertService from './convert.service'
import {
  ConvertToPdfRequestDto,
  JsonToXmlV2RequestDto,
  XmlToJsonRequestDto,
  XmlToJsonResponseDto,
} from './dtos/form.dto'
import { PdfGenerationFailedErrorDto } from './errors/convert.errors.dto'

@ApiTags('convert')
@ApiBearerAuth()
@Controller('convert')
export default class ConvertController {
  constructor(private readonly convertService: ConvertService) {}

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
  @ApiNotFoundResponse({
    status: HttpStatusCode.NotFound,
    description: 'Form definition was not found',
    type: FormDefinitionNotFoundErrorDto,
  })
  @ApiForbiddenResponse({
    status: HttpStatusCode.Forbidden,
    description: 'Form is owned by someone else.',
    type: FormIsOwnedBySomeoneElseErrorDto,
  })
  @ApiUnprocessableEntityResponse({
    status: HttpStatusCode.UnprocessableEntity,
    description: 'Got wrong type of form definition for its slug.',
    type: FormDefinitionNotSupportedTypeErrorDto,
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
    type: FormDefinitionNotFoundErrorDto,
  })
  @Post('xml-to-json/:slug')
  async convertXmlToJson(
    @Body() data: XmlToJsonRequestDto,
    @Param('slug') slug: string,
  ): Promise<XmlToJsonResponseDto> {
    return this.convertService.convertXmlToJson(data.xmlForm, slug)
  }

  @ApiOperation({
    summary: '',
    description: 'Generates PDF for given form data.',
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'Form or form definition not found',
    schema: {
      oneOf: [
        {
          $ref: getSchemaPath(FormNotFoundErrorDto),
        },
        {
          $ref: getSchemaPath(FormDefinitionNotFoundErrorDto),
        },
      ],
    },
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
