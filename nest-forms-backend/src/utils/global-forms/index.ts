// all schemas/xml files should be named and exported from this file
// TODO figure out what we need to export & which files we need for each eform
// TODO figure out whether to store the schema files in this repo or in a different lib

import { JSONSchema7Definition } from 'json-schema'

import FormDefinition from '../global-dtos/form.dto'
import dopravneZnacenie from './dopravneZnacenie'
import kontajneroveStojiska from './kontajneroveStojiska'
import stanoviskoKInvesticnemuZameru from './stanoviskoKInvesticnemuZameru'
import test from './testForm'
import zastitaPrimatora from './zastitaPrimatora'
import zavazneStanoviskoKInvesticnejCinnosti from './zavazneStanoviskoKInvesticnejCinnosti'
import ziadostOUzemnoplanovaciuInformaciu from './ziadostOUzemnoplanovaciuInformaciu'

const formDefinitions = {
  dopravneZnacenie,
  kontajneroveStojiska,
  test,
  zavazneStanoviskoKInvesticnejCinnosti,
  zastitaPrimatora,
  stanoviskoKInvesticnemuZameru,
  ziadostOUzemnoplanovaciuInformaciu,
} satisfies Record<string, FormDefinition>

export type FormDefinitionsKeys = keyof typeof formDefinitions
export type JsonSchema = JSONSchema7Definition

export default formDefinitions
