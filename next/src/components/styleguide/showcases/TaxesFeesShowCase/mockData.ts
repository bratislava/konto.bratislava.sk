import { QueryClient } from '@tanstack/react-query'
import { UserOfficialCorrespondenceChannelEnum } from 'openapi-clients/city-account'
import {
  InstallmentPaidStatusEnum,
  ResponseInstallmentPaymentDetailDtoReasonNotPossibleEnum,
  ResponseOneTimePaymentDetailsDtoReasonNotPossibleEnum,
  ResponseOneTimePaymentDetailsDtoTypeEnum,
  TaxAvailabilityStatus,
  TaxControllerV2GetTaxDetailByYearV2200Response,
  TaxStatusEnum,
  TaxType,
} from 'openapi-clients/tax'

import { TaxFragment } from '@/src/clients/graphql-strapi/api'
import { SelectOption } from '@/src/components/widget-components/SelectField/SelectField'
import { Tier, UserAttributes } from '@/src/frontend/dtos/accountDto'
import { TaxesData } from '@/src/pages/dane-a-poplatky'

const TEXT_COMES_FROM_STRAPI = 'Text sa doťahuje zo Strapi'

// ─── Shared showcase option lists ───

export type ChannelScenario = 'with' | 'without'

export const tierOptions: SelectOption[] = [
  { value: Tier.NEW, label: 'NEW — not yet attempted' },
  { value: Tier.QUEUE_IDENTITY_CARD, label: 'QUEUE_IDENTITY_CARD — in queue' },
  { value: Tier.IDENTITY_CARD, label: 'IDENTITY_CARD — verified' },
]

export const channelOptions: SelectOption[] = [
  { value: 'with', label: 'Channel set (showEmailCommunicationBanner=false)' },
  { value: 'without', label: 'Channel NOT set (showEmailCommunicationBanner=true)' },
]

// ─── User mock objects (seeded into QueryClient for useOfficialCorrespondenceChannel) ───

const MOCK_BASE_USER = {
  id: 'mock-user-id',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  externalId: 'mock-external-id',
  email: 'test@example.com',
  birthNumber: null,
  hasChangedDeliveryMethodAfterDeadline: true,
  gdprData: [],
  consents: [],
}

export const MOCK_USER_WITH_CHANNEL = {
  ...MOCK_BASE_USER,
  officialCorrespondenceChannel: UserOfficialCorrespondenceChannelEnum.Email,
  showEmailCommunicationBanner: false,
}

export const MOCK_USER_WITHOUT_CHANNEL = {
  ...MOCK_BASE_USER,
  officialCorrespondenceChannel: null,
  showEmailCommunicationBanner: true,
}

// ─── Strapi CMS mock ───

export const MOCK_STRAPI_TAX = {
  documentId: 'mock-strapi-tax',
  accountCommunicationConsentText: TEXT_COMES_FROM_STRAPI,
  channelChangeEffectiveNextYearText: TEXT_COMES_FROM_STRAPI,
  channelChangeEffectiveNextYearTitle: TEXT_COMES_FROM_STRAPI,
} as unknown as TaxFragment

// ─── Helpers ───

export const tierToUserAttributes = (tier: Tier): UserAttributes => ({
  'custom:tier': tier,
})

export const createQueryClient = (userData: object): QueryClient => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  qc.setQueryData(['user'], userData)

  return qc
}

// ─── Mock taxes list data (TaxesFeesPageContent) ───

export const createMockTaxesData = (
  scenario: 'available' | 'looking' | 'notOnRecord',
): Record<TaxType, TaxesData | null> => {
  const makeDto = (type: TaxType): TaxesData => {
    if (scenario === 'looking') {
      return {
        availabilityStatus: TaxAvailabilityStatus.LookingForYourTax,
        items: [],
        taxAdministrator: null,
      }
    }
    if (scenario === 'notOnRecord') {
      return {
        availabilityStatus: TaxAvailabilityStatus.TaxNotOnRecord,
        items: [],
        taxAdministrator: null,
      }
    }

    return {
      availabilityStatus: TaxAvailabilityStatus.Available,
      items: [
        {
          year: 2024,
          status: TaxStatusEnum.NotPaid,
          type,
          order: 1,
          amountToBePaid: 15000,
          createdAt: '2024-01-15T00:00:00.000Z',
        },
      ],
      taxAdministrator: null,
    }
  }

  return {
    [TaxType.Dzn]: makeDto(TaxType.Dzn),
    [TaxType.Ko]: makeDto(TaxType.Ko),
  }
}

// ─── Mock tax detail (TaxFeePageContent / TaxFeePaymentPageContent) ───

const MOCK_TAX_PAYER = {
  name: 'Ján Vymyslený',
  permanentResidenceStreet: 'Vymyslená 1',
  permanentResidenceZip: '811 06',
  permanentResidenceCity: 'Bratislava',
  externalId: '12345',
}

export const createMockTaxDetail = (
  paidStatus: TaxStatusEnum,
  taxType: TaxType = TaxType.Dzn,
): TaxControllerV2GetTaxDetailByYearV2200Response => {
  const isPaid = paidStatus === TaxStatusEnum.Paid || paidStatus === TaxStatusEnum.OverPaid
  const isCancelled = paidStatus === TaxStatusEnum.Cancelled
  const totalAmount = 150
  const paidAmount = isPaid ? totalAmount : paidStatus === TaxStatusEnum.PartiallyPaid ? 50 : 0
  const balance = totalAmount - paidAmount

  const oneTimePayment = isPaid
    ? {
        isPossible: false,
        reasonNotPossible: ResponseOneTimePaymentDetailsDtoReasonNotPossibleEnum.AlreadyPaid,
      }
    : isCancelled
      ? {
          isPossible: false,
          reasonNotPossible: ResponseOneTimePaymentDetailsDtoReasonNotPossibleEnum.TaxIsCancelled,
        }
      : {
          isPossible: true,
          type: ResponseOneTimePaymentDetailsDtoTypeEnum.RemainingAmountPayment,
          amount: balance,
          dueDate: '2024-05-31',
          qrCode: '',
          variableSymbol: '20241234560000',
        }

  const installmentPayment =
    isPaid || isCancelled
      ? {
          isPossible: false,
          reasonNotPossible: isPaid
            ? ResponseInstallmentPaymentDetailDtoReasonNotPossibleEnum.AlreadyPaid
            : ResponseInstallmentPaymentDetailDtoReasonNotPossibleEnum.TaxIsCancelled,
        }
      : {
          isPossible: true,
          installments: [
            {
              installmentNumber: 1,
              dueDate: '2024-03-31',
              status: InstallmentPaidStatusEnum.NotPaid,
              remainingAmount: 50,
              totalInstallmentAmount: 50,
            },
            {
              installmentNumber: 2,
              dueDate: '2024-06-30',
              status: InstallmentPaidStatusEnum.NotPaid,
              remainingAmount: 50,
              totalInstallmentAmount: 50,
            },
            {
              installmentNumber: 3,
              dueDate: '2024-09-30',
              status: InstallmentPaidStatusEnum.NotPaid,
              remainingAmount: 50,
              totalInstallmentAmount: 50,
            },
          ],
          activeInstallment: {
            remainingAmount: 50,
            variableSymbol: '20241234560001',
            dueDate: '2024-03-31',
            qrCode: '',
          },
        }

  const base = {
    paidStatus,
    year: 2024,
    order: 1,
    overallPaid: paidAmount,
    overallBalance: balance,
    overallAmount: totalAmount,
    oneTimePayment,
    installmentPayment,
    taxAdministrator: null,
    taxPayer: MOCK_TAX_PAYER,
  }

  if (taxType === TaxType.Dzn) {
    return {
      ...base,
      type: 'DZN',
      itemizedDetail: {
        apartmentTotalAmount: 100,
        constructionTotalAmount: 30,
        groundTotalAmount: 20,
        apartmentTaxDetail: [{ type: 'byt', base: 50, amount: 100 }],
        groundTaxDetail: [{ type: 'A', base: 20, amount: 20 }],
        constructionTaxDetail: [{ type: 'NONRESIDENTIAL', base: 15, amount: 30 }],
      },
    }
  }

  return {
    ...base,
    type: 'KO',
    itemizedDetail: {
      addressDetail: [
        {
          address: { street: 'Vymyslená', orientationNumber: '1' },
          totalAmount: 150,
          itemizedContainers: [
            {
              containerVolume: 120,
              containerCount: 1,
              numberOfDisposals: 52,
              unitRate: 2.88,
              containerType: 'Plastový kontajner',
              fee: 150,
            },
          ],
        },
      ],
    },
  }
}
