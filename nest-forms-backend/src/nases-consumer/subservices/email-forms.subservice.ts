import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FormError, FormState } from '@prisma/client'
import { GenericObjectType } from '@rjsf/utils'
import { FormDefinitionType } from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { omitExtraData } from 'forms-shared/form-utils/omitExtraData'
import { renderSummaryEmail } from 'forms-shared/summary-email/renderSummaryEmail'

import ConvertService from '../../convert/convert.service'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../../forms/forms.errors.enum'
import PrismaService from '../../prisma/prisma.service'
import { getFileIdsToInfoMap } from '../../utils/files'
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
} from './dtos/email-forms.errors.enum'

@Injectable()
export default class EmailFormsSubservice {
  private logger: Logger

  constructor(
    private throwerErrorGuard: ThrowerErrorGuard,
    private prismaService: PrismaService,
    private mailgunService: MailgunService,
    private configService: ConfigService,
    private convertService: ConvertService,
  ) {
    this.logger = new Logger('EmailFormsSubservice')
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  async sendEmailForm(
    formId: string,
    userEmail: string | null,
    userFirstName: string | null,
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

    const jwtSecret = this.configService.getOrThrow<string>('JWT_SECRET')
    const selfUrl = this.configService.getOrThrow<string>('SELF_URL')

    await this.mailgunService.sendOloEmail(
      {
        to: formDefinition.email,
        template: MailgunTemplateEnum.OLO_SEND_FORM,
        data: {
          formId: form.id,
          messageSubject: formTitle,
          firstName: null,
          slug: formDefinition.slug,
          htmlData: await renderSummaryEmail({
            formDefinition,
            formData: jsonDataExtraDataOmitted,
            serverFiles: form.files,
            fileIdInfoMap: getFileIdsToInfoMap(form, jwtSecret, selfUrl),
          }),
        },
      },
      formDefinition.email,
    )

    const userConfirmationEmail =
      userEmail ??
      formDefinition.extractEmail(form.formDataJson as GenericObjectType)

    // Send confirmation email to user
    if (userConfirmationEmail) {
      // Generate confirmation pdf and send to user.
      const file = await this.convertService.generatePdf(
        jsonDataExtraDataOmitted,
        form.id,
        formDefinition,
      )
      const attachments = [
        {
          filename: `potvrdenie.pdf`,
          content: file,
        },
      ]
      const name = (() => {
        if (userFirstName) {
          return userFirstName
        }
        if (formDefinition.extractName) {
          return (
            formDefinition.extractName(
              form.formDataJson as GenericObjectType,
            ) ?? null
          )
        }

        return null
      })()

      try {
        await this.mailgunService.sendOloEmail(
          {
            to: userConfirmationEmail,
            template: MailgunTemplateEnum.OLO_DELIVERED_SUCCESS,
            data: {
              formId: form.id,
              messageSubject: formTitle,
              firstName: name,
              slug: formDefinition.slug,
            },
          },
          formDefinition.email,
          attachments,
        )
      } catch (error) {
        alertError(
          `Sending confirmation email to ${userConfirmationEmail} for form ${formId} failed.`,
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
          state: FormState.FINISHED,
          error: FormError.NONE,
        },
      })
      .catch((error) => {
        alertError(
          `Setting form state with id ${formId} to FINISHED failed.`,
          this.logger,
          JSON.stringify(error),
        )
      })
  }
}
