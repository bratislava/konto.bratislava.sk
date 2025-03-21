import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FormError, FormState } from '@prisma/client'
import { GenericObjectType } from '@rjsf/utils'
import {
  FormDefinitionEmail,
  FormDefinitionType,
} from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { omitExtraData } from 'forms-shared/form-utils/omitExtraData'
import { renderSummaryEmail } from 'forms-shared/summary-email/renderSummaryEmail'

import ConvertService from '../../convert/convert.service'
import FormValidatorRegistryService from '../../form-validator-registry/form-validator-registry.service'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../../forms/forms.errors.enum'
import PrismaService from '../../prisma/prisma.service'
import { getFileIdsToInfoMap } from '../../utils/files'
import { ErrorsEnum } from '../../utils/global-enums/errors.enum'
import { Mailer } from '../../utils/global-services/mailer/mailer.interface'
import MailgunService from '../../utils/global-services/mailer/mailgun.service'
import OloMailerService from '../../utils/global-services/mailer/olo-mailer.service'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import {
  getFrontendFormTitleFromForm,
  getSubjectTextFromForm,
} from '../../utils/handlers/text.handler'
import alertError, {
  LineLoggerSubservice,
} from '../../utils/subservices/line-logger.subservice'
import { EmailFormChecked, isEmailFormChecked } from '../../utils/types/prisma'
import {
  EmailFormsErrorsEnum,
  EmailFormsErrorsResponseEnum,
} from './dtos/email-forms.errors.enum'

@Injectable()
export default class EmailFormsSubservice {
  private logger: LineLoggerSubservice

  constructor(
    private throwerErrorGuard: ThrowerErrorGuard,
    private prismaService: PrismaService,
    private mailgunService: MailgunService,
    private oloMailerService: OloMailerService,
    private configService: ConfigService,
    private convertService: ConvertService,
    private formValidatorRegistryService: FormValidatorRegistryService,
  ) {
    this.logger = new LineLoggerSubservice('EmailFormsSubservice')
  }

  /**
   * Resolves the address based on the environment.
   * If the address is a string, it returns the string.
   * If the address is an object, it returns the production value if CLUSTER_ENV is 'production',
   * otherwise it returns the test/staging value.
   */
  private resolveAddress(address: { test: string; prod: string }): string {
    const isProd =
      this.configService.get<string>('CLUSTER_ENV') === 'production'
    return isProd ? address.prod : address.test
  }

  private getMailer(formDefinition: FormDefinitionEmail): Mailer {
    switch (formDefinition.email.mailer) {
      case 'olo':
        return this.oloMailerService

      case 'mailgun':
        return this.mailgunService

      default:
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          `Unsupported mailer: ${formDefinition.email.mailer}`,
        )
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
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_NOT_FOUND_ERROR,
        FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR,
      )
    }

    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (!formDefinition) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
      )
    }

    if (
      formDefinition.type !== FormDefinitionType.Email ||
      !formDefinition.email.address
    ) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        EmailFormsErrorsEnum.NOT_EMAIL_FORM,
        `${EmailFormsErrorsResponseEnum.NOT_EMAIL_FORM} Form id: ${form.id}.`,
      )
    }

    if (form.formDataJson == null) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormsErrorsEnum.EMPTY_FORM_DATA,
        FormsErrorsResponseEnum.EMPTY_FORM_DATA,
      )
    }

    if (form.formSummary == null) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormsErrorsEnum.EMPTY_FORM_SUMMARY,
        FormsErrorsResponseEnum.EMPTY_FORM_SUMMARY,
      )
    }

    if (!isEmailFormChecked(form)) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        EmailFormsErrorsResponseEnum.NOT_EMAIL_FORM_AFTER_CHECK,
      )
    }

    return { form, formDefinition }
  }

  /**
   * Creates JSON data attachment for the email if sendJsonData is enabled
   */
  private createJsonAttachment(
    formDefinition: FormDefinitionEmail,
    formDataJson: GenericObjectType,
  ): { filename: string; content: Buffer }[] {
    return [
      {
        filename: 'submission.json',
        content: Buffer.from(
          JSON.stringify(
            omitExtraData(
              formDefinition.schema,
              formDataJson,
              this.formValidatorRegistryService.getRegistry(),
            ),
          ),
        ),
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

    if (formDefinition.email.extractName) {
      return formDefinition.email.extractName(formDataJson) ?? null
    }

    return null
  }

  /**
   * Sends confirmation email to the user and handles errors
   */
  private async sendUserConfirmationEmail(
    userEmail: string,
    form: EmailFormChecked,
    formDefinition: FormDefinitionEmail,
    formTitle: string,
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
            messageSubject: formTitle,
            firstName: userName,
            slug: formDefinition.slug,
          },
        },
        emailFrom: this.resolveAddress(
          formDefinition.email.fromAddress ?? formDefinition.email.address,
        ),
        attachments,
      })
    } catch (error) {
      alertError(
        `Sending confirmation email to ${userEmail} for form ${form.id} failed.`,
        this.logger,
        JSON.stringify(error),
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
      .catch((error) => {
        alertError(
          `Setting form state with id ${form.id} to FINISHED failed.`,
          this.logger,
          JSON.stringify(error),
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

    this.logger.log(
      `Sending email of form ${formId} to ${this.resolveAddress(formDefinition.email.address)}.`,
    )

    const formTitle =
      getFrontendFormTitleFromForm(form, formDefinition) ||
      getSubjectTextFromForm(form, formDefinition)

    const jwtSecret = this.configService.getOrThrow<string>('JWT_SECRET')
    const selfUrl = this.configService.getOrThrow<string>('SELF_URL')

    // Send email to the department/office
    await this.getMailer(formDefinition).sendEmail({
      data: {
        to: this.resolveAddress(formDefinition.email.address),
        template: formDefinition.email.newSubmissionTemplate,
        data: {
          formId: form.id,
          messageSubject: formTitle,
          firstName: null,
          slug: formDefinition.slug,
          htmlData: await renderSummaryEmail({
            formSummary: form.formSummary,
            serverFiles: form.files,
            fileIdInfoMap: getFileIdsToInfoMap(form, jwtSecret, selfUrl),
            validatorRegistry: this.formValidatorRegistryService.getRegistry(),
          }),
        },
      },
      emailFrom: this.resolveAddress(
        formDefinition.email.fromAddress ?? formDefinition.email.address,
      ),
      attachments: formDefinition.email.sendJsonDataAttachmentInTechnicalMail
        ? this.createJsonAttachment(formDefinition, form.formDataJson)
        : undefined,
      subject: formDefinition.email.technicalEmailSubject,
    })

    // Determine user email address for confirmation
    const userConfirmationEmail =
      userEmail ?? formDefinition.email.extractEmail(form.formDataJson)

    // Send confirmation email to user if we have an email address
    if (userConfirmationEmail) {
      const userName = this.resolveUserName(
        userFirstName,
        formDefinition,
        form.formDataJson,
      )

      await this.sendUserConfirmationEmail(
        userConfirmationEmail,
        form,
        formDefinition,
        formTitle,
        userName,
      )
    } else {
      alertError(
        `No email address to send confirmation email to (toEmail) for form ${formId}.`,
        this.logger,
      )
    }

    // Update form state to FINISHED
    await this.updateFormState(form)
  }
}
