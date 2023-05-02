import TaxFeeSectionHeader from 'components/forms/segments/AccountSectionHeader/TaxFeeSectionHeader'
import Spinner from 'components/forms/simple-components/Spinner'
import { useRouter } from 'next/router'
import { ReactNode, useEffect } from 'react'

import { TaxApiError } from '../../../../../frontend/api'
import { ROUTES } from '../../../../../frontend/constants'
import { useTaxes } from '../../../../../frontend/hooks/apiHooks'
import logger from '../../../../../frontend/logger'
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

const TaxFeeSection: React.FC<TaxesFeeSectionProps> = () => {
  const { data, error, isLoading } = useTaxes()
  const router = useRouter()

  // TODO change this once we have multiple taxes
  // if there's a problem deal with it on the taxes page which loads the same data
  useEffect(() => {
    if (error) {
      logger.error('Tax detail error', error)
      if (error instanceof TaxApiError && error.status === 422) {
        router
          .push(ROUTES.TAXES_AND_FEES)
          .catch((error) => logger.error('Tax detail redirect error', error))
      }
    }
  }, [error, router])

  let content = <Spinner className="mt-10 m-auto" />
  if (!isLoading && !data) {
    content = (
      <div>
        Neočakávaná chyba pri načítaní dát - kontaktujte prosím podporu na info@bratislava.sk
      </div>
    )
  } else if (data) {
    content = (
      <>
        <TaxFeeSectionHeader tax={data} />
        <TaxAndFeeMainContent>
          <ContactInformationSection tax={data} />
          <TaxDetails tax={data} />
          <PaymentData tax={data} />
        </TaxAndFeeMainContent>
      </>
    )
  }

  // TODO error page

  return <div className="flex flex-col">{content}</div>
}

export default TaxFeeSection
