import { mockGinisDocumentData } from '../../__tests__/ginisContants'
import { mapGinisHistory } from './ginis-api-helper'

describe('ginis-api helpers test', () => {
  test('mapGinisHistory', async () => {
    const mappedHistory = mapGinisHistory(mockGinisDocumentData)
    expect(mappedHistory).toHaveLength(2)
  })
})
