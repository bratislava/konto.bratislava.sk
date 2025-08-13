import TaxFeeSectionHeader from 'components/forms/segments/AccountSectionHeader/TaxFeeSectionHeader'
import React from 'react'

import PaymentData from './PaymentData'
import TaxFooter from './TaxFooter'

const TaxFeePayment = () => {
  return (
    <div className="flex flex-col">
      <TaxFeeSectionHeader />
      <div className="m-auto flex w-full max-w-(--breakpoint-lg) flex-col items-center gap-6 py-6 lg:gap-12 lg:py-12">
        {/* TODO: check if we can pay for previous years if not => taxData.isPayable */}
        <PaymentData />
        <TaxFooter />
      </div>
    </div>
  )
}

export default TaxFeePayment
