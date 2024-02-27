import { updateUserAttributes } from 'aws-amplify/auth'
import { UserData } from 'frontend/dtos/accountDto'
import { useRefreshServerSideProps } from 'frontend/hooks/useRefreshServerSideProps'
import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import useSnackbar from 'frontend/hooks/useSnackbar'
import { GENERIC_ERROR_MESSAGE, isError } from 'frontend/utils/errors'
import logger from 'frontend/utils/logger'
import identity from 'lodash/identity'
import mapValues from 'lodash/mapValues'
import pickBy from 'lodash/pickBy'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'

import AccountMarkdown from '../AccountMarkdown/AccountMarkdown'
import UserProfileConsents from './UserProfileConsents'
import UserProfileDetail from './UserProfileDetail'
import UserProfilePassword from './UserProfilePassword'

const UserProfileView = () => {
  const { t } = useTranslation('account')
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isAlertOpened, setIsAlertOpened] = useState(false)
  const [alertType, setAlertType] = useState<'success' | 'error'>('success')
  const { userData } = useServerSideAuth()
  const [openSnackbarSuccess] = useSnackbar({ variant: 'success' })

  const [updateUserDataError, setUpdateUserDataError] = useState<Error | null>(null)
  const { refreshData } = useRefreshServerSideProps(userData)
  const { push } = useRouter()

  useEffect(() => {
    setAlertType(updateUserDataError ? 'error' : 'success')
  }, [updateUserDataError])

  const handleOnCancelEditing = () => {
    setIsEditing(false)
  }

  const handleOnSubmitEditing = async (newUserData: UserData) => {
    try {
      const userAttributes = mapValues(pickBy(newUserData, identity))
      const keys = Object.keys(userAttributes)
      const result = await updateUserAttributes({
        userAttributes,
      })
      keys.forEach((key) => {
        const keyResult = result[key]
        if (!keyResult.isUpdated) {
          throw new Error(`Unknown error - attribute ${key} was not updated`)
        }
      })

      // TODO why it's openSnackbarSuccess on success and setIsAlertOpened on error ?
      openSnackbarSuccess(t('profile_detail.success_alert'), 3000)
      await refreshData()
      setIsEditing(false)
    } catch (error) {
      logger.error('Update User Data failed', error)
      if (isError(error)) {
        setUpdateUserDataError(error)
      } else {
        logger.error(
          `${GENERIC_ERROR_MESSAGE} - unexpected object thrown in handleOnSubmitEditing:`,
          error,
        )
        setUpdateUserDataError(new Error('Unknown error'))
      }
      setIsAlertOpened(true)
      setTimeout(() => setIsAlertOpened(false), 3000)
    }
  }

  return (
    <section className="h-full bg-gray-100">
      <div className="flex h-full flex-col gap-2 md:gap-0">
        <UserProfileDetail
          userData={userData}
          isEditing={isEditing}
          isAlertOpened={isAlertOpened}
          alertType={alertType}
          onChangeIsEditing={setIsEditing}
          onCancelEditing={handleOnCancelEditing}
          onSubmit={handleOnSubmitEditing}
          onEmailChange={() => push('/zmena-emailu')}
        />
        <UserProfilePassword />
        <UserProfileConsents />
        <div className="bg-gray-100 md:bg-gray-0">
          <AccountMarkdown
            content={`<span className='text-p2'>${t('gdpr_details_link')}</span>`}
            variant="sm"
            className="mx-auto w-full max-w-screen-lg px-4 pb-5 pt-3 md:px-8 md:pb-6 md:pt-4 lg:px-0"
          />
        </div>
      </div>
    </section>
  )
}

export default UserProfileView
