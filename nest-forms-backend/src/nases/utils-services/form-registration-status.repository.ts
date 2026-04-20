import { Injectable } from '@nestjs/common'
import { FormDefinitionSlovenskoSk } from 'forms-shared/definitions/formDefinitionTypes'

import PrismaService from '../../prisma/prisma.service'

@Injectable()
export default class FormRegistrationStatusRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async isFormRegisteredInSlovenskoSk(
    formDefinition: FormDefinitionSlovenskoSk,
  ): Promise<boolean> {
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

    return !!registrationStatus?.isRegistered
  }

  async setStatus(
    formDefinition: FormDefinitionSlovenskoSk,
    isRegistered: boolean,
  ): Promise<void> {
    await this.prismaService.formRegistrationStatus.upsert({
      where: {
        slug_pospId_pospVersion: {
          slug: formDefinition.slug,
          pospId: formDefinition.pospID,
          pospVersion: formDefinition.pospVersion,
        },
      },
      create: {
        slug: formDefinition.slug,
        pospId: formDefinition.pospID,
        pospVersion: formDefinition.pospVersion,
        isRegistered,
      },
      update: {
        isRegistered,
      },
    })
  }
}
