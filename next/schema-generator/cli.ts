import * as fs from 'node:fs'

import { parse } from 'ts-command-line-args'

import priznanieKDaniZNehnutelnosti from './definitions/priznanieKDaniZNehnutelnosti'
import showcase from './definitions/showcase'
import stanoviskoKInvesticnemuZameru from './definitions/stanoviskoKInvesticnemuZameru'
import zavazneStanoviskoKInvesticnejCinnosti from './definitions/zavazneStanoviskoKInvesticnejCinnosti'

type Args = {
  source: string
}

export const args = parse<Args>({
  source: String,
})

const definition = {
  showcase,
  stanoviskoKInvesticnemuZameru,
  zavazneStanoviskoKInvesticnejCinnosti,
  priznanieKDaniZNehnutelnosti,
}[args.source]

if (definition) {
  fs.mkdirSync(`./dist/${args.source}`, { recursive: true })
  fs.writeFileSync(`./dist/${args.source}/schema.json`, JSON.stringify(definition.schema, null, 2))
  fs.writeFileSync(
    `./dist/${args.source}/uiSchema.json`,
    JSON.stringify(definition.uiSchema, null, 2),
  )
} else {
  console.error(`Definition for ${args.source} not found.`)
}
