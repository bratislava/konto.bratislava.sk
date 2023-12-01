import TaxFeeSectionHeader from 'components/forms/segments/AccountSectionHeader/TaxFeeSectionHeader'
import Spinner from 'components/forms/simple-components/Spinner'
import { useRouter } from 'next/router'
import { ReactNode, useEffect } from 'react'

import { ROUTES } from '../../../../../frontend/api/constants'
import { TaxApiError } from '../../../../../frontend/dtos/generalApiDto'
import { useTaxes } from '../../../../../frontend/hooks/apiHooks'
import logger from '../../../../../frontend/utils/logger'
import ContactInformationSection from './ContactInformation'
import PaymentData from './PaymentData'
import TaxDetails from './TaxDetails'

type TaxAndFeeMainContentBase = {
  children: ReactNode
}

const TaxAndFeeMainContent = ({ children }: TaxAndFeeMainContentBase) => {
  return (
    <div className="m-auto flex w-full max-w-screen-lg flex-col items-center gap-12 py-12">
      {children}
    </div>
  )
}

const TaxFeeSection = () => {
  const { data, error, isPending } = useTaxes()
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

  let content = <Spinner className="m-auto mt-10" />
  if (!isPending && !data) {
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
