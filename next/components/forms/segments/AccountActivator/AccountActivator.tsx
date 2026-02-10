import AccountContainer from 'components/forms/segments/AccountContainer/AccountContainer'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import { useTranslation } from 'next-i18next'
import React from 'react'

import Button from '../../simple-components/Button'

const AccountActivator = () => {
  const { t } = useTranslation('account')

  return (
    <AccountContainer>
      <div className="flex flex-col gap-2 rounded-xl bg-gray-50 px-5 py-4 md:rounded-none md:bg-gray-0 md:p-0">
        <h3 className="text-h3">{t('account_activator.title')}</h3>
        <AccountMarkdown variant="sm" content={`${t('account_activator.content')}`} />
        <Button variant="link" className="mt-2 md:mt-4" href="https://bratislava.sk/konto">
          {t('account_activator.button_text')}
        </Button>
      </div>
    </AccountContainer>
  )
}

export default AccountActivator
