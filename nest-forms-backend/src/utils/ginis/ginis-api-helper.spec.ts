import { createMockGinisDocumentData } from '../../__tests__/factories/ginisDocument.factory'
import { mapGinisHistory } from './ginis-api-helper'

describe('ginis-api helpers test', () => {
  test('mapGinisHistory', () => {
    const mappedHistory = mapGinisHistory(createMockGinisDocumentData())
    expect(mappedHistory).toHaveLength(2)
  })
})
