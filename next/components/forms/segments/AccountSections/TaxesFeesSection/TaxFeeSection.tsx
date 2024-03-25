import { ResponseTaxDto } from '@clients/openapi-tax'
import TaxFeeSectionHeader from 'components/forms/segments/AccountSectionHeader/TaxFeeSectionHeader'

import ContactInformationSection from './ContactInformation'
import PaymentData from './PaymentData'
import TaxDetails from './TaxDetails'

type TaxFeeSectionProps = {
  taxData: ResponseTaxDto
}

const TaxFeeSection = ({ taxData }: TaxFeeSectionProps) => {
  return (
    <div className="flex flex-col">
      <TaxFeeSectionHeader tax={taxData} />
      <div className="m-auto flex w-full max-w-screen-lg flex-col items-center gap-12 py-12">
        <ContactInformationSection tax={taxData} />
        <TaxDetails tax={taxData} />
        <PaymentData tax={taxData} />
      </div>
    </div>
  )
}

export default TaxFeeSection
