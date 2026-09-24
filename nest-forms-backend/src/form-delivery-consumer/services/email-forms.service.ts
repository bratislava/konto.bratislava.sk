import {
  ErrorEnum,
  ErrorFactoryService,
  LineLoggerSubservice,
} from '@bratislava/log-nest'
import { Injectable } from '@nestjs/common'
import type { GenericObjectType } from '@rjsf/utils' with {
  'resolution-mode': 'import',
}
import {
  FormDefinitionEmail,
  FormDefinitionType,
  isFormDefinitionWithReplyToAndExtractEmail,
} from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import {
  extractEmailFormAddress,
  extractEmailFormEmail,
  extractEmailFormName,
  extractFormSubjectPlain,
  extractFormSubjectTechnical,
} from 'forms-shared/form-utils/formDataExtractors'
import { baOmitExtraData } from 'forms-shared/form-utils/omitExtraData'
import {
  FileIdInfoMap,
  renderSummaryEmail,
} from 'forms-shared/summary-email/renderSummaryEmail'

import BaConfigService from '../../config/ba-config.service'
import { ClusterEnv } from '../../config/environment-variables'
import ConvertService from '../../convert/convert.service'
import FormValidatorRegistryService from '../../form-validator-registry/form-validator-registry.service'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../../forms/forms.errors.enum'
import { FormError, FormState } from '../../generated/prisma/client'
import { Mailer } from '../../mailer/mailer.interface'
import MailgunService from '../../mailer/mailgun.service'
import OloMailerService from '../../mailer/olo-mailer.service'
import PrismaService from '../../prisma/prisma.service'
import { getFileIdsToInfoMap } from '../../utils/files'
import { EmailFormChecked, isEmailFormChecked } from '../../utils/types/prisma'
import {
  EmailFormsErrorsEnum,
  EmailFormsErrorsResponseEnum,
} from '../errors/email-forms.errors.enum'

@Injectable()
export default class EmailFormsService {
  constructor(
    private errorFactoryService: ErrorFactoryService,
    private prismaService: PrismaService,
    private mailgunService: MailgunService,
    private oloMailerService: OloMailerService,
    private baConfigService: BaConfigService,
    private convertService: ConvertService,
    private formValidatorRegistryService: FormValidatorRegistryService,
    private readonly logger: LineLoggerSubservice,
  ) {}

  /**
   * Resolves the address based on the environment.
   * If the address is a string, it returns the string.
   * If the address is an object, it returns the production value if CLUSTER_ENV is 'production',
   * otherwise it returns the test/staging value.
   */
  private resolveAddress(address: { test: string; prod: string }): string {
    const isProd =
      this.baConfigService.environment.clusterEnv === ClusterEnv.Production
    return isProd ? address.prod : address.test
  }

  private resolveMultipleAddresses(address: {
    test: string[]
    prod: string[]
  }): string {
    const isProd =
      this.baConfigService.environment.clusterEnv === ClusterEnv.Production
    return isProd ? address.prod.join(', ') : address.test.join(', ')
  }

  private getMailer(formDefinition: FormDefinitionEmail): Mailer {
    switch (formDefinition.email.mailer) {
      case 'olo':
        return this.oloMailerService

      case 'mailgun':
        return this.mailgunService

      default:
        throw this.errorFactoryService.InternalServerErrorException({
          errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
          message: 'Unsupported mailer',
          console: { mailer: formDefinition.email.mailer },
        })
    }
  }

  /**
   * Retrieves a form by its ID, validates it, and ensures it's an email form.
   */
  private async getValidatedEmailForm(
    formId: string,
  ): Promise<{ form: EmailFormChecked; formDefinition: FormDefinitionEmail }> {
    const form = await this.prismaService.forms.findUnique({
      where: {
        id: formId,
        archived: false,
      },
      include: {
        files: true,
      },
    })

    if (form === null) {
      throw this.errorFactoryService.NotFoundException({
        errorEnum: FormsErrorsEnum.FORM_NOT_FOUND_ERROR,
        message: FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR,
      })
    }

    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (!formDefinition) {
      throw this.errorFactoryService.NotFoundException({
        errorEnum: FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        message: `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
      })
    }

    if (formDefinition.type !== FormDefinitionType.Email) {
      throw this.errorFactoryService.UnprocessableEntityException({
        errorEnum: EmailFormsErrorsEnum.NOT_EMAIL_FORM,
        message: `${EmailFormsErrorsResponseEnum.NOT_EMAIL_FORM} Form id: ${form.id}.`,
      })
    }

    if (form.formDataJson == null) {
      throw this.errorFactoryService.UnprocessableEntityException({
        errorEnum: FormsErrorsEnum.EMPTY_FORM_DATA,
        message: FormsErrorsResponseEnum.EMPTY_FORM_DATA,
      })
    }

    if (form.formSummary == null) {
      throw this.errorFactoryService.UnprocessableEntityException({
        errorEnum: FormsErrorsEnum.EMPTY_FORM_SUMMARY,
        message: FormsErrorsResponseEnum.EMPTY_FORM_SUMMARY,
      })
    }

    if (!isEmailFormChecked(form)) {
      throw this.errorFactoryService.InternalServerErrorException({
        errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
        message: EmailFormsErrorsResponseEnum.NOT_EMAIL_FORM_AFTER_CHECK,
      })
    }

    return { form, formDefinition }
  }

  /**
   * Creates JSON data attachment for the email if sendJsonData is enabled
   */
  private createJsonAttachment(
    formId: string,
    formDefinition: FormDefinitionEmail,
    formDataJson: GenericObjectType,
    fileIdUrlMap: FileIdInfoMap,
  ): { filename: string; content: Buffer }[] {
    const attachment = {
      formId,
      slug: formDefinition.slug,
      jsonVersion: formDefinition.jsonVersion,
      json: baOmitExtraData(
        formDefinition.schema,
        formDataJson,
        this.formValidatorRegistryService.getRegistry(),
      ),
      fileIdUrlMap,
    }
    return [
      {
        filename: 'submission.json',
        content: Buffer.from(JSON.stringify(attachment)),
      },
    ]
  }

  /**
   * Determines the name to use in the user confirmation email
   */
  private resolveUserName(
    userFirstName: string | null,
    formDefinition: FormDefinitionEmail,
    formDataJson: GenericObjectType,
  ): string | null {
    if (userFirstName) {
      return userFirstName
    }

    return extractEmailFormName(formDefinition, formDataJson) ?? null
  }

  /**
   * Sends confirmation email to the user and handles errors
   */
  private async sendUserConfirmationEmail(
    userEmail: string,
    form: EmailFormChecked,
    formDefinition: FormDefinitionEmail,
    userName: string | null,
  ): Promise<void> {
    try {
      // Generate confirmation pdf
      const file = await this.convertService.generatePdf(
        form.formDataJson,
        form.id,
        formDefinition,
      )

      const attachments = [
        {
          filename: `potvrdenie.pdf`,
          content: file,
        },
      ]

      await this.getMailer(formDefinition).sendEmail({
        data: {
          to: userEmail,
          template: formDefinition.email.userResponseTemplate,
          data: {
            formId: form.id,
            messageSubject: extractFormSubjectPlain(
              formDefinition,
              form.formDataJson,
            ),
            firstName: userName,
            slug: formDefinition.slug,
            formSentAt: form.formSentAt,
          },
        },
        emailFrom: this.resolveAddress(formDefinition.email.fromAddress),
        replyTo: formDefinition.email.replyToAddress
          ? this.resolveAddress(formDefinition.email.replyToAddress)
          : undefined,
        attachments,
      })
    } catch (error) {
      this.logger.error(
        this.errorFactoryService.InternalServerErrorException({
          errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
          message: 'Error while sending confirmation email.',
          console: { formId: form.id },
          error,
        }),
      )
    }
  }

  /**
   * Updates the form state to FINISHED
   */
  private async updateFormState(form: EmailFormChecked): Promise<void> {
    await this.prismaService.forms
      .update({
        where: {
          id: form.id,
        },
        data: {
          state: FormState.FINISHED,
          error: FormError.NONE,
        },
      })
      .catch((error: unknown) => {
        this.logger.error(
          this.errorFactoryService.InternalServerErrorException({
            errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
            message: 'Setting form state to FINISHED failed.',
            console: { formId: form.id },
            error,
          }),
        )
      })
  }

  async sendEmailForm(
    formId: string,
    userEmail: string | null,
    userFirstName: string | null,
  ): Promise<void> {
    // Get and validate the form
    const { form, formDefinition } = await this.getValidatedEmailForm(formId)
    const resolvedRecipientAddresses = this.resolveMultipleAddresses(
      extractEmailFormAddress(formDefinition, form.formDataJson),
    )

    this.logger.log(
      `Sending email of form ${formId} to ${resolvedRecipientAddresses.split(', ').length} recipient(s).`,
    )

    const jwtSecret = this.baConfigService.tokens.jwtSecret
    const selfUrl = this.baConfigService.self.url

    const fileIdInfoMap = getFileIdsToInfoMap(form, jwtSecret, selfUrl)
    let technicalSubject: string | undefined
    if (formDefinition.subject?.extractTechnical) {
      technicalSubject = extractFormSubjectTechnical(
        formDefinition,
        form.formDataJson,
      )
      if (formDefinition.email.technicalEmailSubjectAppendId) {
        technicalSubject += ` [${form.id}]`
      }
    }

    const renderedSummary = await renderSummaryEmail({
      formSummary: form.formSummary,
      serverFiles: form.files,
      fileIdInfoMap,
      validatorRegistry: this.formValidatorRegistryService.getRegistry(),
    })

    // Send email to the department/office
    await this.getMailer(formDefinition).sendEmail({
      data: {
        to: resolvedRecipientAddresses,
        template: formDefinition.email.newSubmissionTemplate,
        data: {
          formId: form.id,
          messageSubject: extractFormSubjectPlain(
            formDefinition,
            form.formDataJson,
          ),
          firstName: null,
          slug: formDefinition.slug,
          htmlData: renderedSummary,
          formSentAt: form.formSentAt,
        },
      },
      emailFrom: this.resolveAddress(formDefinition.email.fromAddress),
      replyTo: isFormDefinitionWithReplyToAndExtractEmail(formDefinition)
        ? extractEmailFormEmail(formDefinition, form.formDataJson)
        : undefined,
      attachments: formDefinition.email.sendJsonDataAttachmentInTechnicalMail
        ? this.createJsonAttachment(
            formId,
            formDefinition,
            form.formDataJson,
            fileIdInfoMap,
          )
        : undefined,
      subject: technicalSubject,
    })

    const userConfirmationEmail =
      userEmail ?? extractEmailFormEmail(formDefinition, form.formDataJson)

    const userName = this.resolveUserName(
      userFirstName,
      formDefinition,
      form.formDataJson,
    )

    if (userConfirmationEmail) {
      await this.sendUserConfirmationEmail(
        userConfirmationEmail,
        form,
        formDefinition,
        userName,
      )
    } else if (formDefinition.email.extractEmail) {
      this.logger.error(
        this.errorFactoryService.InternalServerErrorException({
          errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
          message:
            'No valid user confirmation email available (provided or extracted).',
          console: {
            formId,
            emailSource: userEmail == null ? 'extracted' : 'provided',
            formDefinitionSlug: formDefinition.slug,
          },
        }),
      )
    }

    // Update form state to FINISHED
    await this.updateFormState(form)
  }
}
