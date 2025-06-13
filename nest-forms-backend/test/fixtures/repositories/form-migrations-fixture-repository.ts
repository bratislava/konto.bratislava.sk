import { TestingModule } from '@nestjs/testing'

import PrismaService from '../../../src/prisma/prisma.service'

export class FormMigrationsFixtureRepository {
  private prismaService: PrismaService

  constructor(private readonly testingModule: TestingModule) {
    this.prismaService = testingModule.get(PrismaService)
  }

  async findByGuestAndAuth(guestIdentityId: string, cognitoAuthSub: string) {
    return this.prismaService.formMigration.findMany({
      where: {
        cognitoGuestIdentityId: guestIdentityId,
        cognitoAuthSub,
      },
    })
  }

  async deleteMany(
    migrations: { cognitoAuthSub: string; cognitoGuestIdentityId: string }[],
  ) {
    if (migrations.length === 0) return

    this.prismaService.formMigration.deleteMany({
      where: {
        OR: migrations.map((migration) => ({
          cognitoAuthSub: migration.cognitoAuthSub,
          cognitoGuestIdentityId: migration.cognitoGuestIdentityId,
        })),
      },
    })
  }

  async expireMigration(
    cognitoAuthSub: string,
    cognitoGuestIdentityId: string,
  ) {
    const expiredDate = new Date(Date.now() - 1000) // 1 second ago
    return this.prismaService.formMigration.updateMany({
      where: {
        cognitoAuthSub,
        cognitoGuestIdentityId,
      },
      data: {
        expiresAt: expiredDate,
      },
    })
  }
}
