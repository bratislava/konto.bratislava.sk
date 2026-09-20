import { useTranslation } from 'next-i18next/pages'

import Alert from '@/src/components/simple-components/Alert'

/**
 * TODO remove this temporary alert when state systems are fixed.
 *
 * Currently there is increased number of helpdesk tickets about unsuccessful verification.
 * This is temporary solution, that warns the user that identity verification may fail
 * because of occasional outages of MV SR systems.
 * We have no information when outages may end, or how often they happen. (Seems like cca half of attempts).
 * Introduced in September 2026.
 */
const IdentityVerificationOutageAlert = () => {
  const { t } = useTranslation()

  return (
    <Alert
      title={t('IdentityVerificationOutageAlert.title')}
      message={t('IdentityVerificationOutageAlert.message')}
      type="warning"
      fullWidth
    />
  )
}

export default IdentityVerificationOutageAlert
