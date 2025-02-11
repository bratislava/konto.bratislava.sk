import { describe, test, expect } from 'vitest'
import {
  FormDefinitionSlovenskoSkGeneric,
  isSlovenskoSkGenericFormDefinition,
} from '../../src/definitions/formDefinitionTypes'
import { SharepointColumnMapValue } from '../../src/definitions/sharepointTypes'
import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import {
  getArrayForOneToMany,
  getValueAtJsonPath,
  getValuesForFields,
} from '../../src/sharepoint/getValuesForSharepoint'
import { get as lodashGet } from 'lodash'

describe('getArrayForOneToMany', () => {
  test('should throw error if at the path there is no array', () => {
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

  test('should return the array at the path', () => {
    const array = [{ val1: '' }, { val2: '', val3: '' }, 'val3']
    const data = { val1: { val2: array } }
    const result = getArrayForOneToMany({ jsonDataExtraDataOmitted: data, id: 'id' }, 'val1.val2')
    expect(result).toEqual(array)
  })

  test('should return empty array for non-existing path', () => {
    const result = getArrayForOneToMany({ jsonDataExtraDataOmitted: {}, id: 'id' }, 'val1.val2')
    expect(result).toEqual([])
  })
})

describe('getValueAtJsonPath', () => {
  test('should throw error if at the path there is some object', () => {
    const data = { val1: { val2: 'val3' } }
    try {
      getValueAtJsonPath(data, 'val1')
      expect(true).toBeFalsy()
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)
    }
  })

  test('should throw error if there is array on non-primitives', () => {
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

  test('should return the value', () => {
    const data = { arr: ['val3', 'val4', 'val5'], bool: true, num: 1234, str: 'string' }
    expect(getValueAtJsonPath(data, 'arr')).toBe('val3, val4, val5')
    expect(getValueAtJsonPath(data, 'bool')).toBeTruthy()
    expect(getValueAtJsonPath(data, 'num')).toBe(1234)
    expect(getValueAtJsonPath(data, 'str')).toBe('string')
  })
})

describe('getValuesForFields', () => {
  test('should correctly fill in the data', () => {
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
      },
    )

    expect(result).toEqual({
      field1_col: 'val3, val4, val5',
      field2_col: true,
      field3_col: 'formTitle',
      field4_col: 'ginisIdValue',
    })
  })

  test('should throw error if there is unknown error', () => {
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
      )
      expect(true).toBeFalsy()
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)
    }
  })

  test('should throw error if there is nonexistent field', () => {
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

  test('should match snapshots', () => {
    getExampleFormPairs({
      formDefinitionFilterFn: (
        formDefinition,
      ): formDefinition is Omit<FormDefinitionSlovenskoSkGeneric, 'sharepointData'> &
        Required<Pick<FormDefinitionSlovenskoSkGeneric, 'sharepointData'>> =>
        isSlovenskoSkGenericFormDefinition(formDefinition) &&
        formDefinition.sharepointData !== undefined,
    }).forEach(({ formDefinition, exampleForm }) => {
      if (!exampleForm.sharepointFieldMap) {
        throw new Error('Missing sharepointFieldMap')
      }

      const result = getValuesForFields(
        formDefinition.sharepointData,
        { ginisDocumentId: 'MAG123', formDefinitionSlug: formDefinition.slug, title: 'FormTitle' },
        exampleForm.formData,
        exampleForm.sharepointFieldMap.fieldMap,
      )
      expect(result).toMatchSnapshot()

      Object.entries(formDefinition.sharepointData.oneToOne ?? {}).forEach(([path, value]) => {
        if (!exampleForm.sharepointFieldMap) {
          throw new Error('Missing sharepointFieldMap')
        }
        if (!lodashGet(exampleForm.formData, path, false)) {
          return
        }

        const valuesForFieldsOneToOne = getValuesForFields(
          value,
          {
            ginisDocumentId: 'MAG123',
            formDefinitionSlug: formDefinition.slug,
            title: 'FormTitle',
          },
          exampleForm.formData,
          exampleForm.sharepointFieldMap.oneToOne.fieldMaps[value.databaseName].fieldMap,
        )
        expect(valuesForFieldsOneToOne).toMatchSnapshot()
      })

      Object.entries(formDefinition.sharepointData.oneToMany ?? {}).forEach(([key, value]) => {
        const recordsArray = getArrayForOneToMany(
          { id: '123', jsonDataExtraDataOmitted: exampleForm.formData },
          key,
        )
        recordsArray.forEach((record) => {
          if (!exampleForm.sharepointFieldMap) {
            throw new Error('Missing sharepointFieldMap')
          }

          const valuesForFieldsOneToMany = getValuesForFields(
            value,
            {
              ginisDocumentId: 'MAG123',
              formDefinitionSlug: formDefinition.slug,
              title: 'FormTitle',
            },
            record,
            exampleForm.sharepointFieldMap.oneToMany.fieldMaps[value.databaseName].fieldMap,
          )
          expect(valuesForFieldsOneToMany).toMatchSnapshot()
        })
      })
    })
  })
})
