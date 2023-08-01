import { Auth } from 'aws-amplify'
import { Address } from 'frontend/dtos/accountDto'
import { Tax } from 'frontend/dtos/taxDto'
import useJsonParseMemo from 'frontend/hooks/useJsonParseMemo'
import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import { GENERIC_ERROR_MESSAGE, isError } from 'frontend/utils/errors'
import logger from 'frontend/utils/logger'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

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
  const { userData } = useServerSideAuth()
  const [showSnackbar] = useSnackbar({ variant: 'success' })
  const address = userData?.address
  const parsedAddress = useJsonParseMemo<Address>(address)
  const postal_code_array = parsedAddress?.postal_code?.replace(/\s/g, '')
  const [correspondenceAddressModalShow, setCorrespondenceAddressModalShow] = useState(false)

  const [correspondenceAddressError, setCorrespondenceAddressError] = useState<Error | null>(null)
  const resetError = () => {
    setCorrespondenceAddressError(null)
  }

  const onSubmitCorrespondenceAddress = async ({ data }: { data?: Address }) => {
    try {
      const user = await Auth.currentAuthenticatedUser()
      if (
        await Auth.updateUserAttributes(user, {
          address: data,
        })
      ) {
        setCorrespondenceAddressModalShow(false)
        showSnackbar(t('profile_detail.success_alert'))
      }
    } catch (error) {
      if (isError(error)) {
        setCorrespondenceAddressError(error)
      } else {
        logger.error(
          `${GENERIC_ERROR_MESSAGE} - unexpected object thrown in onSubmitCorrespondenceAddress:`,
          error,
        )
        setCorrespondenceAddressError(new Error('Unknown error'))
      }
    }
  }

  return (
    <>
      <CorrespondenceAddressModal
        show={correspondenceAddressModalShow}
        onClose={() => setCorrespondenceAddressModalShow(false)}
        onSubmit={onSubmitCorrespondenceAddress}
        defaultValues={parsedAddress || undefined}
        error={correspondenceAddressError}
        onHideError={resetError}
      />
      <div className="flex w-full flex-col items-start gap-6 px-4 sm:gap-8 lg:px-0">
        <div className="flex w-full flex-col items-start gap-2">
          <div className="text-h3">{t('personal_info')}</div>
          <div className="flex w-full flex-col">
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
                  (parsedAddress?.street_address ||
                    parsedAddress?.postal_code ||
                    parsedAddress?.locality)
                    ? `${
                        parsedAddress?.street_address &&
                        (postal_code_array || parsedAddress?.locality)
                          ? `${parsedAddress?.street_address},`
                          : parsedAddress?.street_address || ''
                      } ${postalCodeFormat(postal_code_array)} ${parsedAddress?.locality || ''}`
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
        <div className="flex w-full flex-col items-start gap-2">
          <div className="text-h3">{t('equips')}</div>
          <div className="flex w-full flex-col">
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
