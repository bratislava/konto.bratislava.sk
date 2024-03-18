import {
  createCamelCaseOptions,
  createCamelCaseOptionsV2,
  createCondition,
  createStringOptions,
} from '../src/generator/helpers'

describe('createCondition', () => {
  it('should create a condition object with a single property', () => {
    const result = createCondition([[['a'], { const: 'value1' }]])
    expect(result).toEqual({
      type: 'object',
      properties: {
        a: { const: 'value1' },
      },
      required: ['a'],
    })
  })

  it('should create a condition object with nested properties', () => {
    const result = createCondition([
      [['a', 'b'], { const: 'value1' }],
      [['a', 'c'], { const: 'value2' }],
    ])
    expect(result).toEqual({
      type: 'object',
      properties: {
        a: {
          type: 'object',
          properties: {
            b: { const: 'value1' },
            c: { const: 'value2' },
          },
          required: ['b', 'c'],
        },
      },
      required: ['a'],
    })
  })

  it('should handle array properties correctly', () => {
    const result = createCondition([
      [['a', 'array:b', 'c'], { const: 'value1' }],
      [['a', 'array:b', 'd'], { const: 'value2' }],
    ])
    expect(result).toEqual({
      type: 'object',
      properties: {
        a: {
          type: 'object',
          properties: {
            b: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  c: { const: 'value1' },
                  d: { const: 'value2' },
                },
                required: ['c', 'd'],
              },
            },
          },
          required: ['b'],
        },
      },
      required: ['a'],
    })
  })

  it('should handle duplicate paths correctly', () => {
    const result = createCondition([
      [['a', 'b'], { const: 'value1' }],
      [['a', 'b'], { const: 'value2' }],
    ])
    expect(result).toEqual({
      type: 'object',
      properties: {
        a: {
          type: 'object',
          properties: {
            b: { const: 'value2' },
          },
          required: ['b'],
        },
      },
      required: ['a'],
    })
  })

  it('should handle empty input correctly', () => {
    const result = createCondition([])
    expect(result).toEqual({
      type: 'object',
      properties: {},
      required: [],
    })
  })

  it('should throw an error if array tries to overwrite an existing object', () => {
    expect(() =>
      createCondition([
        [['a', 'b', 'c'], { const: 'value' }],
        [['a', 'array:b', 'c'], { const: 'value' }],
      ]),
    ).toThrowError('A non-array path already exists at "a.array:b"')
  })

  it('should throw an error if object tries to overwrite an existing array', () => {
    expect(() =>
      createCondition([
        [['a', 'array:b', 'c'], { const: 'value' }],
        [['a', 'b', 'c'], { const: 'value' }],
      ]),
    ).toThrowError('A non-object path already exists at "a.b"')
  })

  it('should throw an error if path interferes with already existing user object', () => {
    expect(() =>
      createCondition([
        [
          ['a', 'b'],
          {
            type: 'object',
            properties: {
              c: { const: 'value' },
            },
            required: ['c'],
          },
        ],
        [['a', 'b', 'd'], { const: 'value' }],
      ]),
    ).toThrowError('Condition path cannot be written to user created object at "a.b"')
  })
})

describe('createStringOptions', () => {
  it('should create options from a list of strings with default option', () => {
    const result = createStringOptions(['Option 1', 'Option 2', 'Option 3'])
    expect(result).toEqual([
      { value: 'Option 1', title: 'Option 1', isDefault: true },
      { value: 'Option 2', title: 'Option 2' },
      { value: 'Option 3', title: 'Option 3' },
    ])
  })

  it('should create options from a list of strings without default option', () => {
    const result = createStringOptions(['Option 1', 'Option 2', 'Option 3'], false)
    expect(result).toEqual([
      { value: 'Option 1', title: 'Option 1' },
      { value: 'Option 2', title: 'Option 2' },
      { value: 'Option 3', title: 'Option 3' },
    ])
  })

  it('should handle an empty input array', () => {
    const result = createStringOptions([])
    expect(result).toEqual([])
  })

  it('should handle a single string input', () => {
    const result = createStringOptions(['Option 1'])
    expect(result).toEqual([{ value: 'Option 1', title: 'Option 1', isDefault: true }])
  })

  it('should throw an error if options have duplicate values', () => {
    expect(() => createStringOptions(['Option 1', 'Option 2', 'Option 1'])).toThrowError(
      'Options must have unique values',
    )
  })
})

describe('createCamelCaseOptions', () => {
  it('should create options from a list of strings with default option', () => {
    const result = createCamelCaseOptions(['Option 1', 'Option 2', 'Option 3'])
    expect(result).toEqual([
      { value: 'option1', title: 'Option 1', isDefault: true },
      { value: 'option2', title: 'Option 2' },
      { value: 'option3', title: 'Option 3' },
    ])
  })

  it('should create options from a list of strings without default option', () => {
    const result = createCamelCaseOptions(['Option 1', 'Option 2', 'Option 3'], false)
    expect(result).toEqual([
      { value: 'option1', title: 'Option 1' },
      { value: 'option2', title: 'Option 2' },
      { value: 'option3', title: 'Option 3' },
    ])
  })

  it('should handle an empty input array', () => {
    const result = createCamelCaseOptions([])
    expect(result).toEqual([])
  })

  it('should handle a single string input', () => {
    const result = createCamelCaseOptions(['Option 1'])
    expect(result).toEqual([{ value: 'option1', title: 'Option 1', isDefault: true }])
  })

  it('should throw an error if options have duplicate camelCase values', () => {
    expect(() => createCamelCaseOptions(['hello_World', 'HELLO world'])).toThrowError(
      'Options must have unique values',
    )
  })
})

describe('createCamelCaseOptionsV2', () => {
  it('should create options from a list of objects with default option', () => {
    const result = createCamelCaseOptionsV2([
      { title: 'Option 1', description: 'Description 1' },
      { title: 'Option 2' },
      { title: 'Option 3' },
    ])
    expect(result).toEqual([
      { value: 'option1', title: 'Option 1', description: 'Description 1', isDefault: true },
      { value: 'option2', title: 'Option 2', isDefault: undefined },
      { value: 'option3', title: 'Option 3', isDefault: undefined },
    ])
  })

  it('should create options from a list of objects without default option', () => {
    const result = createCamelCaseOptionsV2(
      [
        { title: 'Option 1', description: 'Description 1' },
        { title: 'Option 2' },
        { title: 'Option 3' },
      ],
      false,
    )
    expect(result).toEqual([
      { value: 'option1', title: 'Option 1', description: 'Description 1' },
      { value: 'option2', title: 'Option 2' },
      { value: 'option3', title: 'Option 3' },
    ])
  })

  it('should handle an empty input array', () => {
    const result = createCamelCaseOptionsV2([])
    expect(result).toEqual([])
  })

  it('should handle a single object input', () => {
    const result = createCamelCaseOptionsV2([{ title: 'Option 1' }])
    expect(result).toEqual([{ value: 'option1', title: 'Option 1', isDefault: true }])
  })

  it('should throw an error if options have duplicate camelCase values', () => {
    expect(() =>
      createCamelCaseOptionsV2([{ title: 'hello_World' }, { title: 'HELLO world' }]),
    ).toThrowError('Options must have unique values')
  })
})
