import { Prisma } from '../../generated/prisma/client'
import { userFactory } from './user.factory'

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    physicalEntity: true
    deliveryMethodUserHistory: true
  }
}>

export const userWithRelationsFactory = (
  overrides: Partial<UserWithRelations> = {}
): UserWithRelations => ({
  ...userFactory(),
  physicalEntity: null,
  deliveryMethodUserHistory: [],
  ...overrides,
})
