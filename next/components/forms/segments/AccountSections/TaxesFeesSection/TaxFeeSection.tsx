import { useTaxes } from '@utils/apiHooks'
import { ROUTES } from '@utils/constants'
import logger from '@utils/logger'
import TaxFeeSectionHeader from 'components/forms/segments/AccountSectionHeader/TaxFeeSectionHeader'
import Spinner from 'components/forms/simple-components/Spinner'
import { useRouter } from 'next/router'
import { ReactNode, useEffect } from 'react'

import ContactInformationSection from './ContactInformation'
import PaymentData from './PaymentData'
import TaxDetails from './TaxDetails'

type TaxAndFeeMainContentBase = {
  children: ReactNode
}

const TaxAndFeeMainContent = ({ children }: TaxAndFeeMainContentBase) => {
  return (
    <div className="flex flex-col items-center w-full max-w-screen-lg m-auto gap-12 py-12">
      {children}
    </div>
  )
}

interface TaxesFeeSectionProps {
  isProductionDeployment?: boolean
}

const TaxFeeSection = ({ isProductionDeployment }: TaxesFeeSectionProps) => {
  const { data, error, isLoading } = useTaxes()
  const router = useRouter()

  // TODO effect redirect to index if no data

  useEffect(() => {
    if (error) {
      logger.error('Tax detail error ', error)
      if (error?.status === 422) {
        router
          .push(ROUTES.TAXES_AND_FEES)
          .catch((error) => logger.error('Tax detail redirect error', error))
      }
    }
  }, [error, router])

  if (isLoading || isProductionDeployment || (!isLoading && !data))
    return <Spinner className="mt-10 m-auto" />

  // TODO error page

  return (
    <div className="flex flex-col">
      <TaxFeeSectionHeader tax={data} />
      <TaxAndFeeMainContent>
        <ContactInformationSection tax={data} />
        <TaxDetails tax={data} />
        <PaymentData tax={data} />
      </TaxAndFeeMainContent>
    </div>
  )
}

export default TaxFeeSection
