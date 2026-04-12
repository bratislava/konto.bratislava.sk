import { Button } from '@bratislava/component-library'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'next-i18next'
import objectHash from 'object-hash'
import { useLocalStorage } from 'usehooks-ts'

import { CrossIcon } from '@/src/assets/ui-icons'
import { strapiClient } from '@/src/clients/graphql-strapi'
import AccountMarkdown from '@/src/components/formatting/AccountMarkdown'
import WarningIcon from '@/src/components/icon-components/WarningIcon'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import { environment } from '@/src/environment'

const fetchAlert = async () => {
  try {
    const alertsQuery = await strapiClient.Alerts()
    const alerts = alertsQuery.general?.alerts?.filter((alert) => alert != null) ?? []

    const now = new Date()

    const validAlerts = alerts.filter((alert) => {
      const { dateFrom, dateTo } = alert
      const fromDate = dateFrom ? new Date(dateFrom) : null
      const toDate = dateTo ? new Date(dateTo) : null

      const isAfterFromDate = !fromDate || now >= fromDate
      const isBeforeToDate = !toDate || now <= toDate

      return isAfterFromDate && isBeforeToDate
    })

    const validAlert = validAlerts.length > 0 ? validAlerts[0] : null
    if (validAlert) {
      return { ...validAlert, uniqueId: objectHash(validAlert) }
    }

    return null
  } catch (error) {
    // Handle error gracefully
    return null
  }
}

export const StatusBar = () => {
  const { t } = useTranslation('account')

  const { data: alertData } = useQuery({
    queryKey: ['alert'],
    queryFn: fetchAlert,
    staleTime: Infinity,
  })
  const [dismissedAlerts, setDismissedAlerts] = useLocalStorage<string[]>('dismissedAlerts', [])

  const shouldShowAlert = alertData && !dismissedAlerts.includes(alertData.uniqueId)
  const displayStatusBar = shouldShowAlert && !environment.featureToggles.hideStatusbar

  if (!displayStatusBar) {
    return null
  }

  const handleDismiss = () => {
    if (alertData && !dismissedAlerts.includes(alertData.uniqueId)) {
      setDismissedAlerts((prev) => [...prev, alertData.uniqueId])
    }
  }

  return (
    <div className="w-full bg-warning-700 text-white">
      <SectionContainer>
        <div className="flex justify-between py-4">
          <div className="flex">
            <span className="mr-3">
              <WarningIcon solid className="size-5" />
            </span>
            <AccountMarkdown variant="statusBar" content={alertData.content} />
          </div>
          <Button
            className="h-fit shrink-0"
            icon={<CrossIcon />}
            aria-label={t('StatusBar.aria.close') ?? ''}
            onPress={handleDismiss}
          />
        </div>
      </SectionContainer>
    </div>
  )
}
