import { BaFieldType, CustomComponentFieldUiOptions, CustomComponentType } from '../uiOptionsTypes'
import { GeneratorField } from '../generatorTypes'
import { removeUndefinedValues } from '../helpers'

/**
 * This is a special field that represents no data in the schema. It is a "hacky way", but the easiest how to display
 * custom components in the UI anywhere we need.
 */
export const customComponentsField = (
  property: string,
  customComponents: CustomComponentType | CustomComponentType[],
  uiOptions: Omit<CustomComponentFieldUiOptions, 'customComponents'>,
): GeneratorField => ({
  property,
  // This is probably the best way how to represent no data in the schema, but still have the field in the UI.
  schema: removeUndefinedValues({
    anyOf: [{}],
    baUiSchema: {
      'ui:field': BaFieldType.CustomComponents,
      'ui:options': {
        ...uiOptions,
        customComponents: Array.isArray(customComponents) ? customComponents : [customComponents],
      },
      // If this wouldn't be present, the RJSF will render the field in place of `customComponent__anyOf_select`, now it
      // is rendered directly where it should be.
      'ui:fieldReplacesAnyOrOneOf': true,
    },
  }),
  required: false,
})
