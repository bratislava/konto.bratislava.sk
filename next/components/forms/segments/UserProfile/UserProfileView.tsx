import MessageModal from 'components/forms/widget-components/Modals/MessageModal'
import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'

import useAccount, { UserData } from '../../../../frontend/hooks/useAccount'
import useSnackbar from '../../../../frontend/hooks/useSnackbar'
import logger from '../../../../frontend/logger'
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
  const { userData, updateUserData, error } = useAccount()
  const [openSnackbarSuccess] = useSnackbar({ variant: 'success' })

  useEffect(() => {
    setAlertType(error ? 'error' : 'success')
  }, [error])

  const handleOnCancelEditing = () => {
    setIsEditing(false)
  }

  const handleOnSubmitEditing = (newUserData: UserData) => {
    updateUserData(newUserData)
      .then(() => {
        setIsEditing(false)
        if (alertType === 'error') {
          setIsAlertOpened(true)
          setTimeout(() => setIsAlertOpened(false), 3000)
        } else if (alertType === 'success') {
          // default is 5000 ms
          openSnackbarSuccess(t('profile_detail.success_alert'), 3000)
        }
        return null
      })
      .catch((error_) => {
        logger.error('Update User Data failed', error_)
        setIsAlertOpened(true)
        setTimeout(() => setIsAlertOpened(false), 3000)
      })
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
          <AccountMarkdown content={t('profile_detail.modal_message')} variant="sm" />
          <p className="mt-6">{t('profile_detail.modal_thanks')}</p>
        </MessageModal>
      </div>
    </section>
  )
}

export default UserProfileView
