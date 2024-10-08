import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FormError, FormState } from '@prisma/client'
import { GenericObjectType } from '@rjsf/utils'
import { FormDefinitionType } from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { omitExtraData } from 'forms-shared/form-utils/omitExtraData'
import { renderSummaryEmail } from 'forms-shared/summary-email/renderSummaryEmail'
import * as jwt from 'jsonwebtoken'

import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../../forms/forms.errors.enum'
import PrismaService from '../../prisma/prisma.service'
import { MailgunTemplateEnum } from '../../utils/global-services/mailgun/mailgun.constants'
import MailgunService from '../../utils/global-services/mailgun/mailgun.service'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import {
  getFrontendFormTitleFromForm,
  getSubjectTextFromForm,
} from '../../utils/handlers/text.handler'
import alertError from '../../utils/logging'
import {
  EmailFormsErrorsEnum,
  EmailFormsErrorsResponseEnum,
} from '../../utils/subservices/dtos/email-forms.errors.enum'
import { FormWithFiles } from '../../utils/types/prisma'

@Injectable()
export default class EmailFormsSubservice {
  private logger: Logger

  constructor(
    private throwerErrorGuard: ThrowerErrorGuard,
    private prismaService: PrismaService,
    private mailgunService: MailgunService,
    private configService: ConfigService,
  ) {
    this.logger = new Logger('EmailFormsSubservice')
  }

  async sendEmailForm(
    formId: string,
    toEmail: string | null,
    firstName: string | null,
  ): Promise<void> {
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

    this.logger.log(
      `Sending email of form ${formId} to ${formDefinition.email}`,
    )

    const formTitle =
      getFrontendFormTitleFromForm(form, formDefinition) ||
      getSubjectTextFromForm(form, formDefinition)
    const jsonDataExtraDataOmitted = omitExtraData(
      formDefinition.schemas.schema,
      form.formDataJson as GenericObjectType,
    )

    await this.mailgunService.sendEmail({
      to: formDefinition.email,
      template: MailgunTemplateEnum.OLO_SEND_FORM,
      data: {
        formId: form.id,
        messageSubject: formDefinition.title,
        firstName: null,
        slug: formDefinition.slug,
        htmlData: await renderSummaryEmail({
          formDefinition,
          formData: jsonDataExtraDataOmitted,
          serverFiles: form.files,
          fileIdUrlMap: this.getFileIdsToUrlMap(form),
        }),
      },
    })

    // Send confirmation email to user
    if (toEmail) {
      try {
        // TODO - temporary delivered mail, we should use some OLO mail with html data as when sending the confirmation email to OLO.
        await this.mailgunService.sendEmail({
          to: toEmail,
          template: MailgunTemplateEnum.GINIS_DELIVERED,
          data: {
            formId: form.id,
            messageSubject: formTitle,
            firstName,
            slug: formDefinition.slug,
          },
        })
      } catch (error) {
        alertError(
          `Sending confirmation email to ${toEmail} for form ${formId} failed.`,
          this.logger,
          JSON.stringify(error),
        )
      }
    } else {
      alertError(
        `No email address to send confirmation email to (toEmail) for form ${formId}.`,
        this.logger,
      )
    }

    await this.prismaService.forms
      .update({
        where: {
          id: form.id,
        },
        data: {
          state: FormState.PROCESSING,
          error: FormError.NONE,
        },
      })
      .catch((error) => {
        alertError(
          `Setting form state with id ${formId} to PROCESSING failed.`,
          this.logger,
          JSON.stringify(error),
        )
      })
  }

  private getFileIdsToUrlMap(form: FormWithFiles): Record<string, string> {
    const result: Record<string, string> = {}
    const jwtSecret = this.configService.getOrThrow<string>('JWT_SECRET')
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL')

    form.files.forEach((file) => {
      const token = jwt.sign({ fileId: file.id }, jwtSecret, {
        expiresIn: '5y',
      })
      result[file.id] = `${frontendUrl}/download/file/${token}`
    })
    return result
  }
}
