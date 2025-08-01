import {
  Body,
  Controller,
  Post,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { Response } from 'express'

import { AllowedUserTypes } from '../auth-v2/decorators/allowed-user-types.decorator'
import { ApiCognitoGuestIdentityIdAuth } from '../auth-v2/decorators/api-cognito-guest-identity-id-auth.decorator'
import { GetUser } from '../auth-v2/decorators/get-user.decorator'
import { UserAuthGuard } from '../auth-v2/guards/user-auth.guard'
import { User, UserType } from '../auth-v2/types/user'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import ConvertService from './convert.service'
import {
  ConvertToPdfRequestDto,
  JsonToXmlV2RequestDto,
  XmlToJsonRequestDto,
  XmlToJsonResponseDto,
} from './dtos/form.dto'

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
  @ApiCognitoGuestIdentityIdAuth()
  @ApiBearerAuth()
  @AllowedUserTypes([UserType.Auth, UserType.Guest])
  @UseGuards(UserAuthGuard)
  @Post('json-to-xml-v2')
  async convertJsonToXmlV2(
    @Body() data: JsonToXmlV2RequestDto,
    @GetUser() user: User,
  ): Promise<string> {
    // TODO remove try-catch & extra logging once we start logging requests
    try {
      return await this.convertService.convertJsonToXmlV2(data, user)
    } catch (error) {
      const userId =
        user.type === UserType.Auth
          ? user.cognitoJwtPayload.sub
          : user.cognitoIdentityId
      const email =
        user.type === UserType.Auth ? user.cityAccountUser.email : undefined

      this.logger.log(
        `Error during convertJsonToXmlV2, userId: ${userId}, email: ${email}, formId: ${
          data.formId
        }, data: ${JSON.stringify(data.jsonData)}`,
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
  @ApiCognitoGuestIdentityIdAuth()
  @ApiBearerAuth()
  @AllowedUserTypes([UserType.Auth, UserType.Guest])
  @UseGuards(UserAuthGuard)
  @Post('xml-to-json')
  async convertXmlToJson(
    @Body() data: XmlToJsonRequestDto,
    @GetUser() user: User,
  ): Promise<XmlToJsonResponseDto> {
    return this.convertService.convertXmlToJson(data, user)
  }

  @ApiOperation({
    summary: '',
    description: 'Generates PDF for given form data.',
  })
  @ApiOkResponse({
    description: 'Return pdf file stream.',
    type: StreamableFile,
  })
  @ApiCognitoGuestIdentityIdAuth()
  @ApiBearerAuth()
  @AllowedUserTypes([UserType.Auth, UserType.Guest])
  @UseGuards(UserAuthGuard)
  @Post('pdf')
  async convertToPdf(
    @Res({ passthrough: true }) res: Response,
    @Body() data: ConvertToPdfRequestDto,
    @GetUser() user: User,
  ): Promise<StreamableFile> {
    return this.convertService.convertToPdf(data, res, user)
  }
}
