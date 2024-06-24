import * as fs from 'node:fs'

import { parse } from 'ts-command-line-args'
import { formDefinitions } from '../src/definitions/formDefinitions'
import { getFormDefinitionBySlug } from '../src/definitions/getFormDefinitionBySlug'

type Args = {
  source: string
}

export const args = parse<Args>({
  source: String,
})

let chosenDefinitions: typeof formDefinitions

if (args.source === 'all') {
  chosenDefinitions = formDefinitions
} else {
  const formDefinition = getFormDefinitionBySlug(args.source)
  if (!formDefinition) {
    console.error(`Form definition for ${args.source} not found.`)
    process.exit(1)
  }
  chosenDefinitions = [formDefinition]
}

chosenDefinitions.forEach((formDefinition) => {
  fs.mkdirSync(`./dist-schemas/${formDefinition.slug}`, { recursive: true })
  fs.writeFileSync(
    `./dist-schemas/${formDefinition.slug}/schema.json`,
    JSON.stringify(formDefinition.schemas.schema, null, 2),
  )
  fs.writeFileSync(
    `./dist-schemas/${formDefinition.slug}/uiSchema.json`,
    JSON.stringify(formDefinition.schemas.uiSchema, null, 2),
  )
})
