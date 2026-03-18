import { Button } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next'

import { LockIcon } from '@/src/assets/ui-icons'
import BoxedSection from '@/src/components/page-contents/UserProfilePageContent/BoxedSection'
import BoxedSectionHeader from '@/src/components/page-contents/UserProfilePageContent/BoxedSectionHeader'
import { ROUTES } from '@/src/utils/routes'

const UserProfilePassword = () => {
  const { t } = useTranslation('account')

  return (
    <BoxedSection>
      <BoxedSectionHeader
        title={t('my_profile.password_change.title')}
        text={t('my_profile.password_change.text')}
        isMobileColumn
        childrenToColumn
      >
        <Button
          variant="solid"
          startIcon={<LockIcon />}
          href={ROUTES.PASSWORD_CHANGE}
          hasLinkIcon={false}
          fullWidthMobile
          data-cy="change-password-button"
        >
          {t('my_profile.password_change.button')}
        </Button>
      </BoxedSectionHeader>
    </BoxedSection>
  )
}

export default UserProfilePassword
