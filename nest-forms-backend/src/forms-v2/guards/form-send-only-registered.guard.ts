import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'

import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../../forms/forms.errors.enum'
import PrismaService from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import { FormSendService } from '../services/form-send.service'

@Injectable()
export class FormSendOnlyRegisteredGuard implements CanActivate {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly formSendService: FormSendService,
    private readonly prismaService: PrismaService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {
    this.logger = new LineLoggerSubservice(FormSendOnlyRegisteredGuard.name)
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const { formId } = request.params

    const form = await this.prismaService.forms.findUnique({
      select: { formDefinitionSlug: true },
      where: { id: formId },
    })

    if (!form) {
      return false
    }

    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)

    if (!formDefinition) {
      return false
    }

    const result =
      await this.formSendService.isFormRegisteredInSlovenskoSk(formDefinition)

    if (!result) {
      // log it so we will be alerted in grafana
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          FormsErrorsEnum.FORM_NOT_REGISTERED_IN_SLOVENSKO_SK,
          FormsErrorsResponseEnum.FORM_NOT_REGISTERED_IN_SLOVENSKO_SK,
          `Form definition with slug ${form.formDefinitionSlug} is not registered in slovensko.sk.`,
        ),
      )
    }

    return result
  }
}
