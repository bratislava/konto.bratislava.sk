import { Injectable } from '@nestjs/common'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'

import { User } from '../../auth-v2/types/user'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../../forms/forms.errors.enum'
import PrismaService from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import { CreateFormInput } from '../inputs/create-form.input'
import { getUserFormFields } from '../utils/get-user-form-fields'

@Injectable()
export class CreateFormService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly prismaService: PrismaService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {
    this.logger = new LineLoggerSubservice(CreateFormService.name)
  }

  async createForm(requestData: CreateFormInput, user: User) {
    const formDefinition = getFormDefinitionBySlug(
      requestData.formDefinitionSlug,
    )
    if (!formDefinition) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${requestData.formDefinitionSlug}`,
      )
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
