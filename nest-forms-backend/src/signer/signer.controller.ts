import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
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
import {
  User,
  UserInfo,
  UserInfoResponse,
} from '../utils/decorators/request.decorator'
import { SignerDataRequestDto, SignerDataResponseDto } from './signer.dto'
import { XmlValidationErrorDto } from './signer.errors.dto'
import SignerService from './signer.service'

@ApiTags('Signer')
@ApiBearerAuth()
@Controller('signer')
export default class SignerController {
  private readonly logger: Logger

  constructor(private readonly signerService: SignerService) {
    this.logger = new Logger('SignerController')
  }

  @ApiOperation({
    summary: 'Get signer data',
    description:
      'Generates signer data including XML and metadata for form signing',
  })
  @ApiResponse({
    status: 200,
    description: 'Return signer data',
    type: SignerDataResponseDto,
  })
  @ApiExtraModels(FormNotFoundErrorDto)
  @ApiExtraModels(FormDefinitionNotFoundErrorDto)
  @ApiExtraModels(XmlValidationErrorDto)
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
  @ApiBadRequestResponse({
    status: HttpStatusCode.BadRequest,
    description: 'XML validation failed against XSD schema.',
    type: XmlValidationErrorDto,
  })
  @UseGuards(new CognitoGuard(true))
  @Post('get-signer-data')
  async getSignerData(
    @Body() data: SignerDataRequestDto,
    @User() user?: CognitoGetUserData,
    @UserInfo() userInfo?: UserInfoResponse,
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
