import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

import { SsrAuthContext } from '@/src/components/logic/SsrAuthContext'
import { StrapiTaxProvider } from '@/src/components/page-contents/TaxesFees/useStrapiTax'
import SelectField, {
  SelectOption,
} from '@/src/components/widget-components/SelectField/SelectField'
import { Tier } from '@/src/frontend/dtos/accountDto'

import { MOCK_STRAPI_TAX, tierToUserAttributes } from './mockData'

type TaxShowcaseProvidersProps = {
  tier: Tier
  queryClient: QueryClient
  children: ReactNode
}

export const TaxShowcaseProviders = ({
  tier,
  queryClient,
  children,
}: TaxShowcaseProvidersProps) => (
  <SsrAuthContext.Provider
    value={{ isSignedIn: true, userAttributes: tierToUserAttributes(tier), guestIdentityId: null }}
  >
    <QueryClientProvider client={queryClient}>
      <StrapiTaxProvider strapiTax={MOCK_STRAPI_TAX}>{children}</StrapiTaxProvider>
    </QueryClientProvider>
  </SsrAuthContext.Provider>
)

type ShowcaseLayoutProps = {
  controls: ReactNode
  children: ReactNode
}

export const ShowcaseLayout = ({ controls, children }: ShowcaseLayoutProps) => (
  <div className="flex flex-col gap-12">
    <div className="flex gap-3 rounded-sm bg-gray-200 p-3 text-sm">{controls}</div>
    {children}
  </div>
)

type ShowcaseSelectFieldProps<T extends string> = {
  label: string
  options: SelectOption[]
  value: T
  onChange: (value: T) => void
}

export const ShowcaseSelectField = <T extends string>({
  label,
  options,
  value,
  onChange,
}: ShowcaseSelectFieldProps<T>) => (
  <SelectField
    label={label}
    options={options}
    value={options.find((option) => option.value === value) ?? null}
    onChange={(option) => {
      if (option && !Array.isArray(option)) onChange(option.value as T)
    }}
    className="min-w-0 flex-1"
    displayOptionalLabel={false}
  />
)
