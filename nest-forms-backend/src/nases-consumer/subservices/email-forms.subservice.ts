import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FormError, FormState } from '@prisma/client'
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
import MailgunService from '../../utils/global-services/mailgun/mailgun.service'
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
    private configService: ConfigService,
    private convertService: ConvertService,
    private formValidatorRegistryService: FormValidatorRegistryService,
  ) {
    this.logger = new LineLoggerSubservice('EmailFormsSubservice')
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
      !formDefinition.email
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
      // TODO better error
      throw new Error('Form validation failed')
    }

    return { form: form as EmailFormChecked, formDefinition }
  }

  /**
   * Creates JSON data attachment for the email if sendJsonData is enabled
   */
  private createJsonAttachment(
    formDefinition: FormDefinitionEmail,
    formDataJson: any,
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
    formDataJson: any,
  ): string | null {
    if (userFirstName) {
      return userFirstName
    }

    if (formDefinition.extractName) {
      return formDefinition.extractName(formDataJson) ?? null
    }

    return null
  }

  /**
   * Sends confirmation email to the user and handles errors
   */
  private async sendUserConfirmationEmail(
    userEmail: string,
    form: any,
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

      await this.mailgunService[formDefinition.sendEmailFunction](
        {
          to: userEmail,
          template: formDefinition.userEmailTemplate,
          data: {
            formId: form.id,
            messageSubject: formTitle,
            firstName: userName,
            slug: formDefinition.slug,
          },
        },
        formDefinition.emailFrom ?? formDefinition.email,
        attachments,
      )
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
  private async updateFormState(form: any): Promise<void> {
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
      `Sending email of form ${formId} to ${formDefinition.email}`,
    )

    const formTitle =
      getFrontendFormTitleFromForm(form, formDefinition) ||
      getSubjectTextFromForm(form, formDefinition)

    const jwtSecret = this.configService.getOrThrow<string>('JWT_SECRET')
    const selfUrl = this.configService.getOrThrow<string>('SELF_URL')

    // Send email to the department/office
    await this.mailgunService[formDefinition.sendEmailFunction](
      {
        to: formDefinition.email,
        template: formDefinition.newSubmissionEmailTemplate,
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
      formDefinition.emailFrom ?? formDefinition.email,
      formDefinition.sendJsonData
        ? this.createJsonAttachment(formDefinition, form.formDataJson)
        : undefined,
    )

    // Determine user email address for confirmation
    const userConfirmationEmail =
      userEmail ?? formDefinition.extractEmail(form.formDataJson)

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
