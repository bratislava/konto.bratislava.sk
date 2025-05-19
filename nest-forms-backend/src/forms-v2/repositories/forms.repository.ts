import { Injectable } from '@nestjs/common'
import { Forms } from '@prisma/client'

import PrismaService from '../../prisma/prisma.service'

@Injectable()
export class FormsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  createForm({
    userExternalId,
    formDefinitionSlug,
    jsonVersion,
    ico,
  }: Pick<
    Forms,
    'userExternalId' | 'formDefinitionSlug' | 'jsonVersion' | 'ico'
  >) {
    return this.prismaService.forms.create({
      data: {
        userExternalId,
        formDefinitionSlug,
        jsonVersion,
        ico,
      },
    })
  }
}
