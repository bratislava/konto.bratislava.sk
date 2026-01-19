import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FormError, Forms, FormState } from '@prisma/client'
import {
  FormDefinition,
  isSlovenskoSkFormDefinition,
  isSlovenskoSkGenericFormDefinition,
} from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { extractFormSubjectPlain } from 'forms-shared/form-utils/formDataExtractors'
import { evaluateFormSendPolicy } from 'forms-shared/send-policy/sendPolicy'
import {
  verifyFormSignature,
  VerifyFormSignatureError,
} from 'forms-shared/signer/signature'
import { FormSummary, getFormSummary } from 'forms-shared/summary/summary'
import {
  versionCompareBumpDuringSend,
  versionCompareCanSendForm,
} from 'forms-shared/versioning/version-compare'
import {
  UpvsCorporateBody,
  UpvsNaturalPerson,
} from 'openapi-clients/slovensko-sk'

import { AuthUser, isAuthUser, User } from '../auth-v2/types/user'
import ClientsService from '../clients/clients.service'
import ConvertPdfService from '../convert-pdf/convert-pdf.service'
import { FormFilesReadyResultDto } from '../files/files.dto'
import FilesService from '../files/files.service'
import FormValidatorRegistryService from '../form-validator-registry/form-validator-registry.service'
import { FormUpdateBodyDto } from '../forms/dtos/forms.requests.dto'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../forms/forms.errors.enum'
import FormsService from '../forms/forms.service'
import { getUserFormFields } from '../forms-v2/utils/get-user-form-fields'
import { RabbitPayloadDto } from '../nases-consumer/nases-consumer.dto'
import PrismaService from '../prisma/prisma.service'
import RabbitmqClientService from '../rabbitmq-client/rabbitmq-client.service'
import { ErrorsEnum } from '../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import {
  GetFormResponseDto,
  GetFormsRequestDto,
  GetFormsResponseDto,
  JwtNasesPayloadDto,
  SendFormResponseDto,
  UpdateFormRequestDto,
} from './dtos/requests.dto'
import { verifyFormSignatureErrorMapping } from './nases.errors.dto'
import { NasesErrorsEnum, NasesErrorsResponseEnum } from './nases.errors.enum'
import {
  SendMessageNasesSender,
  SendMessageNasesSenderType,
} from './types/send-message-nases-sender.type'
import NasesUtilsService from './utils-services/tokens.nases.service'
import userToSendPolicyAccountType from './utils-services/user-to-send-policy-account-type'

@Injectable()
export default class NasesService {
  private readonly logger: LineLoggerSubservice

  private readonly versioningEnabled: boolean

  constructor(
    private readonly formsService: FormsService,
    private readonly filesService: FilesService,
    private readonly rabbitmqClientService: RabbitmqClientService,
    private throwerErrorGuard: ThrowerErrorGuard,
    private readonly nasesUtilsService: NasesUtilsService,
    private readonly prisma: PrismaService,
    private readonly formValidatorRegistryService: FormValidatorRegistryService,
    private readonly configService: ConfigService,
    private readonly clientsService: ClientsService,
    private readonly convertPdfService: ConvertPdfService,
  ) {
    this.logger = new LineLoggerSubservice('NasesService')
    this.versioningEnabled =
      this.configService.getOrThrow<string>('FEATURE_TOGGLE_VERSIONING') ===
      'true'
  }

  async getUpvsIdentity(
    token: string,
  ): Promise<UpvsNaturalPerson | UpvsCorporateBody | null> {
    // there is a bug in the container and function `apiUpvsIdentityGet` below, according to 'openapi-clients/slovensko-sk' types
    // returns information about UpvsNaturalPerson,
    // in reality it returns information about UpvsCorporateBody as well
    // after https://github.com/slovensko-digital/slovensko-sk-api/pull/115 is merged, typing can be erased
    const result = await this.clientsService.slovenskoSkApi
      .apiUpvsIdentityGet({
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => response.data)
      .catch((error) => {
        this.logger.error(
          this.throwerErrorGuard.InternalServerErrorException(
            ErrorsEnum.INTERNAL_SERVER_ERROR,
            'Failed to get nases identity, verify if this is because of invalid token or a server issue',
            undefined,
            error,
          ),
        )
        return null
      })
    return result
  }

  async getForm(
    id: string,
  ): Promise<Omit<GetFormResponseDto, 'requiresMigration'>> {
    const form = await this.formsService.getForm(id)
    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (!formDefinition) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
      )
    }

    return {
      ...form,
      formSubject: extractFormSubjectPlain(formDefinition, form.formDataJson),
    }
  }

  async getForms(
    query: GetFormsRequestDto,
    user: AuthUser,
  ): Promise<GetFormsResponseDto> {
    const result = await this.formsService.getForms(query, user)
    return result
  }

  async updateFormEid(
    id: string,
    nasesUser: JwtNasesPayloadDto,
    requestData: UpdateFormRequestDto,
    user: User,
  ): Promise<Forms> {
    const data: FormUpdateBodyDto = {
      mainUri: nasesUser.sub,
      actorUri: nasesUser.actor.sub,
      ...requestData,
    }
    const result = await this.updateForm(id, data, user)
    return result
  }

  async updateForm(
    id: string,
    requestData: UpdateFormRequestDto,
    user: User,
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

    const data = {
      ...getUserFormFields(user),
      ...requestData,
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
      return getFormSummary({
        formDefinition,
        formDataJson: form.formDataJson,
        validatorRegistry: this.formValidatorRegistryService.getRegistry(),
      })
    } catch (error) {
      this.logger.error(
        `Error while generating form summary for form definition ${formDefinition.slug}, formId: ${form.id}`,
        error,
      )
      throw this.throwerErrorGuard.InternalServerErrorException(
        NasesErrorsEnum.FORM_SUMMARY_GENERATION_ERROR,
        NasesErrorsResponseEnum.FORM_SUMMARY_GENERATION_ERROR,
        undefined,
        error,
      )
    }
  }

  async sendForm(formId: string, user: User): Promise<SendFormResponseDto> {
    const form = await this.formsService.checkFormBeforeSending(formId)
    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (!formDefinition) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
      )
    }

    const evaluatedSendPolicy = evaluateFormSendPolicy(
      formDefinition.sendPolicy,
      userToSendPolicyAccountType(user),
    )

    if (!evaluatedSendPolicy.sendPossible) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        NasesErrorsEnum.SEND_POLICY_NOT_POSSIBLE,
        NasesErrorsResponseEnum.SEND_POLICY_NOT_POSSIBLE,
      )
    }

    if (!evaluatedSendPolicy.sendAllowedForUser) {
      throw this.throwerErrorGuard.ForbiddenException(
        NasesErrorsEnum.SEND_POLICY_NOT_ALLOWED_FOR_USER,
        NasesErrorsResponseEnum.SEND_POLICY_NOT_ALLOWED_FOR_USER,
      )
    }

    if (
      this.versioningEnabled &&
      !versionCompareCanSendForm({
        currentVersion: form.jsonVersion,
        latestVersion: formDefinition.jsonVersion,
      })
    ) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        NasesErrorsEnum.FORM_VERSION_NOT_COMPATIBLE,
        NasesErrorsResponseEnum.FORM_VERSION_NOT_COMPATIBLE,
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
        `Data for form with id ${formId} is invalid: ${JSON.stringify(
          validationResult.errors,
        )}`,
      )

      throw this.throwerErrorGuard.NotAcceptableException(
        FormsErrorsEnum.FORM_DATA_INVALID,
        FormsErrorsResponseEnum.FORM_DATA_INVALID,
      )
    }

    this.checkAttachments(
      await this.filesService.areFormAttachmentsReady(formId),
    )

    const formSummary = this.getFormSummaryOrThrow(form, formDefinition)

    this.logger.log(`Sending form ${form.id} to rabbitmq`)
    try {
      await this.rabbitmqClientService.publishDelay(
        {
          formId: form.id,
          tries: 0,
          userData: {
            email: isAuthUser(user) ? user.cityAccountUser.email : null,
            firstName: isAuthUser(user)
              ? (user.cognitoUser.userAttributes.given_name ?? null)
              : null,
          },
        },
        10_000,
      )
    } catch (error) {
      throw this.throwerErrorGuard.NotFoundException(
        NasesErrorsEnum.UNABLE_ADD_FORM_TO_RABBIT,
        `${NasesErrorsEnum.UNABLE_ADD_FORM_TO_RABBIT} Received form id: ${
          form.id
        }`,
        undefined,
        error,
      )
    }

    const shouldBumpJsonVersion =
      !this.versioningEnabled ||
      versionCompareBumpDuringSend({
        currentVersion: form.jsonVersion,
        latestVersion: formDefinition.jsonVersion,
      })

    // set state of form to QUEUED
    await this.formsService.updateForm(form.id, {
      state: FormState.QUEUED,
      formSummary,
      ...(shouldBumpJsonVersion
        ? { jsonVersion: formDefinition.jsonVersion }
        : undefined),
    })
    return {
      id: form.id,
      message: 'Form was successfully queued to rabbitmq.',
      state: FormState.QUEUED,
    }
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  async sendFormEid(
    id: string,
    oboToken: string,
    nasesUser: JwtNasesPayloadDto,
    user: User,
  ): Promise<SendFormResponseDto> {
    const form = await this.formsService.checkFormBeforeSending(id)
    const jwt = this.nasesUtilsService.createUserJwtToken(oboToken)

    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (!formDefinition) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
      )
    }

    const evaluatedSendPolicy = evaluateFormSendPolicy(
      formDefinition.sendPolicy,
      userToSendPolicyAccountType(user),
    )

    if (!evaluatedSendPolicy.eidSendPossible) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        NasesErrorsEnum.SEND_POLICY_NOT_POSSIBLE,
        NasesErrorsResponseEnum.SEND_POLICY_NOT_POSSIBLE,
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

    if (
      this.versioningEnabled &&
      !versionCompareCanSendForm({
        currentVersion: form.jsonVersion,
        latestVersion: formDefinition.jsonVersion,
      })
    ) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        NasesErrorsEnum.FORM_VERSION_NOT_COMPATIBLE,
        NasesErrorsResponseEnum.FORM_VERSION_NOT_COMPATIBLE,
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

    const formSummary = this.getFormSummaryOrThrow(form, formDefinition)

    await this.formsService.updateForm(id, {
      mainUri: nasesUser.sub,
      actorUri: nasesUser.actor.sub,
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

    const shouldBumpJsonVersion =
      !this.versioningEnabled ||
      versionCompareBumpDuringSend({
        currentVersion: form.jsonVersion,
        latestVersion: formDefinition.jsonVersion,
      })

    // TODO rework! this is super fragile and QUEUED state was not originally meant for this
    // just before sending to nases, update form state to QUEUED
    // if the operation takes long, this prevents repeated sending
    // sendToNasesAndUpdateState must never throw, and if it does not succeed we update the state back to DRAFT & set NASES_SEND_ERROR
    await this.formsService.updateForm(id, {
      state: FormState.QUEUED,
      formSummary,
      ...(shouldBumpJsonVersion
        ? { jsonVersion: formDefinition.jsonVersion }
        : undefined),
    })

    try {
      // create a pdf image of the form, upload it to minio and at it among form files
      await this.convertPdfService.createPdfImageInFormFiles(
        data.formId,
        formDefinition,
      )
    } catch (error) {
      await this.formsService.updateForm(id, {
        state: FormState.DRAFT,
        error: FormError.NASES_SEND_ERROR,
      })

      throw this.throwerErrorGuard.InternalServerErrorException(
        NasesErrorsEnum.CREATE_PDF_IMAGE_ERROR,
        `${NasesErrorsResponseEnum.CREATE_PDF_IMAGE_ERROR} Received form id: ${data.formId}.`,
        undefined,
        error,
      )
    }

    try {
      await this.sendToNasesAndUpdateState(jwt, form, data, {
        type: SendMessageNasesSenderType.Eid,
        senderUri: nasesUser.sub,
      })
    } catch (error) {
      this.logger.error(`Error sending form to nases.`, error)

      // TODO temp SEND_TO_NASES_ERROR log, remove.
      this.logger.log(
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

    // Send the form to ginis if should be sent
    if (isSlovenskoSkGenericFormDefinition(formDefinition)) {
      try {
        await this.rabbitmqClientService.publishToGinis({
          formId: data.formId,
          tries: 0,
          userData: data.userData,
        })
      } catch (error) {
        // We do not want to show the user error when the submission was already delivered to Nases. Therefore Ginis errors should only be logged for us.
        this.logger.error(
          this.throwerErrorGuard.InternalServerErrorException(
            NasesErrorsEnum.SEND_TO_GINIS_ERROR,
            `${NasesErrorsResponseEnum.SEND_TO_GINIS_ERROR} Received form id: ${data.formId}.`,
            undefined,
            error,
          ),
        )
      }
    }

    return {
      id: form.id,
      message: 'Form was successfully sent to nases.',
      state: FormState.DELIVERED_NASES,
    }
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

  public async sendToNasesAndUpdateState(
    jwt: string,
    form: Forms,
    data: RabbitPayloadDto,
    sender: SendMessageNasesSender,
    additionalFormUpdates?: FormUpdateBodyDto,
  ): Promise<void> {
    // sendMessageNases is implemented in a way that it does not throw. Therefore this is not in try-catch block.
    const sendData = await this.nasesUtilsService.sendMessageNases(
      jwt,
      form,
      sender,
    )

    if ((sendData && sendData.status !== 200) || !sendData) {
      await this.formsService.updateForm(data.formId, {
        state: FormState.DRAFT,
        error: FormError.NASES_SEND_ERROR,
      })

      throw this.throwerErrorGuard.InternalServerErrorException(
        NasesErrorsEnum.UNABLE_SEND_FORM_TO_NASES,
        NasesErrorsResponseEnum.UNABLE_SEND_FORM_TO_NASES,
        {
          status: sendData.status,
          formId: data.formId,
          error: FormError.NASES_SEND_ERROR,
          sendData: sendData.data,
        },
      )
    }

    // prisma update form status to DELIVERED_NASES
    await this.formsService.updateForm(data.formId, {
      state: FormState.DELIVERED_NASES,
      error: FormError.NONE,
      ...additionalFormUpdates,
    })

    this.logger.log({
      type: 'ALL GOOD - 200',
      status: 200,
      formId: data.formId,
      sendData: sendData.data,
    })
  }
}
