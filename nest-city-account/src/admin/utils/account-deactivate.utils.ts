import { User } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'

export const removePhysicalEntityUserIdRelation = async (
  prisma: PrismaService,
  userId: string
): Promise<void> => {
  const physicalEntity = await prisma.physicalEntity.findUnique({
    where: {
      userId,
    },
  })
  if (physicalEntity) {
    await prisma.physicalEntity.update({
      where: {
        userId,
      },
      data: {
        userId: null,
      },
    })
  }
}

export const removeUserDataFromDatabase = async (
  prisma: PrismaService,
  externalId: string
): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: {
      externalId,
    },
  })
  if (user) {
    await prisma.user.update({
      where: {
        externalId,
      },
      data: {
        email: null,
        birthNumber: null,
        ifo: null,
        birthnumberAlreadyExistsCounter: 0,
        birthnumberAlreadyExistsLast: null,
        userIdCardVerify: {
          deleteMany: {
            userId: user.id,
          },
        },
      },
    })

    await removePhysicalEntityUserIdRelation(prisma, user.id)
  }

  return user
}

export const removeLegalPersonDataFromDatabase = async (
  prisma: PrismaService,
  externalId: string
): Promise<void> => {
  const legalPerson = await prisma.legalPerson.findUnique({
    where: {
      externalId,
    },
  })

  if (legalPerson) {
    await prisma.legalPerson.update({
      where: {
        externalId,
      },
      data: {
        email: null,
        birthNumber: null,
        ico: null,
        birthnumberIcoAlreadyExistsCounter: 0,
        birthnumberIcoAlreadyExistsLast: null,
        legalPersonIcoIdCardVerify: {
          deleteMany: {
            legalPersonId: legalPerson.id,
          },
        },
      },
    })
  }
}
