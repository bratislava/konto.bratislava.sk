// eslint-disable-next-line import/no-extraneous-dependencies
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { environment } from '../../../../../environment'
import { Address } from '../../../../../frontend/dtos/accountDto'
import { useSsrAuth } from '../../../../../frontend/hooks/useSsrAuth'
import { isDefined } from '../../../../../frontend/utils/general'
import SummaryRowSimple from '../../../simple-components/SummaryRowSimple'
import SummaryRow from '../../../steps/Summary/SummaryRow'
import CorrespondenceAddressModalV2 from '../../CorrespondenceAddressModal/CorrespondenceAddressModalV2'
import { useTaxFeeSection } from './useTaxFeeSection'

const formatZip = (zip?: string) => {
  if (!zip) return null

  if (/^\d{5}$/g.test(zip)) {
    return `${zip.slice(0, 3)} ${zip.slice(3)}`
  }

  return zip
}

const displayStrings = (strings: (string | undefined | null)[], separator: string) =>
  strings.filter(isDefined).join(separator)

const ContactInformationSection = () => {
  const { taxData } = useTaxFeeSection()
  const { t } = useTranslation('account')
  const { userAttributes } = useSsrAuth()
  const [parsedAddress, setParsedAddress] = useState(() => {
    try {
      return JSON.parse(userAttributes?.address ?? '{}') as Address
    } catch {
      return {} as Address
    }
  })
  const [correspondenceAddressModalShow, setCorrespondenceAddressModalShow] = useState(false)

  const displayName =
    taxData.taxPayer?.name ??
    displayStrings([userAttributes?.given_name, userAttributes?.family_name], ' ')
  const displayPermanentAddress = displayStrings(
    [
      taxData.taxPayer?.permanentResidenceStreet,
      formatZip(taxData.taxPayer?.permanentResidenceZip),
      taxData.taxPayer?.permanentResidenceCity,
    ],
    ', ',
  )
  const displayCorrespondenceAddress = displayStrings(
    [parsedAddress?.street_address, formatZip(parsedAddress?.postal_code), parsedAddress?.locality],
    ', ',
  )

  return (
    <>
      {environment.featureToggles.taxReportCorrespondenceAddress && (
        <CorrespondenceAddressModalV2
          parsedAddress={parsedAddress}
          isOpen={correspondenceAddressModalShow}
          onOpenChange={setCorrespondenceAddressModalShow}
          onSuccess={(newAddress) => {
            setParsedAddress(newAddress)
            setCorrespondenceAddressModalShow(false)
          }}
        />
      )}
      <div className="flex w-full flex-col items-start gap-6 px-4 sm:gap-8 lg:px-0">
        <div className="flex w-full flex-col items-start gap-2">
          <div className="text-h3">{t('personal_info')}</div>
          <div className="flex w-full flex-col">
            <SummaryRow
              size="small"
              isEditable={false}
              data={{
                label: t('name_and_surname'),
                value: displayName,
                schemaPath: '',
                isError: false,
              }}
            />
            <SummaryRow
              size="small"
              isEditable={false}
              data={{
                label: t('permanent_address'),
                value: displayPermanentAddress,
                schemaPath: '',
                isError: false,
              }}
            />
            {/* Temporarily hidden as this is not implemented on BE. */}
            {environment.featureToggles.taxReportCorrespondenceAddress && (
              <SummaryRow
                size="small"
                data={{
                  label: t('correspondence_address'),
                  value: displayCorrespondenceAddress,
                  schemaPath: '',
                  isError: false,
                }}
                onGoToStep={() => setCorrespondenceAddressModalShow(true)}
              />
            )}
            <SummaryRow
              size="small"
              isEditable={false}
              data={{
                label: t('taxpayer_id'),
                value: taxData.taxPayer?.externalId,
                schemaPath: '',
                isError: false,
              }}
            />
          </div>
        </div>
        <div className="flex w-full flex-col items-start gap-2">
          <div className="text-h3">{t('equips')}</div>
          <div className="flex w-full flex-col">
            <SummaryRow
              size="small"
              isEditable={false}
              data={{
                label: t('name_and_surname'),
                value: taxData?.taxEmployees?.name,
                schemaPath: '',
                isError: false,
              }}
            />
            <SummaryRowSimple size="small" isEditable={false} label={t('contact')} isError={false}>
              <>
                <a
                  className="underline underline-offset-4"
                  href={`tel:${taxData?.taxEmployees?.phoneNumber}`}
                >
                  {taxData?.taxEmployees?.phoneNumber}
                </a>
                ,{' '}
                <a
                  className="underline underline-offset-4"
                  href={`mailto:${taxData?.taxEmployees?.email}`}
                >
                  {taxData?.taxEmployees?.email}
                </a>
              </>
            </SummaryRowSimple>
          </div>
        </div>
      </div>
    </>
  )
}

export default ContactInformationSection
