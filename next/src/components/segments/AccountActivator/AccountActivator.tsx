import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

import Markdown from '@/src/components/formatting/Markdown'
import AccountContainer from '@/src/components/layouts/AccountContainer'

const AccountActivator = () => {
  const { t } = useTranslation('account')

  return (
    <AccountContainer>
      <div className="flex flex-col gap-2 rounded-xl bg-gray-50 px-5 py-4 md:rounded-none md:bg-gray-0 md:p-0">
        <Typography variant="h3">{t('account_activator.title')}</Typography>
        <Markdown variant="small" content={t('account_activator.content')} />
        <Button variant="link" className="mt-2 md:mt-4" href="https://bratislava.sk/konto">
          {t('account_activator.button_text')}
        </Button>
      </div>
    </AccountContainer>
  )
}

export default AccountActivator
