/* eslint-disable i18next/no-literal-string */

import { Button, Typography } from '@bratislava/component-library'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  GDPRCategoryEnum,
  GDPRSubTypeEnum,
  GDPRTypeEnum,
  UserOfficialCorrespondenceChannelEnum,
} from 'openapi-clients/city-account'
import { useState } from 'react'

import { TaxFragment } from '@/src/clients/graphql-strapi/api'
import OfficialCorrespondenceChannelChangeModal from '@/src/components/page-contents/TaxesFees/shared/OfficialCorrespondenceChannelChangeModal'
import { StrapiTaxProvider } from '@/src/components/page-contents/TaxesFees/useStrapiTax'
import { Stack } from '@/src/components/styleguide/Stack'
import { Wrapper } from '@/src/components/styleguide/Wrapper'

const TEXT_COMES_FROM_STRAPI = 'Text sa doťahuje zo Strapi'

const MOCK_STRAPI_TAX_BASE = {
  documentId: 'mock-strapi-tax',
  accountCommunicationConsentText: TEXT_COMES_FROM_STRAPI,
  channelChangeEffectiveNextYearText: null,
  channelChangeEffectiveNextYearTitle: null,
}

const MOCK_STRAPI_TAX_WITH_DEADLINE_ALERT = {
  ...MOCK_STRAPI_TAX_BASE,
  channelChangeEffectiveNextYearTitle: TEXT_COMES_FROM_STRAPI,
  channelChangeEffectiveNextYearText: TEXT_COMES_FROM_STRAPI,
}

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
  gdprData: [],
}

const MOCK_USER_SUBSCRIBED = {
  ...BASE_USER_DATA,
  officialCorrespondenceChannel: UserOfficialCorrespondenceChannelEnum.Email,
  hasChangedDeliveryMethodAfterDeadline: false,
  gdprData: [
    {
      category: GDPRCategoryEnum.Taxes,
      type: GDPRTypeEnum.FormalCommunication,
      subType: GDPRSubTypeEnum.Subscribe,
    },
  ],
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

type OfficialCorrespondenceChannelModalVariantProps = {
  label: string
  userData: object
  strapiTax: TaxFragment
}

const OfficialCorrespondenceChannelModalVariant = ({
  label,
  userData,
  strapiTax,
}: OfficialCorrespondenceChannelModalVariantProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [queryClient] = useState(() => createQueryClient(userData))

  return (
    <QueryClientProvider client={queryClient}>
      <StrapiTaxProvider strapiTax={strapiTax}>
        <Button variant="solid" onPress={() => setIsOpen(true)}>
          {label}
        </Button>
        <OfficialCorrespondenceChannelChangeModal isOpen={isOpen} onOpenChange={setIsOpen} />
      </StrapiTaxProvider>
    </QueryClientProvider>
  )
}

const OfficialCorrespondenceChannelShowcase = () => {
  return (
    <Wrapper title="Official correspondence channel change modal" direction="column" noBorder>
      <Typography>
        <strong>Where is this used: </strong>Taxes &amp; Fees page. Opened from the delivery method
        settings (gear icon in OfficialCorrespondenceChannelInformation) and from
        OfficialCorrespondenceChannelNeededBanner. Note: submitting will fail in the styleguide (no
        auth) and show an error toast.
      </Typography>
      <Stack direction="row">
        <OfficialCorrespondenceChannelModalVariant
          label="Not subscribed (Postal)"
          userData={MOCK_USER_NOT_SUBSCRIBED}
          strapiTax={MOCK_STRAPI_TAX_BASE}
        />
        <OfficialCorrespondenceChannelModalVariant
          label="Subscribed (Email)"
          userData={MOCK_USER_SUBSCRIBED}
          strapiTax={MOCK_STRAPI_TAX_BASE}
        />
        <OfficialCorrespondenceChannelModalVariant
          label="Changed after deadline (shows alert)"
          userData={MOCK_USER_CHANGED_AFTER_DEADLINE}
          strapiTax={MOCK_STRAPI_TAX_WITH_DEADLINE_ALERT}
        />
      </Stack>
    </Wrapper>
  )
}

export default OfficialCorrespondenceChannelShowcase
