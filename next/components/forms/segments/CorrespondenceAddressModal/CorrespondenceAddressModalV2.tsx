import { updateUserAttributes } from 'aws-amplify/auth'
import CorrespondenceAddressForm from 'components/forms/segments/CorrespondenceAddressForm/CorrespondenceAddressForm'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'

import { Address } from '../../../../frontend/dtos/accountDto'
import useSnackbar from '../../../../frontend/hooks/useSnackbar'
import { GENERIC_ERROR_MESSAGE, isError } from '../../../../frontend/utils/errors'
import logger from '../../../../frontend/utils/logger'
import Modal, { ModalProps } from '../../simple-components/Modal'

type Props = { parsedAddress: Address; onSuccess: (newAddress: Address) => void } & ModalProps

const CorrespondenceAddressModalV2 = ({
  parsedAddress,
  isOpen,
  onOpenChange,
  onSuccess,
}: Props) => {
  const [showSnackbar] = useSnackbar({ variant: 'success' })
  const { t } = useTranslation('account')
  const [error, setError] = useState<Error | null>(null)

  const resetError = () => {
    setError(null)
  }

  const handleSubmit = async ({ data }: { data: Address }) => {
    try {
      const addressString = JSON.stringify(data)
      const {
        address: { isUpdated },
      } = await updateUserAttributes({
        userAttributes: { address: addressString },
      })
      if (isUpdated) {
        onSuccess(data)
        showSnackbar(t('profile_detail.success_alert'))
      } else {
        throw new Error('Unknown error')
      }
    } catch (error) {
      if (isError(error)) {
        setError(error)
      } else {
        logger.error(
          `${GENERIC_ERROR_MESSAGE} - unexpected object thrown in onSubmitCorrespondenceAddress:`,
          error,
        )
        setError(new Error('Unknown error'))
      }
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(value) => {
        if (!value) {
          resetError()
        }
        onOpenChange?.(value)
      }}
      modalOverlayClassname="md:py-4"
      modalClassname="md:max-w-[800px] md:my-4 md:py-12 md:px-14"
      mobileFullScreen
    >
      {/* TODO: Proper title */}
      <h2 className="text-h2 mb-2">{t('correspondence_address')}</h2>
      <CorrespondenceAddressForm
        onSubmit={handleSubmit}
        error={error}
        defaultValues={parsedAddress ?? undefined}
        onHideError={resetError}
      />
    </Modal>
  )
}

export default CorrespondenceAddressModalV2
