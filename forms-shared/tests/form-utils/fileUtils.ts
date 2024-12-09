import { getFileUuids, getFileUuidsNaive } from '../../src/form-utils/fileUtils'
import { selectMultiple } from '../../src/generator/functions/selectMultiple'
import { input } from '../../src/generator/functions/input'
import { fileUpload } from '../../src/generator/functions/fileUpload'
import { object } from '../../src/generator/object'

describe('fileUtils', () => {
  const fileUploadSchema = object('files', {}, {}, [
    fileUpload('file', { title: 'File' }, {}),
    fileUpload('fileMultiple', { title: 'File multiple', multiple: true }, {}),
    input('fakeFileInput', { type: 'text', title: 'Fake file' }, {}),
    selectMultiple(
      'fakeFileSelect',
      {
        title: 'Fake file select',
        items: [
          {
            value: 'e37359e2-2547-42a9-82d6-d40054f17da0',
            label: 'Fake file 1',
          },
          {
            value: '8bc77372-b48c-4b99-ae46-0df42bf7f1bb',
            label: 'Fake file 2',
          },
        ],
      },
      {},
    ),
    input('anotherField', { type: 'text', title: 'Another field' }, {}),
  ])

  const data = {
    file: 'f3603d59-49f4-4059-9a3d-555184217357',
    fileMultiple: ['7459535f-96c2-47ed-bf32-55143e52a4ea'],
    fakeFileInput: 'b3d0cd96-d255-4bfb-8b1a-56a185d467f3',
    fakeFileSelect: ['e37359e2-2547-42a9-82d6-d40054f17da0'],
    anotherField: 'some value',
  }

  it('getFileUuidsNaive should return all valid UUIDs entries from the data', () => {
    expect(getFileUuidsNaive(data)).toEqual([
      'f3603d59-49f4-4059-9a3d-555184217357',
      '7459535f-96c2-47ed-bf32-55143e52a4ea',
      'b3d0cd96-d255-4bfb-8b1a-56a185d467f3',
      'e37359e2-2547-42a9-82d6-d40054f17da0',
    ])
  })

  it('getFileUuidsNaive should return only file ids from the data', () => {
    expect(getFileUuids(fileUploadSchema.schema, data)).toEqual([
      'f3603d59-49f4-4059-9a3d-555184217357',
      '7459535f-96c2-47ed-bf32-55143e52a4ea',
    ])
  })
})
