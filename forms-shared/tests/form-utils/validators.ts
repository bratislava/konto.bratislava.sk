import { baAjvValidator } from '../../src/form-utils/validators'

describe('validators', () => {
  it('baAjvValidator is extracted correctly', () => {
    expect(baAjvValidator.constructor.name).toBe('Ajv')
  })
})
