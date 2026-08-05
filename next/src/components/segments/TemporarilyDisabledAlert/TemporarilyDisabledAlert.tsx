import { useTranslation } from 'next-i18next/pages'

import { FormTemporarilyDisabledFragment } from '@/src/clients/graphql-strapi/api'
import Markdown from '@/src/components/formatting/Markdown'
import Alert from '@/src/components/simple-components/Alert'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'

/**
 * Renders the "service temporarily disabled" alert. Copy is fixed in code, only the restoration date
 * and optional reason come from Strapi. The reason line is shown only on the landing page.
 *
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=18316-19326
 */

type TemporarilyDisabledAlertProps = {
  strapiForm: FormTemporarilyDisabledFragment | null | undefined
  variant: 'landingPage' | 'form'
  className?: string
}

const TemporarilyDisabledAlert = ({
  strapiForm,
  variant,
  className,
}: TemporarilyDisabledAlertProps) => {
  const { t } = useTranslation('account')
  const { isSignedIn } = useSsrAuth()

  if (!strapiForm?.isTemporarilyDisabled) {
    return null
  }

  const date = strapiForm.temporarilyDisabledUntil?.trim() || undefined
  const reason = strapiForm.temporarilyDisabledReason?.trim() || undefined

  const translationMap = {
    authenticated: {
      withDate: t('TemporarilyDisabledAlert.body.authenticated.withDate', { date }),
      withoutDate: t('TemporarilyDisabledAlert.body.authenticated.withoutDate'),
    },
    notAuthenticated: {
      withDate: t('TemporarilyDisabledAlert.body.notAuthenticated.withDate', { date }),
      withoutDate: t('TemporarilyDisabledAlert.body.notAuthenticated.withoutDate'),
    },
  }

  const showReason = variant === 'landingPage' && !!reason

  const message = (
    <div className="flex flex-col gap-2">
      <Markdown
        variant="small"
        content={
          translationMap[isSignedIn ? 'authenticated' : 'notAuthenticated'][
            date ? 'withDate' : 'withoutDate'
          ]
        }
      />
      {showReason ? (
        <div>
          <span className="font-semibold">{t('TemporarilyDisabledAlert.reasonLabel')}</span>{' '}
          {reason}
        </div>
      ) : null}
    </div>
  )

  return (
    <Alert
      type="warning"
      title={t('TemporarilyDisabledAlert.title')}
      message={message}
      fullWidth
      className={className}
    />
  )
}

export default TemporarilyDisabledAlert
