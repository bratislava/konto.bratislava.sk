import { HttpStatus, Injectable } from '@nestjs/common'
import { FormError, Forms, FormState } from '@prisma/client'
import {
  FormDefinition,
  isSlovenskoSkFormDefinition,
  isSlovenskoSkGenericFormDefinition,
} from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
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

import ApiJwtTokensService from '../api-jwt-tokens/api-jwt-tokens.service'
import { isAuthUser, User } from '../auth-v2/types/user'
import BaConfigService from '../config/ba-config.service'
import ConvertPdfService from '../convert-pdf/convert-pdf.service'
import { FormFilesReadyResultDto } from '../files/files.dto'
import {
  FilesErrorsEnum,
  FilesErrorsResponseEnum,
} from '../files/files.errors.enum'
import FilesService from '../files/files.service'
import { RabbitPayloadDto } from '../form-delivery-consumer/dtos/form-delivery-consumer.dto'
import FormValidatorRegistryService from '../form-validator-registry/form-validator-registry.service'
import { FormUpdateBodyDto } from '../forms/dtos/requests.dto'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../forms/forms.errors.enum'
import FormsService from '../forms/forms.service'
import { verifyFormSignatureErrorMapping } from '../nases/nases.errors.dto'
import {
  NasesErrorsEnum,
  NasesErrorsResponseEnum,
} from '../nases/nases.errors.enum'
import NasesSenderService from '../nases/services/nases.sender.service'
import { JwtNasesPayload } from '../nases/types/jwt-nases.types'
import userToSendPolicyAccountType from '../nases/utils-services/user-to-send-policy-account-type'
import RabbitmqClientService from '../rabbitmq-client/rabbitmq-client.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { SendFormResponseDto } from './dtos/responses.dto'
import {
  FormSenderErrorsEnum,
  FormSenderErrorsResponseEnum,
} from './form-sender.errors.enum'

@Injectable()
export class FormSenderService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly formsService: FormsService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly apiJwtTokensService: ApiJwtTokensService,
    private readonly baConfigService: BaConfigService,
    private readonly formValidatorRegistryService: FormValidatorRegistryService,
    private readonly filesService: FilesService,
    private readonly convertPdfService: ConvertPdfService,
    private readonly rabbitmqClientService: RabbitmqClientService,
    private readonly nasesSenderService: NasesSenderService,
  ) {
    this.logger = new LineLoggerSubservice(FormSenderService.name)
  }

  createUserJwtToken(oboToken: string): string {
    return this.apiJwtTokensService.createUserJwtToken(
      oboToken,
      this.baConfigService.slovenskoSk.apiTokenPrivate,
    )
  }

  async updateAndSendForm(
    formId: string,
    data: FormUpdateBodyDto,
    user: User,
  ): Promise<SendFormResponseDto> {
    await this.formsService.updateFormWithUser(formId, data, user)

    const form = await this.formsService.checkFormBeforeSending(formId)
    // All extra files should be already deleted at this point and remaining files should be SAFE.

    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (!formDefinition) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
      )
    }

    // File size check at submission time — this is the authoritative point because
    // the set of files is only final after the form data has been updated and extra
    // files deleted. All files at this point are expected to be in SAFE state.
    if (
      this.baConfigService.featureToggles.fileSizeLimits &&
      formDefinition.files
    ) {
      await this.enforceFileSizeConstraints(formId, formDefinition.files)
    }

    const evaluatedSendPolicy = evaluateFormSendPolicy(
      formDefinition.sendPolicy,
      userToSendPolicyAccountType(user),
    )

    if (!evaluatedSendPolicy.sendPossible) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormSenderErrorsEnum.SEND_POLICY_NOT_POSSIBLE,
        FormSenderErrorsResponseEnum.SEND_POLICY_NOT_POSSIBLE,
      )
    }

    if (!evaluatedSendPolicy.sendAllowedForUser) {
      throw this.throwerErrorGuard.ForbiddenException(
        FormSenderErrorsEnum.SEND_POLICY_NOT_ALLOWED_FOR_USER,
        FormSenderErrorsResponseEnum.SEND_POLICY_NOT_ALLOWED_FOR_USER,
      )
    }

    if (
      this.baConfigService.featureToggles.versioning &&
      !versionCompareCanSendForm({
        currentVersion: form.jsonVersion,
        latestVersion: formDefinition.jsonVersion,
      })
    ) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormSenderErrorsEnum.FORM_VERSION_NOT_COMPATIBLE,
        FormSenderErrorsResponseEnum.FORM_VERSION_NOT_COMPATIBLE,
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
        FormSenderErrorsEnum.UNABLE_ADD_FORM_TO_RABBIT,
        `${FormSenderErrorsEnum.UNABLE_ADD_FORM_TO_RABBIT} Received form id: ${
          form.id
        }`,
        undefined,
        error,
      )
    }

    const shouldBumpJsonVersion =
      !this.baConfigService.featureToggles.versioning ||
      versionCompareBumpDuringSend({
        currentVersion: form.jsonVersion,
        latestVersion: formDefinition.jsonVersion,
      })

    // set state of form to QUEUED
    await this.formsService.updateForm(form.id, {
      state: FormState.QUEUED,
      formSummary,
      formSentAt: new Date(),
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
    nasesUser: JwtNasesPayload,
    user: User,
  ): Promise<SendFormResponseDto> {
    const form = await this.formsService.checkFormBeforeSending(id)
    const jwt = this.createUserJwtToken(oboToken)

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
        FormSenderErrorsEnum.SEND_POLICY_NOT_POSSIBLE,
        FormSenderErrorsResponseEnum.SEND_POLICY_NOT_POSSIBLE,
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
            errorEnum,
            errorMessage,
          )
        } else {
          throw error
        }
      }
    }

    if (
      this.baConfigService.featureToggles.versioning &&
      !versionCompareCanSendForm({
        currentVersion: form.jsonVersion,
        latestVersion: formDefinition.jsonVersion,
      })
    ) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormSenderErrorsEnum.FORM_VERSION_NOT_COMPATIBLE,
        FormSenderErrorsResponseEnum.FORM_VERSION_NOT_COMPATIBLE,
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
      formSentAt: new Date(),
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
      !this.baConfigService.featureToggles.versioning ||
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
        FormSenderErrorsEnum.CREATE_PDF_IMAGE_ERROR,
        `${FormSenderErrorsResponseEnum.CREATE_PDF_IMAGE_ERROR} Received form id: ${data.formId}.`,
        undefined,
        error,
      )
    }

    try {
      await this.sendToNasesAndUpdateState(jwt, form, data, nasesUser.sub)
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
            FormSenderErrorsEnum.SEND_TO_GINIS_ERROR,
            FormSenderErrorsResponseEnum.SEND_TO_GINIS_ERROR,
            { formId: data.formId },
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
        FormSenderErrorsEnum.INFECTED_FILE,
        FormSenderErrorsResponseEnum.INFECTED_FILE,
      )
    }

    throw this.throwerErrorGuard.BadRequestException(
      FormSenderErrorsEnum.FILE_NOT_SCANNED,
      FormSenderErrorsResponseEnum.FILE_NOT_SCANNED,
    )
  }

  public async sendToNasesAndUpdateState(
    jwt: string,
    form: Forms,
    data: RabbitPayloadDto,
    senderUri: string,
    additionalFormUpdates?: FormUpdateBodyDto,
  ): Promise<void> {
    // send is implemented in a way that it does not throw. Therefore this is not in try-catch block.
    const sendData = await this.nasesSenderService.send(jwt, form, senderUri)

    if (sendData.status !== HttpStatus.OK) {
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
        FormSenderErrorsEnum.FORM_SUMMARY_GENERATION_ERROR,
        FormSenderErrorsResponseEnum.FORM_SUMMARY_GENERATION_ERROR,
        undefined,
        error,
      )
    }
  }

  private async enforceFileSizeConstraints(
    formId: string,
    formDefinitionFiles: NonNullable<FormDefinition['files']>,
  ) {
    const safeFiles = await this.filesService.getActiveFileSizes(formId)

    this.enforceFormCumulativeSize(safeFiles, formDefinitionFiles)
    this.enforcePerSlotConstraints(safeFiles, formDefinitionFiles)
  }

  private enforceFormCumulativeSize(
    safeFiles: { id: string; slotId: string | null; fileSize: number }[],
    formDefinitionFiles: NonNullable<FormDefinition['files']>,
  ) {
    const totalFileSize = safeFiles.reduce((sum, f) => sum + f.fileSize, 0)
    const maxTotalFileSize =
      formDefinitionFiles.maxTotalFileSize ??
      this.baConfigService.fileLimits.maxCumulativeSizeGlobal
    if (totalFileSize > maxTotalFileSize) {
      throw this.throwerErrorGuard.BadRequestException(
        FilesErrorsEnum.TOTAL_FILE_SIZE_EXCEEDED_ERROR,
        `${FilesErrorsResponseEnum.TOTAL_FILE_SIZE_EXCEEDED_ERROR} Total: ${totalFileSize}, limit: ${maxTotalFileSize}`,
      )
    }
  }

  /**
   * Per-slot checks (cumulative size + per-file size). Files with null slotId
   * were uploaded before slots existed; they only contribute to the form-level total.
   */
  private enforcePerSlotConstraints(
    safeFiles: { id: string; slotId: string | null; fileSize: number }[],
    formDefinitionFiles: NonNullable<FormDefinition['files']>,
  ) {
    const slotsById = new Map(
      formDefinitionFiles.slots.map((s) => [s.slotId, s]),
    )
    const filesBySlot = new Map<string, { id: string; fileSize: number }[]>()
    for (const file of safeFiles) {
      if (file.slotId === null) continue
      const list = filesBySlot.get(file.slotId) ?? []
      list.push({ id: file.id, fileSize: file.fileSize })
      filesBySlot.set(file.slotId, list)
    }

    for (const [slotId, slotFiles] of filesBySlot) {
      const slot = slotsById.get(slotId)
      if (!slot) continue
      this.enforceSingleSlotConstraints(slotId, slotFiles, slot)
    }
  }

  private enforceSingleSlotConstraints(
    slotId: string,
    slotFiles: { id: string; fileSize: number }[],
    slot: NonNullable<FormDefinition['files']>['slots'][number],
  ) {
    const { maxFileSize, maxTotalFileSize } = slot
    if (maxFileSize !== undefined) {
      const oversized = slotFiles.find((f) => f.fileSize > maxFileSize)
      if (oversized) {
        throw this.throwerErrorGuard.BadRequestException(
          FilesErrorsEnum.FILE_SIZE_EXCEEDED_ERROR,
          FilesErrorsResponseEnum.FILE_SIZE_EXCEEDED_ERROR,
          `Slot: ${slotId}, fileId: ${oversized.id}, size: ${oversized.fileSize}, limit: ${maxFileSize}`,
        )
      }
    }

    if (maxTotalFileSize !== undefined) {
      const slotTotalSize = slotFiles.reduce((sum, f) => sum + f.fileSize, 0)
      if (slotTotalSize > maxTotalFileSize) {
        throw this.throwerErrorGuard.BadRequestException(
          FilesErrorsEnum.TOTAL_FILE_SIZE_EXCEEDED_ERROR,
          FilesErrorsResponseEnum.TOTAL_FILE_SIZE_EXCEEDED_ERROR,
          `Slot: ${slotId}, total: ${slotTotalSize}, limit: ${maxTotalFileSize}`,
        )
      }
    }
  }
}
