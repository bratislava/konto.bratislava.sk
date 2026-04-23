import { updateUserAttributes } from 'aws-amplify/auth'
import identity from 'lodash/identity'
import mapValues from 'lodash/mapValues'
import pickBy from 'lodash/pickBy'
import { useTranslation } from 'next-i18next/pages'
import { useId, useState } from 'react'

import useToast from '@/src/components/simple-components/Toast/useToast'
import { UserAttributes } from '@/src/frontend/dtos/accountDto'
import { useRefreshServerSideProps } from '@/src/frontend/hooks/useRefreshServerSideProps'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'
import { useUserUpdateBloomreachData } from '@/src/frontend/hooks/useUser'
import { GENERIC_ERROR_MESSAGE, isError } from '@/src/frontend/utils/errors'
import logger from '@/src/frontend/utils/logger'

export const useUserProfileDetails = () => {
  const { t } = useTranslation('account')
  const { showToast } = useToast()
  const formId = `form-${useId()}`

  const { tierStatus, userAttributes } = useSsrAuth()
  const { refreshData } = useRefreshServerSideProps(userAttributes)
  const { updateBloomreachData } = useUserUpdateBloomreachData()

  const [isEditing, setIsEditing] = useState<boolean>(false)

  const handleSubmitEditing = async (newUserAttributes: UserAttributes) => {
    try {
      const newUserAttributesFiltered = mapValues(pickBy(newUserAttributes, identity))
      const keys = Object.keys(newUserAttributesFiltered)
      const result = await updateUserAttributes({
        userAttributes: newUserAttributesFiltered,
      })

      keys.forEach((key) => {
        const keyResult = result[key]
        if (!keyResult.isUpdated) {
          throw new Error(`Unknown error - attribute ${key} was not updated`)
        }
      })

      showToast({
        message: t('my_profile.profile_detail.success_snackbar_message'),
        variant: 'success',
        duration: 3000,
      })

      // at time of coding cognito is not providing
      // user attributes change event, this is next best thing I come up with
      // this doesn't affect FE, therfore we don't need to wait for result
      await updateBloomreachData()
      await refreshData()

      setIsEditing(false)
    } catch (error) {
      logger.error('Update User Data failed', error)
      if (!isError(error)) {
        logger.error(
          `${GENERIC_ERROR_MESSAGE} - unexpected object thrown in handleOnSubmitEditing:`,
          error,
        )
      }

      showToast({
        message: t('my_profile.profile_detail.error_snackbar_message'),
        variant: 'error',
        duration: 3000,
      })
    }
  }

  return {
    formId,
    tierStatus,
    userAttributes,
    isEditing,
    setIsEditing,
    handleSubmitEditing,
  }
}
