import {
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import jwt from 'jsonwebtoken'

import { AllowedUserTypes } from '../auth-v2/decorators/allowed-user-types.decorator'
import { ApiCognitoGuestIdentityIdAuth } from '../auth-v2/decorators/api-cognito-guest-identity-id-auth.decorator'
import { GetUser } from '../auth-v2/decorators/get-user.decorator'
import { UserAuthGuard } from '../auth-v2/guards/user-auth.guard'
import { User, UserType } from '../auth-v2/types/user'
import { UpdateFormRequestDto } from '../forms/dtos/requests.dto'
import FormsService from '../forms/forms.service'
import { FormAccessGuard } from '../forms-v2/guards/form-access.guard'
import { FormSendOnlyRegisteredGuard } from '../forms-v2/guards/form-send-only-registered.guard'
import { EidUpdateSendFormRequestDto } from '../nases/dtos/requests.dto'
import { SendFormResponseDto } from '../nases/dtos/responses.dto'
import NasesService from '../nases/nases.service'
import { JwtNasesPayload } from '../nases/types/jwt-nases.types'
import {
  ErrorsEnum,
  ErrorsResponseEnum,
} from '../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'

@ApiTags('form-sender')
@ApiBearerAuth()
@Controller('form-sender')
export default class FormSenderController {
  constructor(
    private readonly nasesService: NasesService,
    private readonly formsService: FormsService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly logger: LineLoggerSubservice,
  ) {}

  @ApiOperation({
    summary: '',
    description:
      'This endpoint is used for updating from and sending it to NASES. First is form updated then send to rabbitmq, then is controlled if everything is okay and files are scanned and after that is send to NASES',
  })
  @ApiOkResponse({
    description: 'Form was successfully send to rabbit, ant then to nases.',
    type: SendFormResponseDto,
  })
  @ApiCognitoGuestIdentityIdAuth()
  @ApiBearerAuth()
  @AllowedUserTypes([UserType.Auth, UserType.Guest])
  @UseGuards(UserAuthGuard, FormAccessGuard, FormSendOnlyRegisteredGuard)
  @Post('send-and-update-form/:formId')
  async sendAndUpdateForm(
    @Body() data: UpdateFormRequestDto,
    @Param('formId') formId: string,
    @GetUser() user: User,
  ): Promise<SendFormResponseDto> {
    await this.formsService.updateFormWithUser(formId, data, user)

    return this.nasesService.sendForm(formId, user)
  }

  @ApiOperation({
    summary: '',
    description:
      'This endpoint is used for updating from and sending it to NASES. First is form updated then send to rabbitmq, then is controlled if everything is okay and files are scanned and after that is send to NASES',
  })
  @ApiOkResponse({
    description: 'Form was successfully send to rabbit, ant then to nases.',
    type: SendFormResponseDto,
  })
  @ApiCognitoGuestIdentityIdAuth()
  @ApiBearerAuth()
  @AllowedUserTypes([UserType.Auth, UserType.Guest])
  @UseGuards(UserAuthGuard, FormAccessGuard, FormSendOnlyRegisteredGuard)
  @Post('eid/send-and-update-form/:formId')
  async sendAndUpdateFormEid(
    @Body() data: EidUpdateSendFormRequestDto,
    @Param('formId') formId: string,
    @GetUser() user: User,
  ): Promise<SendFormResponseDto> {
    const jwtTest = this.nasesService.createUserJwtToken(data.eidToken)
    if ((await this.nasesService.getUpvsIdentity(jwtTest)) === null) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
      )
    }
    const nasesUser = jwt.decode(data.eidToken, {
      json: true,
    }) as JwtNasesPayload

    // eslint-disable-next-line @typescript-eslint/no-misused-spread -- we are spreading a DTO object, which is not a problem
    const updateData = { ...data, eidToken: undefined }

    // TODO temp SEND_TO_NASES_ERROR log, remove
    this.logger.log(
      `Signed data from request for formId ${formId} before send:`,
      updateData.formSignature,
    )

    await this.formsService.updateFormEid(formId, nasesUser, updateData, user)

    return this.nasesService.sendFormEid(formId, data.eidToken, nasesUser, user)
  }
}
