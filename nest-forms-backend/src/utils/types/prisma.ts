import { Prisma } from '@prisma/client'

export type FormWithSchemaAndVersion = Prisma.FormsGetPayload<{
  include: {
    schemaVersion: {
      include: {
        schema: true
      }
    }
  }
}>

export type FormWithSchemaVersionAndFiles = Prisma.FormsGetPayload<{
  include: {
    schemaVersion: {
      include: {
        schema: true
      }
    }
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
