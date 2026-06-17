import { TaxStatusEnum, TaxType } from 'openapi-clients/tax'
import { useMemo, useState } from 'react'

import TaxFeePageContent from '@/src/components/page-contents/TaxesFees/TaxFeePageContent/TaxFeePageContent'
import { TaxFeeProvider } from '@/src/components/page-contents/TaxesFees/useTaxFee'
import { SelectOption } from '@/src/components/widget-components/SelectField/SelectField'
import { Tier } from '@/src/frontend/dtos/accountDto'

import { createMockTaxDetail, createQueryClient, MOCK_USER_WITH_CHANNEL } from './mockData'
import { ShowcaseLayout, ShowcaseSelectField, TaxShowcaseProviders } from './shared'

const paidStatusOptions: SelectOption[] = [
  { value: TaxStatusEnum.NotPaid, label: 'NOT_PAID — payment section shown' },
  { value: TaxStatusEnum.PartiallyPaid, label: 'PARTIALLY_PAID — remaining balance' },
  { value: TaxStatusEnum.Paid, label: 'PAID — success alert' },
  { value: TaxStatusEnum.OverPaid, label: 'OVER_PAID — success alert' },
  { value: TaxStatusEnum.Cancelled, label: 'CANCELLED — info alert' },
]

const taxTypeOptions: SelectOption[] = [
  { value: TaxType.Dzn, label: 'DZN — property tax' },
  { value: TaxType.Ko, label: 'KO — communal waste fee' },
]

const TaxFeeDetailShowCase = () => {
  const [paidStatus, setPaidStatus] = useState<TaxStatusEnum>(TaxStatusEnum.NotPaid)
  const [taxType, setTaxType] = useState<TaxType>(TaxType.Dzn)

  const queryClient = useMemo(() => createQueryClient(MOCK_USER_WITH_CHANNEL), [])
  const taxData = useMemo(() => createMockTaxDetail(paidStatus, taxType), [paidStatus, taxType])

  return (
    <ShowcaseLayout
      controls={
        <>
          <ShowcaseSelectField
            label="Payment status"
            options={paidStatusOptions}
            value={paidStatus}
            onChange={setPaidStatus}
          />
          <ShowcaseSelectField
            label="Tax type"
            options={taxTypeOptions}
            value={taxType}
            onChange={setTaxType}
          />
        </>
      }
    >
      <TaxShowcaseProviders tier={Tier.IDENTITY_CARD} queryClient={queryClient}>
        <TaxFeeProvider taxData={taxData} strapiTaxAdministrator={null}>
          <div className="bg-background-passive-base">
            <TaxFeePageContent />
          </div>
        </TaxFeeProvider>
      </TaxShowcaseProviders>
    </ShowcaseLayout>
  )
}

export default TaxFeeDetailShowCase
