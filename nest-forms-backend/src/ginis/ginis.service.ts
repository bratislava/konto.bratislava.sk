import { setTimeout } from 'node:timers/promises'

import { Nack, RabbitRPC } from '@golevelup/nestjs-rabbitmq'
import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { FormError, Forms, FormState, GinisState } from '@prisma/client'
import { Channel, ConsumeMessage } from 'amqplib'
import { Queue } from 'bull'
import { MailgunTemplateEnum } from 'forms-shared/definitions/emailFormTypes'
import {
  FormDefinitionSlovenskoSkGeneric,
  isSlovenskoSkGenericFormDefinition,
} from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import {
  extractFormSubjectPlain,
  extractFormSubjectTechnical,
} from 'forms-shared/form-utils/formDataExtractors'
import { ContactAndIdInfoTypeEnum } from 'openapi-clients/city-account'
import {
  UpvsCorporateBody,
  UpvsNaturalPerson,
} from 'openapi-clients/slovensko-sk'

import ClientsService from '../clients/clients.service'
import BaConfigService from '../config/ba-config.service'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../forms/forms.errors.enum'
import {
  NasesErrorsEnum,
  NasesErrorsResponseEnum,
} from '../nases/nases.errors.enum'
import NasesUtilsService, {
  isUpvsCorporateBody,
  isUpvsNaturalPerson,
} from '../nases/utils-services/tokens.nases.service'
import PrismaService from '../prisma/prisma.service'
import { RABBIT_MQ, RABBIT_NASES } from '../utils/constants'
import { ErrorsEnum } from '../utils/global-enums/errors.enum'
import MailgunService from '../utils/global-services/mailer/mailgun.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { toLogfmt } from '../utils/logging'
import alertError, {
  LineLoggerSubservice,
} from '../utils/subservices/line-logger.subservice'
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'
import { FormWithFiles } from '../utils/types/prisma'
import { GinisCheckNasesPayloadDto } from './dtos/ginis.response.dto'
import GinisHelper from './subservices/ginis.helper'
import GinisAPIService, {
  GinContactParams,
  GinContactType,
} from './subservices/ginis-api.service'

@Injectable()
export default class GinisService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly baConfigService: BaConfigService,
    private readonly clientsService: ClientsService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly ginisHelper: GinisHelper,
    private readonly ginisApiService: GinisAPIService,
    private mailgunService: MailgunService,
    private readonly minioClientSubservice: MinioClientSubservice,
    private prismaService: PrismaService,
    private readonly nasesUtilsService: NasesUtilsService,
    @InjectQueue('sharepoint') private readonly sharepointQueue: Queue,
  ) {
    this.logger = new LineLoggerSubservice('GinisService')

    if (
      !['production', 'development', 'staging'].includes(
        process.env.NODE_ENV ?? '',
      ) &&
      process.env.JEST_WORKER_ID === undefined
    ) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        `.env value NODE_ENV must be set to 'production', 'development' or 'staging'`,
      )
    }
  }

  private async updateFailedRegistration(formId: string): Promise<void> {
    await this.prismaService.forms.update({
      where: { id: formId },
      data: {
        state: FormState.ERROR,
        error: FormError.GINIS_SEND_ERROR,
        ginisState: GinisState.ERROR_REGISTER,
      },
    })
  }

  private async updateSuccessfulRegistration(
    formId: string,
    documentId: string,
  ): Promise<void> {
    await this.prismaService.forms.update({
      where: { id: formId },
      data: {
        state: FormState.DELIVERED_GINIS,
        ginisDocumentId: documentId,
        error: FormError.NONE,
        ginisState: GinisState.REGISTERED,
      },
    })
  }

  async registerGinisDocument(formId: string): Promise<boolean> {
    try {
      const documentId = await this.ginisHelper.retryWithDelay(async () =>
        this.ginisApiService.findDocumentId(formId),
      )
      if (!documentId) {
        return false
      }
      await this.updateSuccessfulRegistration(formId, documentId)
      return true
    } catch (error) {
      alertError(
        `ERROR registerGinisDocument - error while registering the document. Form id: ${formId}`,
        this.logger,
        error,
      )
      await this.updateFailedRegistration(formId)
    }
    return false
  }

  private async updateFailedAttachmentUpload(fileId: string): Promise<void> {
    await this.prismaService.files.update({
      where: {
        id: fileId,
      },
      data: {
        ginisUploadedError: true,
      },
    })
  }

  private async updateSuccessfulAttachmentUpload(
    fileId: string,
  ): Promise<void> {
    await this.prismaService.files.update({
      where: {
        id: fileId,
      },
      data: {
        ginisUploaded: true,
        ginisUploadedError: false,
      },
    })
  }

  private async uploadAttachmentToGinis(
    file: FormWithFiles['files'][number],
    ginisDocumentId: string,
    minioFilePath: string,
  ): Promise<void> {
    if (file.ginisUploaded) {
      return
    }

    try {
      // sometimes ginis times-out on the first try
      await this.ginisHelper.retryWithDelay(async () => {
        const fileStream = await this.minioClientSubservice.download(
          this.baConfigService.minio.buckets.safe,
          minioFilePath,
        )

        return this.ginisApiService.uploadFile(
          ginisDocumentId,
          file.fileName,
          fileStream,
        )
      })

      await this.updateSuccessfulAttachmentUpload(file.id)
    } catch (error) {
      alertError(
        `ERROR uploadAttachments - error upload file to ginis. Form id: ${file.formId}; Ginis id: ${ginisDocumentId}; File id: ${file.id}`,
        this.logger,
        error,
      )
      await this.updateFailedAttachmentUpload(file.id)
    }
  }

  async uploadAttachments(form: FormWithFiles, pospID: string): Promise<void> {
    await this.prismaService.forms.update({
      where: {
        id: form.id,
      },
      data: {
        ginisState: GinisState.RUNNING_UPLOAD_ATTACHMENTS,
      },
    })

    if (!form.ginisDocumentId) {
      alertError(
        `ERROR uploadAttachments - missing ginisDocumentId. Form id: ${form.id}`,
        this.logger,
      )
      return
    }

    // ginis can't handle parallel uploads, it's causing race conditions on their side
    for (let i = 0; i < form.files.length; i += 1) {
      const file = form.files[i]
      const minioFilePath = `${pospID}/${form.id}/${file.minioFileName}`

      // eslint-disable-next-line no-await-in-loop
      await this.uploadAttachmentToGinis(
        file,
        form.ginisDocumentId!,
        minioFilePath,
      )
    }
  }

  private async updateFailedAssignment(ginisDocumentId: string): Promise<void> {
    await this.prismaService.forms.update({
      where: {
        ginisDocumentId,
      },
      data: {
        state: FormState.ERROR,
        error: FormError.GINIS_SEND_ERROR,
        ginisState: GinisState.ERROR_ASSIGN_SUBMISSION,
      },
    })
  }

  private async updateSuccessfulAssignment(
    ginisDocumentId: string,
  ): Promise<void> {
    await this.prismaService.forms.update({
      where: { ginisDocumentId },
      data: {
        ginisState: GinisState.SUBMISSION_ASSIGNED,
        error: FormError.NONE,
        state: FormState.PROCESSING,
      },
    })
  }

  async assignSubmission(
    ginisDocumentId: string,
    ginisNodeId: string,
    ginisFunctionId?: string,
  ): Promise<void> {
    this.logger.debug('---- start to assign submission ----')
    await this.prismaService.forms.update({
      where: {
        ginisDocumentId,
      },
      data: {
        ginisState: GinisState.RUNNING_ASSIGN_SUBMISSION,
      },
    })

    try {
      await this.ginisHelper.retryWithDelay(async () =>
        this.ginisApiService.assignDocument(
          ginisDocumentId,
          ginisNodeId,
          ginisFunctionId,
        ),
      )
      await this.updateSuccessfulAssignment(ginisDocumentId)
      this.logger.debug('---- assigned in ginis ----')
    } catch (error) {
      alertError(
        `ERROR assignSubmission - error assigning document in ginis. Ginis id: ${ginisDocumentId}`,
        this.logger,
        error,
      )
      await this.updateFailedAssignment(ginisDocumentId)
    }
  }

  async nackTrueWithWait(seconds: number): Promise<Nack> {
    if (process.env.JEST_WORKER_ID === undefined) {
      await setTimeout(seconds)
    }
    return new Nack(true)
  }

  @RabbitRPC({
    exchange: RABBIT_MQ.EXCHANGE,
    routingKey: RABBIT_NASES.ROUTING_KEY,
    queue: RABBIT_NASES.QUEUE,
    errorHandler: (channel: Channel, message: ConsumeMessage, error: Error) => {
      // eslint-disable-next-line no-console
      const logger = new LineLoggerSubservice('Rabbit')
      logger.error(`GinisService RABBIT_MQ_ERROR: ${JSON.stringify(error)}`)
      channel.reject(message, false)
    },
  })
  // eslint-disable-next-line sonarjs/cognitive-complexity
  public async onQueueConsumption(
    data: GinisCheckNasesPayloadDto,
  ): Promise<Nack> {
    this.logger.debug(`Consuming message for formId: ${data.formId}`)

    const form = await this.prismaService.forms.findUnique({
      where: { id: data.formId, archived: false },
      include: {
        files: true,
      },
    })

    // checks on form
    if (!form) {
      alertError(
        `ERROR - form not exists in Ginis consumption queue. Form id: ${data.formId}`,
        this.logger,
      )
      await this.ginisHelper.setFormToError(data.formId)
      return new Nack(false)
    }

    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (!formDefinition) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
      )
    }
    if (!isSlovenskoSkGenericFormDefinition(formDefinition)) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE,
        `onQueueConsumption: ${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE}: ${formDefinition.type}, form id: ${form.id}`,
      )
    }

    const filesToUpload = form.files.filter((file) => !file.ginisUploaded)

    // Registration
    if (
      form.ginisState === GinisState.CREATED ||
      form.ginisState === GinisState.ERROR_REGISTER
    ) {
      if (!this.baConfigService.ginis.shouldRegister) {
        this.logger.debug('---- skipping register to ginis ----')
        return new Nack(false)
      }

      this.logger.debug('---- start to register to ginis ----')
      await this.prismaService.forms.update({
        where: { id: form.id },
        data: {
          ginisState: GinisState.RUNNING_REGISTER,
        },
      })
      return this.nackTrueWithWait(20_000)
    }

    if (form.ginisState === GinisState.RUNNING_REGISTER) {
      if (await this.registerGinisDocument(form.id)) {
        this.logger.debug('---- registered to ginis ----')
        return this.nackTrueWithWait(20_000)
      }
      return this.nackTrueWithWait(600_000)
    }

    // Attachments upload
    if (
      (form.ginisState === GinisState.REGISTERED ||
        form.ginisState === GinisState.RUNNING_UPLOAD_ATTACHMENTS) &&
      filesToUpload.length > 0
    ) {
      if (!form.ginisDocumentId) {
        alertError(
          `ERROR uploadAttachments - ginisDocumentId does not exists in form - Ginis consumption queue. Form id: ${form.id}`,
          this.logger,
        )
        return this.nackTrueWithWait(20_000)
      }
      this.logger.debug('---- uploading attachments ----')
      await this.uploadAttachments(form, formDefinition.pospID)
      return this.nackTrueWithWait(20_000)
    }

    if (
      filesToUpload.length === 0 &&
      (form.ginisState === GinisState.RUNNING_UPLOAD_ATTACHMENTS ||
        form.ginisState === GinisState.REGISTERED)
    ) {
      await this.prismaService.forms.update({
        where: { id: form.id },
        data: {
          ginisState: GinisState.ATTACHMENTS_UPLOADED,
          error: FormError.NONE,
        },
      })
      this.logger.debug('---- attachments uploaded ----')
      return this.nackTrueWithWait(20_000)
    }

    // Assign submission
    if (form.ginisState === GinisState.ATTACHMENTS_UPLOADED) {
      if (!form.ginisDocumentId) {
        alertError(
          `ERROR assignSubmission - ginisDocumentId does not exists in form - Ginis consumption queue. Form id: ${form.id}`,
          this.logger,
        )
        return this.nackTrueWithWait(20_000)
      }
      await this.assignSubmission(
        form.ginisDocumentId,
        formDefinition.ginisAssignment.ginisNodeId,
        formDefinition.ginisAssignment.ginisFunctionId,
      )
      return this.nackTrueWithWait(20_000)
    }

    if (form.ginisState === GinisState.ERROR_ASSIGN_SUBMISSION) {
      this.logger.error(
        '---- ERROR assigning submission (manual intervention required) ----',
      )
      return this.nackTrueWithWait(600_000)
    }

    // Send externally
    if (form.ginisState === GinisState.SUBMISSION_ASSIGNED) {
      await this.prismaService.forms.update({
        where: { id: form.id },
        data: {
          state: formDefinition.sharepointData
            ? FormState.SENDING_TO_SHAREPOINT
            : FormState.PROCESSING,
          ginisState: GinisState.FINISHED,
          error: FormError.NONE,
        },
      })

      // Send to SharePoint
      if (formDefinition.sharepointData) {
        await this.sendToSharepoint(form.id)
      }

      // Send via email
      if (data.userData.email) {
        await this.mailgunService.sendEmail({
          data: {
            template: MailgunTemplateEnum.GINIS_DELIVERED,
            data: {
              formId: form.id,
              firstName: data.userData.firstName,
              messageSubject: extractFormSubjectPlain(
                formDefinition,
                form.formDataJson,
              ),
              slug: form.formDefinitionSlug,
            },
            to: data.userData.email,
          },
        })
      }

      return new Nack(false)
    }
    return this.nackTrueWithWait(20_000)
  }

  private async sendToSharepoint(formId: string): Promise<void> {
    this.logger.log(`Adding form ${formId} to sharepoint queue.`)
    await this.sharepointQueue.add(
      {
        formId,
      },
      {
        removeOnComplete: true,
        removeOnFail: true,
      },
    )
  }

  private async fetchContactByUri(
    uri: string,
  ): Promise<UpvsNaturalPerson | UpvsCorporateBody> {
    const jwt = this.nasesUtilsService.createTechnicalAccountJwtToken()
    const response =
      await this.clientsService.slovenskoSkApi.apiIamIdentitiesSearchPost(
        {
          uris: [uri],
        },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      )
    const result = response.data

    if (result.length === 0) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormsErrorsEnum.FORM_DATA_INVALID,
        `fetchContactByUri: ${FormsErrorsResponseEnum.FORM_DATA_INVALID}: Form uri not found in nases. Uri: ${uri}`,
      )
    }
    if (result.length > 1) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormsErrorsEnum.FORM_DATA_INVALID,
        `fetchContactByUri: ${FormsErrorsResponseEnum.FORM_DATA_INVALID}: Multiple results found for form uri. Uri: ${uri}`,
      )
    }
    return result[0]
  }

  private async extractContactParamsFromUri(
    form: Forms,
  ): Promise<GinContactParams> {
    if (!form.mainUri) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormsErrorsEnum.FORM_DATA_INVALID,
        `fetchContactByUri: ${FormsErrorsResponseEnum.FORM_DATA_INVALID}: Form uri not found in form. Form id: ${form.id}`,
      )
    }

    const contact = await this.fetchContactByUri(form.mainUri)
    const params: GinContactParams = {
      uri: form.mainUri,
      email:
        contact.emails && contact.emails.length > 0
          ? contact.emails[0].address
          : undefined,
    }

    if (isUpvsNaturalPerson(contact)) {
      params.type = GinContactType.PHYSICAL_ENTITY
      const extractedData =
        this.nasesUtilsService.extractNaturalPersonData(contact)
      if (extractedData.firstNames.length > 0) {
        params.firstName = extractedData.firstNames.join(' ')
      }
      if (extractedData.lastNames.length > 0) {
        params.lastName = extractedData.lastNames.join(' ')
      }
      return params
    }

    if (isUpvsCorporateBody(contact)) {
      params.type = GinContactType.LEGAL_ENTITY
      const extractedData =
        this.nasesUtilsService.extractCorporateBodyData(contact)
      if (extractedData.name) {
        params.name = extractedData.name
      }
      if (extractedData.ico) {
        params.ico = extractedData.ico
      }
      return params
    }

    // don't throw, alert only
    this.logger.error(
      this.throwerErrorGuard.UnprocessableEntityException(
        NasesErrorsEnum.IDENTITY_SEARCH_DATA_INCONSISTENT,
        `extractContactParamsFromUri: ${NasesErrorsResponseEnum.IDENTITY_SEARCH_DATA_INCONSISTENT}: Contact shape not identified from nases identity search data for uri: ${form.mainUri}.`,
        toLogfmt({
          alert: 1,
        }),
      ),
    )

    // Fallback: return basic params with name if available
    const fallbackContact = contact as UpvsNaturalPerson | UpvsCorporateBody
    if (fallbackContact.name) {
      params.name = fallbackContact.name
    }
    return params
  }

  private async extractContactParamsFromExternalId(
    form: Forms,
  ): Promise<GinContactParams> {
    if (!form.externalId) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormsErrorsEnum.FORM_DATA_INVALID,
        `extractContactParamsFromExternalId: ${FormsErrorsResponseEnum.FORM_DATA_INVALID}: External id not found in form. Form id: ${form.id}`,
      )
    }

    const params: GinContactParams = {}
    const contactResponse =
      await this.clientsService.cityAccountApi.userIntegrationControllerGetContactAndIdInfoByExternalId(
        form.externalId,
        {
          headers: {
            apiKey: this.baConfigService.cityAccountBackend.apiKey,
          },
        },
      )

    const contactInfo = contactResponse.data
    if (!contactInfo) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.CITY_ACCOUNT_USER_GET_ERROR,
        `extractContactParamsFromExternalId: ${FormsErrorsResponseEnum.CITY_ACCOUNT_USER_GET_ERROR}: Contact info not found in city account for external id: ${form.externalId}. Form id: ${form.id}`,
      )
    }

    params.email = contactInfo.email

    // Map Cognito account type to Ginis contact type and set appropriate fields
    if (contactInfo.accountType === ContactAndIdInfoTypeEnum.Fo) {
      // Physical entity (UserContactAndIdInfoDto)
      params.type = GinContactType.PHYSICAL_ENTITY
      params.firstName = contactInfo.firstName
      params.lastName = contactInfo.lastName
      params.birthNumber = contactInfo.birthNumber
    } else if (
      contactInfo.accountType === ContactAndIdInfoTypeEnum.Po ||
      contactInfo.accountType === ContactAndIdInfoTypeEnum.FoP
    ) {
      // Legal entity or self-employed entity (LegalPersonContactAndIdInfoDto)
      params.type =
        contactInfo.accountType === ContactAndIdInfoTypeEnum.Po
          ? GinContactType.LEGAL_ENTITY
          : GinContactType.SELF_EMPLOYED_ENTITY
      params.name = contactInfo.name
      params.ico = contactInfo.ico
    }

    return params
  }

  private async handleDocumentSender(form: Forms): Promise<string | undefined> {
    let contactParams: GinContactParams = form.externalId
      ? await this.extractContactParamsFromExternalId(form)
      : {}

    if (form.mainUri) {
      const uriParams = await this.extractContactParamsFromUri(form)

      if (contactParams.email) {
        // throw away email from nases if we already have one
        uriParams.email = undefined
      }
      // Filter out undefined values
      const filteredUriParams = Object.fromEntries(
        Object.entries(uriParams).filter((entry) => entry[1] !== undefined),
      )
      contactParams = { ...contactParams, ...filteredUriParams }
    }

    // Skip update call if there are no updates to make
    const hasContactInformation = Object.values(contactParams).some(
      (value) => value !== undefined,
    )
    if (!hasContactInformation) {
      return undefined
    }
    return this.ginisApiService.upsertContact(contactParams)
  }

  public async createDocument(
    form: Forms,
    formDefinition: FormDefinitionSlovenskoSkGeneric,
  ) {
    if (form.formDataJson === null) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormsErrorsEnum.EMPTY_FORM_DATA,
        `createDocument: ${FormsErrorsResponseEnum.EMPTY_FORM_DATA}`,
        `No form data json in form id: ${form.id}`,
      )
    }
    const senderId = await this.handleDocumentSender(form)

    const documentId =
      form.ginisDocumentId ??
      (await this.ginisHelper.retryWithDelay(async () =>
        this.ginisApiService.createDocument(
          form.id,
          formDefinition.ginisDocumentTypeId,
          form.updatedAt,
          extractFormSubjectTechnical(formDefinition, form.formDataJson!),
          senderId,
        ),
      ))

    // called to reset the state to REGISTERED even if ginisDocumentId is already set
    await this.updateSuccessfulRegistration(form.id, documentId)

    const detail = await this.ginisHelper.retryWithDelay(async () =>
      this.ginisApiService.getDocumentDetail(documentId),
    )
    if (!detail['Cj-dokumentu']) {
      await this.ginisHelper.retryWithDelay(async () =>
        this.ginisApiService.assignReferenceNumber(documentId),
      )
    }

    const foundDocumentId = await this.ginisHelper.retryWithDelay(async () =>
      this.ginisApiService.findDocumentId(form.id),
    )
    if (foundDocumentId === documentId) {
      return
    }

    const propertyOrder = await this.ginisHelper.retryWithDelay(async () =>
      this.ginisApiService.createFormIdProperty(documentId),
    )
    await this.ginisHelper.retryWithDelay(async () =>
      this.ginisApiService.setFormIdProperty(
        documentId,
        propertyOrder,
        form.id,
      ),
    )
  }
}
