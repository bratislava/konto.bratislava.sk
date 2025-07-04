import { TestingModule } from '@nestjs/testing'
import { Forms } from '@prisma/client'

import PrismaService from '../../../src/prisma/prisma.service'

export class FormsFixtureRepository {
  private prismaService: PrismaService

  constructor(private readonly testingModule: TestingModule) {
    this.prismaService = testingModule.get(PrismaService)
  }

  async get(formId: Forms['id']) {
    return this.prismaService.forms.findUnique({
      where: { id: formId },
    })
  }

  async deleteMany(formIds: Forms['id'][]) {
    return this.prismaService.forms.deleteMany({
      where: { id: { in: formIds } },
    })
  }
}
