import { ResponseTaxDto } from '@clients/openapi-tax'
import TaxFeeSectionHeader from 'components/forms/segments/AccountSectionHeader/TaxFeeSectionHeader'

import ContactInformationSection from './ContactInformation'
import PaymentData from './PaymentData'
import TaxDetails from './TaxDetails'
import { TaxFeeSectionProvider } from './useTaxFeeSection'

type TaxFeeSectionProps = {
  taxData: ResponseTaxDto
}

const TaxFeeSection = ({ taxData }: TaxFeeSectionProps) => {
  return (
    <TaxFeeSectionProvider taxData={taxData}>
      <div className="flex flex-col">
        <TaxFeeSectionHeader />
        <div className="m-auto flex w-full max-w-screen-lg flex-col items-center gap-12 py-12">
          <ContactInformationSection />
          <TaxDetails />
          <PaymentData />
        </div>
      </div>
    </TaxFeeSectionProvider>
  )
}

export default TaxFeeSection
