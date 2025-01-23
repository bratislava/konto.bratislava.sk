import { Injectable } from '@nestjs/common'
import { FormError, FormOwnerType, Forms, FormState } from '@prisma/client'
import axios, { AxiosResponse } from 'axios'
import {
  FormDefinition,
  isSlovenskoSkFormDefinition,
} from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { hashFormData } from 'forms-shared/signer/hashFormData'
import {
  verifyFormSignature,
  VerifyFormSignatureError,
} from 'forms-shared/signer/signature'
import { FormSummary, getFormSummary } from 'forms-shared/summary/summary'
import { FormFilesReadyResultDto } from 'src/files/files.dto'

import { CognitoGetUserData } from '../auth/dtos/cognito.dto'
import verifyUserByEidToken from '../common/utils/city-account'
import FilesService from '../files/files.service'
import FormValidatorRegistryService from '../form-validator-registry/form-validator-registry.service'
import { FormUpdateBodyDto } from '../forms/dtos/forms.requests.dto'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../forms/forms.errors.enum'
import FormsHelper from '../forms/forms.helper'
import FormsService from '../forms/forms.service'
import { RabbitPayloadDto } from '../nases-consumer/nases-consumer.dto'
import NasesConsumerService from '../nases-consumer/nases-consumer.service'
import PrismaService from '../prisma/prisma.service'
import RabbitmqClientService from '../rabbitmq-client/rabbitmq-client.service'
import { Tier } from '../utils/global-enums/city-account.enum'
import { ErrorsEnum } from '../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import {
  getFrontendFormTitleFromForm,
  getSubjectTextFromForm,
} from '../utils/handlers/text.handler'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import {
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
import { verifyFormSignatureErrorMapping } from './nases.errors.dto'
import { NasesErrorsEnum, NasesErrorsResponseEnum } from './nases.errors.enum'
import NasesUtilsService from './utils-services/tokens.nases.service'

@Injectable()
export default class NasesService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly formsService: FormsService,
    private readonly filesService: FilesService,
    private readonly formsHelper: FormsHelper,
    private readonly nasesConsumerService: NasesConsumerService,
    private readonly rabbitmqClientService: RabbitmqClientService,
    private throwerErrorGuard: ThrowerErrorGuard,
    private readonly nasesUtilsService: NasesUtilsService,
    private readonly prisma: PrismaService,
    private readonly formValidatorRegistryService: FormValidatorRegistryService,
  ) {
    this.logger = new LineLoggerSubservice('NasesService')
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

  async createForm(
    requestData: CreateFormRequestDto,
    ico: string | null,
    user?: CognitoGetUserData,
  ): Promise<CreateFormResponseDto> {
    const formDefinition = getFormDefinitionBySlug(
      requestData.formDefinitionSlug,
    )
    if (!formDefinition) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${requestData.formDefinitionSlug}`,
      )
    }

    const data = {
      userExternalId: user ? user.sub : null,
      formDefinitionSlug: requestData.formDefinitionSlug,
      jsonVersion: formDefinition.jsonVersion,
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

    // TEMPORARY FOR REQUESTS RUNNING DURING MIGRATION
    if (data.formDataBase64 && data.formDataJson && !data.formSignature) {
      this.logger.log(`Updating form ${id} with formSignature during migration`)
      data.formSignature = {
        signatureBase64: data.formDataBase64,
        pospID: 'esmao.eforms.bratislava.obec_024',
        pospVersion: '201501.2',
        jsonVersion: '1.0',
        formDataHash: hashFormData(data.formDataJson),
      }
    }
    const result = await this.formsService.updateForm(id, data)
    return result
  }

  private getFormSummaryOrThrow(
    form: Forms,
    formDefinition: FormDefinition,
  ): FormSummary {
    if (form.formDataJson == null) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormsErrorsEnum.EMPTY_FORM_DATA,
        FormsErrorsResponseEnum.EMPTY_FORM_DATA,
      )
    }

    try {
      return getFormSummary(
        formDefinition,
        form.formDataJson,
        this.formValidatorRegistryService.getRegistry(),
      )
    } catch (error) {
      this.logger.error(
        `Error while generating form summary for form definition ${formDefinition.slug}, formId: ${form.id}, error: ${error}`,
      )
      throw this.throwerErrorGuard.InternalServerErrorException(
        NasesErrorsEnum.FORM_SUMMARY_GENERATION_ERROR,
        NasesErrorsResponseEnum.FORM_SUMMARY_GENERATION_ERROR,
      )
    }
  }

  async sendForm(
    id: string,
    userInfo?: ResponseGdprDataDto,
    user?: CognitoGetUserData,
  ): Promise<SendFormResponseDto> {
    const form = await this.formsService.checkFormBeforeSending(id)
    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (!formDefinition) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
      )
    }

    if (
      !formDefinition.allowSendingUnauthenticatedUsers &&
      !this.isUserVerified(user)
    ) {
      throw this.throwerErrorGuard.ForbiddenException(
        NasesErrorsEnum.SEND_UNVERIFIED,
        NasesErrorsResponseEnum.SEND_UNVERIFIED,
      )
    }

    if (
      !this.formsHelper.userCanSendForm(
        form,
        formDefinition.allowSendingUnauthenticatedUsers ?? false,
        userInfo,
        user?.sub,
      )
    ) {
      throw this.throwerErrorGuard.ForbiddenException(
        NasesErrorsEnum.FORBIDDEN_SEND,
        NasesErrorsResponseEnum.FORBIDDEN_SEND,
      )
    }

    const validator = this.formValidatorRegistryService
      .getRegistry()
      .getValidator(formDefinition.schema)
    const validationResult = validator.validateFormData(
      form.formDataJson,
      formDefinition.schema,
    )
    if (validationResult.errors.length > 0) {
      this.logger.error(
        `Data for form with id ${id} is invalid: ${JSON.stringify(
          validationResult.errors,
        )}`,
      )

      throw this.throwerErrorGuard.NotAcceptableException(
        FormsErrorsEnum.FORM_DATA_INVALID,
        FormsErrorsResponseEnum.FORM_DATA_INVALID,
      )
    }

    this.checkAttachments(await this.filesService.areFormAttachmentsReady(id))

    const formSummary = this.getFormSummaryOrThrow(form, formDefinition)

    this.logger.log(`Sending form ${form.id} to rabbitmq`)
    try {
      await this.rabbitmqClientService.publishDelay(
        {
          formId: form.id,
          tries: 0,
          userData: {
            email: user?.email || null,
            firstName: user?.given_name || null,
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
      formSummary,
      // TODO: Until proper versioning is implemented we only sync jsonVersion from formDefinition on successful send
      jsonVersion: formDefinition.jsonVersion,
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

    if (form.formDataJson == null) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormsErrorsEnum.EMPTY_FORM_DATA,
        FormsErrorsResponseEnum.EMPTY_FORM_DATA,
      )
    }

    if (formDefinition.isSigned) {
      if (!form.formSignature) {
        throw this.throwerErrorGuard.UnprocessableEntityException(
          NasesErrorsEnum.SIGNATURE_MISSING,
          NasesErrorsResponseEnum.SIGNATURE_MISSING,
        )
      }

      try {
        verifyFormSignature(
          formDefinition,
          form.formDataJson,
          form.formSignature,
        )
      } catch (error) {
        if (error instanceof VerifyFormSignatureError) {
          const { error: errorEnum, message: errorMessage } =
            verifyFormSignatureErrorMapping[error.type]
          throw this.throwerErrorGuard.UnprocessableEntityException(
            // eslint-disable-next-line custom-rules/thrower-error-guard-enum
            errorEnum,
            errorMessage,
          )
        } else {
          throw error
        }
      }
    }

    const validator = this.formValidatorRegistryService
      .getRegistry()
      .getValidator(formDefinition.schema)
    const validationResult = validator.validateFormData(
      form.formDataJson,
      formDefinition.schema,
    )
    if (validationResult.errors.length > 0) {
      this.logger.error(
        `Data for form with id ${id} is invalid: ${JSON.stringify(
          validationResult.errors,
        )}`,
      )

      throw this.throwerErrorGuard.NotAcceptableException(
        FormsErrorsEnum.FORM_DATA_INVALID,
        FormsErrorsResponseEnum.FORM_DATA_INVALID,
      )
    }

    const formSummary = this.getFormSummaryOrThrow(form, formDefinition)

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

    this.checkAttachments(await this.filesService.areFormAttachmentsReady(id))

    // Send to nases
    const isSent = await this.nasesConsumerService.sendToNasesAndUpdateState(
      jwt,
      form,
      data,
      formDefinition,
      user.sub,
      {
        formSummary,
        // TODO: Until proper versioning is implemented we only sync jsonVersion from formDefinition on successful send
        jsonVersion: formDefinition.jsonVersion,
      },
    )

    if (!isSent) {
      // TODO: It would be better to rewrite how sendToNasesAndUpdateState works or use a different function
      await this.formsService.updateForm(data.formId, {
        state: FormState.DRAFT,
        error: FormError.NASES_SEND_ERROR,
      })

      // TODO temp SEND_TO_NASES_ERROR log, remove
      console.log(
        `SEND_TO_NASES_ERROR: ${NasesErrorsResponseEnum.SEND_TO_NASES_ERROR} additional info - formId: ${form.id}, formSignature from db: ${JSON.stringify(
          form.formSignature,
          null,
          2,
        )}`,
      )

      throw this.throwerErrorGuard.InternalServerErrorException(
        NasesErrorsEnum.SEND_TO_NASES_ERROR,
        NasesErrorsResponseEnum.SEND_TO_NASES_ERROR,
      )
    }

    if (!this.isUserVerified(cognitoUser)) {
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

  private isUserVerified(user?: CognitoGetUserData): boolean {
    if (!user) return false
    return (
      user['custom:tier'] === Tier.IDENTITY_CARD ||
      user['custom:tier'] === Tier.EID
    )
  }

  private checkAttachments(
    formAttachmentsReady: FormFilesReadyResultDto,
  ): void {
    if (formAttachmentsReady.filesReady) {
      return
    }

    if (formAttachmentsReady.error === FormError.INFECTED_FILES) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        NasesErrorsEnum.INFECTED_FILE,
        NasesErrorsResponseEnum.INFECTED_FILE,
      )
    }

    throw this.throwerErrorGuard.BadRequestException(
      NasesErrorsEnum.FILE_NOT_SCANNED,
      NasesErrorsResponseEnum.FILE_NOT_SCANNED,
    )
  }
}
