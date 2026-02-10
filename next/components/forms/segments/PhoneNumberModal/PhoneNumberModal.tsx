import { updateUserAttributes } from 'aws-amplify/auth'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'

import { UserAttributes } from '@/frontend/dtos/accountDto'
import { useSsrAuth } from '@/frontend/hooks/useSsrAuth'
import { GENERIC_ERROR_MESSAGE, isError } from '@/frontend/utils/errors'
import logger from '@/frontend/utils/logger'

import PhoneNumberForm, { PhoneNumberData } from '../../auth-forms/PhoneNumberForm'
import MessageModal from '../../widget-components/Modals/MessageModal'

const getInitialOpen = (userAttributes: UserAttributes | null) => {
  // Signed out
  if (!userAttributes) {
    return false
  }

  return userAttributes.phone_number == null && userAttributes['custom:hide_phone_modal'] !== 'true'
}

const PhoneNumberModal = () => {
  const { t } = useTranslation('account')
  const { userAttributes } = useSsrAuth()
  const [isOpen, setIsOpen] = useState(getInitialOpen(userAttributes))
  const [phoneNumberError, setPhoneNumberError] = useState<Error | null>(null)

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open)

    if (!open) {
      try {
        await updateUserAttributes({ userAttributes: { 'custom:hide_phone_modal': 'true' } })
      } catch (error) {
        // We want to fail silently here, as this is not a critical operation
        logger.error(
          `${GENERIC_ERROR_MESSAGE} - unexpected object thrown in handleOpenChange:`,
          error,
        )
      }
    }
  }

  const onSubmitPhoneNumber = async (submitData: { data?: PhoneNumberData }) => {
    try {
      const {
        phone_number: { isUpdated },
      } = await updateUserAttributes({
        userAttributes: { phone_number: submitData.data?.phone_number },
      })
      if (isUpdated) {
        setIsOpen(false)
      } else {
        throw new Error('Unknown error')
      }
    } catch (error) {
      if (isError(error)) {
        setPhoneNumberError(error)
      } else {
        logger.error(
          `${GENERIC_ERROR_MESSAGE} - unexpected object thrown in onSubmitPhoneNumber:`,
          error,
        )
        setPhoneNumberError(new Error('Unknown error'))
      }
    }
  }

  const resetError = () => {
    setPhoneNumberError(null)
  }

  return (
    <MessageModal
      title={t('phone_number_modal.title')}
      type="info"
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      mobileFullScreen
      dataCy="add-phone-number"
      // TODO: Move button from inside the form here.
    >
      <PhoneNumberForm
        defaultValues={{ phone_number: userAttributes?.phone_number ?? '' }}
        onSubmit={onSubmitPhoneNumber}
        error={phoneNumberError}
        onHideError={resetError}
      />
    </MessageModal>
  )
}

export default PhoneNumberModal
