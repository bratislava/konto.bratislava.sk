import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { Tax } from '../../../../../frontend/dtos/taxDto'
import useAccount, { Address } from '../../../../../frontend/hooks/useAccount'
import useSnackbar from '../../../../../frontend/hooks/useSnackbar'
import SummaryRowSimple from '../../../simple-components/SummaryRowSimple'
import SummaryRow from '../../../steps/Summary/SummaryRow'
import CorrespondenceAddressModal from '../../CorrespondenceAddressModal/CorrespondenceAddressModal'

interface ContactInformationSectionProps {
  tax: Tax
}

const postalCodeFormat = (code?: string): string =>
  code ? `${code.slice(0, 3)} ${code.slice(3)}` : ''

const ContactInformationSection = ({ tax }: ContactInformationSectionProps) => {
  const { t } = useTranslation('account')
  const { userData, updateUserData, error, resetError } = useAccount()
  const [showSnackbar] = useSnackbar({ variant: 'success' })
  const postal_code_array = userData?.address?.postal_code?.replace(/\s/g, '')
  const [correspondenceAddressModalShow, setCorrespondenceAddressModalShow] = useState(false)

  const onSubmitCorrespondenceAddress = async ({ data }: { data?: Address }) => {
    if (await updateUserData({ address: data })) {
      setCorrespondenceAddressModalShow(false)
      showSnackbar(t('profile_detail.success_alert'))
    }
  }

  return (
    <>
      <CorrespondenceAddressModal
        show={correspondenceAddressModalShow}
        onClose={() => setCorrespondenceAddressModalShow(false)}
        onSubmit={onSubmitCorrespondenceAddress}
        defaultValues={userData?.address}
        error={error}
        onHideError={resetError}
      />
      <div className="lg:px-0 flex flex-col items-start sm:gap-8 gap-6 w-full px-4">
        <div className="flex flex-col w-full items-start gap-2">
          <div className="text-h3">{t('personal_info')}</div>
          <div className="flex flex-col w-full">
            <SummaryRow
              size="small"
              isEditable={false}
              data={{
                label: t('name_and_surname'),
                value:
                  tax.taxPayer?.name ||
                  `${userData?.given_name || ''} ${userData?.family_name || ''}`,
                schemaPath: '',
                isError: false,
              }}
            />
            <SummaryRow
              size="small"
              isEditable={false}
              data={{
                label: t('permanent_address'),
                value: `${tax.taxPayer?.permanentResidenceStreet}${
                  tax.taxPayer?.permanentResidenceZip
                    ? `, ${tax.taxPayer?.permanentResidenceZip}`
                    : ''
                }${
                  tax.taxPayer?.permanentResidenceCity
                    ? `, ${tax.taxPayer?.permanentResidenceCity}`
                    : ''
                }`,
                schemaPath: '',
                isError: false,
              }}
            />
            <SummaryRow
              size="small"
              data={{
                label: t('correspondence_address'),
                value:
                  userData &&
                  (userData.address?.street_address ||
                    userData.address?.postal_code ||
                    userData.address?.locality)
                    ? `${
                        userData.address?.street_address &&
                        (postal_code_array || userData.address?.locality)
                          ? `${userData.address?.street_address},`
                          : userData.address?.street_address || ''
                      } ${postalCodeFormat(postal_code_array)} ${userData.address?.locality || ''}`
                    : '',
                schemaPath: '',
                isError: false,
              }}
              onGoToStep={() => setCorrespondenceAddressModalShow(true)}
            />
            <SummaryRow
              size="small"
              isEditable={false}
              data={{
                label: t('taxpayer_id'),
                value: tax.taxPayer?.externalId,
                schemaPath: '',
                isError: false,
              }}
            />
          </div>
        </div>
        <div className="flex flex-col w-full items-start gap-2">
          <div className="text-h3">{t('equips')}</div>
          <div className="flex flex-col w-full">
            <SummaryRow
              size="small"
              isEditable={false}
              data={{
                label: t('name_and_surname'),
                value: tax?.taxEmployees?.name,
                schemaPath: '',
                isError: false,
              }}
            />
            <SummaryRowSimple size="small" isEditable={false} label={t('contact')} isError={false}>
              <div className="flex gap-2">
                <div>
                  <a
                    className="underline underline-offset-4"
                    href={`tel:${tax?.taxEmployees?.phoneNumber}`}
                  >
                    {tax?.taxEmployees?.phoneNumber}
                  </a>
                  ,
                </div>
                <a
                  className="underline underline-offset-4"
                  href={`mailto:${tax?.taxEmployees?.email}`}
                >
                  {tax?.taxEmployees?.email}
                </a>
              </div>
            </SummaryRowSimple>
          </div>
        </div>
      </div>
    </>
  )
}

export default ContactInformationSection
