/* eslint-disable i18next/no-literal-string */

import { Button, Typography } from '@bratislava/component-library'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UserOfficialCorrespondenceChannelEnum } from 'openapi-clients/city-account'
import { useState } from 'react'

import { MunicipalChargeConfigFragment } from '@/src/clients/graphql-strapi/api'
import DeliveryMethodChangeModal from '@/src/components/page-contents/TaxesPageContent/shared/DeliveryMethodChangeModal'
import { StrapiTaxConfigProvider } from '@/src/components/page-contents/TaxesPageContent/useStrapiTaxConfig'
import { Stack } from '@/src/components/styleguide/Stack'
import { Wrapper } from '@/src/components/styleguide/Wrapper'

const TEXT_COMES_FROM_STRAPI = 'Text sa doťahuje zo Strapi'

const MOCK_STRAPI_TAX_CONFIG_BASE = {
  deliveryMethod: {
    consentText: TEXT_COMES_FROM_STRAPI,
    deliveryMethodChangePendingAlert: null,
  },
} as unknown as MunicipalChargeConfigFragment

const MOCK_STRAPI_TAX_CONFIG_WITH_DEADLINE_ALERT = {
  deliveryMethod: {
    consentText: TEXT_COMES_FROM_STRAPI,
    deliveryMethodChangePendingAlert: {
      title: TEXT_COMES_FROM_STRAPI,
      content: TEXT_COMES_FROM_STRAPI,
    },
  },
} as unknown as MunicipalChargeConfigFragment

const BASE_USER_DATA = {
  id: 'mock-user-id',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  externalId: 'mock-external-id',
  email: 'test@example.com',
  birthNumber: null,
  showEmailCommunicationBanner: false,
  consents: [],
}

const MOCK_USER_NOT_SUBSCRIBED = {
  ...BASE_USER_DATA,
  officialCorrespondenceChannel: UserOfficialCorrespondenceChannelEnum.Postal,
  hasChangedDeliveryMethodAfterDeadline: false,
  consents: [],
}

const MOCK_USER_SUBSCRIBED = {
  ...BASE_USER_DATA,
  officialCorrespondenceChannel: UserOfficialCorrespondenceChannelEnum.Email,
  hasChangedDeliveryMethodAfterDeadline: false,
}

const MOCK_USER_CHANGED_AFTER_DEADLINE = {
  ...MOCK_USER_SUBSCRIBED,
  hasChangedDeliveryMethodAfterDeadline: true,
}

const createQueryClient = (userData: object) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  qc.setQueryData(['user'], userData)

  return qc
}

type DeliveryMethodModalVariantProps = {
  label: string
  userData: object
  strapiTaxConfig: MunicipalChargeConfigFragment
}

const DeliveryMethodModalVariant = ({
  label,
  userData,
  strapiTaxConfig,
}: DeliveryMethodModalVariantProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [queryClient] = useState(() => createQueryClient(userData))

  return (
    <QueryClientProvider client={queryClient}>
      <StrapiTaxConfigProvider strapiTaxConfig={strapiTaxConfig}>
        <Button variant="solid" onPress={() => setIsOpen(true)}>
          {label}
        </Button>
        <DeliveryMethodChangeModal isOpen={isOpen} onOpenChange={setIsOpen} />
      </StrapiTaxConfigProvider>
    </QueryClientProvider>
  )
}

const DeliveryMethodShowcase = () => {
  return (
    <Wrapper title="Delivery method change modal" direction="column" noBorder>
      <Typography>
        <strong>Where is this used: </strong>Taxes &amp; Fees page. Opened from the delivery method
        settings (gear icon in DeliveryMethodInformation) and from DeliveryMethodNeededBanner. Note:
        submitting will fail in the styleguide (no auth) and show an error toast.
      </Typography>
      <Stack direction="row">
        <DeliveryMethodModalVariant
          label="Not subscribed (Postal)"
          userData={MOCK_USER_NOT_SUBSCRIBED}
          strapiTaxConfig={MOCK_STRAPI_TAX_CONFIG_BASE}
        />
        <DeliveryMethodModalVariant
          label="Subscribed (Email)"
          userData={MOCK_USER_SUBSCRIBED}
          strapiTaxConfig={MOCK_STRAPI_TAX_CONFIG_BASE}
        />
        <DeliveryMethodModalVariant
          label="Changed after deadline (shows alert)"
          userData={MOCK_USER_CHANGED_AFTER_DEADLINE}
          strapiTaxConfig={MOCK_STRAPI_TAX_CONFIG_WITH_DEADLINE_ALERT}
        />
      </Stack>
    </Wrapper>
  )
}

export default DeliveryMethodShowcase
