import inquirer from 'inquirer'
import { createWriteStream } from 'fs'
import fs from 'fs/promises'
import path from 'path'
import archiver from 'archiver'
import { formDefinitions } from '../src/definitions/formDefinitions'
import {
  FormDefinitionSlovenskoSk,
  isSlovenskoSkFormDefinition,
} from '../src/definitions/formDefinitionTypes'
import { getSlovenskoSkContainerFiles } from '../src/slovensko-sk/getSlovenskoSkContainerFiles'
import { get as getAppRootDir } from 'app-root-dir'
import { devFormDefinitions } from '../src/definitions/devFormDefinitions'

const rootDir = getAppRootDir()

async function generateSchemas(form: FormDefinitionSlovenskoSk, validFrom: string) {
  const outputDir = path.join(rootDir, 'dist-schemas', form.slug)
  const containerFiles = getSlovenskoSkContainerFiles(form, validFrom)

  await fs.mkdir(outputDir, { recursive: true })

  await fs.writeFile(
    path.join(outputDir, 'schema.json'),
    JSON.stringify(form.schemas.schema, null, 2),
  )
  await fs.writeFile(
    path.join(outputDir, 'uiSchema.json'),
    JSON.stringify(form.schemas.uiSchema, null, 2),
  )

  const outputFile = path.join(outputDir, 'container.zip')
  const output = createWriteStream(outputFile)
  const archive = archiver('zip', { zlib: { level: 9 } })

  archive.pipe(output)

  for (const [filePath, content] of Object.entries(containerFiles)) {
    archive.append(content, { name: filePath })
  }

  await archive.finalize()

  return outputDir
}

function getTomorrowDate() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0] // Format as YYYY-MM-DD
}

function isValidDate(input: string) {
  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(input) && !isNaN(new Date(input).getTime())
  return isValidDate || 'Please enter a valid date in YYYY-MM-DD format'
}

async function main() {
  const allForms = [...formDefinitions, ...devFormDefinitions].filter(isSlovenskoSkFormDefinition)

  const {
    selectedOption,
    validFrom,
  }: {
    selectedOption: 'all' | FormDefinitionSlovenskoSk
    validFrom: string
  } = await inquirer.prompt(
    // @ts-expect-error Inquirer typings don't work well
    [
      {
        type: 'list',
        name: 'selectedOption',
        message: 'Select an option:',
        choices: [
          { name: 'All form definitions', value: 'all' },
          ...allForms.map((form) => ({
            name: form.title,
            value: form,
          })),
        ],
      },
      {
        type: 'input',
        name: 'validFrom',
        message: 'Valid from (YYYY-MM-DD):',
        default: getTomorrowDate(),
        validate: isValidDate,
      },
    ],
  )

  let formsToProcess = []

  if (selectedOption === 'all') {
    formsToProcess = allForms
  } else {
    formsToProcess = [selectedOption]
  }

  for (const form of formsToProcess) {
    const outputDir = await generateSchemas(form, validFrom)
    console.log(`Generated schemas for ${form.title} in ${outputDir}`)
  }

  console.log('All schemas generated successfully.')
}

main().catch((error) => {
  console.error('An error occurred:', error)
  process.exit(1)
})
