import TaxesChannelChangeEffectiveNextYearAlert from 'components/forms/segments/AccountSections/TaxesFees/shared/TaxesFeesDeliveryMethod/TaxesChannelChangeEffectiveNextYearAlert'
import TaxesFeesDeliveryMethodCard from 'components/forms/segments/AccountSections/TaxesFees/shared/TaxesFeesDeliveryMethod/TaxesFeesDeliveryMethodCard'
import TaxesFeesDeliveryMethodChangeModal from 'components/forms/segments/AccountSections/TaxesFees/shared/TaxesFeesDeliveryMethod/TaxesFeesDeliveryMethodChangeModal'
import { useOfficialCorrespondenceChannel } from 'components/forms/segments/AccountSections/TaxesFees/useOfficialCorrespondenceChannel'
import { useStrapiTax } from 'components/forms/segments/AccountSections/TaxesFees/useStrapiTax'
import { useState } from 'react'

const OfficialCorrespondenceChannelInformation = () => {
  const { hasChangedDeliveryMethodAfterDeadline } = useOfficialCorrespondenceChannel()
  const strapiTax = useStrapiTax()

  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <TaxesFeesDeliveryMethodChangeModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
      <div className="mx-4 flex flex-col gap-4 rounded-lg bg-gray-0 p-4 lg:mx-0 lg:gap-5 lg:p-5">
        <TaxesFeesDeliveryMethodCard onButtonPress={() => setIsModalOpen(true)} />
        {hasChangedDeliveryMethodAfterDeadline && (
          <TaxesChannelChangeEffectiveNextYearAlert strapiTax={strapiTax} />
        )}
      </div>
    </>
  )
}

export default OfficialCorrespondenceChannelInformation
