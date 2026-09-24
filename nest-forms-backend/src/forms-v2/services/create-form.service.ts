import { ErrorFactoryService } from '@bratislava/log-nest'
import { Injectable } from '@nestjs/common'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'

import { User } from '../../auth-v2/types/user'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../../forms/forms.errors.enum'
import PrismaService from '../../prisma/prisma.service'
import { CreateFormInput } from '../inputs/create-form.input'
import { getUserFormFields } from '../utils/get-user-form-fields'

@Injectable()
export class CreateFormService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly errorFactoryService: ErrorFactoryService,
  ) {}

  async createForm(requestData: CreateFormInput, user: User) {
    const formDefinition = getFormDefinitionBySlug(
      requestData.formDefinitionSlug,
    )
    if (!formDefinition) {
      // TODO: Errors
      throw this.errorFactoryService.NotFoundException({
        errorEnum: FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        message: `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${requestData.formDefinitionSlug}`,
      })
    }

    if (formDefinition.isDisabled) {
      throw this.errorFactoryService.ForbiddenException({
        errorEnum: FormsErrorsEnum.FORM_DEFINITION_DISABLED,
        message: FormsErrorsResponseEnum.FORM_DEFINITION_DISABLED,
        console: { slug: requestData.formDefinitionSlug },
      })
    }

    return this.prismaService.forms.create({
      data: {
        formDefinitionSlug: requestData.formDefinitionSlug,
        jsonVersion: formDefinition.jsonVersion,
        ...getUserFormFields(user),
      },
    })
  }
}
