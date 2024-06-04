import { baAjvValidator } from '../../src/form-utils/validators'

describe('validators', () => {
  it('baAjvValidator is extracted correctly', () => {
    // TODO: `instanceof` stopped working
    // expect(baAjvValidator instanceof Ajv).toBe(true)
    expect(baAjvValidator.constructor.name).toBe('Ajv')
  })
})
