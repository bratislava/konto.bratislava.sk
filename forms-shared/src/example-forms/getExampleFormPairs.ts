import { FormDefinition } from '../definitions/formDefinitionTypes'
import {
  getFormDefinitionBySlug,
  getFormDefinitionBySlugDev,
} from '../definitions/getFormDefinitionBySlug'
import flatten from 'lodash/flatten'
import { exampleDevForms, exampleForms } from './exampleForms'
import { ExampleForm } from './types'

type ExampleFormPair = {
  formDefinition: FormDefinition
  exampleForm: ExampleForm
}

export function getExampleFormPairs({
  formDefinitionFilterFn = () => true,
  includeDevForms = false,
}: {
  formDefinitionFilterFn?: (formDefinition: FormDefinition) => boolean
  includeDevForms?: boolean
} = {}): ExampleFormPair[] {
  const getFormDefinitionBySlugLocal = includeDevForms
    ? getFormDefinitionBySlugDev
    : getFormDefinitionBySlug
  const exampleFormsLocal = includeDevForms ? {...exampleForms, ...exampleDevForms} : exampleForms

  const slugs = Object.keys(exampleFormsLocal)
  const formDefinitions = slugs
    .map(getFormDefinitionBySlugLocal)
    .filter(
      (formDefinition) => formDefinition != null && formDefinitionFilterFn(formDefinition),
    ) as FormDefinition[]

  const withExampleForms = formDefinitions.map((formDefinition) => {
    const exampleFormsBySlug = exampleFormsLocal[formDefinition.slug]
    return exampleFormsBySlug.map((exampleForm) => ({ formDefinition, exampleForm }))
  })

  return flatten(withExampleForms)
}
