import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'

import { User } from '../../auth-v2/types/user'
import { ALLOW_COMPLETED_DISABLED_FORMS_KEY } from '../../forms-v2/decorators/allow-completed-disabled-forms.decorator'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import { FormsErrorsEnum, FormsErrorsResponseEnum } from '../forms.errors.enum'
import FormsService from '../forms.service'

interface RequestWithUser extends Request {
  user?: User
}

@Injectable()
export class FormDefinitionMustBeEnabledGuard implements CanActivate {
  constructor(
    private readonly formsService: FormsService,
    private readonly reflector: Reflector,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>()
    const { formId } = request.params

    if (!formId || typeof formId !== 'string') {
      throw this.throwerErrorGuard.BadRequestException(
        FormsErrorsEnum.FORM_ID_ERROR,
        FormsErrorsResponseEnum.FORM_ID_ERROR,
      )
    }

    const form = await this.formsService.getForm(formId)
    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (!formDefinition) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
      )
    }

    if (formDefinition.isDisabled) {
      const allowCompletedDisabledForms =
        this.reflector.getAllAndOverride<boolean>(
          ALLOW_COMPLETED_DISABLED_FORMS_KEY,
          [context.getHandler(), context.getClass()],
        )

      if (!allowCompletedDisabledForms || this.formsService.isEditable(form)) {
        throw this.throwerErrorGuard.ForbiddenException(
          FormsErrorsEnum.FORM_DEFINITION_DISABLED,
          FormsErrorsResponseEnum.FORM_DEFINITION_DISABLED,
        )
      }
    }

    return true
  }
}
