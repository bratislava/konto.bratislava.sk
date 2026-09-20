import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'

import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import { FormsErrorsEnum, FormsErrorsResponseEnum } from '../forms.errors.enum'
import FormsService from '../forms.service'

@Injectable()
export class FormMustBeEditableGuard implements CanActivate {
  constructor(
    private readonly formsService: FormsService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const { formId } = request.params

    if (!formId || typeof formId !== 'string') {
      throw this.throwerErrorGuard.BadRequestException(
        FormsErrorsEnum.FORM_ID_ERROR,
        FormsErrorsResponseEnum.FORM_ID_ERROR,
      )
    }

    const form = await this.formsService.getForm(formId)

    if (!this.formsService.isEditable(form)) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormsErrorsEnum.FORM_NOT_EDITABLE_ERROR,
        `${FormsErrorsResponseEnum.FORM_NOT_EDITABLE_ERROR} Current form state is: ${form.state}.`,
      )
    }

    return true
  }
}
