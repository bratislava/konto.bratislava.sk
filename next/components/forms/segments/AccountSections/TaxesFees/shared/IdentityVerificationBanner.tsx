import ImageMestskeKontoSituacia from '@assets/images/mestske-konto-situacia.png'
import AnnouncementBlock from 'components/forms/segments/AccountSections/IntroSection/Announcements/AnnouncementBlock'
import { ROUTES } from 'frontend/api/constants'
import { useTranslation } from 'next-i18next'
import React from 'react'

type Props = {
  variant: 'verification-needed' | 'verification-in-process'
}

const IdentityVerificationBanner = ({ variant }: Props) => {
  const { t } = useTranslation('account')

  if (variant === 'verification-needed') {
    return (
      <AnnouncementBlock
        announcementContent={t('account_section_payment.verify_identity_content')}
        imageSrc={ImageMestskeKontoSituacia}
        buttons={[
          {
            children: t('account_section_payment.verify_and_set'),
            href: ROUTES.IDENTITY_VERIFICATION,
            variant: 'black-solid',
            fullWidthMobile: true,
          },
        ]}
      />
    )
  }

  if (variant === 'verification-in-process') {
    return (
      <AnnouncementBlock
        announcementContent={t('account_section_payment.verifying_identity_content')}
        imageSrc={ImageMestskeKontoSituacia}
      />
    )
  }

  return null
}

export default IdentityVerificationBanner
