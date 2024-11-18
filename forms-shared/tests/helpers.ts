import {
  createCamelCaseItems,
  createCamelCaseItemsV2,
  createCondition,
  createStringItems,
  createStringItemsV2,
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

describe('createStringItems', () => {
  it('should create items from a list of strings with default item', () => {
    const result = createStringItems(['Item 1', 'Item 2', 'Item 3'])
    expect(result).toEqual([
      { value: 'Item 1', label: 'Item 1', isDefault: true },
      { value: 'Item 2', label: 'Item 2' },
      { value: 'Item 3', label: 'Item 3' },
    ])
  })

  it('should create items from a list of strings without default item', () => {
    const result = createStringItems(['Item 1', 'Item 2', 'Item 3'], false)
    expect(result).toEqual([
      { value: 'Item 1', label: 'Item 1' },
      { value: 'Item 2', label: 'Item 2' },
      { value: 'Item 3', label: 'Item 3' },
    ])
  })

  it('should handle an empty input array', () => {
    const result = createStringItems([])
    expect(result).toEqual([])
  })

  it('should handle a single string input', () => {
    const result = createStringItems(['Item 1'])
    expect(result).toEqual([{ value: 'Item 1', label: 'Item 1', isDefault: true }])
  })

  it('should throw an error if items have duplicate values', () => {
    expect(() => createStringItems(['Item 1', 'Item 2', 'Item 1'])).toThrowError(
      'Items must have unique values',
    )
  })
})

describe('createStringItemsV2', () => {
  it('should create items from a list of objects with default item', () => {
    const result = createStringItemsV2([
      { label: 'Item 1', description: 'Description 1' },
      { label: 'Item 2' },
      { label: 'Item 3' },
    ])
    expect(result).toEqual([
      { value: 'Item 1', label: 'Item 1', description: 'Description 1', isDefault: true },
      { value: 'Item 2', label: 'Item 2', isDefault: undefined },
      { value: 'Item 3', label: 'Item 3', isDefault: undefined },
    ])
  })

  it('should create items from a list of objects without default item', () => {
    const result = createStringItemsV2(
      [{ label: 'Item 1', description: 'Description 1' }, { label: 'Item 2' }, { label: 'Item 3' }],
      false,
    )
    expect(result).toEqual([
      { value: 'Item 1', label: 'Item 1', description: 'Description 1' },
      { value: 'Item 2', label: 'Item 2' },
      { value: 'Item 3', label: 'Item 3' },
    ])
  })

  it('should handle an empty input array', () => {
    const result = createStringItemsV2([])
    expect(result).toEqual([])
  })

  it('should handle a single object input', () => {
    const result = createStringItemsV2([{ label: 'Item 1' }])
    expect(result).toEqual([{ value: 'Item 1', label: 'Item 1', isDefault: true }])
  })

  it('should throw an error if items have duplicate values', () => {
    expect(() => createStringItemsV2([{ label: 'Item 1' }, { label: 'Item 1' }])).toThrowError(
      'Items must have unique values',
    )
  })

  it('should preserve additional properties from input objects', () => {
    const result = createStringItemsV2([
      { label: 'Item 1', extra: 'data1', nested: { prop: 'value' } },
      { label: 'Item 2', extra: 'data2' },
    ])
    expect(result).toEqual([
      {
        value: 'Item 1',
        label: 'Item 1',
        extra: 'data1',
        nested: { prop: 'value' },
        isDefault: true,
      },
      {
        value: 'Item 2',
        label: 'Item 2',
        extra: 'data2',
        isDefault: undefined,
      },
    ])
  })
})

describe('createCamelCaseItems', () => {
  it('should create items from a list of strings with default item', () => {
    const result = createCamelCaseItems(['Item 1', 'Item 2', 'Item 3'])
    expect(result).toEqual([
      { value: 'item1', label: 'Item 1', isDefault: true },
      { value: 'item2', label: 'Item 2' },
      { value: 'item3', label: 'Item 3' },
    ])
  })

  it('should create items from a list of strings without default item', () => {
    const result = createCamelCaseItems(['Item 1', 'Item 2', 'Item 3'], false)
    expect(result).toEqual([
      { value: 'item1', label: 'Item 1' },
      { value: 'item2', label: 'Item 2' },
      { value: 'item3', label: 'Item 3' },
    ])
  })

  it('should handle an empty input array', () => {
    const result = createCamelCaseItems([])
    expect(result).toEqual([])
  })

  it('should handle a single string input', () => {
    const result = createCamelCaseItems(['Item 1'])
    expect(result).toEqual([{ value: 'item1', label: 'Item 1', isDefault: true }])
  })

  it('should throw an error if items have duplicate camelCase values', () => {
    expect(() => createCamelCaseItems(['hello_World', 'HELLO world'])).toThrowError(
      'Items must have unique values',
    )
  })
})

describe('createCamelCaseItemsV2', () => {
  it('should create items from a list of objects with default item', () => {
    const result = createCamelCaseItemsV2([
      { label: 'Item 1', description: 'Description 1' },
      { label: 'Item 2' },
      { label: 'Item 3' },
    ])
    expect(result).toEqual([
      { value: 'item1', label: 'Item 1', description: 'Description 1', isDefault: true },
      { value: 'item2', label: 'Item 2', isDefault: undefined },
      { value: 'item3', label: 'Item 3', isDefault: undefined },
    ])
  })

  it('should create items from a list of objects without default item', () => {
    const result = createCamelCaseItemsV2(
      [{ label: 'Item 1', description: 'Description 1' }, { label: 'Item 2' }, { label: 'Item 3' }],
      false,
    )
    expect(result).toEqual([
      { value: 'item1', label: 'Item 1', description: 'Description 1' },
      { value: 'item2', label: 'Item 2' },
      { value: 'item3', label: 'Item 3' },
    ])
  })

  it('should handle an empty input array', () => {
    const result = createCamelCaseItemsV2([])
    expect(result).toEqual([])
  })

  it('should handle a single object input', () => {
    const result = createCamelCaseItemsV2([{ label: 'Item 1' }])
    expect(result).toEqual([{ value: 'item1', label: 'Item 1', isDefault: true }])
  })

  it('should throw an error if items have duplicate camelCase values', () => {
    expect(() =>
      createCamelCaseItemsV2([{ label: 'hello_World' }, { label: 'HELLO world' }]),
    ).toThrowError('Items must have unique values')
  })
})
