import { Prisma } from '@prisma/client'

export type FormWithSelectedProperties = Prisma.FormsGetPayload<{
  select: {
    id: true
    updatedAt: true
    createdAt: true
    state: true
    error: true
    formDataJson: true
    schemaVersionId: true
    schemaVersion: {
      select: {
        messageSubjectFormat: true
        schema: true
        uiSchema: true
      }
    }
  }
}>
