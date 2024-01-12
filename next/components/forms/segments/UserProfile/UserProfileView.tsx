import { Auth } from 'aws-amplify'
import { UserData } from 'frontend/dtos/accountDto'
import { useRefreshServerSideProps } from 'frontend/hooks/useRefreshServerSideProps'
import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import { GENERIC_ERROR_MESSAGE, isError } from 'frontend/utils/errors'
import logger from 'frontend/utils/logger'
import { showSnackbar } from 'frontend/utils/notifications'
import identity from 'lodash/identity'
import mapValues from 'lodash/mapValues'
import pickBy from 'lodash/pickBy'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import AccountMarkdown from '../AccountMarkdown/AccountMarkdown'
import UserProfileConsents from './UserProfileConsents'
import UserProfileDetail from './UserProfileDetail'
import UserProfilePassword from './UserProfilePassword'

const UserProfileView = () => {
  const { t } = useTranslation('account')
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const { userData } = useServerSideAuth()

  const { refreshData } = useRefreshServerSideProps(userData)
  const { push } = useRouter()

  const handleOnCancelEditing = () => {
    setIsEditing(false)
  }

  const handleOnSubmitEditing = async (newUserData: UserData) => {
    try {
      const user = await Auth.currentAuthenticatedUser()
      await Auth.updateUserAttributes(user, mapValues(pickBy(newUserData, identity)))

      showSnackbar(t('profile_detail.success_alert'), 'success')
      await refreshData()
      setIsEditing(false)
    } catch (error) {
      logger.error('Update User Data failed', error)

      if (isError(error)) {
        showSnackbar(error.toString(), 'error')
      } else {
        logger.error(
          `${GENERIC_ERROR_MESSAGE} - unexpected object thrown in handleOnSubmitEditing:`,
          error,
        )
        showSnackbar(new Error('Unknown error').toString(), 'error')
      }
    }
  }

  return (
    <section className="h-full bg-gray-100">
      <div className="flex h-full flex-col gap-2 md:gap-0">
        <UserProfileDetail
          userData={userData}
          isEditing={isEditing}
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
