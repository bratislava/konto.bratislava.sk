import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { useState } from 'react'

import Icon from '@/src/components/icon-components/Icon'
import DeliveryMethodAlert from '@/src/components/page-contents/TaxesPageContent/shared/DeliveryMethodAlert'
import DeliveryMethodChangeModal from '@/src/components/page-contents/TaxesPageContent/shared/DeliveryMethodChangeModal'
import { useGetDeliveryMethod } from '@/src/frontend/hooks/useDeliveryMethod'

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19565-29877&t=zZFpVkREtcEMkKS5-4
 */

const DeliveryMethodInformation = () => {
  const { t } = useTranslation()

  const {
    deliveryMethod,
    deliveryMethodLabel,
    canUserChangeDeliveryMethod,
    hasUserChangedDeliveryMethodAfterDeadline,
  } = useGetDeliveryMethod()

  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!deliveryMethod) {
    return null
  }

  return (
    <>
      <DeliveryMethodChangeModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
      <div className="flex flex-col gap-4 rounded-lg border bg-gray-0 p-4 lg:mx-0 lg:gap-5 lg:p-5">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-gray-100 p-3 max-lg:hidden">
              <Icon name="mail" className="size-6" />
            </div>
            <Typography variant="p-large" className="font-semibold">
              {deliveryMethodLabel}
            </Typography>
          </div>
          {canUserChangeDeliveryMethod && (
            <>
              {/* Desktop */}
              <Button
                onPress={() => setIsModalOpen(true)}
                variant="link"
                startIcon={<Icon name="settings" />}
                className="max-lg:hidden"
              >
                {t('DeliveryMethodInformation.changeButton')}
              </Button>
              {/* Mobile */}
              <Button
                onPress={() => setIsModalOpen(true)}
                variant="icon-wrapped"
                icon={<Icon name="settings" />}
                className="self-start lg:hidden"
                aria-label={t('DeliveryMethodInformation.aria.changeButton')}
              />
            </>
          )}
        </div>

        {hasUserChangedDeliveryMethodAfterDeadline && (
          <DeliveryMethodAlert variant="change-effective-next-year" />
        )}
      </div>
    </>
  )
}

export default DeliveryMethodInformation
