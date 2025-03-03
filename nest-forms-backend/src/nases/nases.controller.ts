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
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotAcceptableResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { Forms } from '@prisma/client'
import jwt from 'jsonwebtoken'

import { CognitoGetUserData } from '../auth/dtos/cognito.dto'
import CognitoGuard from '../auth/guards/cognito.guard'
import NasesAuthGuard from '../auth/guards/nases.guard'
import {
  FileDeleteFromMinioWasNotSuccessfulErrorDto,
  FileIdsNotFoundInDbErrorDto,
} from '../files/files.errors.dto'
import FormDeleteResponseDto from '../forms/dtos/forms.responses.dto'
import {
  EmptyFormDataErrorDto,
  FormDataInvalidErrorDto,
  FormDefinitionNotFoundErrorDto,
  FormDefinitionNotSupportedTypeErrorDto,
  FormIsOwnedBySomeoneElseErrorDto,
  FormNotEditableErrorDto,
  FormNotFoundErrorDto,
  NoFormXmlDataErrorDto,
} from '../forms/forms.errors.dto'
import FormsService from '../forms/forms.service'
import {
  BearerToken,
  User,
  UserInfo,
  UserInfoResponse,
} from '../utils/decorators/request.decorator'
import {
  DatabaseErrorDto,
  NotFoundErrorDto,
  UnauthorizedErrorDto,
} from '../utils/global-dtos/errors.dto'
import {
  ErrorsEnum,
  ErrorsResponseEnum,
} from '../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import {
  CreateFormRequestDto,
  EidSendFormRequestDto,
  EidUpdateSendFormRequestDto,
  GetFormResponseDto,
  GetFormsRequestDto,
  GetFormsResponseDto,
  JwtNasesPayloadDto,
  SendFormResponseDto,
  UpdateFormRequestDto,
} from './dtos/requests.dto'
import {
  CanSendResponseDto,
  CreateFormResponseDto,
  MigrateFormResponseDto,
} from './dtos/responses.dto'
import {
  ForbiddenFormSendDto,
  FormAssignedToOtherUserErrorDto,
  FormSummaryGenerationErrorDto,
  FormVersionNotCompatibleErrorDto,
  SignatureFormDataHashMismatchErrorDto,
  SignatureFormDefinitionMismatchErrorDto,
  SignatureMissingErrorDto,
  UnableAddFormToRabbitErrorDto,
} from './nases.errors.dto'
import { NasesErrorsEnum, NasesErrorsResponseEnum } from './nases.errors.enum'
import NasesService from './nases.service'
import NasesUtilsService from './utils-services/tokens.nases.service'

@ApiTags('nases')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized.',
  type: UnauthorizedErrorDto,
})
@Controller('nases')
export default class NasesController {
  constructor(
    private readonly nasesService: NasesService,
    private readonly nasesUtilsService: NasesUtilsService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly formsService: FormsService,
  ) {}

  // WORK ENDPOINTS

  @ApiOperation({
    summary: '',
    description: 'Return form by ID and by logged user',
  })
  @ApiResponse({
    status: 200,
    description: 'Return form',
    type: GetFormResponseDto,
  })
  @ApiExtraModels(FormNotFoundErrorDto)
  @ApiNotFoundResponse({
    description: 'Not found error.',
    schema: {
      anyOf: [
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
    description: 'This form is owned by other user.',
    type: FormIsOwnedBySomeoneElseErrorDto,
  })
  @UseGuards(new CognitoGuard(true))
  @Get('form/:id')
  async getForm(
    @Param('id') id: string,
    @User() user?: CognitoGetUserData,
    @UserInfo() userInfo?: UserInfoResponse,
  ): Promise<GetFormResponseDto> {
    const data = await this.nasesService.getForm(
      id,
      userInfo?.ico ?? null,
      user?.sub,
    )
    return data
  }

  @ApiOperation({
    summary: 'Get paginated forms',
    description: 'Get paginated forms',
  })
  @ApiResponse({
    status: 200,
    description: 'Return forms',
    type: GetFormsResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Form definition not found',
    type: FormDefinitionNotFoundErrorDto,
  })
  @ApiExtraModels(DatabaseErrorDto)
  @ApiInternalServerErrorResponse({
    description: 'Internal server error, usually database connected.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(DatabaseErrorDto),
        },
      ],
    },
  })
  @UseGuards(CognitoGuard)
  @Get('forms')
  async getForms(
    @User() user: CognitoGetUserData,
    @UserInfo() userInfo: UserInfoResponse,
    @Query() query: GetFormsRequestDto,
  ): Promise<GetFormsResponseDto> {
    const data = await this.nasesService.getForms(
      query,
      user.sub,
      userInfo.ico ?? null,
    )
    return data
  }

  @ApiOperation({
    summary: '',
    description: 'Archive form (hide from user but keep in database)',
  })
  @ApiResponse({
    status: 200,
    description: 'Form successfully deleted',
  })
  @ApiBadRequestResponse({
    description: 'Bad request error.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(FormNotEditableErrorDto),
        },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: 'Form not found.',
    type: FormNotFoundErrorDto,
  })
  @ApiForbiddenResponse({
    description: "This form is some else's",
    type: FormIsOwnedBySomeoneElseErrorDto,
  })
  @UseGuards(new CognitoGuard(true))
  @Delete(':id')
  async deleteForm(
    @Param('id') id: string,
    @User() user?: CognitoGetUserData,
    @UserInfo() userInfo?: UserInfoResponse,
  ): Promise<FormDeleteResponseDto> {
    await this.formsService.archiveForm(
      id,
      user?.sub ?? null,
      userInfo?.ico ?? null,
    )
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
  @ApiResponse({
    status: 200,
    description: 'Create form in db',
    type: GetFormResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Form definition not found',
    type: FormDefinitionNotFoundErrorDto,
  })
  @ApiExtraModels(DatabaseErrorDto)
  @ApiInternalServerErrorResponse({
    description: 'Internal server error, usually database connected.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(DatabaseErrorDto),
        },
      ],
    },
  })
  @UseGuards(new CognitoGuard(true))
  @Post('create-form')
  async createForm(
    @Body() data: CreateFormRequestDto,
    @User() user?: CognitoGetUserData,
    @UserInfo() userInfo?: UserInfoResponse,
  ): Promise<CreateFormResponseDto> {
    const returnData = await this.nasesService.createForm(
      data,
      userInfo?.ico ?? null,
      user,
    )
    return returnData
  }

  @ApiOperation({
    summary: '',
    description: 'Update form',
  })
  @ApiResponse({
    status: 200,
    description:
      'Return charging details - price and used free minutes / hours.',
    type: GetFormResponseDto,
  })
  @ApiExtraModels(DatabaseErrorDto)
  @ApiExtraModels(FormNotFoundErrorDto)
  @ApiExtraModels(FileIdsNotFoundInDbErrorDto)
  @ApiExtraModels(FileDeleteFromMinioWasNotSuccessfulErrorDto)
  @ApiBadRequestResponse({
    description: 'Bad request.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(FileIdsNotFoundInDbErrorDto),
        },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: 'Not found error.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(FormNotFoundErrorDto),
        },
      ],
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error, usually database connected.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(DatabaseErrorDto),
        },
        {
          $ref: getSchemaPath(FileDeleteFromMinioWasNotSuccessfulErrorDto),
        },
      ],
    },
  })
  @UseGuards(new CognitoGuard(true))
  @Post('update-form/:id')
  async updateForm(
    @Body() data: UpdateFormRequestDto,
    @Param('id') id: string,
    @User() user?: CognitoGetUserData,
    @UserInfo() userInfo?: UserInfoResponse,
  ): Promise<Forms> {
    const returnData = await this.nasesService.updateForm(
      id,
      data,
      userInfo?.ico ?? null,
      user,
    )
    return returnData
  }

  @ApiOperation({
    deprecated: true,
    summary: '',
    description:
      'Create id in our backend, which you need to send in form as external id. Save also data necessary for envelope to send message to NASES',
  })
  @ApiResponse({
    status: 200,
    description: 'Create form in db',
    type: GetFormResponseDto,
  })
  @ApiExtraModels(DatabaseErrorDto)
  @ApiExtraModels(FormNotFoundErrorDto)
  @ApiExtraModels(FileIdsNotFoundInDbErrorDto)
  @ApiExtraModels(FileDeleteFromMinioWasNotSuccessfulErrorDto)
  @ApiBadRequestResponse({
    description: 'Bad request.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(FileIdsNotFoundInDbErrorDto),
        },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: 'Not found error.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(FormNotFoundErrorDto),
        },
      ],
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error, usually database connected.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(DatabaseErrorDto),
        },
        {
          $ref: getSchemaPath(FileDeleteFromMinioWasNotSuccessfulErrorDto),
        },
      ],
    },
  })
  @UseGuards(NasesAuthGuard)
  @Post('eid/update-form/:id')
  async updateFormEid(
    @User() user: JwtNasesPayloadDto,
    @Body() data: UpdateFormRequestDto,
    @Param('id') id: string,
  ): Promise<Forms> {
    const returnData = await this.nasesService.updateFormEid(
      id,
      user,
      data,
      null,
    )
    return returnData
  }

  @ApiOperation({
    summary: '',
    description:
      'Check if given form can be sent to Nases (all files are scanned etc.)',
  })
  @ApiResponse({
    status: 200,
    description: '',
    type: CanSendResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Form was not found.',
    type: FormNotFoundErrorDto,
  })
  @ApiForbiddenResponse({
    description: 'It is forbidden to access this form.',
    type: ForbiddenFormSendDto,
  })
  @UseGuards(new CognitoGuard(true))
  @Get('eid/can-send/:id')
  async checkSendConditions(
    @Param('id') id: string,
    @Body() data: EidSendFormRequestDto,
    @User() cognitoUser?: CognitoGetUserData,
  ): Promise<CanSendResponseDto> {
    const jwtTest = this.nasesUtilsService.createUserJwtToken(data.eidToken)
    if ((await this.nasesService.getNasesIdentity(jwtTest)) === null) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
      )
    }

    const user = jwt.decode(data.eidToken, { json: true }) as JwtNasesPayloadDto
    const canSend = await this.nasesService.canSendForm(
      id,
      user,
      cognitoUser?.sub,
    )

    return { canSend, formId: id }
  }

  @ApiOperation({
    summary: '',
    description:
      'This endpoint is used for sending form to NASES. First is form send to rabbitmq, then is controlled if everything is okay and files are scanned and after that is send to NASES',
  })
  @ApiResponse({
    status: 200,
    description: 'Form was successfully send to rabbit, ant then to nases.',
    type: SendFormResponseDto,
  })
  @ApiExtraModels(DatabaseErrorDto)
  @ApiExtraModels(UnableAddFormToRabbitErrorDto)
  @ApiExtraModels(FormNotEditableErrorDto)
  @ApiExtraModels(NoFormXmlDataErrorDto)
  @ApiExtraModels(FormNotFoundErrorDto)
  @ApiExtraModels(FormDefinitionNotFoundErrorDto)
  @ApiExtraModels(FormSummaryGenerationErrorDto)
  @ApiExtraModels(EmptyFormDataErrorDto)
  @ApiExtraModels(FormVersionNotCompatibleErrorDto)
  @ApiNotFoundResponse({
    description: 'Not found error.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(FormNotFoundErrorDto),
        },
        {
          $ref: getSchemaPath(FormDefinitionNotFoundErrorDto),
        },
      ],
    },
  })
  @ApiUnprocessableEntityResponse({
    description: 'Unprocessable entity error.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(UnableAddFormToRabbitErrorDto),
        },
        {
          $ref: getSchemaPath(NoFormXmlDataErrorDto),
        },
        {
          $ref: getSchemaPath(FormNotEditableErrorDto),
        },
        {
          $ref: getSchemaPath(EmptyFormDataErrorDto),
        },
        {
          $ref: getSchemaPath(FormVersionNotCompatibleErrorDto),
        },
      ],
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(DatabaseErrorDto),
        },
        {
          $ref: getSchemaPath(FormSummaryGenerationErrorDto),
        },
      ],
    },
  })
  @ApiNotAcceptableResponse({
    description: 'Provided data is not sendable, usually it is not valid.',
    type: FormDataInvalidErrorDto,
  })
  @UseGuards(new CognitoGuard(true))
  @Post('send-form/:id')
  async sendForm(
    @Param('id') id: string,
    @UserInfo() userInfo?: UserInfoResponse,
    @User() user?: CognitoGetUserData,
  ): Promise<SendFormResponseDto> {
    const data = await this.nasesService.sendForm(id, userInfo, user)
    return data
  }

  @ApiOperation({
    summary: '',
    description:
      'This endpoint is used for sending form to NASES. First is form send to rabbitmq, then is controlled if everything is okay and files are scanned and after that is send to NASES',
  })
  @ApiResponse({
    status: 200,
    description: 'Form was successfully send to rabbit, ant then to nases.',
    type: SendFormResponseDto,
  })
  @ApiExtraModels(DatabaseErrorDto)
  @ApiExtraModels(UnableAddFormToRabbitErrorDto)
  @ApiExtraModels(FormNotFoundErrorDto)
  @ApiExtraModels(FormNotEditableErrorDto)
  @ApiExtraModels(FormDefinitionNotFoundErrorDto)
  @ApiExtraModels(FormSummaryGenerationErrorDto)
  @ApiExtraModels(EmptyFormDataErrorDto)
  @ApiExtraModels(SignatureMissingErrorDto)
  @ApiExtraModels(SignatureFormDefinitionMismatchErrorDto)
  @ApiExtraModels(SignatureFormDataHashMismatchErrorDto)
  @ApiExtraModels(FormVersionNotCompatibleErrorDto)
  @ApiNotFoundResponse({
    description: 'Not found error.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(FormNotFoundErrorDto),
        },
        {
          $ref: getSchemaPath(FormDefinitionNotFoundErrorDto),
        },
      ],
    },
  })
  @ApiUnprocessableEntityResponse({
    description: 'Unprocessable entity error.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(UnableAddFormToRabbitErrorDto),
        },
        {
          $ref: getSchemaPath(NoFormXmlDataErrorDto),
        },
        {
          $ref: getSchemaPath(FormNotEditableErrorDto),
        },
        {
          $ref: getSchemaPath(EmptyFormDataErrorDto),
        },
        {
          $ref: getSchemaPath(SignatureMissingErrorDto),
        },
        {
          $ref: getSchemaPath(SignatureFormDefinitionMismatchErrorDto),
        },
        {
          $ref: getSchemaPath(SignatureFormDataHashMismatchErrorDto),
        },
        {
          $ref: getSchemaPath(FormVersionNotCompatibleErrorDto),
        },
      ],
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(DatabaseErrorDto),
        },
        {
          $ref: getSchemaPath(FormSummaryGenerationErrorDto),
        },
      ],
    },
  })
  @ApiNotAcceptableResponse({
    description: 'Provided data is not sendable, usually it is not valid.',
    type: FormDataInvalidErrorDto,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Got wrong type of form definition for its slug.',
    type: FormDefinitionNotSupportedTypeErrorDto,
  })
  @UseGuards(new CognitoGuard(true))
  @Post('eid/send-form/:id')
  async sendFormEid(
    @Param('id') id: string,
    @Body() body: EidSendFormRequestDto,
    @User() cognitoUser?: CognitoGetUserData,
    @BearerToken() bearerToken?: string,
  ): Promise<SendFormResponseDto> {
    const jwtTest = this.nasesUtilsService.createUserJwtToken(body.eidToken)
    if ((await this.nasesService.getNasesIdentity(jwtTest)) === null) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
      )
    }

    const user = jwt.decode(body.eidToken, { json: true }) as JwtNasesPayloadDto
    const data = await this.nasesService.sendFormEid(
      id,
      body.eidToken,
      user,
      cognitoUser,
      bearerToken,
    )
    return data
  }

  @ApiOperation({
    summary: '',
    description:
      'This endpoint is used for updating from and sending it to NASES. First is form updated then send to rabbitmq, then is controlled if everything is okay and files are scanned and after that is send to NASES',
  })
  @ApiResponse({
    status: 200,
    description: 'Form was successfully send to rabbit, ant then to nases.',
    type: SendFormResponseDto,
  })
  @ApiExtraModels(DatabaseErrorDto)
  @ApiExtraModels(UnableAddFormToRabbitErrorDto)
  @ApiExtraModels(FormNotFoundErrorDto)
  @ApiExtraModels(FormDefinitionNotFoundErrorDto)
  @ApiExtraModels(FormSummaryGenerationErrorDto)
  @ApiExtraModels(EmptyFormDataErrorDto)
  @ApiExtraModels(SignatureMissingErrorDto)
  @ApiExtraModels(SignatureFormDefinitionMismatchErrorDto)
  @ApiExtraModels(SignatureFormDataHashMismatchErrorDto)
  @ApiExtraModels(FormVersionNotCompatibleErrorDto)
  @ApiBadRequestResponse({
    description: 'Bad request error.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(FormNotEditableErrorDto),
        },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: 'Not found error.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(FormNotFoundErrorDto),
        },
        {
          $ref: getSchemaPath(FormDefinitionNotFoundErrorDto),
        },
      ],
    },
  })
  @ApiUnprocessableEntityResponse({
    description: 'Unprocessable entity error.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(UnableAddFormToRabbitErrorDto),
        },
        {
          $ref: getSchemaPath(EmptyFormDataErrorDto),
        },
        {
          $ref: getSchemaPath(FormVersionNotCompatibleErrorDto),
        },
      ],
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(DatabaseErrorDto),
        },
        {
          $ref: getSchemaPath(FormSummaryGenerationErrorDto),
        },
      ],
    },
  })
  @ApiNotAcceptableResponse({
    description: 'Provided data is not sendable, usually it is not valid.',
    type: FormDataInvalidErrorDto,
  })
  @UseGuards(new CognitoGuard(true))
  @Post('send-and-update-form/:id')
  async sendAndUpdateForm(
    @Body() data: UpdateFormRequestDto,
    @Param('id') id: string,
    @User() user?: CognitoGetUserData,
    @UserInfo() userInfo?: UserInfoResponse,
  ): Promise<SendFormResponseDto> {
    await this.nasesService.updateForm(id, data, userInfo?.ico ?? null, user)

    const returnData = await this.nasesService.sendForm(id, userInfo, user)
    return returnData
  }

  @ApiOperation({
    summary: '',
    description:
      'This endpoint is used for updating from and sending it to NASES. First is form updated then send to rabbitmq, then is controlled if everything is okay and files are scanned and after that is send to NASES',
  })
  @ApiResponse({
    status: 200,
    description: 'Form was successfully send to rabbit, ant then to nases.',
    type: SendFormResponseDto,
  })
  @ApiExtraModels(DatabaseErrorDto)
  @ApiExtraModels(UnableAddFormToRabbitErrorDto)
  @ApiExtraModels(FormNotFoundErrorDto)
  @ApiExtraModels(FormNotEditableErrorDto)
  @ApiExtraModels(FormDefinitionNotFoundErrorDto)
  @ApiExtraModels(FormSummaryGenerationErrorDto)
  @ApiExtraModels(EmptyFormDataErrorDto)
  @ApiExtraModels(SignatureMissingErrorDto)
  @ApiExtraModels(SignatureFormDefinitionMismatchErrorDto)
  @ApiExtraModels(SignatureFormDataHashMismatchErrorDto)
  @ApiExtraModels(FormVersionNotCompatibleErrorDto)
  @ApiNotFoundResponse({
    description: 'Not found error.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(FormNotFoundErrorDto),
        },
        {
          $ref: getSchemaPath(FormDefinitionNotFoundErrorDto),
        },
      ],
    },
  })
  @ApiUnprocessableEntityResponse({
    description: 'Unprocessable entity error.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(UnableAddFormToRabbitErrorDto),
        },
        {
          $ref: getSchemaPath(NoFormXmlDataErrorDto),
        },
        {
          $ref: getSchemaPath(FormNotEditableErrorDto),
        },
        {
          $ref: getSchemaPath(EmptyFormDataErrorDto),
        },
        {
          $ref: getSchemaPath(SignatureMissingErrorDto),
        },
        {
          $ref: getSchemaPath(SignatureFormDefinitionMismatchErrorDto),
        },
        {
          $ref: getSchemaPath(SignatureFormDataHashMismatchErrorDto),
        },
        {
          $ref: getSchemaPath(FormVersionNotCompatibleErrorDto),
        },
      ],
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(DatabaseErrorDto),
        },
        {
          $ref: getSchemaPath(FormSummaryGenerationErrorDto),
        },
      ],
    },
  })
  @ApiNotAcceptableResponse({
    description: 'Provided data is not sendable, usually it is not valid.',
    type: FormDataInvalidErrorDto,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Got wrong type of form definition for its slug.',
    type: FormDefinitionNotSupportedTypeErrorDto,
  })
  @UseGuards(new CognitoGuard(true))
  @Post('eid/send-and-update-form/:id')
  async sendAndUpdateFormEid(
    @Body() data: EidUpdateSendFormRequestDto,
    @Param('id') id: string,
    @User() cognitoUser?: CognitoGetUserData,
    @UserInfo() userInfo?: UserInfoResponse,
    @BearerToken() bearerToken?: string,
  ): Promise<SendFormResponseDto> {
    const jwtTest = this.nasesUtilsService.createUserJwtToken(data.eidToken)
    if ((await this.nasesService.getNasesIdentity(jwtTest)) === null) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
      )
    }
    const user = jwt.decode(data.eidToken, { json: true }) as JwtNasesPayloadDto

    if (!(await this.nasesService.canSendForm(id, user, cognitoUser?.sub))) {
      throw this.throwerErrorGuard.ForbiddenException(
        NasesErrorsEnum.FORBIDDEN_SEND,
        NasesErrorsResponseEnum.FORBIDDEN_SEND,
      )
    }

    const updateData = { ...data, eidToken: undefined }

    // TODO temp SEND_TO_NASES_ERROR log, remove
    console.log(
      `Signed data from request for formId ${id} before send:`,
      updateData.formSignature,
    )

    await this.nasesService.updateFormEid(
      id,
      user,
      updateData,
      userInfo?.ico ?? null,
      cognitoUser,
    )

    const returnData = await this.nasesService.sendFormEid(
      id,
      data.eidToken,
      user,
      cognitoUser,
      bearerToken,
    )
    return returnData
  }

  @ApiOperation({
    summary: '',
    description: 'Assign form with no assigned user to the authenticated user',
  })
  @ApiResponse({
    status: 200,
    type: MigrateFormResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'No such form found.',
    type: NotFoundErrorDto,
  })
  @ApiForbiddenResponse({
    description: 'The form is already assigned to someone',
    type: FormAssignedToOtherUserErrorDto,
  })
  @UseGuards(CognitoGuard)
  @Post('migrate-form/:id')
  async migrateForm(
    @User() user: CognitoGetUserData,
    @Param('id') id: string,
    @UserInfo() userInfo: UserInfoResponse,
  ): Promise<MigrateFormResponseDto> {
    await this.nasesService.migrateForm(id, user, userInfo.ico ?? null)
    return {
      formId: id,
      success: true,
    }
  }
}
