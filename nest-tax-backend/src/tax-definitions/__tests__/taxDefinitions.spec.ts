// import { getTaxDefinitionByType } from '../getTaxDefinitionByType'
import { todo } from 'node:test'

import { TaxType } from '@prisma/client'

describe('Tax Definitions', () => {
  it('should pass', () => {
    expect(true).toBe(true)
  })

  Object.values(TaxType).forEach((type) => {
    todo(`should have tax definition for tax type: ${type}`, () => {
      // TODO uncomment when PKO is implemented
      // const taxDefinition = getTaxDefinitionByType(type)
      // expect(taxDefinition).not.toBeNull()
    })
  })
})
