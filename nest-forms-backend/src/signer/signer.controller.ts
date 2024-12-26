import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { HttpStatusCode } from 'axios'

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
import { SignerDataRequestDto, SignerDataResponseDto } from './signer.dto'
import SignerService from './signer.service'

@ApiTags('signer')
@ApiBearerAuth()
@Controller('signer')
export default class SignerController {
  private readonly logger: Logger

  constructor(private readonly signerService: SignerService) {
    this.logger = new Logger('SignerController')
  }

  @ApiOperation({
    summary: 'Signer JSON to XML',
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
    description: 'Got wrong type of form definition for its slug.',
    type: FormDefinitionNotSupportedTypeErrorDto,
  })
  @UseGuards(new CognitoGuard(true))
  @Post('json-to-xml-v2')
  async convertJsonToXmlV2(
    @Body() data: SignerDataRequestDto,
    @User() user?: CognitoGetUserData,
    @UserInfo() userInfo?: ResponseGdprDataDto,
  ): Promise<SignerDataResponseDto> {
    // TODO remove try-catch & extra logging once we start logging requests
    try {
      return await this.signerService.getSignerData(
        data,
        userInfo?.ico ?? null,
        user,
      )
    } catch (error) {
      this.logger.log(
        `Error during getSignerData, userId: ${user?.sub}, email: ${user?.email}, formId: ${data.formId}, data: ${JSON.stringify(data.formDataJson)}`,
      )
      throw error
    }
  }
}
