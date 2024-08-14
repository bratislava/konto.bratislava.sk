import { SharepointColumnMapValue } from '../../src/definitions/sharepointTypes'
import {
  getArrayForOneToMany,
  getValueAtJsonPath,
  getValuesForFields,
} from '../../src/sharepoint/getValuesForSharepoint'

describe('getArrayForOneToMany', () => {
  it('should throw error if at the path there is no array', () => {
    try {
      getArrayForOneToMany(
        { jsonDataExtraDataOmitted: { val1: { val2: 'val3' } }, id: 'id' },
        'val1.val2',
      )
      expect(true).toBeFalsy()
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)
    }

    try {
      getArrayForOneToMany(
        { jsonDataExtraDataOmitted: { val1: { val2: { val3: 'val4' } } }, id: 'id' },
        'val1.val2',
      )
      expect(true).toBeFalsy()
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)
    }
  })

  it('should return the array at the path', () => {
    const array = [{ val1: '' }, { val2: '', val3: '' }, 'val3']
    const data = { val1: { val2: array } }
    const result = getArrayForOneToMany({ jsonDataExtraDataOmitted: data, id: 'id' }, 'val1.val2')
    expect(result).toEqual(array)
  })

  it('should return empty array for non-existing path', () => {
    const result = getArrayForOneToMany({ jsonDataExtraDataOmitted: {}, id: 'id' }, 'val1.val2')
    expect(result).toEqual([])
  })
})

describe('getValueAtJsonPath', () => {
  it('should throw error if at the path there is some object', () => {
    const data = { val1: { val2: 'val3' } }
    try {
      getValueAtJsonPath(data, 'val1')
      expect(true).toBeFalsy()
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)
    }
  })

  it('should throw error if there is array on non-primitives', () => {
    const dataArray = { val1: { val2: ['val3', 'val4', ['val5']] } }
    const data = { val1: { val2: ['val3', 'val4', { val5: 'val6' }] } }

    try {
      getValueAtJsonPath(data, 'val1.val2')
      expect(true).toBeFalsy()
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)
    }
    try {
      getValueAtJsonPath(dataArray, 'val1.val2')
      expect(true).toBeFalsy()
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)
    }
  })

  it('should return the value', () => {
    const data = { arr: ['val3', 'val4', 'val5'], bool: true, num: 1234, str: 'string' }
    expect(getValueAtJsonPath(data, 'arr')).toBe('val3, val4, val5')
    expect(getValueAtJsonPath(data, 'bool')).toBeTruthy()
    expect(getValueAtJsonPath(data, 'num')).toBe(1234)
    expect(getValueAtJsonPath(data, 'str')).toBe('string')
  })
})

describe('getValuesForFields', () => {
  it('should correctly fill in the data', () => {
    const data = { arr: ['val3', 'val4', 'val5'], bool: true, num: 1234, str: 'string' }
    const result = getValuesForFields(
      {
        databaseName: 'dbName',
        columnMap: {
          field1: {
            type: 'json_path',
            info: 'arr',
          },
          field2: {
            type: 'json_path',
            info: 'bool',
          },
          field3: {
            type: 'title',
          },
          field4: {
            type: 'mag_number',
          },
          field5: {
            type: 'json_path',
            info: 'non-existing.path',
          },
        },
      },
      {
        ginisDocumentId: 'ginisIdValue',
        formDefinitionSlug: 'formSlugValue',
        title: 'formTitle',
      },
      data,
      {
        field1: 'field1_col',
        field2: 'field2_col',
        field3: 'field3_col',
        field4: 'field4_col',
        field5: 'field5_col',
        field6: 'field6_col',
      },
      { field6: 'field6Val' },
    )

    expect(result).toEqual({
      field1_col: 'val3, val4, val5',
      field2_col: true,
      field3_col: 'formTitle',
      field4_col: 'ginisIdValue',
      field6_colId: 'field6Val',
    })
  })

  it('should throw error if there is unknown error', () => {
    const data = { arr: ['val3', 'val4', 'val5'], bool: true, num: 1234, str: 'string' }

    try {
      getValuesForFields(
        {
          databaseName: 'dbName',
          columnMap: {
            field1: {
              type: 'json_path',
              info: 'arr',
            },
            field2: {
              type: 'json_path',
              info: 'bool',
            },
            field3: {
              type: 'nonexistent',
            } as unknown as SharepointColumnMapValue,
            field4: {
              type: 'mag_number',
            },
            field5: {
              type: 'json_path',
              info: 'non-existing.path',
            },
          },
        },
        {
          ginisDocumentId: 'ginisIdValue',
          formDefinitionSlug: 'formSlugValue',
          title: 'formTitle',
        },
        data,
        {
          field1: 'field1_col',
          field2: 'field2_col',
          field3: 'field3_col',
          field4: 'field4_col',
          field5: 'field5_col',
          field6: 'field6_col',
        },
        { field6: 'field6Val' },
      )
      expect(true).toBeFalsy()
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)
    }
  })

  it('should throw error if there is nonexistent field', () => {
    const data = { arr: ['val3', 'val4', 'val5'], bool: true, num: 1234, str: 'string' }

    try {
      getValuesForFields(
        { databaseName: 'dbName', columnMap: {} },
        {
          ginisDocumentId: 'ginisIdValue',
          formDefinitionSlug: 'formSlugValue',
          title: 'formTitle',
        },
        data,
        {
          field1: 'field1_col',
          field2: 'field2_col',
          field3: 'field3_col',
          field4: 'field4_col',
          field5: 'field5_col',
          field6: 'field6_col',
        },
      )
      expect(true).toBeFalsy()
    } catch (error) {}
  })
})

// TODO snapshot tests
