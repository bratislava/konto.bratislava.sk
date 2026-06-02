import { parseAsStringLiteral, useQueryState } from 'nuqs'
import { TaxStatusEnum, TaxType } from 'openapi-clients/tax'
import { useMemo, useState } from 'react'

import TaxFeePaymentPageContent from '@/src/components/page-contents/TaxesFees/TaxFeePaymentPageContent/TaxFeePaymentPageContent'
import { TaxFeeProvider } from '@/src/components/page-contents/TaxesFees/useTaxFee'
import { SelectOption } from '@/src/components/widget-components/SelectField/SelectField'
import { Tier } from '@/src/frontend/dtos/accountDto'
import { PaymentMethod } from '@/src/frontend/types/types'

import {
  channelOptions,
  ChannelScenario,
  createMockTaxDetail,
  createQueryClient,
  MOCK_USER_WITH_CHANNEL,
  MOCK_USER_WITHOUT_CHANNEL,
  tierOptions,
} from './mockData'
import { ShowcaseLayout, ShowcaseSelectField, TaxShowcaseProviders } from './shared'

const paymentMethodOptions: SelectOption[] = [
  { value: PaymentMethod.RemainingAmount, label: 'Remaining amount (zvysna-suma)' },
  { value: PaymentMethod.Installments, label: 'Installments (splatky)' },
]

const TaxFeePaymentShowCase = () => {
  const [tier, setTier] = useState<Tier>(Tier.IDENTITY_CARD)
  const [channelScenario, setChannelScenario] = useState<ChannelScenario>('with')

  // Controls the same URL param that TaxFeePaymentPageContent reads internally
  const [paymentMethod, setPaymentMethod] = useQueryState(
    'sposob-uhrady',
    parseAsStringLiteral([PaymentMethod.RemainingAmount, PaymentMethod.Installments] as const)
      .withDefault(PaymentMethod.RemainingAmount)
      .withOptions({ clearOnDefault: false }),
  )

  const queryClient = useMemo(() => {
    const userData = channelScenario === 'with' ? MOCK_USER_WITH_CHANNEL : MOCK_USER_WITHOUT_CHANNEL

    return createQueryClient(userData)
  }, [channelScenario])

  const taxData = useMemo(() => createMockTaxDetail(TaxStatusEnum.NotPaid, TaxType.Dzn), [])

  return (
    <ShowcaseLayout
      controls={
        <>
          <ShowcaseSelectField
            label="Tier / identity status"
            options={tierOptions}
            value={tier}
            onChange={setTier}
          />
          <ShowcaseSelectField
            label="Official correspondence channel"
            options={channelOptions}
            value={channelScenario}
            onChange={setChannelScenario}
          />
          <ShowcaseSelectField
            label="Payment method (sposob-uhrady)"
            options={paymentMethodOptions}
            value={paymentMethod}
            onChange={(v) => void setPaymentMethod(v)}
          />
        </>
      }
    >
      <TaxShowcaseProviders key={channelScenario} tier={tier} queryClient={queryClient}>
        <TaxFeeProvider taxData={taxData} strapiTaxAdministrator={null}>
          <div className="bg-background-passive-base">
            <TaxFeePaymentPageContent />
          </div>
        </TaxFeeProvider>
      </TaxShowcaseProviders>
    </ShowcaseLayout>
  )
}

export default TaxFeePaymentShowCase
