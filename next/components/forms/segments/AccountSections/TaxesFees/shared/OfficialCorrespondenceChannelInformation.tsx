import { MailIcon, SettingsIcon } from '@assets/ui-icons'
import OfficialCorrespondenceChannelAlert from 'components/forms/segments/AccountSections/TaxesFees/shared/OfficialCorrespondenceChannelAlert'
import OfficialCorrespondenceChannelChangeModal from 'components/forms/segments/AccountSections/TaxesFees/shared/OfficialCorrespondenceChannelChangeModal'
import { useOfficialCorrespondenceChannel } from 'components/forms/segments/AccountSections/TaxesFees/useOfficialCorrespondenceChannel'
import { useStrapiTax } from 'components/forms/segments/AccountSections/TaxesFees/useStrapiTax'
import ButtonNew from 'components/forms/simple-components/ButtonNew'
import { useTranslation } from 'next-i18next'
import { UserOfficialCorrespondenceChannelEnum } from 'openapi-clients/city-account'
import { useState } from 'react'

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19565-29877&t=zZFpVkREtcEMkKS5-4
 */

const OfficialCorrespondenceChannelInformation = () => {
  const { t } = useTranslation('account')

  const strapiTax = useStrapiTax()
  const { channel, canUserChangeChannel, isChannelChangeEffectiveNextYear } =
    useOfficialCorrespondenceChannel()

  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!channel) {
    return null
  }

  const channelLabel = {
    [UserOfficialCorrespondenceChannelEnum.Email]: t('taxes.communication_channel.email'),
    [UserOfficialCorrespondenceChannelEnum.Postal]: t('taxes.communication_channel.postal'),
    [UserOfficialCorrespondenceChannelEnum.Edesk]: t('taxes.communication_channel.edesk'),
  }[channel]

  return (
    <>
      <OfficialCorrespondenceChannelChangeModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
      <div className="mx-4 flex flex-col gap-4 rounded-lg border bg-gray-0 p-4 lg:mx-0 lg:gap-5 lg:p-5">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-gray-100 p-3 max-lg:hidden">
              <MailIcon className="size-6" />
            </div>
            <span className="text-p1-semibold">{channelLabel}</span>
          </div>
          {canUserChangeChannel && (
            <>
              {/* Desktop */}
              <ButtonNew
                onPress={() => setIsModalOpen(true)}
                variant="black-link"
                startIcon={<SettingsIcon />}
                className="max-lg:hidden"
              >
                {t('taxes.communication_channel.change_button')}
              </ButtonNew>
              {/* Mobile */}
              <ButtonNew
                onPress={() => setIsModalOpen(true)}
                variant="icon-wrapped"
                icon={<SettingsIcon />}
                className="self-start lg:hidden"
                aria-label={t('taxes.communication_channel.change_button.aria')}
              />
            </>
          )}
        </div>

        {isChannelChangeEffectiveNextYear && (
          <OfficialCorrespondenceChannelAlert
            variant="change-effective-next-year"
            strapiTax={strapiTax}
          />
        )}
      </div>
    </>
  )
}

export default OfficialCorrespondenceChannelInformation
