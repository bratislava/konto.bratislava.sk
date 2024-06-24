import {
  getFormDefinitionBySlug,
  isSlovenskoSkFormDefinition,
} from '@forms-shared/definitions/form-definitions-helpers'
import { Injectable, Logger } from '@nestjs/common'
import { FormOwnerType, Forms, FormState } from '@prisma/client'
import axios, { AxiosResponse } from 'axios'

import { CognitoGetUserData } from '../auth/dtos/cognito.dto'
import verifyUserByEidToken from '../common/utils/city-account'
import { isUserVerified } from '../common/utils/helpers'
import FilesService from '../files/files.service'
import { FormUpdateBodyDto } from '../forms/dtos/forms.requests.dto'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../forms/forms.errors.enum'
import FormsHelper from '../forms/forms.helper'
import FormsService from '../forms/forms.service'
import FormsValidator from '../forms/forms.validator'
import { RabbitPayloadDto } from '../nases-consumer/nases-consumer.dto'
import NasesConsumerService from '../nases-consumer/nases-consumer.service'
import PrismaService from '../prisma/prisma.service'
import RabbitmqClientService from '../rabbitmq-client/rabbitmq-client.service'
import { ErrorsEnum } from '../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import {
  getFrontendFormTitleFromForm,
  getSubjectTextFromForm,
} from '../utils/handlers/text.handler'
import {
  CreateFormEidRequestDto,
  CreateFormRequestDto,
  GetFormResponseDto,
  GetFormsRequestDto,
  GetFormsResponseDto,
  JwtNasesPayloadDto,
  SendFormResponseDto,
  UpdateFormRequestDto,
} from './dtos/requests.dto'
import {
  CreateFormResponseDto,
  ResponseGdprDataDto,
} from './dtos/responses.dto'
import { NasesErrorsEnum, NasesErrorsResponseEnum } from './nases.errors.enum'
import NasesUtilsService from './utils-services/tokens.nases.service'

@Injectable()
export default class NasesService {
  private readonly logger: Logger

  constructor(
    private readonly formsService: FormsService,
    private readonly formsValidator: FormsValidator,
    private readonly filesService: FilesService,
    private readonly formsHelper: FormsHelper,
    private readonly nasesConsumerService: NasesConsumerService,
    private readonly rabbitmqClientService: RabbitmqClientService,
    private throwerErrorGuard: ThrowerErrorGuard,
    private readonly nasesUtilsService: NasesUtilsService,
    private readonly prisma: PrismaService,
  ) {
    this.logger = new Logger('NasesService')
  }

  async getNasesIdentity(token: string): Promise<JwtNasesPayloadDto | null> {
    const result = await axios
      .get(
        `${process.env.SLOVENSKO_SK_CONTAINER_URI ?? ''}/api/upvs/identity`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then((response: AxiosResponse<JwtNasesPayloadDto>) => response.data)
      .catch((error) => {
        console.error(
          this.throwerErrorGuard.InternalServerErrorException(
            ErrorsEnum.INTERNAL_SERVER_ERROR,
            'Failed to get nases identity, verify if this is because of invalid token or a server issue',
          ),
        )
        console.error(error)
        return null
      })
    return result
  }

  async createFormEid(
    nasesUser: JwtNasesPayloadDto,
    requestData: CreateFormEidRequestDto,
  ): Promise<Forms> {
    const data = {
      mainUri: nasesUser.sub,
      actorUri: nasesUser.actor.sub,
      ...requestData,
    }
    return this.formsService.createForm(data)
  }

  async createForm(
    requestData: CreateFormRequestDto,
    ico: string | null,
    user?: CognitoGetUserData,
  ): Promise<CreateFormResponseDto> {
    const data = {
      userExternalId: user ? user.sub : null,
      ...requestData,
      ico,
      ownerType:
        user?.['custom:account_type'] === 'po' ||
        user?.['custom:account_type'] === 'fo-p'
          ? FormOwnerType.PO
          : user?.['custom:account_type']
            ? FormOwnerType.FO
            : undefined,
    }
    const result = await this.formsService.createForm(data)
    const formDefinition = getFormDefinitionBySlug(result.formDefinitionSlug)
    if (!formDefinition) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${result.formDefinitionSlug}`,
      )
    }

    const messageSubject = getSubjectTextFromForm(result, formDefinition)
    const frontendTitle =
      getFrontendFormTitleFromForm(result, formDefinition) || messageSubject
    return {
      ...result,
      messageSubject,
      frontendTitle,
    }
  }

  async migrateForm(
    id: string,
    user: CognitoGetUserData,
    ico: string | null,
  ): Promise<void> {
    const form = await this.prisma.forms.findFirst({
      where: {
        id,
        archived: false,
      },
    })
    if (form === null) {
      throw this.throwerErrorGuard.NotFoundException(
        ErrorsEnum.NOT_FOUND_ERROR,
        `There is no such form with id ${id}`,
      )
    }

    if (form.userExternalId || form.mainUri || form.actorUri) {
      throw this.throwerErrorGuard.ForbiddenException(
        NasesErrorsEnum.FORM_ASSIGNED_TO_OTHER_USER,
        'This form is already assigned to another user',
      )
    }

    await this.prisma.forms.update({
      where: {
        id,
      },
      data: {
        userExternalId: user.sub,
        ico,
        ownerType:
          user?.['custom:account_type'] === 'po' ||
          user?.['custom:account_type'] === 'fo-p'
            ? FormOwnerType.PO
            : user?.['custom:account_type']
              ? FormOwnerType.FO
              : undefined,
      },
    })
  }

  async getForm(
    id: string,
    ico: string | null,
    userExternalId?: string,
  ): Promise<GetFormResponseDto> {
    const form = await this.formsService.getForm(id, ico, userExternalId)
    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (!formDefinition) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
      )
    }

    const messageSubject = getSubjectTextFromForm(form, formDefinition)
    const frontendTitle =
      getFrontendFormTitleFromForm(form, formDefinition) || messageSubject
    return {
      ...form,
      messageSubject,
      frontendTitle,
      formDefinitionSlug: formDefinition.slug,
    }
  }

  async getForms(
    query: GetFormsRequestDto,
    userExternalId: string,
    ico: string | null,
  ): Promise<GetFormsResponseDto> {
    const result = await this.formsService.getForms(query, userExternalId, ico)
    return result
  }

  async updateFormEid(
    id: string,
    nasesUser: JwtNasesPayloadDto,
    requestData: UpdateFormRequestDto,
    ico: string | null,
    user?: CognitoGetUserData,
  ): Promise<Forms> {
    const data: FormUpdateBodyDto = {
      mainUri: nasesUser.sub,
      actorUri: nasesUser.actor.sub,
      ...requestData,
    }
    const result = await this.updateForm(id, data, ico, user)
    return result
  }

  async updateForm(
    id: string,
    requestData: UpdateFormRequestDto,
    ico: string | null,
    user?: CognitoGetUserData,
  ): Promise<Forms> {
    const form = await this.prisma.forms.findFirst({
      where: {
        id,
        archived: false,
      },
    })

    if (form === null) {
      throw this.throwerErrorGuard.NotFoundException(
        ErrorsEnum.NOT_FOUND_ERROR,
        `Form with id ${id} not found.`,
      )
    }

    if (
      !this.formsHelper.isFormAccessGranted(form, user ? user.sub : null, ico)
    ) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        'Unauthorized',
      )
    }

    const data = {
      userExternalId: user ? user.sub : null,
      email: user?.email,
      ...requestData,
      ownerType:
        user?.['custom:account_type'] === 'po' ||
        user?.['custom:account_type'] === 'fo-p'
          ? FormOwnerType.PO
          : user?.['custom:account_type']
            ? FormOwnerType.FO
            : undefined,
      ico,
    }
    const result = await this.formsService.updateForm(id, data)
    return result
  }

  async sendForm(
    id: string,
    userInfo: ResponseGdprDataDto,
    user: CognitoGetUserData,
  ): Promise<SendFormResponseDto> {
    const form = await this.formsService.checkFormBeforeSending(id)
    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (!formDefinition) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
      )
    }

    if (!isUserVerified(user)) {
      throw this.throwerErrorGuard.ForbiddenException(
        NasesErrorsEnum.SEND_UNVERIFIED,
        NasesErrorsResponseEnum.SEND_UNVERIFIED,
      )
    }

    if (!this.formsHelper.userCanSendForm(form, userInfo, user.sub)) {
      throw this.throwerErrorGuard.ForbiddenException(
        NasesErrorsEnum.FORBIDDEN_SEND,
        NasesErrorsResponseEnum.FORBIDDEN_SEND,
      )
    }
    if (
      !this.formsValidator.validateFormData(
        formDefinition.schemas.schema,
        form.formDataJson,
        id,
      )
    ) {
      throw this.throwerErrorGuard.NotAcceptableException(
        FormsErrorsEnum.FORM_DATA_INVALID,
        FormsErrorsResponseEnum.FORM_DATA_INVALID,
      )
    }

    this.logger.log(`Sending form ${form.id} to rabbitmq`)
    try {
      await this.rabbitmqClientService.publishDelay(
        {
          formId: form.id,
          tries: 0,
          userData: {
            email: user.email || null,
            firstName: user.given_name || null,
          },
        },
        10_000,
      )
    } catch (error) {
      throw this.throwerErrorGuard.NotFoundException(
        NasesErrorsEnum.UNABLE_ADD_FORM_TO_RABBIT,
        `${NasesErrorsEnum.UNABLE_ADD_FORM_TO_RABBIT} Received form id: ${
          form.id
        } Error: ${error as string}`,
      )
    }

    // set state of form to QUEUED
    await this.formsService.updateForm(form.id, {
      state: FormState.QUEUED,
    })
    return {
      id: form.id,
      message: 'Form was successfully queued to rabbitmq.',
      state: FormState.QUEUED,
    }
  }

  async sendFormEid(
    id: string,
    oboToken: string,
    user: JwtNasesPayloadDto,
    cognitoUser?: CognitoGetUserData,
    bearerToken?: string,
  ): Promise<SendFormResponseDto> {
    const form = await this.formsService.checkFormBeforeSending(id)
    const jwt = this.nasesUtilsService.createUserJwtToken(oboToken)

    if (
      !this.formsHelper.userCanSendFormEid(
        form,
        user.sub,
        user.actor.sub,
        cognitoUser?.sub,
      )
    ) {
      throw this.throwerErrorGuard.ForbiddenException(
        NasesErrorsEnum.FORBIDDEN_SEND,
        NasesErrorsResponseEnum.FORBIDDEN_SEND,
      )
    }

    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (!formDefinition) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
      )
    }

    if (!isSlovenskoSkFormDefinition(formDefinition)) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE,
        `sendFormEid: ${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE}: ${formDefinition.type}, form id: ${form.id}`,
      )
    }

    // TODO - rethink/address, skipping formData validation for is signed as in this step, the form data can be different from what we are sending anyway
    if (
      !formDefinition.isSigned &&
      !this.formsValidator.validateFormData(
        formDefinition.schemas.schema,
        form.formDataJson,
        id,
      )
    ) {
      throw this.throwerErrorGuard.NotAcceptableException(
        FormsErrorsEnum.FORM_DATA_INVALID,
        FormsErrorsResponseEnum.FORM_DATA_INVALID,
      )
    }

    await this.formsService.updateForm(id, {
      mainUri: form.mainUri ?? user.sub,
      actorUri: form.actorUri ?? user.actor.sub,
    })

    const data: RabbitPayloadDto = {
      formId: id,
      tries: 0,
      userData: {
        email: null,
        firstName: null,
      },
    }

    // Check send conditions
    const formAttachmentsReady =
      await this.filesService.areFormAttachmentsReady(id)
    if (!formAttachmentsReady.filesReady) {
      throw this.throwerErrorGuard.ForbiddenException(
        NasesErrorsEnum.UNABLE_TO_SEND,
        NasesErrorsResponseEnum.UNABLE_TO_SEND,
      )
    }

    // Send to nases
    await this.nasesConsumerService.sendToNasesAndUpdateState(
      jwt,
      form,
      data,
      formDefinition,
      user.sub,
    )

    if (!isUserVerified(cognitoUser)) {
      await verifyUserByEidToken(oboToken, this.logger, bearerToken)
    }

    return {
      id: form.id,
      message: 'Form was successfully sent to nases.',
      state: FormState.DELIVERED_NASES,
    }
  }

  async canSendForm(
    formId: string,
    user: JwtNasesPayloadDto,
    userExternalId?: string,
  ): Promise<boolean> {
    const form = await this.formsService.checkFormBeforeSending(formId)
    if (
      !this.formsHelper.userCanSendFormEid(
        form,
        user.sub,
        user.actor.sub,
        userExternalId,
      )
    ) {
      throw this.throwerErrorGuard.ForbiddenException(
        NasesErrorsEnum.FORBIDDEN_SEND,
        NasesErrorsResponseEnum.FORBIDDEN_SEND,
      )
    }

    const formAttachmentsReady =
      await this.filesService.areFormAttachmentsReady(formId)
    return formAttachmentsReady.filesReady
  }
}
