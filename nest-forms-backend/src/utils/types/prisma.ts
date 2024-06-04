import { Prisma } from '@prisma/client'

export type FormWithFiles = Prisma.FormsGetPayload<{
  include: {
    files: true
  }
}>

export type FormWithSelectedProperties = Prisma.FormsGetPayload<{
  select: {
    id: true
    updatedAt: true
    createdAt: true
    state: true
    error: true
    formDataJson: true
  }
}>
