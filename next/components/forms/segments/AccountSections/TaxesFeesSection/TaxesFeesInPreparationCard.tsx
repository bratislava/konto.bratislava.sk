import React from 'react'

import Alert from '../../../info-components/Alert'
import AccountMarkdown from '../../AccountMarkdown/AccountMarkdown'
import { useStrapiTax } from './useStrapiTax'

const TaxesFeesInPreparationCard = () => {
  const { currentYearTaxInPreparationTitle, currentYearTaxInPreparationText } = useStrapiTax()

  return (
    <Alert
      type="warning"
      fullWidth
      message={
        <>
          {currentYearTaxInPreparationTitle && (
            <span className="text-h6">{currentYearTaxInPreparationTitle}</span>
          )}
          {currentYearTaxInPreparationText && (
            <AccountMarkdown variant="sm" content={currentYearTaxInPreparationText} />
          )}
        </>
      }
    />
  )
}

export default TaxesFeesInPreparationCard
