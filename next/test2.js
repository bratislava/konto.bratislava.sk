const { getDefaultFormState, ValidatorType } = require('@rjsf/utils')
const { customizeValidator } = require('@rjsf/validator-ajv8')

const validator = customizeValidator()

// emptyObjectFields: 'populateAllDefaults',
// | 'populateRequiredDefaults' | 'skipDefaults';
const defaultFormStateBehavior = {
  arrayMinItems: { populate: 'never' },
  emptyObjectFields: 'populateAllDefaults',
}

const schema = {
  type: 'object',
  allOf: [
    {
      type: 'object',
      properties: {
        first: {
          type: 'object',
        },
      },
      required: ['first'],
    },
    {
      type: 'object',
      properties: {
        second: {
          type: 'object',
        },
      },
      allOf: [
        {
          type: 'object',
          properties: {
            third: {
              type: 'object',
              properties: {
                fourth: {
                  type: 'object',
                },
              },
              required: ['fourth'],
            },
          },
          required: ['third'],
        },
      ],
      required: ['second'],
    },
  ],
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
