import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { Forms } from '@prisma/client'
import jwt from 'jsonwebtoken'

import { AllowedUserTypes } from '../auth-v2/decorators/allowed-user-types.decorator'
import { ApiCognitoGuestIdentityIdAuth } from '../auth-v2/decorators/api-cognito-guest-identity-id-auth.decorator'
import { GetUser } from '../auth-v2/decorators/get-user.decorator'
import { UserAuthGuard } from '../auth-v2/guards/user-auth.guard'
import { AuthUser, User, UserType } from '../auth-v2/types/user'
import FormDeleteResponseDto from '../forms/dtos/forms.responses.dto'
import FormsService from '../forms/forms.service'
import {
  FormAccessAllowMigrations,
  FormAccessGuard,
  GetFormAccessType,
} from '../forms-v2/guards/form-access.guard'
import { FormAccessType } from '../forms-v2/services/form-access.service'
import {
  ErrorsEnum,
  ErrorsResponseEnum,
} from '../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import {
  EidUpdateSendFormRequestDto,
  GetFormResponseDto,
  GetFormsRequestDto,
  GetFormsResponseDto,
  JwtNasesPayloadDto,
  SendFormResponseDto,
  UpdateFormRequestDto,
} from './dtos/requests.dto'
import NasesService from './nases.service'
import NasesUtilsService from './utils-services/tokens.nases.service'

@ApiTags('nases')
@ApiBearerAuth()
@Controller('nases')
export default class NasesController {
  constructor(
    private readonly nasesService: NasesService,
    private readonly nasesUtilsService: NasesUtilsService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly formsService: FormsService,
    private readonly logger: LineLoggerSubservice,
  ) {}

  // WORK ENDPOINTS

  @ApiOperation({
    summary: '',
    description: 'Return form by ID and by logged user',
  })
  @ApiOkResponse({
    description: 'Return form',
    type: GetFormResponseDto,
  })
  @ApiCognitoGuestIdentityIdAuth()
  @ApiBearerAuth()
  @AllowedUserTypes([UserType.Auth, UserType.Guest])
  @FormAccessAllowMigrations()
  @UseGuards(UserAuthGuard, FormAccessGuard)
  @Get('form/:formId')
  async getForm(
    @Param('formId') id: string,
    @GetUser() user: User,
    @GetFormAccessType() accessType: FormAccessType,
  ): Promise<GetFormResponseDto> {
    const data = await this.nasesService.getForm(id)
    return {
      ...data,
      requiresMigration: accessType === FormAccessType.Migration,
    }
  }

  @ApiOperation({
    summary: 'Get paginated forms',
    description: 'Get paginated forms',
  })
  @ApiOkResponse({
    description: 'Return forms',
    type: GetFormsResponseDto,
  })
  @ApiBearerAuth()
  @AllowedUserTypes([UserType.Auth])
  @UseGuards(UserAuthGuard)
  @Get('forms')
  async getForms(
    @Query() query: GetFormsRequestDto,
    @GetUser() user: AuthUser,
  ): Promise<GetFormsResponseDto> {
    const data = await this.nasesService.getForms(query, user)
    return data
  }

  @ApiOperation({
    summary: '',
    description: 'Archive form (hide from user but keep in database)',
  })
  @ApiOkResponse({
    description: 'Form successfully deleted',
  })
  @ApiCognitoGuestIdentityIdAuth()
  @ApiBearerAuth()
  @AllowedUserTypes([UserType.Auth, UserType.Guest])
  @UseGuards(UserAuthGuard, FormAccessGuard)
  @Delete(':formId')
  async deleteForm(
    @Param('formId') formId: string,
  ): Promise<FormDeleteResponseDto> {
    await this.formsService.archiveForm(formId)
    return {
      archived: true,
      formId,
    }
  }

  @ApiOperation({
    summary: '',
    description: 'Update form',
  })
  @ApiOkResponse({
    description:
      'Return charging details - price and used free minutes / hours.',
    type: GetFormResponseDto,
  })
  @ApiCognitoGuestIdentityIdAuth()
  @ApiBearerAuth()
  @AllowedUserTypes([UserType.Auth, UserType.Guest])
  @UseGuards(UserAuthGuard, FormAccessGuard)
  @Post('update-form/:formId')
  async updateForm(
    @Body() data: UpdateFormRequestDto,
    @Param('formId') formId: string,
    @GetUser() user: User,
  ): Promise<Forms> {
    const returnData = await this.nasesService.updateForm(formId, data, user)
    return returnData
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
  @UseGuards(UserAuthGuard, FormAccessGuard)
  @Post('send-and-update-form/:formId')
  async sendAndUpdateForm(
    @Body() data: UpdateFormRequestDto,
    @Param('formId') formId: string,
    @GetUser() user: User,
  ): Promise<SendFormResponseDto> {
    await this.nasesService.updateForm(formId, data, user)

    const returnData = await this.nasesService.sendForm(formId, user)
    return returnData
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
  @UseGuards(UserAuthGuard, FormAccessGuard)
  @Post('eid/send-and-update-form/:formId')
  async sendAndUpdateFormEid(
    @Body() data: EidUpdateSendFormRequestDto,
    @Param('formId') formId: string,
    @GetUser() user: User,
  ): Promise<SendFormResponseDto> {
    const jwtTest = this.nasesUtilsService.createUserJwtToken(data.eidToken)
    if ((await this.nasesService.getNasesIdentity(jwtTest)) === null) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
      )
    }
    const nasesUser = jwt.decode(data.eidToken, {
      json: true,
    }) as JwtNasesPayloadDto

    const updateData = { ...data, eidToken: undefined }

    // TODO temp SEND_TO_NASES_ERROR log, remove
    this.logger.log(
      `Signed data from request for formId ${formId} before send:`,
      updateData.formSignature,
    )

    await this.nasesService.updateFormEid(formId, nasesUser, updateData, user)

    const returnData = await this.nasesService.sendFormEid(
      formId,
      data.eidToken,
      nasesUser,
      user,
    )
    return returnData
  }
}
