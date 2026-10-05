import { ErrorFactoryService } from '@bratislava/log-nest'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'

import { User } from '../../auth-v2/types/user'
import { ALLOW_COMPLETED_DISABLED_FORMS_KEY } from '../../forms-v2/decorators/allow-completed-disabled-forms.decorator'
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
    private readonly errorFactoryService: ErrorFactoryService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>()
    const { formId } = request.params

    if (!formId || typeof formId !== 'string') {
      throw this.errorFactoryService.BadRequestException({
        errorEnum: FormsErrorsEnum.FORM_ID_ERROR,
        message: FormsErrorsResponseEnum.FORM_ID_ERROR,
      })
    }

    const form = await this.formsService.getForm(formId)
    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (!formDefinition) {
      throw this.errorFactoryService.NotFoundException({
        errorEnum: FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        message: `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
      })
    }

    if (formDefinition.isDisabled) {
      const allowCompletedDisabledForms =
        this.reflector.getAllAndOverride<boolean>(
          ALLOW_COMPLETED_DISABLED_FORMS_KEY,
          [context.getHandler(), context.getClass()],
        )

      if (!allowCompletedDisabledForms || this.formsService.isEditable(form)) {
        throw this.errorFactoryService.ForbiddenException({
          errorEnum: FormsErrorsEnum.FORM_DEFINITION_DISABLED,
          message: FormsErrorsResponseEnum.FORM_DEFINITION_DISABLED,
        })
      }
    }

    return true
  }
}
