import { FormDefinition } from '../definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from '../definitions/getFormDefinitionBySlug'
import flatten from 'lodash/flatten'
import { exampleForms } from './exampleForms'
import { ExampleForm } from './types'

type ExampleFormPair = {
  formDefinition: FormDefinition
  exampleForm: ExampleForm
}

export function getExampleFormPairs({
  formDefinitionFilterFn = () => true,
}: {
  formDefinitionFilterFn?: (formDefinition: FormDefinition) => boolean
} = {}): ExampleFormPair[] {
  const slugs = Object.keys(exampleForms)
  const formDefinitions = slugs
    .map(getFormDefinitionBySlug)
    .filter(
      (formDefinition) => formDefinition != null && formDefinitionFilterFn(formDefinition),
    ) as FormDefinition[]

  const withExampleForms = formDefinitions.map((formDefinition) => {
    const exampleFormsBySlug = exampleForms[formDefinition.slug]
    return exampleFormsBySlug.map((exampleForm) => ({ formDefinition, exampleForm }))
  })

  return flatten(withExampleForms)
}
