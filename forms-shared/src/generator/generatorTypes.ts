import type { RJSFSchema } from '@rjsf/utils'

export type GeneratorField = {
  property: string
  schema: RJSFSchema
  required: boolean
}

export type GeneratorObjectField = Omit<GeneratorField, 'property'> & {
  property: string | null
}

export type GeneratorConditionalFields = {
  condition: RJSFSchema
  thenSchema: RJSFSchema
  elseSchema?: RJSFSchema
}

export type GeneratorFieldType = GeneratorField | GeneratorConditionalFields | GeneratorObjectField

export type GeneratorBaseOptions = {
  title: string
  required?: boolean
}
