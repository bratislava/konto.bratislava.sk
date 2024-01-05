import * as fs from 'node:fs'

import { parse } from 'ts-command-line-args'

import priznanieKDaniZNehnutelnosti from './definitions/priznanie-k-dani-z-nehnutelnosti'
// import showcase from './definitions/showcase'
import stanoviskoKInvesticnemuZameru from './definitions/stanovisko-k-investicnemu-zameru'
import zavazneStanoviskoKInvesticnejCinnosti from './definitions/zavazne-stanovisko-k-investicnej-cinnosti'

type Args = {
  source: string
}

export const args = parse<Args>({
  source: String,
})

const definitions = {
  // showcase,
  'stanovisko-k-investicnemu-zameru': stanoviskoKInvesticnemuZameru,
  'zavazne-stanovisko-k-investicnej-cinnosti': zavazneStanoviskoKInvesticnejCinnosti,
  'priznanie-k-dani-z-nehnutelnosti': priznanieKDaniZNehnutelnosti,
} as const

const chosenDefinitions: Array<keyof typeof definitions> = []

// ugly because of ts - pushes either the chosen definition or all definitions according to source
if (definitions[args.source as keyof typeof definitions])
  chosenDefinitions.push(args.source as keyof typeof definitions)
if (args.source === 'all')
  chosenDefinitions.push(...(Object.keys(definitions) as typeof chosenDefinitions))

if (chosenDefinitions.length) {
  chosenDefinitions.forEach((definitionKey) => {
    fs.mkdirSync(`./dist/${definitionKey}`, { recursive: true })
    fs.writeFileSync(
      `./dist/${definitionKey}/schema.json`,
      JSON.stringify(definitions[definitionKey].schema, null, 2),
    )
    fs.writeFileSync(
      `./dist/${definitionKey}/uiSchema.json`,
      JSON.stringify(definitions[definitionKey].uiSchema, null, 2),
    )
  })
} else {
  console.error(`Definition for ${args.source} not found.`)
}
