import { testFormsSharedIntegration } from '@forms-shared/integration-test/testFormsSharedIntegration'

describe('testFormsSharedIntegration', () => {
  it('should return true', async () => {
    expect(await testFormsSharedIntegration()).toBe(true)
  })
})
