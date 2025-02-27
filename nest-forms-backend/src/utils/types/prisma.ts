import { Forms, Prisma } from '@prisma/client'

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
    formDefinitionSlug: true
  }
}>

export type EmailFormChecked = FormWithFiles & {
  formSummary: NonNullable<Forms['formSummary']>
  formDataJson: NonNullable<Forms['formDataJson']>
}

export function isEmailFormChecked(form: Forms): form is EmailFormChecked {
  return form.formDataJson !== null && form.formSummary !== null
}
