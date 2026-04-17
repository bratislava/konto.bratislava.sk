import { Button } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

import { LockIcon } from '@/src/assets/ui-icons'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import { ROUTES } from '@/src/utils/routes'

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19551-22584&t=IZ8lRgxsaIokMNeg-4
 */

const UserProfilePassword = () => {
  const { t } = useTranslation('account')

  return (
    <SectionContainer>
      <div className="border-border-passive-primary rounded-lg border p-4 lg:p-6">
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-col gap-2">
            <h2 className="text-h5">{t('my_profile.password_change.title')}</h2>
            <p className="text-p2">{t('my_profile.password_change.text')}</p>
          </div>
          <Button
            variant="solid"
            startIcon={<LockIcon />}
            href={ROUTES.PASSWORD_CHANGE}
            hasLinkIcon={false}
            data-cy="change-password-button"
          >
            {t('my_profile.password_change.button')}
          </Button>
        </div>
      </div>
    </SectionContainer>
  )
}

export default UserProfilePassword
