import { Button } from '@bratislava/component-library'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'

import Icon from '@/src/components/icon-components/Icon'

const BackButton = () => {
  const { t } = useTranslation('account')
  const router = useRouter()

  return (
    <>
      <Button
        variant="icon-wrapped-negative-margin"
        size="large"
        icon={<Icon name="arrow-left" />}
        aria-label={t('BackButton.aria')}
        onPress={() => router.back()}
        className="max-lg:mx-1"
      />
      <div className="mx-6 h-6 border-r max-lg:hidden" aria-hidden />
    </>
  )
}

export default BackButton
