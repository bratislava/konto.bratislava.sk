import { ErrorFactoryService } from '@bratislava/log-nest'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'

import { FormsErrorsEnum, FormsErrorsResponseEnum } from '../forms.errors.enum'
import FormsService from '../forms.service'

@Injectable()
export class FormMustBeEditableGuard implements CanActivate {
  constructor(
    private readonly formsService: FormsService,
    private readonly errorFactoryService: ErrorFactoryService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const { formId } = request.params

    if (!formId || typeof formId !== 'string') {
      throw this.errorFactoryService.BadRequestException({
        errorEnum: FormsErrorsEnum.FORM_ID_ERROR,
        message: FormsErrorsResponseEnum.FORM_ID_ERROR,
      })
    }

    const form = await this.formsService.getForm(formId)

    if (!this.formsService.isEditable(form)) {
      throw this.errorFactoryService.UnprocessableEntityException({
        errorEnum: FormsErrorsEnum.FORM_NOT_EDITABLE_ERROR,
        message: `${FormsErrorsResponseEnum.FORM_NOT_EDITABLE_ERROR} Current form state is: ${form.state}.`,
      })
    }

    return true
  }
}
