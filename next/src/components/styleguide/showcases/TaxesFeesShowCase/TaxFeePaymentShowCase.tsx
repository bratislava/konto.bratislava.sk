import { parseAsStringLiteral, useQueryState } from 'nuqs'
import { TaxStatusEnum, TaxType } from 'openapi-clients/tax'
import { useMemo, useState } from 'react'

import TaxFeePaymentPageContent from '@/src/components/page-contents/TaxesFees/TaxFeePaymentPageContent/TaxFeePaymentPageContent'
import { StrapiTaxAdministratorProvider } from '@/src/components/page-contents/TaxesFees/useStrapiTaxAdministrator'
import { TaxDataProvider } from '@/src/components/page-contents/TaxesFees/useTaxData'
import { SelectOption } from '@/src/components/widget-components/SelectField/SelectField'
import { Tier } from '@/src/frontend/dtos/accountDto'
import { PaymentMethod } from '@/src/frontend/types/paymentMethodTypes'

import {
  createMockTaxDetail,
  createQueryClient,
  deliveryMethodOptions,
  DeliveryMethodScenario,
  MOCK_USER_WITH_DELIVERY_METHOD,
  MOCK_USER_WITHOUT_DELIVERY_METHOD,
  tierOptions,
} from './mockData'
import { ShowcaseLayout, ShowcaseSelectField, TaxShowcaseProviders } from './shared'

const paymentMethodOptions: SelectOption[] = [
  { value: PaymentMethod.RemainingAmount, label: 'Remaining amount (zvysna-suma)' },
  { value: PaymentMethod.Installments, label: 'Installments (splatky)' },
]

const TaxFeePaymentShowCase = () => {
  const [tier, setTier] = useState<Tier>(Tier.IDENTITY_CARD)
  const [deliveryMethodScenario, setDeliveryMethodScenario] =
    useState<DeliveryMethodScenario>('with')

  // Controls the same URL param that TaxFeePaymentPageContent reads internally
  const [paymentMethod, setPaymentMethod] = useQueryState(
    'sposob-uhrady',
    parseAsStringLiteral([PaymentMethod.RemainingAmount, PaymentMethod.Installments] as const)
      .withDefault(PaymentMethod.RemainingAmount)
      .withOptions({ clearOnDefault: false }),
  )

  const queryClient = useMemo(() => {
    const userData =
      deliveryMethodScenario === 'with'
        ? MOCK_USER_WITH_DELIVERY_METHOD
        : MOCK_USER_WITHOUT_DELIVERY_METHOD

    return createQueryClient(userData)
  }, [deliveryMethodScenario])

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
            label="Delivery method"
            options={deliveryMethodOptions}
            value={deliveryMethodScenario}
            onChange={setDeliveryMethodScenario}
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
      <TaxShowcaseProviders key={deliveryMethodScenario} tier={tier} queryClient={queryClient}>
        <TaxDataProvider taxData={taxData}>
          <StrapiTaxAdministratorProvider strapiTaxAdministrator={null}>
            <div className="bg-background-passive-base">
              <TaxFeePaymentPageContent />
            </div>
          </StrapiTaxAdministratorProvider>
        </TaxDataProvider>
      </TaxShowcaseProviders>
    </ShowcaseLayout>
  )
}

export default TaxFeePaymentShowCase
