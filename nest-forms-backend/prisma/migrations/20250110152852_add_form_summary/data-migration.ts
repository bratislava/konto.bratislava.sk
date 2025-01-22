import { Prisma, PrismaClient } from '@prisma/client'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { createSingleUseValidatorRegistry } from 'forms-shared/form-utils/validatorRegistry'
import { getFormSummary } from 'forms-shared/summary/summary'

const prisma = new PrismaClient()

async function main() {
  const validatorRegistry = createSingleUseValidatorRegistry()
  console.log('Starting form summary migration...')
  let processedCount = 0
  let errorCount = 0
  let continueProcessing = true
  const failedFormIds = new Set<string>()

  while (continueProcessing) {
    await prisma.$transaction(async (tx) => {
      const [form] = await tx.forms.findMany({
        where: {
          state: { not: 'DRAFT' },
          formSummary: { equals: Prisma.AnyNull },
          id: { notIn: [...failedFormIds] },
        },
        take: 1,
      })

      if (!form) {
        console.log('No more forms to process')
        continueProcessing = false
        return
      }

      console.log(`Processing form ${form.id} (${form.formDefinitionSlug})...`)

      try {
        const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
        if (!formDefinition)
          throw new Error(
            `Definition not found for slug ${form.formDefinitionSlug}`,
          )

        if (!form.formDataJson) {
          throw new Error(`Form ${form.id} has no data`)
        }

        console.log(`Generating summary for form ${form.id}...`)
        const formSummary = getFormSummary(
          formDefinition,
          form.formDataJson,
          validatorRegistry,
        )

        console.log(`Updating form ${form.id} with summary...`)
        await tx.forms.update({
          where: { id: form.id },
          data: {
            formSummary,
          },
        })
        console.log(`Successfully processed form ${form.id}`)
        processedCount++
      } catch (error) {
        console.error(`Error processing form ${form.id}:`, error)
        failedFormIds.add(form.id)
        errorCount++
      }
    })
  }

  console.log(
    `Migration completed. Processed: ${processedCount}, Errors: ${errorCount}, Failed IDs: ${[...failedFormIds].join(', ')}`,
  )
}

main()
  .catch(async (error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => prisma.$disconnect())
