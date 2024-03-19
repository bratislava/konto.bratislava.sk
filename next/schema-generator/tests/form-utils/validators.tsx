import { baAjvValidator } from '../../src/form-utils/validators'
import Ajv from 'ajv'

describe('validators', () => {
  it('baAjvValidator is extracted correctly', () => {
    expect(baAjvValidator instanceof Ajv).toBe(true)
  })
})
