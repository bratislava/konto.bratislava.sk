import { Injectable } from '@nestjs/common'
import {
  FormDefinition,
  isSlovenskoSkFormDefinition,
} from 'forms-shared/definitions/formDefinitionTypes'

import PrismaService from '../../prisma/prisma.service'

@Injectable()
export class FormSendService {
  constructor(private readonly prismaService: PrismaService) {}

  async isFormRegisteredInSlovenskoSk(
    formDefinition: FormDefinition,
  ): Promise<boolean> {
    if (!isSlovenskoSkFormDefinition(formDefinition)) {
      return true
    }

    const registrationStatus =
      await this.prismaService.formRegistrationStatus.findUnique({
        select: {
          isRegistered: true,
        },
        where: {
          slug_pospId_pospVersion: {
            slug: formDefinition.slug,
            pospId: formDefinition.pospID,
            pospVersion: formDefinition.pospVersion,
          },
        },
      })

    return !registrationStatus || registrationStatus.isRegistered
  }
}
