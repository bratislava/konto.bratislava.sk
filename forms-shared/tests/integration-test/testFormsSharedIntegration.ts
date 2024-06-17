import { testFormsSharedIntegration } from '../../src/integration-test/testFormsSharedIntegration'

describe('testFormsSharedIntegration', () => {
  it('should return true', async () => {
    expect(await testFormsSharedIntegration()).toBe(true)
  })
})
