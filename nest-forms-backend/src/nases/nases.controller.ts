import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
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

import { CognitoGetUserData } from '../auth/dtos/cognito.dto'
import CognitoGuard from '../auth/guards/cognito.guard'
import NasesAuthGuard from '../auth/guards/nases.guard'
import {
  FileDeleteFromMinioWasNotSuccessfulErrorDto,
  FileIdsNotFoundInDbErrorDto,
} from '../files/files.errors.dto'
import FormDeleteResponseDto from '../forms/dtos/forms.responses.dto'
import {
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
import parseJwt from '../utils/tokens'
import {
  CreateFormEidRequestDto,
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
  ResponseGdprDataDto,
} from './dtos/responses.dto'
import {
  ForbiddenFormSendDto,
  FormAssignedToOtherUserErrorDto,
  FormSummaryGenerationErrorDto,
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
  @ApiResponse({
    status: 404,
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
    status: 403,
    description: 'This form is owned by other user.',
    type: FormIsOwnedBySomeoneElseErrorDto,
  })
  @UseGuards(new CognitoGuard(true))
  @Get('form/:id')
  async getForm(
    @Param('id') id: string,
    @User() user?: CognitoGetUserData,
    @UserInfo() userInfo?: ResponseGdprDataDto,
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
    status: 404,
    description: 'Form definition not found',
    type: FormDefinitionNotFoundErrorDto,
  })
  @ApiExtraModels(DatabaseErrorDto)
  @ApiInternalServerErrorResponse({
    status: 500,
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
    @UserInfo() userInfo: ResponseGdprDataDto,
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
    status: 400,
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
    status: 404,
    description: 'Form not found.',
    type: FormNotFoundErrorDto,
  })
  @ApiForbiddenResponse({
    status: 403,
    description: "This form is some else's",
    type: FormIsOwnedBySomeoneElseErrorDto,
  })
  @UseGuards(new CognitoGuard(true))
  @Delete(':id')
  async deleteForm(
    @Param('id') id: string,
    @User() user?: CognitoGetUserData,
    @UserInfo() userInfo?: ResponseGdprDataDto,
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
    status: 404,
    description: 'Form definition not found',
    type: FormDefinitionNotFoundErrorDto,
  })
  @ApiExtraModels(DatabaseErrorDto)
  @ApiInternalServerErrorResponse({
    status: 500,
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
    @UserInfo() userInfo?: ResponseGdprDataDto,
  ): Promise<CreateFormResponseDto> {
    const returnData = await this.nasesService.createForm(
      data,
      userInfo?.ico ?? null,
      user,
    )
    return returnData
  }

  @ApiOperation({
    deprecated: true,
    description:
      'Create only id in our backend, which you need to send in form as external id. There is only one mandatory parameter - email, rest of body is not mandatory, you can add form name, category version and some tags',
  })
  @ApiResponse({
    status: 200,
    description:
      'Return charging details - price and used free minutes / hours.',
    type: GetFormResponseDto,
  })
  @ApiExtraModels(DatabaseErrorDto)
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal server error, usually database connected.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(DatabaseErrorDto),
        },
      ],
    },
  })
  @UseGuards(NasesAuthGuard)
  @Post('eid/create-form')
  async createFormEid(
    @User() user: JwtNasesPayloadDto,
    @Body() data: CreateFormEidRequestDto,
  ): Promise<Forms> {
    const returnData = await this.nasesService.createFormEid(user, data)
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
  @ApiResponse({
    status: 400,
    description: 'Bad request.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(FileIdsNotFoundInDbErrorDto),
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
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
    status: 500,
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
    @UserInfo() userInfo?: ResponseGdprDataDto,
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
  @ApiResponse({
    status: 400,
    description: 'Bad request.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(FileIdsNotFoundInDbErrorDto),
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
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
    status: 500,
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
    status: 404,
    description: 'Form was not found.',
    type: FormNotFoundErrorDto,
  })
  @ApiForbiddenResponse({
    status: 403,
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
    const jwt = this.nasesUtilsService.createUserJwtToken(data.eidToken)
    if ((await this.nasesService.getNasesIdentity(jwt)) === null) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
      )
    }

    const user = parseJwt<JwtNasesPayloadDto>(data.eidToken)
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
  @ApiResponse({
    status: 404,
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
  @ApiResponse({
    status: 422,
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
      ],
    },
  })
  @ApiInternalServerErrorResponse({
    status: 500,
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
    status: 406,
    description: 'Provided data is not sendable, usually it is not valid.',
    type: FormDataInvalidErrorDto,
  })
  @UseGuards(new CognitoGuard(true))
  @Post('send-form/:id')
  async sendForm(
    @Param('id') id: string,
    @UserInfo() userInfo?: ResponseGdprDataDto,
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
  @ApiResponse({
    status: 404,
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
  @ApiResponse({
    status: 422,
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
      ],
    },
  })
  @ApiInternalServerErrorResponse({
    status: 500,
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
    status: 406,
    description: 'Provided data is not sendable, usually it is not valid.',
    type: FormDataInvalidErrorDto,
  })
  @ApiUnprocessableEntityResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
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

    const user = parseJwt<JwtNasesPayloadDto>(body.eidToken)
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
  @ApiResponse({
    status: 400,
    description: 'Bad request error.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(FormNotEditableErrorDto),
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
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
  @ApiResponse({
    status: 422,
    description: 'Unprocessable entity error.',
    type: UnableAddFormToRabbitErrorDto,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
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
    status: 406,
    description: 'Provided data is not sendable, usually it is not valid.',
    type: FormDataInvalidErrorDto,
  })
  @UseGuards(new CognitoGuard(true))
  @Post('send-and-update-form/:id')
  async sendAndUpdateForm(
    @Body() data: UpdateFormRequestDto,
    @Param('id') id: string,
    @User() user?: CognitoGetUserData,
    @UserInfo() userInfo?: ResponseGdprDataDto,
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
  @ApiResponse({
    status: 404,
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
  @ApiResponse({
    status: 422,
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
      ],
    },
  })
  @ApiInternalServerErrorResponse({
    status: 500,
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
    status: 406,
    description: 'Provided data is not sendable, usually it is not valid.',
    type: FormDataInvalidErrorDto,
  })
  @ApiUnprocessableEntityResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Got wrong type of form definition for its slug.',
    type: FormDefinitionNotSupportedTypeErrorDto,
  })
  @UseGuards(new CognitoGuard(true))
  @Post('eid/send-and-update-form/:id')
  async sendAndUpdateFormEid(
    @Body() data: EidUpdateSendFormRequestDto,
    @Param('id') id: string,
    @User() cognitoUser?: CognitoGetUserData,
    @UserInfo() userInfo?: ResponseGdprDataDto,
    @BearerToken() bearerToken?: string,
  ): Promise<SendFormResponseDto> {
    const jwtTest = this.nasesUtilsService.createUserJwtToken(data.eidToken)
    if ((await this.nasesService.getNasesIdentity(jwtTest)) === null) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
      )
    }
    const user = parseJwt<JwtNasesPayloadDto>(data.eidToken)

    if (!(await this.nasesService.canSendForm(id, user, cognitoUser?.sub))) {
      throw this.throwerErrorGuard.ForbiddenException(
        NasesErrorsEnum.FORBIDDEN_SEND,
        NasesErrorsResponseEnum.FORBIDDEN_SEND,
      )
    }

    const updateData = { ...data, eidToken: undefined }
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
    status: 404,
    description: 'No such form found.',
    type: NotFoundErrorDto,
  })
  @ApiForbiddenResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'The form is already assigned to someone',
    type: FormAssignedToOtherUserErrorDto,
  })
  @UseGuards(CognitoGuard)
  @Post('migrate-form/:id')
  async migrateForm(
    @User() user: CognitoGetUserData,
    @Param('id') id: string,
    @UserInfo() userInfo: ResponseGdprDataDto,
  ): Promise<MigrateFormResponseDto> {
    await this.nasesService.migrateForm(id, user, userInfo.ico ?? null)
    return {
      formId: id,
      success: true,
    }
  }
}
