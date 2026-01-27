import inquirer from 'inquirer'
import { createReadStream, createWriteStream } from 'fs'
import fs from 'fs/promises'
import path from 'path'
import archiver from 'archiver'
import { formDefinitions } from '../src/definitions/formDefinitions'
import {
  FormDefinitionSlovenskoSk,
  isSlovenskoSkFormDefinition,
} from '../src/definitions/formDefinitionTypes'
import { getSlovenskoSkContainerFiles } from '../src/slovensko-sk/containerFiles'
import { get as getAppRootDir } from 'app-root-dir'
import { devFormDefinitions } from '../src/definitions/devFormDefinitions'
import unzipper from 'unzipper'
import { rimraf } from 'rimraf'
import { SharedLogger } from '../src/utils/sharedLogger'

const rootDir = getAppRootDir()
const logger = new SharedLogger('generateSlovenskoSkContainer.ts')

async function generateFiles(formDefinition: FormDefinitionSlovenskoSk, validFrom: string) {
  const outputDir = path.join(rootDir, 'dist-schemas', formDefinition.slug)
  const containerFiles = getSlovenskoSkContainerFiles(formDefinition, validFrom)

  await rimraf(outputDir)
  await fs.mkdir(outputDir, { recursive: true })

  await fs.writeFile(
    path.join(outputDir, 'schema.json'),
    JSON.stringify(formDefinition.schema, null, 2),
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

async function unzipFile(sourceFile: string, targetDir: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    createReadStream(sourceFile)
      .pipe(unzipper.Extract({ path: targetDir }))
      .on('close', () => resolve())
      .on('error', (error: Error) => reject(error))
  })
}

async function main() {
  const allFormDefinitions = [...formDefinitions, ...devFormDefinitions].filter(
    isSlovenskoSkFormDefinition,
  )

  const {
    selectedFormDefinition,
    validFrom,
    unzip,
  }: {
    selectedFormDefinition: FormDefinitionSlovenskoSk
    validFrom: string
    unzip: boolean
  } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedFormDefinition',
      message: 'Select a form definition:',
      choices: allFormDefinitions.map((formDefinition) => ({
        name: formDefinition.title,
        value: formDefinition,
      })),
    },
    {
      type: 'input',
      name: 'validFrom',
      message: 'Valid from (YYYY-MM-DD):',
      default: getTomorrowDate(),
      validate: isValidDate,
    },
    {
      type: 'confirm',
      name: 'unzip',
      message: 'Do you want to unzip the container.zip file?',
      default: false,
    },
  ])

  const outputDir = await generateFiles(selectedFormDefinition, validFrom)
  logger.log(`Generated schemas for ${selectedFormDefinition.title} in ${outputDir}`)

  if (unzip) {
    const zipFile = path.join(outputDir, 'container.zip')
    const unzipDir = path.join(outputDir, 'container')

    try {
      await fs.mkdir(unzipDir, { recursive: true })
      await unzipFile(zipFile, unzipDir)
      logger.log(`Unzipped container.zip to ${unzipDir}`)
    } catch (error) {
      logger.error('Error unzipping file:', error)
    }
  }
}

main().catch((error) => {
  logger.error('An error occurred:', error)
  process.exit(1)
})
