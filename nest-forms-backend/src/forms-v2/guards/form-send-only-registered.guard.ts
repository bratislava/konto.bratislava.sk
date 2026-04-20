import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'
import { isSlovenskoSkFormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'

import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../../forms/forms.errors.enum'
import FormRegistrationStatusRepository from '../../nases/utils-services/form-registration-status.repository'
import PrismaService from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'

@Injectable()
export class FormSendOnlyRegisteredGuard implements CanActivate {
  constructor(
    private readonly formRegistrationStatusRepository: FormRegistrationStatusRepository,
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

    if (!isSlovenskoSkFormDefinition(formDefinition)) {
      return true
    }

    const isRegistered =
      await this.formRegistrationStatusRepository.isFormRegisteredInSlovenskoSk(
        formDefinition,
      )

    if (!isRegistered) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        FormsErrorsEnum.FORM_NOT_REGISTERED_IN_SLOVENSKO_SK,
        FormsErrorsResponseEnum.FORM_NOT_REGISTERED_IN_SLOVENSKO_SK,
        `Form definition with slug ${form.formDefinitionSlug}, pospId ${formDefinition.pospID}, pospVersion ${formDefinition.pospVersion} is not registered in slovensko.sk.`,
      )
    }

    return true
  }
}
