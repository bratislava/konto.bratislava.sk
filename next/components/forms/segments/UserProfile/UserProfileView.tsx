import { Auth } from 'aws-amplify'
import cx from 'classnames'
import MessageModal from 'components/forms/widget-components/Modals/MessageModal'
import { UserData } from 'frontend/dtos/accountDto'
import { useRefreshServerSideProps } from 'frontend/hooks/useRefreshServerSideProps'
import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import useSnackbar from 'frontend/hooks/useSnackbar'
import { isError } from 'frontend/utils/errors'
import logger from 'frontend/utils/logger'
import { identity, mapValues, pickBy } from 'lodash'
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
  const [isEmailModalOpened, setIsEmailModalOpened] = useState<boolean>(false)
  const { userData } = useServerSideAuth()
  const [openSnackbarSuccess] = useSnackbar({ variant: 'success' })

  const [updateUserDataError, setUpdateUserDataError] = useState<Error | null>(null)
  const { refreshData } = useRefreshServerSideProps(userData)

  useEffect(() => {
    setAlertType(updateUserDataError ? 'error' : 'success')
  }, [updateUserDataError])

  const handleOnCancelEditing = () => {
    setIsEditing(false)
  }

  const handleOnSubmitEditing = async (newUserData: UserData) => {
    try {
      const user = await Auth.currentAuthenticatedUser()
      await Auth.updateUserAttributes(user, mapValues(pickBy(newUserData, identity)))
      // TODO why it's openSnackbarSuccess on success and setIsAlertOpened on error ?
      openSnackbarSuccess(t('profile_detail.success_alert'), 3000)
      await refreshData()
    } catch (error) {
      logger.error('Update User Data failed', error)
      if (isError(error)) {
        setUpdateUserDataError(error)
      } else {
        logger.error('Unexpected error - unexpected object thrown in handleOnSubmitEditing:', error)
        setUpdateUserDataError(new Error('Unknown error'))
      }
      setIsAlertOpened(true)
      setTimeout(() => setIsAlertOpened(false), 3000)
    }
  }

  return (
    <section className="bg-gray-100 h-full">
      <div className="flex flex-col gap-2 md:gap-0 h-full">
        <UserProfileDetail
          userData={userData}
          isEditing={isEditing}
          isAlertOpened={isAlertOpened}
          alertType={alertType}
          onChangeIsEditing={setIsEditing}
          onCancelEditing={handleOnCancelEditing}
          onSubmit={handleOnSubmitEditing}
          onOpenEmailModal={() => setIsEmailModalOpened(true)}
        />
        <UserProfilePassword />
        <UserProfileConsents />
        <div className="bg-gray-100 md:bg-gray-0">
          <AccountMarkdown
            content={`<span className='text-p2'>${t('gdpr_details_link')}</span>`}
            variant="sm"
            className="w-full max-w-screen-lg mx-auto px-4 md:px-8 lg:px-0 pt-3 pb-5 md:pb-6 md:pt-4"
          />
        </div>
        <MessageModal
          show={isEmailModalOpened}
          excludeButtons
          className="w-[700px] m-5"
          type="warning"
          cancelHandler={() => {
            setIsEmailModalOpened(false)
          }}
          submitHandler={() => {
            setIsEmailModalOpened(false)
          }}
          title={t('profile_detail.modal_title')}
        >
          <AccountMarkdown
            content={t('profile_detail.modal_message')}
            variant="sm"
            className={cx('text-center', 'md:text-left')}
          />
          <p className={cx('text-p3 lg:text-p2 mt-6 text-center', 'md:text-left')}>
            {t('profile_detail.modal_thanks')}
          </p>
        </MessageModal>
      </div>
    </section>
  )
}

export default UserProfileView
