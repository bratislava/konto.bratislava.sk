import { Prisma, PrismaClient } from '@prisma/client'
import { isSlovenskoSkFormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { createFormSignature } from 'forms-shared/signer/signature'
import { validateExtractAsice } from 'forms-shared/signer/validateExtractAsice'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting form signature migration...')
  let processedCount = 0
  let errorCount = 0
  let continueProcessing = true
  const failedFormIds = new Set<string>()

  while (continueProcessing) {
    await prisma.$transaction(async (tx) => {
      const [form] = await tx.forms.findMany({
        where: {
          AND: [
            {
              AND: [
                { formDataBase64: { not: null } },
                { formDataBase64: { not: '' } },
              ],
            },
            {
              id: { notIn: [...failedFormIds] },
              formSignature: { equals: Prisma.AnyNull },
            },
          ],
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

        if (!isSlovenskoSkFormDefinition(formDefinition)) {
          throw new Error(`Form ${form.id} is not a slovensko.sk form`)
        }

        if (!form.formDataJson || !form.formDataBase64) {
          throw new Error(`Form ${form.id} has no data`)
        }

        console.log(`Generating signature for form ${form.id}...`)
        const formSignature = createFormSignature(
          formDefinition,
          form.formDataBase64,
          form.formDataJson,
        )
        try {
          const formDataBase64NoSpaces = form.formDataBase64.replaceAll(
            /\s/g,
            '',
          )
          const { formDataHash } = await validateExtractAsice(
            formDataBase64NoSpaces,
          )
          if (formDataHash !== formSignature.formDataHash) {
            console.log(
              `Replacing formDataHash for form ${form.id}, old: ${formSignature.formDataHash}, new: ${formDataHash}`,
            )
            formSignature.formDataHash = formDataHash
          }
        } catch (error) {
          console.log(
            `Error extractinng formDataHash for form ${form.id}:`,
            error,
          )
        }

        console.log(`Updating form ${form.id} with signature...`)
        await tx.forms.update({
          where: { id: form.id },
          data: {
            formSignature,
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
