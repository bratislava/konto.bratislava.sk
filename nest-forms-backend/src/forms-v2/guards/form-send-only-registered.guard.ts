import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'

import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../../forms/forms.errors.enum'
import PrismaService from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import { FormSendService } from '../services/form-send.service'

@Injectable()
export class FormSendOnlyRegisteredGuard implements CanActivate {
  constructor(
    private readonly formSendService: FormSendService,
    private readonly prismaService: PrismaService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {}

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
      throw this.throwerErrorGuard.InternalServerErrorException(
        FormsErrorsEnum.FORM_NOT_REGISTERED_IN_SLOVENSKO_SK,
        FormsErrorsResponseEnum.FORM_NOT_REGISTERED_IN_SLOVENSKO_SK,
        `Form definition with slug ${form.formDefinitionSlug} is not registered in slovensko.sk.`,
      )
    }

    return result
  }
}
