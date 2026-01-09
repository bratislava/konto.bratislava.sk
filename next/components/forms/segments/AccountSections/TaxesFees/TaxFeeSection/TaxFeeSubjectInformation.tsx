// eslint-disable-next-line import/no-extraneous-dependencies
import HorizontalDivider from 'components/forms/HorizontalDivider'
import { useTaxFeeSection } from 'components/forms/segments/AccountSections/TaxesFees/useTaxFeeSection'
import CorrespondenceAddressModal from 'components/forms/segments/CorrespondenceAddressModal/CorrespondenceAddressModal'
import SummaryRow from 'components/forms/steps/Summary/SummaryRow'
import { environment } from 'environment'
import { Address } from 'frontend/dtos/accountDto'
import { useSsrAuth } from 'frontend/hooks/useSsrAuth'
import { formatZip } from 'frontend/utils/formatZip'
import { isDefined } from 'frontend/utils/general'
import { useTranslation } from 'next-i18next'
import { TaxType } from 'openapi-clients/tax'
import { Fragment, useState } from 'react'

const displayStrings = (strings: (string | undefined | null)[], separator: string) =>
  strings.filter(isDefined).join(separator)

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=20611-9191&m=dev
 */

const TaxFeeSubjectInformation = () => {
  const { t } = useTranslation('account')

  const { taxData } = useTaxFeeSection()
  const { userAttributes } = useSsrAuth()

  const [parsedAddress, setParsedAddress] = useState(() => {
    try {
      return JSON.parse(userAttributes?.address ?? '{}') as Address
    } catch {
      return {} as Address
    }
  })

  const [showCorrespondenceAddressModal, setShowCorrespondenceAddressModal] = useState(false)

  const title = {
    [TaxType.Dzn]: t('taxes.contact_information.personal_info.tax'),
    [TaxType.Ko]: t('taxes.contact_information.personal_info.fee'),
  }[taxData.type]

  const displayName =
    taxData.taxPayer?.name ??
    displayStrings([userAttributes?.given_name, userAttributes?.family_name], ' ')

  const displayPermanentAddress = displayStrings(
    [
      taxData.taxPayer?.permanentResidenceStreet,
      formatZip(taxData.taxPayer?.permanentResidenceZip ?? undefined),
      taxData.taxPayer?.permanentResidenceCity,
    ],
    ', ',
  )

  const displayCorrespondenceAddress = displayStrings(
    [parsedAddress?.street_address, formatZip(parsedAddress?.postal_code), parsedAddress?.locality],
    ', ',
  )

  const taxFeeSubjectIdLabel = {
    [TaxType.Dzn]: t('taxes.contact_information.taxpayer_id.dzn'),
    [TaxType.Ko]: t('taxes.contact_information.taxpayer_id.ko'),
  }[taxData.type]

  const rows = [
    {
      label: t('taxes.contact_information.name_and_surname'),
      value: displayName,
    },
    {
      label: t('taxes.contact_information.permanent_address'),
      value: displayPermanentAddress,
    },
    {
      label: taxFeeSubjectIdLabel,
      value: taxData.taxPayer?.externalId,
    },
  ]

  return (
    <>
      {/* Temporarily hidden as this is not implemented on BE. */}
      {environment.featureToggles.taxReportCorrespondenceAddress && (
        <CorrespondenceAddressModal
          parsedAddress={parsedAddress}
          isOpen={showCorrespondenceAddressModal}
          onOpenChange={setShowCorrespondenceAddressModal}
          onSuccess={(newAddress) => {
            setParsedAddress(newAddress)
            setShowCorrespondenceAddressModal(false)
          }}
        />
      )}
      <div className="flex w-full flex-col items-start gap-4 px-4 lg:gap-6 lg:px-0">
        <div className="text-h5">{title}</div>
        <ul className="flex w-full flex-col rounded-lg border-2 border-gray-200 px-5 py-2 lg:px-6">
          {rows.map((row, index) => {
            return (
              <Fragment key={index}>
                {index > 0 && <HorizontalDivider asListItem />}
                <li className="flex flex-col gap-2 py-3 lg:flex-row lg:gap-4 lg:py-4">
                  <span className="text-p2-semibold">{row.label}</span>
                  <span className="text-p2">{row.value}</span>
                </li>
              </Fragment>
            )
          })}
          {/* Temporarily hidden as this is not implemented on BE. */}
          {environment.featureToggles.taxReportCorrespondenceAddress && (
            <SummaryRow
              size="small"
              data={{
                label: t('taxes.contact_information.correspondence_address'),
                value: displayCorrespondenceAddress,
                schemaPath: '',
                isError: false,
              }}
              onGoToStep={() => setShowCorrespondenceAddressModal(true)}
            />
          )}
        </ul>
      </div>
    </>
  )
}

export default TaxFeeSubjectInformation
