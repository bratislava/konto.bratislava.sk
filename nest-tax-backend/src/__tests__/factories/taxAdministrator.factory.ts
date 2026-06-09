import { Prisma, TaxAdministrator, TaxType } from '@prisma/client'

const DEFAULT_DATE = new Date('2023-01-01T00:00:00.000Z')

export type TestTaxAdministratorEntryOverrides = Partial<
  Omit<
    Prisma.TaxPayerTaxAdministratorGetPayload<{
      include: { taxAdministrator: true }
    }>,
    'taxAdministrator'
  >
> & {
  taxAdministrator?: Partial<TaxAdministrator>
}

export const createTestTaxAdministratorEntry = (
  overrides?: TestTaxAdministratorEntryOverrides,
) => {
  const { taxAdministrator: taxAdministratorOverrides, ...rest } =
    overrides ?? {}
  return {
    taxPayerId: 1,
    taxAdministratorId: 1,
    taxType: TaxType.DZN,
    ...rest,
    taxAdministrator: {
      id: 1,
      createdAt: DEFAULT_DATE,
      updatedAt: DEFAULT_DATE,
      externalId: 'ext-admin-1',
      name: 'Test Tax Administrator',
      phoneNumber: '+421123456789',
      email: 'admin@test.sk',
      ...taxAdministratorOverrides,
    },
  }
}
