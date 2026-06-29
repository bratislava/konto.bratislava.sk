import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Request } from 'express'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import PrismaService from 'src/prisma/prisma.service'

import { User } from '../../auth-v2/types/user'

interface RequestWithUser extends Request {
  user?: User
}

@Injectable()
export class FormMustBeEnabledGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>()
    const { formId } = request.params

    if (!formId || typeof formId !== 'string') {
      // TODO: Errors
      throw new BadRequestException('formId path parameter is required')
    }

    const form = await this.prismaService.forms.findUnique({
      where: { id: formId },
    })
    if (!form) {
      // TODO: Errors
      throw new NotFoundException('form not found')
    }

    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (!formDefinition) {
      // TODO: Errors
      throw new NotFoundException('form definition not found')
    }
    if (formDefinition.isDisabled) {
      // TODO: Errors
      throw new ForbiddenException('form definition is disabled')
    }

    return true
  }
}
