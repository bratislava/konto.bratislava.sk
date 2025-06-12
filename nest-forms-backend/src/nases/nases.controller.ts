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

import {
  UserInfo,
  UserInfoResponse,
} from '../auth/decorators/user-info.decorator'
import { CognitoGetUserData } from '../auth/dtos/cognito.dto'
import CognitoGuard from '../auth/guards/cognito.guard'
import { AllowedUserTypes } from '../auth-v2/decorators/allowed-user-types.decorator'
import { ApiCognitoGuestIdentityIdAuth } from '../auth-v2/decorators/api-cognito-guest-identity-id-auth.decorator'
import { GetUser } from '../auth-v2/decorators/get-user.decorator'
import { UserAuthGuard } from '../auth-v2/guards/user-auth.guard'
import { AuthUser, User as UserV2, UserType } from '../auth-v2/types/user'
import FormDeleteResponseDto from '../forms/dtos/forms.responses.dto'
import FormsService from '../forms/forms.service'
import { User } from '../utils/decorators/request.decorator'
import {
  ErrorsEnum,
  ErrorsResponseEnum,
} from '../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import {
  CreateFormRequestDto,
  EidUpdateSendFormRequestDto,
  GetFormResponseDto,
  GetFormsRequestDto,
  GetFormsResponseDto,
  JwtNasesPayloadDto,
  SendFormResponseDto,
  UpdateFormRequestDto,
} from './dtos/requests.dto'
import { CreateFormResponseDto } from './dtos/responses.dto'
import { NasesErrorsEnum, NasesErrorsResponseEnum } from './nases.errors.enum'
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
  @UseGuards(UserAuthGuard)
  @Get('form/:id')
  async getForm(
    @Param('id') id: string,
    @GetUser() user: UserV2,
  ): Promise<GetFormResponseDto> {
    const data = await this.nasesService.getForm(id, user)
    return data
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
  @UseGuards(UserAuthGuard)
  @Delete(':id')
  async deleteForm(
    @Param('id') id: string,
    @GetUser() user: UserV2,
  ): Promise<FormDeleteResponseDto> {
    await this.formsService.archiveForm(id, user)
    return {
      archived: true,
      formId: id,
    }
  }

  @ApiOperation({
    summary: '',
    description:
      'Create id in our backend, which you need to send in form as external id. Save also data necessary for envelope to send message to NASES',
  })
  @ApiOkResponse({
    description: 'Create form in db',
    type: CreateFormResponseDto,
  })
  @ApiCognitoGuestIdentityIdAuth()
  @ApiBearerAuth()
  @AllowedUserTypes([UserType.Auth, UserType.Guest])
  @UseGuards(UserAuthGuard)
  @Post('create-form')
  async createForm(
    @Body() data: CreateFormRequestDto,
    @GetUser() user: UserV2,
  ): Promise<CreateFormResponseDto> {
    const returnData = await this.nasesService.createForm(data, user)
    return returnData
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
  @UseGuards(UserAuthGuard)
  @Post('update-form/:id')
  async updateForm(
    @Body() data: UpdateFormRequestDto,
    @Param('id') id: string,
    @GetUser() user: UserV2,
  ): Promise<Forms> {
    const returnData = await this.nasesService.updateForm(id, data, user)
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
  @UseGuards(UserAuthGuard)
  @Post('send-and-update-form/:id')
  async sendAndUpdateForm(
    @Body() data: UpdateFormRequestDto,
    @Param('id') id: string,
    @GetUser() user: UserV2,
  ): Promise<SendFormResponseDto> {
    await this.nasesService.updateForm(id, data, user)

    // @ts-expect-error Breaking change, will be fixed in NASES service
    const returnData = await this.nasesService.sendForm(id, user)
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
  @UseGuards(UserAuthGuard)
  @Post('eid/send-and-update-form/:id')
  async sendAndUpdateFormEid(
    @Body() data: EidUpdateSendFormRequestDto,
    @Param('id') id: string,
    @GetUser() user: UserV2,
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

    if (
      !(await this.nasesService.canSendForm(
        id,
        nasesUser,
        user.type === UserType.Auth ? user.id : undefined,
      ))
    ) {
      throw this.throwerErrorGuard.ForbiddenException(
        NasesErrorsEnum.FORBIDDEN_SEND,
        NasesErrorsResponseEnum.FORBIDDEN_SEND,
      )
    }

    const updateData = { ...data, eidToken: undefined }

    // TODO temp SEND_TO_NASES_ERROR log, remove
    this.logger.log(
      `Signed data from request for formId ${id} before send:`,
      updateData.formSignature,
    )

    await this.nasesService.updateFormEid(id, nasesUser, updateData, user)

    const returnData = await this.nasesService.sendFormEid(
      id,
      data.eidToken,
      nasesUser,
      // @ts-expect-error Breaking change, will be fixed in NASES service
      user,
    )
    return returnData
  }
}
