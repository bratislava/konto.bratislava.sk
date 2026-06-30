import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'

import { User } from '../../auth-v2/types/user'
import { ALLOW_COMPLETED_DISABLED_FORMS_KEY } from '../../forms-v2/decorators/allow-completed-disabled-forms.decorator'
import FormsService from '../forms.service'

interface RequestWithUser extends Request {
  user?: User
}

@Injectable()
export class FormMustBeEnabledGuard implements CanActivate {
  constructor(
    private readonly formsService: FormsService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>()
    const { formId } = request.params

    if (!formId || typeof formId !== 'string') {
      // TODO: Errors
      throw new BadRequestException('formId path parameter is required')
    }

    const form = await this.formsService.getForm(formId)

    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (!formDefinition) {
      // TODO: Errors
      throw new NotFoundException('form definition not found')
    }

    if (formDefinition.isDisabled) {
      const allowCompletedDisabledForms =
        this.reflector.getAllAndOverride<boolean>(
          ALLOW_COMPLETED_DISABLED_FORMS_KEY,
          [context.getHandler(), context.getClass()],
        )

      if (!allowCompletedDisabledForms || this.formsService.isEditable(form)) {
        // TODO: Errors
        throw new ForbiddenException('form definition is disabled')
      }
    }

    return true
  }
}
