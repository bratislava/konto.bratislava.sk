const { getDefaultFormState } = require('@rjsf/utils')
const { customizeValidator } = require('@rjsf/validator-ajv8')

const validator = customizeValidator()

const defaultFormStateBehavior = {
  arrayMinItems: { populate: 'never' },
  emptyObjectFields: 'populateAllDefaults',
}

const schema = {
  type: 'object',
  properties: {
    second: {
      type: 'object',
      allOf: [
        {
          type: 'object',
          properties: {
            test1: {
              type: 'string',
              default: 'default value',
            },
          },
          required: ['third'],
        },
      ],
    },
  },
  required: ['second'],
}

const defaultFormData = getDefaultFormState(
  validator,
  schema,
  {},
  undefined,
  undefined,
  defaultFormStateBehavior,
)

console.log(defaultFormData)
